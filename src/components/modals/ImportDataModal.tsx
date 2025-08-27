import React, { useState } from 'react';
import Modal from '../Modal';
import Button from '../Button';
import { z } from 'zod';
import type { ImportPayload } from '../../types';
export type { ImportPayload } from '../../types';

const CADENCES = ['weekly', 'biweekly', 'monthly', 'quarterly', 'yearly'] as const;
const TXN_TYPES = ['income', 'expense'] as const;

const BudgetSchema = z.object({
  id: z.string(),
  category: z.string(),
  allocated: z.number(),
  spent: z.number()
});

const DebtSchema = z.object({
  id: z.string(),
  name: z.string(),
  balance: z.number(),
  apr: z.number(),
  minPayment: z.number()
});

const BNPLPlanSchema = z.object({
  id: z.string(),
  provider: z.enum(['PayPal', 'Affirm', 'Klarna']),
  description: z.string(),
  total: z.number(),
  remaining: z.number(),
  dueDates: z.array(z.string()),
  apr: z.number().optional()
});

const RecurringTransactionSchema = z.object({
  id: z.string(),
  name: z.string(),
  type: z.enum(TXN_TYPES),
  amount: z.number(),
  cadence: z.enum(CADENCES)
});

const GoalSchema = z.object({
  id: z.string(),
  name: z.string(),
  target: z.number(),
  current: z.number(),
  due: z.string().optional(),
  priority: z.number().optional()
});

const ImportPayloadSchema = z.object({
  budgets: z.array(BudgetSchema),
  debts: z.array(DebtSchema),
  bnpl: z.array(BNPLPlanSchema),
  recurring: z.array(RecurringTransactionSchema),
  goals: z.array(GoalSchema)
});

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
      const result = ImportPayloadSchema.safeParse(json);
      if (!result.success) {
        setError('Invalid schema. Expect a JSON object with keys: budgets, debts, bnpl, recurring, goals');
        return;
      }
      onImport(result.data as ImportPayload);
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
