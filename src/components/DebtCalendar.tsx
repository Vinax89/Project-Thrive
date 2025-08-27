import React, { useEffect, useMemo, useRef, useState } from "react";

export type Recurrence = "none" | "weekly" | "biweekly" | "monthly";
export interface Debt {
  id: string; name: string; amount: number; dueDate: string; recurrence: Recurrence; autopay: boolean;
  notes?: string; color?: string; paidDates?: string[];
}

interface DebtCalendarProps {
  storageKey?: string; initialDebts?: Debt[]; onChange?: (debts: Debt[]) => void; startOn?: 0 | 1;
}

const iso = (d: Date) => d.toISOString().slice(0,10);
const parseISO = (s: string) => { const [y,m,dd] = s.split("-").map(Number); return new Date(y, m-1, dd); };
const addDays = (d: Date, days: number) => new Date(d.getFullYear(), d.getMonth(), d.getDate() + days);
const isSameDay = (a: Date, b: Date) => a.getFullYear()===b.getFullYear() && a.getMonth()===b.getMonth() && a.getDate()===b.getDate();
const currency = (n: number) => n.toLocaleString(undefined, { style: "currency", currency: "USD" });

function monthMatrix(year: number, month: number, startOn: 0|1) {
  const first = new Date(year, month, 1);
  const shift = (first.getDay() - startOn + 7) % 7;
  const start = addDays(first, -shift);
  return Array.from({length: 42}, (_,i)=>addDays(start, i));
}

function nextOccurrenceOnOrAfter(anchorISO: string, recurrence: Recurrence, onOrAfter: Date): Date | null {
  const anchor = parseISO(anchorISO);
  if (recurrence === "none") return isSameDay(anchor, onOrAfter) || anchor > onOrAfter ? anchor : null;
  if (recurrence === "monthly") {
    const t = new Date(onOrAfter.getFullYear(), onOrAfter.getMonth(), Math.min(anchor.getDate(), 28));
    if (t < onOrAfter) t.setMonth(t.getMonth()+1);
    return t;
  }
  const step = recurrence === "weekly" ? 7 : 14;
  const diff = Math.floor((+onOrAfter - +anchor)/86400000);
  const k = diff <= 0 ? 0 : Math.ceil(diff/step);
  const cand = addDays(anchor, k*step);
  return cand < onOrAfter ? addDays(cand, step) : cand;
}

function allOccurrencesInRange(debt: Debt, from: Date, to: Date) {
  const out: Date[] = [];
  if (debt.recurrence === "none") {
    const d = parseISO(debt.dueDate); if (d>=from && d<=to) out.push(d); return out;
  }
  const step = debt.recurrence === "weekly" ? 7 : debt.recurrence === "biweekly" ? 14 : 30;
  let cur = nextOccurrenceOnOrAfter(debt.dueDate, debt.recurrence, from);
  let guard = 0;
  while (cur && cur <= to && guard < 400) { out.push(new Date(cur)); cur = addDays(cur, step); guard++; }
  return out;
}

function useLocalStorage(key?: string, seed?: Debt[]) {
  const [state, setState] = useState<Debt[]>(() => {
    if (!key) return seed ?? [];
    try { const raw = localStorage.getItem(key); if (raw) return JSON.parse(raw); } catch {}
    return seed ?? [];
  });
  useEffect(()=>{ if (key) try { localStorage.setItem(key, JSON.stringify(state)); } catch {} }, [key, state]);
  return [state, setState] as const;
}

const WEEKDAYS = ["Sun","Mon","Tue","Wed","Thu","Fri","Sat"];

export default function DebtCalendar({ storageKey = "debt.calendar", initialDebts = [], onChange, startOn = 0 }: DebtCalendarProps) {
  const [debts, setDebts] = useLocalStorage(storageKey, initialDebts);
  useEffect(()=>{ onChange?.(debts); }, [debts, onChange]);

  const today = new Date();
  const [cursor, setCursor] = useState<Date>(new Date(today.getFullYear(), today.getMonth(), 1));
  const [selected, setSelected] = useState<Date>(new Date(today));
  const [activeDebt, setActiveDebt] = useState<Debt | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [query, setQuery] = useState("");
  const liveRef = useRef<HTMLDivElement>(null);

  const grid = useMemo(()=>monthMatrix(cursor.getFullYear(), cursor.getMonth(), startOn), [cursor, startOn]);
  const from = grid[0], to = grid[grid.length-1];

  type Occurrence = { date: string; debt: Debt };
  const occurrences = useMemo<Occurrence[]>(()=>{
    const res: Occurrence[] = [];
    debts.forEach(d => allOccurrencesInRange(d, from, to).forEach(dt => res.push({ date: iso(dt), debt: d })));
    return res.sort((a,b)=>a.date.localeCompare(b.date));
  }, [debts, from, to]);

  const grouped = useMemo(()=>{
    const map = new Map<string, Occurrence[]>();
    for (const oc of occurrences) {
      if (query && !(`${oc.debt.name} ${oc.debt.notes ?? ''}`.toLowerCase().includes(query.toLowerCase()))) continue;
      const arr = map.get(oc.date) ?? []; arr.push(oc); map.set(oc.date, arr);
    }
    return map;
  }, [occurrences, query]);

  // Keyboard navigation across the grid
  function moveFocus(deltaDays: number) { setSelected(prev => addDays(prev, deltaDays)); }
  function onKeyDown(e: React.KeyboardEvent) {
    const key = e.key;
    if (["ArrowLeft","ArrowRight","ArrowUp","ArrowDown","Home","End","PageUp","PageDown","Enter"].includes(key)) e.preventDefault();
    if (key === "ArrowLeft") moveFocus(-1);
    if (key === "ArrowRight") moveFocus(1);
    if (key === "ArrowUp") moveFocus(-7);
    if (key === "ArrowDown") moveFocus(7);
    if (key === "Home") setSelected(new Date(cursor.getFullYear(), cursor.getMonth(), 1));
    if (key === "End") setSelected(new Date(cursor.getFullYear(), cursor.getMonth()+1, 0));
    if (key === "PageUp") setCursor(new Date(cursor.getFullYear(), cursor.getMonth()-1, 1));
    if (key === "PageDown") setCursor(new Date(cursor.getFullYear(), cursor.getMonth()+1, 1));
    if (key === "Enter") { setShowForm(true); setActiveDebt(null); announce("Add debt on "+selected.toDateString()); }
  }

  // Live region announcements
  function announce(msg: string) { if (liveRef.current) liveRef.current.textContent = msg; }

  function addOrUpdateDebt(next: Debt) {
    setDebts(prev => {
      const i = prev.findIndex(d => d.id === next.id);
      const out = i>=0 ? [...prev.slice(0,i), next, ...prev.slice(i+1)] : [...prev, next];
      announce(`${next.name} saved`); return out;
    });
  }
  function deleteDebt(id: string) { setDebts(prev => prev.filter(d => d.id !== id)); announce("Debt deleted"); }
  function markPaid(dateISO: string, id: string) {
    setDebts(prev => prev.map(d => d.id !== id ? d : { ...d, paidDates: Array.from(new Set([...(d.paidDates ?? []), dateISO])) }));
    announce("Marked paid");
  }
  function unmarkPaid(dateISO: string, id: string) {
    setDebts(prev => prev.map(d => d.id !== id ? d : { ...d, paidDates: (d.paidDates ?? []).filter(x => x !== dateISO) }));
    announce("Undo paid");
  }

  const totals = useMemo(()=>{
    let total=0, paid=0, autopay=0;
    for (const [dateISO, arr] of grouped.entries()) {
      for (const { debt } of arr) {
        total += debt.amount; if (debt.autopay) autopay += debt.amount; if (debt.paidDates?.includes(dateISO)) paid += debt.amount;
      }
    }
    return { total, paid, autopay };
  }, [grouped]);

  const headerLabel = cursor.toLocaleString(undefined, { month: "long", year: "numeric" });

  const selectedISO = iso(selected);

  useEffect(()=>{
    // keep cursor month in sync with selected date when navigating weeks
    if (selected.getFullYear() !== cursor.getFullYear() || selected.getMonth() !== cursor.getMonth()) {
      setCursor(new Date(selected.getFullYear(), selected.getMonth(), 1));
    }
  }, [selected]);

  return (
    <div className="w-full max-w-6xl mx-auto">
      <div aria-live="polite" aria-atomic="true" className="sr-only" ref={liveRef} />

      {/* toolbar */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 mb-4">
        <div className="flex items-center gap-2">
          <button onClick={()=>setCursor(new Date(cursor.getFullYear(), cursor.getMonth()-1, 1))} className="px-3 py-2 rounded-xl bg-gray-100 hover:bg-gray-200" aria-label="Previous month">◀</button>
          <div className="text-xl font-semibold select-none min-w-[10ch] text-center" aria-live="polite">{headerLabel}</div>
          <button onClick={()=>setCursor(new Date(cursor.getFullYear(), cursor.getMonth()+1, 1))} className="px-3 py-2 rounded-xl bg-gray-100 hover:bg-gray-200" aria-label="Next month">▶</button>
          <button onClick={()=>setCursor(new Date(today.getFullYear(), today.getMonth(), 1))} className="ml-2 px-3 py-2 rounded-xl bg-gray-100 hover:bg-gray-200">Today</button>
        </div>
        <div className="flex items-center gap-2 w-full sm:w-auto">
          <input aria-label="Search debts" placeholder="Search…" className="w-full sm:w-64 px-3 py-2 rounded-xl border border-gray-300 focus:outline-none focus:ring" value={query} onChange={e=>setQuery(e.target.value)} />
          <button onClick={()=>{ setSelected(today); setActiveDebt(null); setShowForm(true); }} className="px-4 py-2 rounded-2xl bg-black text-white shadow hover:shadow-md">New</button>
        </div>
      </div>

      {/* totals */}
      <div className="grid grid-cols-3 gap-3 mb-4" role="group" aria-label="Month totals">
        <Stat label="Month Total" value={currency(totals.total)} />
        <Stat label="Scheduled (Autopay)" value={currency(totals.autopay)} />
        <Stat label="Marked Paid" value={currency(totals.paid)} />
      </div>

      {/* weekday header */}
      <div className="grid grid-cols-7 text-center text-sm font-medium text-gray-600" role="row">
        {Array.from({length:7}).map((_,i)=>(<div key={i} className="py-2 select-none" role="columnheader">{WEEKDAYS[(i+startOn)%7]}</div>))}
      </div>

      {/* grid */}
      <div
        className="grid grid-cols-7 gap-1 rounded-2xl bg-gray-100 p-1"
        role="grid"
        aria-label="Debt calendar"
        onKeyDown={onKeyDown}
        tabIndex={0}
      >
        {grid.map((date, idx)=>{
          const inMonth = date.getMonth()===cursor.getMonth();
          const dateISO = iso(date);
          const dayEvents = grouped.get(dateISO) ?? [];
          const isToday = isSameDay(date, today);
          const sumForDay = dayEvents.reduce((s,e)=>s+e.debt.amount, 0);
          const isSelected = isSameDay(date, selected);

          return (
            <div
              key={idx}
              role="gridcell"
              aria-selected={isSelected}
              aria-label={`${date.toDateString()} — ${currency(sumForDay)} due`}
              className={
                "relative min-h-[110px] rounded-xl p-2 bg-white border focus:outline-none " +
                (inMonth?"border-gray-200":"border-transparent opacity-50 ") +
                (isToday?" ring-2 ring-black ":"") +
                (isSelected?" ring-2 ring-blue-500 ":"")
              }
              onClick={(e)=>{ if ((e.target as HTMLElement).closest("[data-chip]")) return; setSelected(date); setActiveDebt(null); setShowForm(true); }}
            >
              <div className="flex items-center justify-between">
                <div className="text-xs font-medium text-gray-500 select-none">{date.getDate()}</div>
                {sumForDay>0 && (
                  <div className="text-xs px-2 py-0.5 rounded-full bg-gray-100 text-gray-700">{currency(sumForDay)}</div>
                )}
              </div>
              <div className="mt-2 flex flex-col gap-1">
                {dayEvents.map(({ debt })=>{
                  const paid = debt.paidDates?.includes(dateISO);
                  return (
                    <div
                      key={debt.id+dateISO}
                      data-chip
                      className="group flex items-center gap-2 px-2 py-1 rounded-lg text-xs cursor-pointer hover:opacity-90"
                      style={{ backgroundColor: debt.color ?? (paid?"#d1fae5":"#e5e7eb") }}
                      onClick={()=>{ setSelected(date); setActiveDebt(debt); setShowForm(true); }}
                    >
                      <span className={"truncate "+(paid?"line-through":"")}>{debt.name}</span>
                      <span className={"ml-auto tabular-nums "+(paid?"line-through":"font-semibold")}>{currency(debt.amount)}</span>
                      {debt.autopay && <span className="text-[10px] px-1 py-0.5 rounded bg-black/10" aria-label="Autopay">AUTO</span>}
                    </div>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>

      {showForm && (
        <DebtForm
          dateISO={selectedISO}
          initial={activeDebt}
          onClose={()=>setShowForm(false)}
          onDelete={activeDebt?()=>{ deleteDebt(activeDebt.id); setShowForm(false); }:undefined}
          onSave={(values)=>{ const next: Debt = activeDebt?{...activeDebt,...values}:{...values, id: crypto.randomUUID()}; addOrUpdateDebt(next); setShowForm(false); }}
          onMarkPaid={(date)=> activeDebt && markPaid(date, activeDebt.id)}
          onUnmarkPaid={(date)=> activeDebt && unmarkPaid(date, activeDebt.id)}
        />
      )}
    </div>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-2xl bg-white p-4 border border-gray-200 shadow-sm">
      <div className="text-xs text-gray-500">{label}</div>
      <div className="text-lg font-semibold mt-1">{value}</div>
    </div>
  );
}

interface FormProps { dateISO: string; initial: Debt | null; onClose: () => void; onSave: (v: Omit<Debt,"id">) => void; onDelete?: ()=>void; onMarkPaid: (iso: string)=>void; onUnmarkPaid: (iso: string)=>void; }
function DebtForm({ dateISO, initial, onClose, onSave, onDelete, onMarkPaid, onUnmarkPaid }: FormProps) {
  const [name, setName] = useState(initial?.name ?? "");
  const [amount, setAmount] = useState<string>(initial?String(initial.amount):"");
  const [dueDate, setDueDate] = useState<string>(initial?.dueDate ?? dateISO);
  const [recurrence, setRecurrence] = useState<Recurrence>(initial?.recurrence ?? "none");
  const [autopay, setAutopay] = useState<boolean>(initial?.autopay ?? false);
  const [notes, setNotes] = useState<string>(initial?.notes ?? "");
  const [color, setColor] = useState<string>(initial?.color ?? "");
  const ref = useRef<HTMLDivElement>(null);

  useEffect(()=>{ const f=(e:KeyboardEvent)=>{ if(e.key==="Escape") onClose(); }; window.addEventListener("keydown", f); return ()=>window.removeEventListener("keydown", f); }, [onClose]);
  useEffect(()=>{ ref.current?.focus(); }, []);

  const paidToday = initial?.paidDates?.includes(dateISO) ?? false;

  function handleSave(){
    const amt = Number.parseFloat(amount);
    if (!name.trim() || Number.isNaN(amt) || amt<=0) return;
    onSave({ name: name.trim(), amount: Math.round(amt*100)/100, dueDate, recurrence, autopay, notes: notes.trim() || undefined, color: color || undefined, paidDates: initial?.paidDates ?? [] });
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4" role="dialog" aria-modal="true" aria-labelledby="debtFormTitle">
      <div ref={ref} tabIndex={-1} className="w-full max-w-lg rounded-2xl bg-white p-4 shadow-2xl outline-none">
        <div className="flex items-center justify-between mb-2">
          <div id="debtFormTitle" className="text-lg font-semibold">{initial?"Edit":"Add"} Debt</div>
          <button onClick={onClose} className="px-2 py-1 rounded-lg hover:bg-gray-100" aria-label="Close">✕</button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <L label="Name"><input value={name} onChange={e=>setName(e.target.value)} className="input" placeholder="e.g., X1 Card" /></L>
          <L label="Amount"><input value={amount} onChange={e=>setAmount(e.target.value)} className="input" inputMode="decimal" placeholder="0.00" /></L>
          <L label="Anchor Due Date"><input type="date" value={dueDate} onChange={e=>setDueDate(e.target.value)} className="input" /></L>
          <L label="Recurrence"><select value={recurrence} onChange={e=>setRecurrence(e.target.value as Recurrence)} className="input"><option value="none">None</option><option value="weekly">Weekly</option><option value="biweekly">Biweekly</option><option value="monthly">Monthly (same day)</option></select></L>
          <L label="Autopay"><Toggle checked={autopay} onChange={setAutopay} /></L>
          <L label="Chip Color (optional)"><input type="color" value={color} onChange={e=>setColor(e.target.value)} className="input h-10" /></L>
          <L label="Notes" full><textarea value={notes} onChange={e=>setNotes(e.target.value)} className="input min-h-[80px]" placeholder="Internal notes…" /></L>
        </div>

        {initial && (
          <div className="mt-3 p-3 rounded-xl bg-gray-50 border border-gray-200 flex items-center gap-2">
            <span className="text-sm">Status for <strong>{dateISO}</strong>:</span>
            {!paidToday ? (
              <button onClick={()=>onMarkPaid(dateISO)} className="btn">Mark Paid</button>
            ) : (
              <button onClick={()=>onUnmarkPaid(dateISO)} className="btn">Undo Paid</button>
            )}
          </div>
        )}

        <div className="mt-4 flex items-center justify-between">
          <div className="text-xs text-gray-500">Tip: <kbd className="kbd">Ctrl/Cmd+K</kbd> to quick-add</div>
          <div className="flex items-center gap-2">
            {onDelete && (<button onClick={onDelete} className="px-3 py-2 rounded-xl border border-red-300 text-red-700 hover:bg-red-50">Delete</button>)}
            <button onClick={handleSave} className="btn">Save</button>
          </div>
        </div>
      </div>

      <style>{`.input{@apply w-full px-3 py-2 rounded-xl border border-gray-300 focus:outline-none focus:ring}.btn{@apply px-4 py-2 rounded-2xl bg-black text-white hover:opacity-90}.kbd{@apply px-1.5 py-0.5 rounded bg-gray-200 text-gray-700}`}</style>
    </div>
  );
}

function L({ label, children, full }: { label: string; children: React.ReactNode; full?: boolean }) {
  return (
    <label className={(full?"sm:col-span-2 ":"")+"flex flex-col gap-1 text-sm"}>
      <span className="text-gray-600">{label}</span>
      {children}
    </label>
  );
}

function Toggle({ checked, onChange }: { checked: boolean; onChange: (v: boolean)=>void }) {
  return (
    <button type="button" role="switch" aria-checked={checked} onClick={()=>onChange(!checked)} className={"w-12 h-7 rounded-full border transition relative "+(checked?"bg-black border-black":"bg-gray-200 border-gray-300")}>
      <span className={"absolute top-0.5 transition "+(checked?"right-0.5":"left-0.5")} style={{ width: 24, height: 24 }}>
        <span className="block w-6 h-6 rounded-full bg-white shadow" />
      </span>
    </button>
  );
}
