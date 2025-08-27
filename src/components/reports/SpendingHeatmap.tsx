import React from 'react';

export default function SpendingHeatmap({ matrix }:{ matrix:number[][] }) {
  const max = Math.max(...matrix.flat(), 1);
  return (
    <div className="grid grid-cols-12 gap-1">
      {matrix.map((row, i) => row.map((v, j) => {
        const bg = `rgba(59,130,246,${v/max})`;
        return <div key={`${i}-${j}`} title={`M${j+1}: $${v.toFixed(0)}`} style={{ width: 16, height: 16, backgroundColor: bg }} className="rounded" />;
      }))}
    </div>
  );
}
