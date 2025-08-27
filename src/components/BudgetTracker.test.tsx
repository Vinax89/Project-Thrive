import { render, screen, fireEvent } from '@testing-library/react';
import { vi } from 'vitest';
import BudgetTracker from './BudgetTracker';
import type { Budget } from '../types';

const sampleBudgets: Budget[] = [
  { id: '1', category: 'Food', allocated: 100, spent: 50 }
];

describe('BudgetTracker', () => {
  it('renders budgets and allows adding a budget', () => {
    const onAdd = vi.fn();
    render(
      <BudgetTracker
        budgets={sampleBudgets}
        onAdd={onAdd}
        onUpdate={vi.fn()}
        onDelete={vi.fn()}
      />
    );

    expect(screen.getByText('Food')).toBeInTheDocument();
    expect(screen.getByText('$50.00 / $100.00')).toBeInTheDocument();

    fireEvent.click(screen.getByText('+ Add Budget'));
    fireEvent.change(screen.getByLabelText('Category'), { target: { value: 'Rent' } });
    fireEvent.change(screen.getByLabelText('Allocated'), { target: { value: '800' } });
    fireEvent.change(screen.getByLabelText('Spent'), { target: { value: '0' } });
    fireEvent.click(screen.getByText('Save'));

    expect(onAdd).toHaveBeenCalledWith(
      expect.objectContaining({ category: 'Rent', allocated: 800, spent: 0 })
    );
  });
});
