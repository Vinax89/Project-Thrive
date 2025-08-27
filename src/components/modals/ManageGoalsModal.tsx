import React, { useState } from 'react';
import Modal from '../Modal';
import Button from '../Button';
import GoalModal from './GoalModal';
import type { Goal } from '../../types';

export default function ManageGoalsModal({
  open, onClose, goals, onChange
}: {
  open: boolean;
  onClose: () => void;
  goals: Goal[];
  onChange: (next: Goal[]) => void;
}) {
  const [editing, setEditing] = useState<Goal | null>(null);
  const [creating, setCreating] = useState<boolean>(false);

  return (
    <Modal open={open} onClose={onClose} title="Manage Goals">
      <div className="flex justify-end mb-4">
        <Button onClick={() => { setCreating(true); setEditing(null); }}>+ Add Goal</Button>
      </div>
      <div className="overflow-auto">
        <table className="min-w-full text-sm">
          <thead>
            <tr className="text-left border-b border-gray-200 dark:border-gray-700">
              <th className="py-2 pr-4">Name</th>
              <th className="py-2 pr-4">Current</th>
              <th className="py-2 pr-4">Target</th>
              <th className="py-2 pr-4">Due</th>
              <th className="py-2 pr-4">Actions</th>
            </tr>
          </thead>
          <tbody>
            {goals.map(g => (
              <tr key={g.id} className="border-b border-gray-100 dark:border-gray-800">
                <td className="py-2 pr-4">{g.name}</td>
                <td className="py-2 pr-4">${g.current.toFixed(2)}</td>
                <td className="py-2 pr-4">${g.target.toFixed(2)}</td>
                <td className="py-2 pr-4">{g.due || '—'}</td>
                <td className="py-2 pr-4">
                  <div className="flex gap-2">
                    <Button variant="secondary" onClick={() => setEditing(g)}>Edit</Button>
                    <Button variant="danger" onClick={() => onChange(goals.filter(x => x.id !== g.id))}>Delete</Button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <GoalModal
        open={creating}
        onClose={() => setCreating(false)}
        onSave={(g) => { onChange([...goals, g]); setCreating(false); }}
      />
      <GoalModal
        open={!!editing}
        initial={editing}
        onClose={() => setEditing(null)}
        onDelete={(id) => { onChange(goals.filter(x => x.id !== id)); setEditing(null); }}
        onSave={(g) => { onChange(goals.map(x => x.id === g.id ? g : x)); setEditing(null); }}
      />
    </Modal>
  );
}
