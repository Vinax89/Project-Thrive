import React, { useState } from 'react';
import Modal from '../Modal';
import Button from '../Button';
import {
  Budget,
  Debt,
  BNPLPlan,
  RecurringTransaction,
  Goal,
} from '../../types';

export type ImportPayload = {
  budgets?: Budget[];
  debts?: Debt[];
  bnpl?: BNPLPlan[];
  recurring?: RecurringTransaction[];
  goals?: Goal[];
};

function isBudget(b: any): b is Budget {
  return (
    typeof b === 'object' &&
    b !== null &&
    typeof b.id === 'string' &&
    typeof b.category === 'string' &&
    typeof b.allocated === 'number' &&
    typeof b.spent === 'number'
  );
}

function isDebt(d: any): d is Debt {
  return (
    typeof d === 'object' &&
    d !== null &&
    typeof d.id === 'string' &&
    typeof d.name === 'string' &&
    typeof d.balance === 'number' &&
    typeof d.apr === 'number' &&
    typeof d.minPayment === 'number'
  );
}

function isBNPLPlan(p: any): p is BNPLPlan {
  return (
    typeof p === 'object' &&
    p !== null &&
    typeof p.id === 'string' &&
    typeof p.provider === 'string' &&
    typeof p.description === 'string' &&
    typeof p.total === 'number' &&
    typeof p.remaining === 'number' &&
    Array.isArray(p.dueDates)
  );
}

function isRecurring(r: any): r is RecurringTransaction {
  return (
    typeof r === 'object' &&
    r !== null &&
    typeof r.id === 'string' &&
    typeof r.name === 'string' &&
    typeof r.type === 'string' &&
    typeof r.amount === 'number' &&
    typeof r.cadence === 'string'
  );
}

function isGoal(g: any): g is Goal {
  return (
    typeof g === 'object' &&
    g !== null &&
    typeof g.id === 'string' &&
    typeof g.name === 'string' &&
    typeof g.target === 'number' &&
    typeof g.current === 'number'
  );
}

function validate(p: any): p is ImportPayload {
  if (typeof p !== 'object' || p === null) return false;
  const allowed = ['budgets', 'debts', 'bnpl', 'recurring', 'goals'];
  for (const k of Object.keys(p)) if (!allowed.includes(k)) return false;
  if (p.budgets && (!Array.isArray(p.budgets) || !p.budgets.every(isBudget))) return false;
  if (p.debts && (!Array.isArray(p.debts) || !p.debts.every(isDebt))) return false;
  if (p.bnpl && (!Array.isArray(p.bnpl) || !p.bnpl.every(isBNPLPlan))) return false;
  if (p.recurring && (!Array.isArray(p.recurring) || !p.recurring.every(isRecurring))) return false;
  if (p.goals && (!Array.isArray(p.goals) || !p.goals.every(isGoal))) return false;
  return true;
}

export default function ImportDataModal({
  open, onClose, onImport
}: {
  open: boolean;
  onClose: () => void;
  onImport: (payload: ImportPayload) => void;
}) {
  const [text, setText] = useState('');
  const [error, setError] = useState<string | null>(null);

  async function onFile(e: React.ChangeEvent<HTMLInputElement>) {
    const f = e.target.files?.[0];
    if (!f) return;
    const t = await f.text();
    setText(t);
  }

  function handleImport() {
    setError(null);
    try {
      const json = JSON.parse(text);
      if (!validate(json)) { setError('Invalid schema. Expect a JSON object with keys: budgets, debts, bnpl, recurring, goals'); return; }
      onImport(json);
      onClose();
    } catch (e: any) {
      setError('Invalid JSON: ' + (e?.message || String(e)));
    }
  }

  return (
    <Modal open={open} onClose={onClose} title="Import Data">
      <div className="space-y-3">
        <input type="file" accept="application/json" onChange={onFile}
          className="block w-full text-sm file:mr-3 file:py-2 file:px-4 file:rounded file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100" />
        <textarea value={text} onChange={(e)=>setText(e.target.value)} rows={10}
          className="w-full px-3 py-2 rounded border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800" placeholder='Paste JSON here...' />
        {error && <div className="text-sm text-red-600">{error}</div>}
        <div className="flex justify-end gap-2">
          <Button variant="secondary" onClick={onClose}>Cancel</Button>
          <Button onClick={handleImport}>Import</Button>
        </div>
      </div>
    </Modal>
  );
}
