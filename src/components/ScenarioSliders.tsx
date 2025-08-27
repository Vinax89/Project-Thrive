import React from 'react';
import Input from './Input';

export default function ScenarioSliders({ income, setIncome, expenses, setExpenses }:{
  income:number; setIncome:(n:number)=>void; expenses:number; setExpenses:(n:number)=>void;
}) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      <div className="p-4 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
        <div className="font-medium mb-2">Income Adjuster</div>
        <Input type="range" min="0" max="20000" step="100" value={income} onChange={e=>setIncome(parseFloat(e.target.value))} />
        <div className="text-sm mt-2">Monthly Income: <b>${income.toFixed(2)}</b></div>
      </div>
      <div className="p-4 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
        <div className="font-medium mb-2">Expense Adjuster</div>
        <Input type="range" min="0" max="20000" step="100" value={expenses} onChange={e=>setExpenses(parseFloat(e.target.value))} />
        <div className="text-sm mt-2">Monthly Expenses: <b>${expenses.toFixed(2)}</b></div>
      </div>
    </div>
  );
}
