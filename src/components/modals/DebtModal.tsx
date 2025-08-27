import React, { useEffect, useState } from 'react';
import Modal from '../Modal';
import Input from '../Input';
import Button from '../Button';

export type Debt = {
  id: string;
  name: string;
  balance: number;
  apr: number;
  minPayment: number;
};

const safeId = () => (crypto?.randomUUID?.() ?? Math.random().toString(36).slice(2));

export default function DebtModal({
  open, onClose, initial, onSave, onDelete
}: {
  open: boolean;
  onClose: () => void;
  initial?: Debt | null;
  onSave: (d: Debt) => void;
  onDelete?: (id: string) => void;
}) {
  const [form, setForm] = useState<Debt>(initial ?? { id: safeId(), name: '', balance: 0, apr: 0, minPayment: 0 });
  useEffect(() => { setForm(initial ?? { id: safeId(), name: '', balance: 0, apr: 0, minPayment: 0 }); }, [initial, open]);
  const invalid = !form.name.trim() || form.balance < 0 || form.apr < 0 || form.minPayment < 0;
  return (
    <Modal open={open} onClose={onClose} title={initial ? 'Edit Debt' : 'Add Debt'}>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Input label="Name" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
        <Input label="Balance" type="number" value={form.balance} onChange={(e) => setForm({ ...form, balance: parseFloat(e.target.value) || 0 })} />
        <Input label="APR (%)" type="number" value={form.apr} onChange={(e) => setForm({ ...form, apr: parseFloat(e.target.value) || 0 })} />
        <Input label="Min Payment" type="number" value={form.minPayment} onChange={(e) => setForm({ ...form, minPayment: parseFloat(e.target.value) || 0 })} />
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
