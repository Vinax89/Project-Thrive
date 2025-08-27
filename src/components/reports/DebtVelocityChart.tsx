import React, { useMemo } from 'react';
import { ResponsiveContainer, LineChart, Line, XAxis, YAxis, Tooltip, CartesianGrid } from 'recharts';
import { PlanResult } from '../../logic/debt';

const fmtMoney = (n: number) => `$${n.toLocaleString(undefined, { maximumFractionDigits: 0 })}`;

export default function DebtVelocityChart({ plan }:{ plan: PlanResult }) {
  const data = useMemo(() => plan.schedule.map(s => ({ month: s.month, principal: s.principal, interest: s.interest })), [plan.schedule]);
  return (
    <div className="h-64">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={data}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="month" />
          <YAxis tickFormatter={fmtMoney} />
          <Tooltip formatter={(v) => fmtMoney(Number(v))} />
          <Line type="monotone" dataKey="principal" stroke="#22c55e" strokeWidth={2} dot={false} />
          <Line type="monotone" dataKey="interest" stroke="#ef4444" strokeWidth={2} dot={false} />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
