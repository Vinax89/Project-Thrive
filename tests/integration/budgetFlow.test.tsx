import { render, screen, fireEvent } from '@testing-library/react';
import React, { useState } from 'react';
import BudgetTracker from '../../src/components/BudgetTracker';
import type { Budget } from '../../src/types';

function BudgetApp() {
  const [budgets, setBudgets] = useState<Budget[]>([]);
  return (
    <BudgetTracker
      budgets={budgets}
      onAdd={(b) => setBudgets([...budgets, b])}
      onUpdate={(b) => setBudgets(budgets.map((x) => (x.id === b.id ? b : x)))}
      onDelete={(id) => setBudgets(budgets.filter((x) => x.id !== id))}
    />
  );
}

describe('budget creation flow', () => {
  it('creates and displays a new budget', () => {
    render(<BudgetApp />);

    fireEvent.click(screen.getByText('+ Add Budget'));
    fireEvent.change(screen.getByLabelText('Category'), { target: { value: 'Groceries' } });
    fireEvent.change(screen.getByLabelText('Allocated'), { target: { value: '300' } });
    fireEvent.change(screen.getByLabelText('Spent'), { target: { value: '0' } });
    fireEvent.click(screen.getByText('Save'));

    expect(screen.getByText('Groceries')).toBeInTheDocument();
  });
});
