import React, { useState } from 'react';
import Modal from '../Modal';
import Button from '../Button';
import DebtModal from './DebtModal';
import type { Debt } from '../../types';

export default function ManageDebtsModal({
  open, onClose, debts, onChange
}: {
  open: boolean;
  onClose: () => void;
  debts: Debt[];
  onChange: (next: Debt[]) => void;
}) {
  const [editing, setEditing] = useState<Debt | null>(null);
  const [creating, setCreating] = useState<boolean>(false);

  return (
    <Modal open={open} onClose={onClose} title="Manage Debts">
      <div className="flex justify-end mb-4">
        <Button onClick={() => { setCreating(true); setEditing(null); }}>+ Add Debt</Button>
      </div>
      <div className="overflow-auto">
        <table className="min-w-full text-sm">
          <thead>
            <tr className="text-left border-b border-gray-200 dark:border-gray-700">
              <th className="py-2 pr-4">Name</th>
              <th className="py-2 pr-4">Balance</th>
              <th className="py-2 pr-4">APR</th>
              <th className="py-2 pr-4">Min</th>
              <th className="py-2 pr-4">Actions</th>
            </tr>
          </thead>
          <tbody>
            {debts.map(d => (
              <tr key={d.id} className="border-b border-gray-100 dark:border-gray-800">
                <td className="py-2 pr-4">{d.name}</td>
                <td className="py-2 pr-4">${d.balance.toFixed(2)}</td>
                <td className="py-2 pr-4">{d.apr.toFixed(2)}%</td>
                <td className="py-2 pr-4">${d.minPayment.toFixed(2)}</td>
                <td className="py-2 pr-4">
                  <div className="flex gap-2">
                    <Button variant="secondary" onClick={() => setEditing(d)}>Edit</Button>
                    <Button variant="danger" onClick={() => onChange(debts.filter(x => x.id !== d.id))}>Delete</Button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <DebtModal
        open={creating}
        onClose={() => setCreating(false)}
        onSave={(d) => { onChange([...debts, d]); setCreating(false); }}
      />
      <DebtModal
        open={!!editing}
        initial={editing}
        onClose={() => setEditing(null)}
        onDelete={(id) => { onChange(debts.filter(x => x.id !== id)); setEditing(null); }}
        onSave={(d) => { onChange(debts.map(x => x.id === d.id ? d : x)); setEditing(null); }}
      />
    </Modal>
  );
}
