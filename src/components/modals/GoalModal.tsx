import React, { useEffect, useState } from 'react';
import Modal from '../Modal';
import Input from '../Input';
import Button from '../Button';
import type { Goal } from '../../types';

const safeId = () => (crypto?.randomUUID?.() ?? Math.random().toString(36).slice(2));

export default function GoalModal({
  open, onClose, initial, onSave, onDelete
}: {
  open: boolean;
  onClose: () => void;
  initial?: Goal | null;
  onSave: (g: Goal) => void;
  onDelete?: (id: string) => void;
}) {
  const [form, setForm] = useState<Goal>(initial ?? { id: safeId(), name: '', target: 0, current: 0 });
  useEffect(() => { setForm(initial ?? { id: safeId(), name: '', target: 0, current: 0 }); }, [initial, open]);
  const invalid = !form.name.trim() || form.target < 0 || form.current < 0 || form.current > form.target;
  return (
    <Modal open={open} onClose={onClose} title={initial ? 'Edit Goal' : 'Add Goal'}>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Input label="Name" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
        <Input label="Target" type="number" value={form.target} onChange={(e) => setForm({ ...form, target: parseFloat(e.target.value) || 0 })} />
        <Input label="Current" type="number" value={form.current} onChange={(e) => setForm({ ...form, current: parseFloat(e.target.value) || 0 })} />
        <Input label="Due (YYYY-MM-DD)" value={form.due || ''} onChange={(e) => setForm({ ...form, due: e.target.value })} />
      </div>
      <div className="mt-6 flex justify-between">
        {initial && onDelete ? (
          <Button variant="danger" onClick={() => onDelete(form.id)}>Delete</Button>
        ) : <span />}
        <div className="flex gap-2">
          <Button variant="secondary" onClick={onClose}>Cancel</Button>
          <Button disabled={invalid} onClick={() => onSave(form)}>Save</Button>
        </div>
      </div>
    </Modal>
  );
}
