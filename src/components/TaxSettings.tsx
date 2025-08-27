import React from 'react';
import Select from './Select';
import { getStates, getYears } from '../taxes';

export default function TaxSettings({
  state,
  year,
  onStateChange,
  onYearChange
}: {
  state: string;
  year: number;
  onStateChange: (state: string) => void;
  onYearChange: (year: number) => void;
}) {
  const states = getStates();
  const years = getYears(state);

  return (
    <div className="flex gap-4">
      <Select
        label="State"
        value={state}
        onChange={(e) => onStateChange(e.target.value)}
      >
        {states.map((s) => (
          <option key={s} value={s}>
            {s}
          </option>
        ))}
      </Select>
      <Select
        label="Year"
        value={year}
        onChange={(e) => onYearChange(Number(e.target.value))}
      >
        {years.map((y) => (
          <option key={y} value={y}>
            {y}
          </option>
        ))}
      </Select>
    </div>
  );
}
