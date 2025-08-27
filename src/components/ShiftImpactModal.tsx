import React, { useMemo, useState } from 'react';
import Modal from './Modal';
import Input from './Input';

export default function ShiftImpactModal({ open, onClose }:{ open:boolean; onClose:()=>void; }) {
  const [baseRate, setBaseRate] = useState(64.59);
  const [hoursPerShift, setHoursPerShift] = useState(12);
  const [extraShifts, setExtraShifts] = useState(2);
  const [differentials, setDiff] = useState(6);

  const monthlyExtra = useMemo(()=> (baseRate + differentials) * hoursPerShift * extraShifts, [baseRate, hoursPerShift, extraShifts, differentials]);

  return (
    <Modal open={open} onClose={onClose} title="Shift Impact Calculator">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Input label="Base Rate ($/hr)" type="number" value={baseRate} onChange={e=>setBaseRate(parseFloat(e.target.value)||0)} />
        <Input label="Hours per Shift" type="number" value={hoursPerShift} onChange={e=>setHoursPerShift(parseFloat(e.target.value)||0)} />
        <Input label="Extra Shifts / Month" type="number" value={extraShifts} onChange={e=>setExtraShifts(parseFloat(e.target.value)||0)} />
        <Input label="Differentials ($/hr)" type="number" value={differentials} onChange={e=>setDiff(parseFloat(e.target.value)||0)} />
      </div>
      <div className="mt-4 text-lg">Estimated added monthly income: <b>${monthlyExtra.toFixed(2)}</b></div>
      <div className="text-sm text-gray-600 dark:text-gray-300 mt-2">Use this number to adjust the Projection sliders and Debt Calculator budget to see payoff acceleration.</div>
    </Modal>
  );
}
