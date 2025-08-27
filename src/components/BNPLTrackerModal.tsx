import React from 'react';
import Modal from './Modal';
import { BNPLPlan } from '../types';

function daysUntil(dIso: string) {
  const d = new Date(dIso + 'T00:00:00Z'); // UTC midnight
  const now = new Date();
  return Math.floor((d.getTime() - now.getTime()) / 86400000);
}
function heatColor(dIso: string) {
  const diff = daysUntil(dIso);
  if (diff < 0) return 'bg-gray-400';
  if (diff < 7) return 'bg-red-500';
  if (diff < 14) return 'bg-orange-500';
  if (diff < 30) return 'bg-yellow-500';
  return 'bg-green-500';
}

export default function BNPLTrackerModal({ open, onClose, plans }:{
  open:boolean; onClose:()=>void; plans: BNPLPlan[];
}) {
  return (
    <Modal open={open} onClose={onClose} title="BNPL Tracker">
      <div className="space-y-6">
        {plans.map(p => (
          <div key={p.id} className="p-4 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
            <div className="flex items-center justify-between">
              <div>
                <div className="font-semibold">{p.provider}</div>
                <div className="text-sm text-gray-600 dark:text-gray-300">{p.description}</div>
              </div>
              <div className="text-sm">Remaining: <b>${p.remaining.toFixed(2)}</b> / ${p.total.toFixed(2)}</div>
            </div>
            <div className="mt-3 flex flex-wrap gap-2">
              {p.dueDates.map(d => (
                <div key={d} className={`px-3 py-1 rounded text-white ${heatColor(d)}`}>{d}</div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </Modal>
  );
}
