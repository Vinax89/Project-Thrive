import React, { useState } from 'react';
import Modal from '../Modal';
import Button from '../Button';
import type { Debt, BNPLPlan } from '../../types';

type ImportPayload = {
  budgets?: any[];
  debts?: Debt[];
  bnplPlans?: BNPLPlan[];
  recurring?: any[];
  goals?: any[];
};

function validate(p: any): p is ImportPayload {
  if (typeof p !== 'object' || p === null) return false;
  const allowed = ['budgets','debts','bnplPlans','recurring','goals'];
  for (const k of Object.keys(p)) if (!allowed.includes(k)) return false;
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
