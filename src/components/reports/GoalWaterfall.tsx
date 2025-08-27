import React from 'react';
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid } from 'recharts';

export default function GoalWaterfall({ goals }:{ goals: Array<{name:string; current:number; target:number;}> }) {
  const data = goals.map(g => ({ name: g.name, remaining: Math.max(0, g.target - g.current) }));
  return (
    <div className="h-64">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="name" />
          <YAxis />
          <Tooltip />
          <Bar dataKey="remaining" fill="#06b6d4" />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
