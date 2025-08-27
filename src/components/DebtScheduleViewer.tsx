import React, { useMemo } from 'react';
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  Legend
} from 'recharts';
import { FixedSizeList, ListChildComponentProps } from 'react-window';
import { PlanResult } from '../logic/debt';

const fmtMoney = (n: number) => `$${n.toLocaleString(undefined, { maximumFractionDigits: 0 })}`;

export default function DebtScheduleViewer({ plan }: { plan: PlanResult }) {
  const chartData = useMemo(
    () =>
      plan.schedule.map((s) => ({
        month: s.month,
        interest: s.interest,
        principal: s.principal,
        payment: s.payment
      })),
    [plan.schedule]
  );

  const ROW_HEIGHT = 40;

  const TableRow = ({ index, style }: ListChildComponentProps) => {
    const s = plan.schedule[index];
    return (
      <tr key={s.month} style={style} className="border-b border-gray-100 dark:border-gray-800">
        <td className="py-2 pr-4">{s.month}</td>
        <td className="py-2 pr-4">${s.payment.toFixed(2)}</td>
        <td className="py-2 pr-4 text-green-600">${s.principal.toFixed(2)}</td>
        <td className="py-2 pr-4 text-red-500">${s.interest.toFixed(2)}</td>
        <td className="py-2 pr-4">{(s.unlockedBadges || []).join(', ')}</td>
      </tr>
    );
  };

  const TBody = React.forwardRef<HTMLTableSectionElement, React.HTMLAttributes<HTMLTableSectionElement>>(
    (props, ref) => <tbody ref={ref} {...props} />
  );

  return (
    <div className="space-y-4">
      <div className="p-4 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
        <div className="font-medium mb-2">Payments Breakdown</div>
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="month" />
              <YAxis tickFormatter={fmtMoney} />
              <Tooltip formatter={(v) => fmtMoney(Number(v))} />
              <Legend />
              <Area type="monotone" dataKey="principal" stackId="1" stroke="#22c55e" fill="#22c55e" />
              <Area type="monotone" dataKey="interest" stackId="1" stroke="#ef4444" fill="#ef4444" />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>
      <div className="p-4 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
        <div className="font-medium mb-2">Amortization Table</div>
        <table className="min-w-full text-sm">
          <thead>
            <tr className="text-left border-b border-gray-200 dark:border-gray-700">
              <th className="py-2 pr-4">Month</th>
              <th className="py-2 pr-4">Payment</th>
              <th className="py-2 pr-4">Principal</th>
              <th className="py-2 pr-4">Interest</th>
              <th className="py-2 pr-4">Badges Unlocked</th>
            </tr>
          </thead>
          <FixedSizeList
            height={Math.min(400, plan.schedule.length * ROW_HEIGHT)}
            itemCount={plan.schedule.length}
            itemSize={ROW_HEIGHT}
            width="100%"
            outerElementType={TBody}
          >
            {TableRow}
          </FixedSizeList>
        </table>
      </div>
    </div>
  );
}
