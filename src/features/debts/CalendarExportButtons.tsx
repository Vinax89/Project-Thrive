import React from "react";
import type { Debt } from "@/components/DebtCalendar";

function expandMonthOccurrences(debts: Debt[], year: number, month: number) {
  const start = new Date(year, month, 1);
  const end = new Date(year, month + 1, 0);
  const dayISO = (d: Date) => d.toISOString().slice(0, 10);
  const rows: Array<{date: string; name: string; amount: number; autopay: boolean; notes?: string}> = [];

  for (const d of debts) {
    const anchor = new Date(d.dueDate);
    const push = (dt: Date) => {
      if (dt >= start && dt <= end) rows.push({ date: dayISO(dt), name: d.name, amount: d.amount, autopay: !!d.autopay, notes: d.notes });
    };

    if (d.recurrence === "none") {
      push(anchor); continue;
    }
    if (d.recurrence === "monthly") {
      push(new Date(year, month, anchor.getDate())); continue;
    }
    const step = d.recurrence === "weekly" ? 7 : 14;
    let cur = new Date(anchor);
    while (cur < start) cur = new Date(cur.getFullYear(), cur.getMonth(), cur.getDate() + step);
    while (cur <= end) { push(cur); cur = new Date(cur.getFullYear(), cur.getMonth(), cur.getDate() + step); }
  }

  rows.sort((a,b)=>a.date.localeCompare(b.date));
  return rows;
}

export default function CalendarExportButtons({ debts, year, month }: { debts: Debt[]; year: number; month: number }) {
  const title = `Debt Calendar — ${new Date(year, month).toLocaleString(undefined, { month: "long", year: "numeric" })}`;

  const downloadCSV = React.useCallback(() => {
    const rows = expandMonthOccurrences(debts, year, month);
    const header = ["Date","Name","Amount","Autopay","Notes"].join(",");
    const body = rows.map(r => [r.date, r.name, r.amount, r.autopay?"Yes":"No", (r.notes||"").replace(/"/g,'""')].map(x=>`"${x}"`).join(",")).join("\n");
    const blob = new Blob([header+"\n"+body], { type: "text/csv;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url; a.download = `${title}.csv`; a.click();
    URL.revokeObjectURL(url); a.remove();
  }, [debts, year, month, title]);

  return (
    <div className="flex gap-2">
      <button className="px-3 py-2 rounded-xl bg-gray-100 hover:bg-gray-200" onClick={downloadCSV}>Export CSV</button>
    </div>
  );
}
