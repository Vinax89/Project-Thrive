import React, { useState } from 'react';
import Modal from '../Modal';
import Button from '../Button';
import type {
  ImportPayload,
  Budget,
  Debt,
  BNPLPlan,
  RecurringTransaction,
  Goal,
  Cadence,
  TxnType
} from '../../types';
export type { ImportPayload } from '../../types';

const CADENCES: Cadence[] = ['weekly', 'biweekly', 'monthly', 'quarterly', 'yearly'];
const TXN_TYPES: TxnType[] = ['income', 'expense'];

function isString(v: unknown): v is string {
  return typeof v === 'string';
}

function isNumber(v: unknown): v is number {
  return typeof v === 'number' && !Number.isNaN(v);
}

function isBudget(item: any): item is Budget {
  return (
    isString(item?.id) &&
    isString(item?.category) &&
    isNumber(item?.allocated) &&
    isNumber(item?.spent)
  );
}

function isDebt(item: any): item is Debt {
  return (
    isString(item?.id) &&
    isString(item?.name) &&
    isNumber(item?.balance) &&
    isNumber(item?.apr) &&
    isNumber(item?.minPayment)
  );
}

function isBNPLPlan(item: any): item is BNPLPlan {
  return (
    isString(item?.id) &&
    ['PayPal', 'Affirm', 'Klarna'].includes(item?.provider) &&
    isString(item?.description) &&
    isNumber(item?.total) &&
    isNumber(item?.remaining) &&
    Array.isArray(item?.dueDates) &&
    item.dueDates.every(isString) &&
    (item.apr === undefined || isNumber(item.apr))
  );
}

function isRecurringTransaction(item: any): item is RecurringTransaction {
  return (
    isString(item?.id) &&
    isString(item?.name) &&
    TXN_TYPES.includes(item?.type) &&
    isNumber(item?.amount) &&
    CADENCES.includes(item?.cadence)
  );
}

function isGoal(item: any): item is Goal {
  return (
    isString(item?.id) &&
    isString(item?.name) &&
    isNumber(item?.target) &&
    isNumber(item?.current) &&
    (item.due === undefined || isString(item.due)) &&
    (item.priority === undefined || isNumber(item.priority))
  );
}

function validate(payload: any): payload is ImportPayload {
  return (
    Array.isArray(payload?.budgets) && payload.budgets.every(isBudget) &&
    Array.isArray(payload?.debts) && payload.debts.every(isDebt) &&
    Array.isArray(payload?.bnpl) && payload.bnpl.every(isBNPLPlan) &&
    Array.isArray(payload?.recurring) && payload.recurring.every(isRecurringTransaction) &&
    Array.isArray(payload?.goals) && payload.goals.every(isGoal)
  );
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
      if (!validate(json)) {
        setError('Invalid schema. Expect a JSON object with keys: budgets, debts, bnpl, recurring, goals');
        return;
      }
      onImport(json);
      onClose();
    } catch (e) {
      setError('Invalid JSON: ' + (e instanceof Error ? e.message : String(e)));
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
