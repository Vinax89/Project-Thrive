import React, { useState } from 'react';
import Modal from '../Modal';
import Button from '../Button';
import { importSchema, type ImportPayload } from '../../schema/import';
export type { ImportPayload } from '../../schema/import';
import { Budget, BankTransaction } from '../../types';
import { TransactionMapper } from '../BudgetTracker';

export default function ImportDataModal({
  open,
  onClose,
  onImport,
  budgets,
  onTransactions
}: {
  open: boolean;
  onClose: () => void;
  onImport: (payload: ImportPayload) => void;
  budgets: Budget[];
  onTransactions?: (txns: BankTransaction[]) => void;
}) {
  const [mode, setMode] = useState<'json' | 'csv' | 'bank'>('json');
  const [text, setText] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [transactions, setTransactions] = useState<BankTransaction[]>([]);
  const [mapping, setMapping] = useState(false);

  async function onFile(e: React.ChangeEvent<HTMLInputElement>) {
    const f = e.target.files?.[0];
    if (!f) return;
    const t = await f.text();
    if (mode === 'json') {
      setText(t);
    } else if (mode === 'csv') {
      const tx = parseCsv(t);
      setTransactions(tx);
      setMapping(true);
    }
  }

  function handleImport() {
    setError(null);
    try {
      const json = JSON.parse(text);
      const result = importSchema.safeParse(json);
      if (!result.success) {
        setError(result.error.issues.map((i) => `${i.path.join('.')}: ${i.message}`).join('; '));
        return;
      }
      onImport(result.data);
      onClose();
    } catch (e) {
      setError('Invalid JSON: ' + (e instanceof Error ? e.message : String(e)));
    }
  }

  async function handleBankImport() {
    setError(null);
    try {
      const res = await fetch('/api/bank/transactions');
      const data: BankTransaction[] = await res.json();
      setTransactions(data);
      setMapping(true);
    } catch (e) {
      setError('Bank import failed: ' + (e instanceof Error ? e.message : String(e)));
    }
  }

  return (
    <Modal open={open} onClose={onClose} title="Import Data">
      <div className="space-y-3">
        <div className="flex gap-2">
          <Button
            variant={mode === 'json' ? 'primary' : 'secondary'}
            onClick={() => setMode('json')}
          >
            JSON
          </Button>
          <Button
            variant={mode === 'csv' ? 'primary' : 'secondary'}
            onClick={() => setMode('csv')}
          >
            CSV
          </Button>
          <Button
            variant={mode === 'bank' ? 'primary' : 'secondary'}
            onClick={() => setMode('bank')}
          >
            Bank Import
          </Button>
        </div>

        {mode === 'json' && (
          <>
            <input
              type="file"
              accept="application/json"
              onChange={onFile}
              className="block w-full text-sm file:mr-3 file:py-2 file:px-4 file:rounded file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
            />
            <textarea
              value={text}
              onChange={(e) => setText(e.target.value)}
              rows={10}
              className="w-full px-3 py-2 rounded border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800"
              placeholder='Paste JSON here...'
            />
            <div className="flex justify-end gap-2">
              <Button variant="secondary" onClick={onClose}>Cancel</Button>
              <Button onClick={handleImport}>Import</Button>
            </div>
          </>
        )}

        {mode === 'csv' && (
          <>
            <input
              type="file"
              accept="text/csv"
              onChange={onFile}
              className="block w-full text-sm file:mr-3 file:py-2 file:px-4 file:rounded file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
            />
            <div className="flex justify-end">
              <Button variant="secondary" onClick={onClose}>Close</Button>
            </div>
          </>
        )}

        {mode === 'bank' && (
          <div className="flex justify-end gap-2">
            <Button variant="secondary" onClick={onClose}>Cancel</Button>
            <Button onClick={handleBankImport}>Fetch</Button>
          </div>
        )}

        {error && <div className="text-sm text-red-600">{error}</div>}
      </div>

      <TransactionMapper
        open={mapping}
        transactions={transactions}
        budgets={budgets}
        onSave={(tx) => { onTransactions?.(tx); setMapping(false); onClose(); }}
        onClose={() => setMapping(false)}
      />
    </Modal>
  );
}

function parseCsv(text: string): BankTransaction[] {
  const lines = text.trim().split(/\r?\n/);
  if (!lines.length) return [];
  const [header, ...rows] = lines;
  const cols = header.split(',');
  const nameIdx = cols.findIndex((c) => c.toLowerCase() === 'name');
  const amountIdx = cols.findIndex((c) => c.toLowerCase() === 'amount');
  const dateIdx = cols.findIndex((c) => c.toLowerCase() === 'date');
  return rows
    .filter((r) => r.trim().length)
    .map((row, i) => {
      const cells = row.split(',');
      return {
        id: `csv-${i}`,
        accountId: 'csv',
        name: cells[nameIdx] || '',
        amount: parseFloat(cells[amountIdx] || '0'),
        date: cells[dateIdx] || '',
      } as BankTransaction;
    });
}

