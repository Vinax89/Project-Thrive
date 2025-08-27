import React, { useState } from 'react';
import Modal from '../Modal';
import Button from '../Button';
import ObligationModal from './ObligationModal';
import type { Obligation } from '../../types';

export default function ManageObligationsModal({
  open, onClose, obligations, onChange
}: {
  open: boolean;
  onClose: () => void;
  obligations: Obligation[];
  onChange: (next: Obligation[]) => void;
}) {
  const [editing, setEditing] = useState<Obligation | null>(null);
  const [creating, setCreating] = useState<boolean>(false);

  return (
    <Modal open={open} onClose={onClose} title="Manage Obligations">
      <div className="flex justify-end mb-4">
        <Button onClick={() => { setCreating(true); setEditing(null); }}>+ Add Obligation</Button>
      </div>
      <div className="overflow-auto">
        <table className="min-w-full text-sm">
          <thead>
            <tr className="text-left border-b border-gray-200 dark:border-gray-700">
              <th className="py-2 pr-4">Name</th>
              <th className="py-2 pr-4">Amount</th>
              <th className="py-2 pr-4">Cadence</th>
              <th className="py-2 pr-4">Due</th>
              <th className="py-2 pr-4">Actions</th>
            </tr>
          </thead>
          <tbody>
            {obligations.map(o => (
              <tr key={o.id} className="border-b border-gray-100 dark:border-gray-800">
                <td className="py-2 pr-4">{o.name}</td>
                <td className="py-2 pr-4">${o.amount.toFixed(2)}</td>
                <td className="py-2 pr-4">{o.cadence}</td>
                <td className="py-2 pr-4">{o.dueDate || '—'}</td>
                <td className="py-2 pr-4">
                  <div className="flex gap-2">
                    <Button variant="secondary" onClick={() => setEditing(o)}>Edit</Button>
                    <Button variant="danger" onClick={() => onChange(obligations.filter(x => x.id !== o.id))}>Delete</Button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <ObligationModal
        open={creating}
        onClose={() => setCreating(false)}
        onSave={(o) => { onChange([...obligations, o]); setCreating(false); }}
      />
      <ObligationModal
        open={!!editing}
        initial={editing}
        onClose={() => setEditing(null)}
        onDelete={(id) => { onChange(obligations.filter(x => x.id !== id)); setEditing(null); }}
        onSave={(o) => { onChange(obligations.map(x => x.id === o.id ? o : x)); setEditing(null); }}
      />
    </Modal>
  );
}
