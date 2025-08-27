import React, { useEffect, useState } from 'react';
import Modal from '../Modal';
import Input from '../Input';
import Select from '../Select';
import Button from '../Button';
import type { Obligation, Cadence } from '../../types';

const safeId = () => (crypto?.randomUUID?.() ?? Math.random().toString(36).slice(2));

export default function ObligationModal({
  open, onClose, initial, onSave, onDelete
}: {
  open: boolean;
  onClose: () => void;
  initial?: Obligation | null;
  onSave: (o: Obligation) => void;
  onDelete?: (id: string) => void;
}) {
  const [form, setForm] = useState<Obligation>(initial ?? { id: safeId(), name: '', amount: 0, cadence: 'monthly' });
  useEffect(() => { setForm(initial ?? { id: safeId(), name: '', amount: 0, cadence: 'monthly' }); }, [initial, open]);
  const invalid = !form.name.trim() || form.amount < 0;
  return (
    <Modal open={open} onClose={onClose} title={initial ? 'Edit Obligation' : 'Add Obligation'}>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Input label="Name" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
        <Input label="Amount" type="number" value={form.amount} onChange={(e) => setForm({ ...form, amount: parseFloat(e.target.value) || 0 })} />
        <Select label="Cadence" value={form.cadence} onChange={(e) => setForm({ ...form, cadence: e.target.value as Cadence })}>
          <option value="weekly">Weekly</option>
          <option value="biweekly">Biweekly</option>
          <option value="monthly">Monthly</option>
          <option value="quarterly">Quarterly</option>
          <option value="yearly">Yearly</option>
        </Select>
        <Input label="Due (YYYY-MM-DD)" value={form.dueDate || ''} onChange={(e) => setForm({ ...form, dueDate: e.target.value })} />
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
