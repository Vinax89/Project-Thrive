import React from 'react';

export default function SankeyFlow({ flows }:{ flows: Array<{source:string; target:string; amount:number}> }) {
  const total = flows.reduce((s,f)=>s+f.amount,0) || 1;
  return (
    <div className="space-y-2">
      {flows.map((f,i)=>{
        const w = Math.max(2, Math.round((f.amount/total)*100));
        return (
          <div key={i}>
            <div className="text-xs text-gray-600 dark:text-gray-300">{f.source} → {f.target} (${f.amount.toFixed(2)})</div>
            <div className="h-2 bg-blue-200 dark:bg-blue-900 rounded overflow-hidden">
              <div className="h-2 bg-blue-600" style={{ width: w + '%' }} />
            </div>
          </div>
        );
      })}
    </div>
  );
}
