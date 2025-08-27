import React, { useMemo, useState } from 'react';
import { ResponsiveContainer, LineChart, Line, XAxis, YAxis, Tooltip, CartesianGrid } from 'recharts';
import ScenarioSliders from './ScenarioSliders';
import { RecurringTransaction, CashFlowProjectionPoint } from '../types';

function monthlyFromCadence(amount: number, cadence: RecurringTransaction['cadence']) {
  switch (cadence) {
    case 'weekly': return amount * 4.345;
    case 'biweekly': return amount * 2.1725;
    case 'monthly': return amount;
    case 'quarterly': return amount / 3;
    case 'yearly': return amount / 12;
    default: return amount;
  }
}

const fmtMoney = (n: number) => `$${n.toLocaleString(undefined, { maximumFractionDigits: 0 })}`;
const fmtMonth = (isoYYYYMM: string) => {
  const [y, m] = isoYYYYMM.split('-').map(Number);
  const d = new Date(Date.UTC(y, (m ?? 1) - 1, 1));
  return d.toLocaleString(undefined, { month: 'short', year: 'numeric' });
};

export default function CashFlowProjection({ currentBalance, recurring, months=12 }:{
  currentBalance:number; recurring: RecurringTransaction[]; months?: number;
}) {
  const [incomeAdj, setIncomeAdj] = useState(0);
  const [expenseAdj, setExpenseAdj] = useState(0);

  const { monthlyIncome, monthlyExpense } = useMemo(()=>{
    const monthlyIncome = recurring.filter(t=>t.type==='income').reduce((s,t)=>s+monthlyFromCadence(t.amount, t.cadence),0) + incomeAdj;
    const monthlyExpense = recurring.filter(t=>t.type==='expense').reduce((s,t)=>s+monthlyFromCadence(t.amount, t.cadence),0) + expenseAdj;
    return { monthlyIncome, monthlyExpense };
  }, [recurring, incomeAdj, expenseAdj]);

  const data = useMemo<CashFlowProjectionPoint[]>(()=>{
    const res: CashFlowProjectionPoint[] = [];
    let bal = currentBalance;
    const now = new Date();
    for (let i=0;i<months;i++){
      const label = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth()+i, 1)).toISOString().slice(0,7);
      bal = bal + monthlyIncome - monthlyExpense;
      res.push({ label, endingBalance: Math.round(bal*100)/100 });
    }
    return res;
  }, [currentBalance, months, monthlyIncome, monthlyExpense]);

  return (
    <div className="space-y-4">
      <ScenarioSliders income={monthlyIncome} setIncome={n=>setIncomeAdj(n - (monthlyIncome - incomeAdj))}
                       expenses={monthlyExpense} setExpenses={n=>setExpenseAdj(n - (monthlyExpense - expenseAdj))} />
      <div className="p-4 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
        <div className="mb-2 font-medium">Projected Balance</div>
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={data}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="label" tickFormatter={fmtMonth} />
              <YAxis tickFormatter={fmtMoney} />
              <Tooltip formatter={(v) => fmtMoney(Number(v))} labelFormatter={(l) => fmtMonth(String(l))} />
              <Line type="monotone" dataKey="endingBalance" stroke="#3b82f6" strokeWidth={2} dot={false} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}
