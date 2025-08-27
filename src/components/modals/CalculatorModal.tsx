import React, { useMemo, useState } from 'react';
import Modal from '../Modal';
import Input from '../Input';
import Select from '../Select';
import { payoff } from '../../logic/debt';

type Debt = { id:string; name:string; balance:number; apr:number; minPayment:number };

export default function CalculatorModal({
  open, onClose, debts
}: { open:boolean; onClose:()=>void; debts: Debt[]; }) {
  const [budget, setBudget] = useState(1500);
  const [method, setMethod] = useState<'snowball'|'avalanche'>('avalanche');

  const result = useMemo(()=> payoff(debts, budget, method, 600), [debts, budget, method]);

  return (
    <Modal open={open} onClose={onClose} title="Debt Payoff Calculator">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Input label="Monthly Payoff Budget" type="number" value={budget} onChange={e=>setBudget(parseFloat(e.target.value)||0)} />
        <Select label="Method" value={method} onChange={e=>setMethod(e.target.value as any)}>
          <option value="avalanche">Avalanche (highest APR first)</option>
          <option value="snowball">Snowball (smallest balance first)</option>
        </Select>
        <div className="flex flex-col justify-end">
          <div className="text-sm text-gray-600 dark:text-gray-300">Months to payoff</div>
          <div className="text-2xl font-semibold">{result.months}</div>
        </div>
      </div>
      <div className="mt-4 text-sm">
        Total interest: <b>${result.totalInterest.toFixed(2)}</b> — Strategy: <b>{method}</b>
      </div>
      <div className="mt-6 flex justify-end">
        <button className="px-4 py-2 rounded bg-blue-600 text-white" onClick={onClose}>Close</button>
      </div>
    </Modal>
  );
}
