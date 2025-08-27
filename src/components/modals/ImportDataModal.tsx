import React, { useState } from 'react';
import Modal from '../Modal';
import Button from '../Button';
import type { DataPayload, Budget, Debt, BNPLPlan, RecurringTransaction, Goal } from '../../types';

function isObject(v: any): v is Record<string, any> {
  return typeof v === 'object' && v !== null;
}

function isBudget(v: any): v is Budget {
  return (
    isObject(v) &&
    typeof v.id === 'string' &&
    typeof v.category === 'string' &&
    typeof v.allocated === 'number' &&
    typeof v.spent === 'number'
  );
}

function isDebt(v: any): v is Debt {
  return (
    isObject(v) &&
    typeof v.id === 'string' &&
    typeof v.name === 'string' &&
    typeof v.balance === 'number' &&
    typeof v.apr === 'number' &&
    typeof v.minPayment === 'number'
  );
}

function isBNPLPlan(v: any): v is BNPLPlan {
  return (
    isObject(v) &&
    typeof v.id === 'string' &&
    typeof v.provider === 'string' &&
    typeof v.description === 'string' &&
    typeof v.total === 'number' &&
    typeof v.remaining === 'number' &&
    Array.isArray(v.dueDates)
  );
}

function isRecurring(v: any): v is RecurringTransaction {
  return (
    isObject(v) &&
    typeof v.id === 'string' &&
    typeof v.name === 'string' &&
    typeof v.type === 'string' &&
    typeof v.amount === 'number'
  );
}

function isGoal(v: any): v is Goal {
  return (
    isObject(v) &&
    typeof v.id === 'string' &&
    typeof v.name === 'string' &&
    typeof v.target === 'number' &&
    typeof v.current === 'number'
  );
}

function validate(p: any): p is DataPayload {
  if (!isObject(p)) return false;
  const allowed = ['budgets','debts','bnplPlans','recurring','goals'];
  for (const k of Object.keys(p)) if (!allowed.includes(k)) return false;

  if (p.budgets && (!Array.isArray(p.budgets) || !p.budgets.every(isBudget))) return false;
  if (p.debts && (!Array.isArray(p.debts) || !p.debts.every(isDebt))) return false;
  if (p.bnplPlans && (!Array.isArray(p.bnplPlans) || !p.bnplPlans.every(isBNPLPlan))) return false;
  if (p.recurring && (!Array.isArray(p.recurring) || !p.recurring.every(isRecurring))) return false;
  if (p.goals && (!Array.isArray(p.goals) || !p.goals.every(isGoal))) return false;

  return true;
}

export default function ImportDataModal({
  open, onClose, onImport
}: {
  open: boolean;
  onClose: () => void;
  onImport: (payload: DataPayload) => void;
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
      if (!validate(json)) { setError('Invalid schema. Expect a JSON object with keys: budgets, debts, bnplPlans, recurring, goals'); return; }
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
