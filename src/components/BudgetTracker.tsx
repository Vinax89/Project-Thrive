import React, { useMemo, useState } from 'react';
import Button from './Button';
import Input from './Input';
import Modal from './Modal';
import { Budget } from '../types';

const safeId = () => (crypto?.randomUUID?.() ?? Math.random().toString(36).slice(2));

function BudgetTracker({ budgets, onAdd, onUpdate, onDelete }:{
  budgets: Budget[];
  onAdd: (b: Budget)=>void;
  onUpdate: (b: Budget)=>void;
  onDelete: (id: string)=>void;
}){
  const [editing, setEditing] = useState<Budget|null>(null);
  const [creating, setCreating] = useState(false);
  const [form, setForm] = useState<Budget>({ id:safeId(), category:'New', allocated:0, spent:0 });

  const totalAllocated = useMemo(()=> budgets.reduce((s,b)=>s+b.allocated,0), [budgets]);
  const totalSpent = useMemo(()=> budgets.reduce((s,b)=>s+b.spent,0), [budgets]);

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold">Budgets</h3>
        <Button variant="secondary" onClick={()=>{ setForm({ id:safeId(), category:'New', allocated:0, spent:0 }); setCreating(true); }}>+ Add Budget</Button>
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {budgets.map(b => {
          const pct = b.allocated>0 ? Math.min(100, Math.round((b.spent/b.allocated)*100)) : 0;
          const over = b.spent > b.allocated;
          return (
            <div key={b.id} className="p-4 bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
              <div className="flex items-start justify-between">
                <div>
                  <div className="font-medium">{b.category}</div>
                  <div className="text-sm text-gray-500 dark:text-gray-400">${b.spent.toFixed(2)} / ${b.allocated.toFixed(2)}</div>
                </div>
                <div className="flex gap-2">
                  <button className="p-2 rounded hover:bg-gray-100 dark:hover:bg-gray-700" onClick={()=>setEditing(b)}>Edit</button>
                  <button className="p-2 rounded hover:bg-gray-100 dark:hover:bg-gray-700" onClick={()=>onDelete(b.id)}>Delete</button>
                </div>
              </div>
              <div className="mt-3 w-full bg-gray-100 dark:bg-gray-700 rounded h-2 overflow-hidden">
                <div className={`h-2 ${over ? 'bg-red-500' : pct>=80 ? 'bg-yellow-500' : 'bg-green-500'}`} style={{ width: pct + '%' }} />
              </div>
              {over && <div className="mt-2 text-xs text-red-500">Over budget by ${(b.spent - b.allocated).toFixed(2)}</div>}
            </div>
          );
        })}
      </div>
      <div className="p-4 bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
        <div className="flex items-center justify-between">
          <div className="font-medium">Totals</div>
          <div className="text-sm text-gray-600 dark:text-gray-300">${totalSpent.toFixed(2)} spent / ${totalAllocated.toFixed(2)} allocated</div>
        </div>
        <div className="mt-2 w-full bg-gray-100 dark:bg-gray-700 rounded h-2 overflow-hidden">
          <div className="h-2 bg-blue-600" style={{ width: (totalAllocated>0? Math.min(100, Math.round((totalSpent/totalAllocated)*100)) : 0) + '%' }} />
        </div>
      </div>

      <Modal open={creating} onClose={()=>setCreating(false)} title="Add Budget">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Input label="Category" value={form.category} onChange={e=>setForm({...form, category: e.target.value})} />
          <Input label="Allocated" type="number" value={form.allocated} onChange={e=>setForm({...form, allocated: parseFloat(e.target.value)||0})} />
          <Input label="Spent" type="number" value={form.spent} onChange={e=>setForm({...form, spent: parseFloat(e.target.value)||0})} />
        </div>
        <div className="mt-6 flex justify-end gap-2">
          <Button variant="secondary" onClick={()=>setCreating(false)}>Cancel</Button>
          <Button onClick={()=>{ onAdd(form); setCreating(false); }}>Save</Button>
        </div>
      </Modal>

      <Modal open={!!editing} onClose={()=>setEditing(null)} title="Edit Budget">
        {editing && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input label="Category" value={editing.category} onChange={e=>setEditing({...editing, category: e.target.value})} />
            <Input label="Allocated" type="number" value={editing.allocated} onChange={e=>setEditing({...editing, allocated: parseFloat(e.target.value)||0})} />
            <Input label="Spent" type="number" value={editing.spent} onChange={e=>setEditing({...editing, spent: parseFloat(e.target.value)||0})} />
          </div>
        )}
        <div className="mt-6 flex justify-end gap-2">
          <Button variant="secondary" onClick={()=>setEditing(null)}>Cancel</Button>
          <Button onClick={()=>{ if(editing) onUpdate(editing); setEditing(null); }}>Save</Button>
        </div>
      </Modal>
    </div>
  );
}

export default React.memo(BudgetTracker);
