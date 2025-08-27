import { render, screen, fireEvent } from '@testing-library/react';
import CashFlowProjection from './CashFlowProjection';
import type { RecurringTransaction } from '../types';

describe('CashFlowProjection', () => {
  const recurring: RecurringTransaction[] = [
    { id: 'inc', type: 'income', amount: 1000, cadence: 'monthly' },
    { id: 'exp', type: 'expense', amount: 500, cadence: 'monthly' }
  ];

  it('shows income and expense adjustments', () => {
    render(<CashFlowProjection currentBalance={0} recurring={recurring} months={1} />);

    expect(screen.getByText(/Monthly Income:/)).toHaveTextContent('$1000.00');
    expect(screen.getByText(/Monthly Expenses:/)).toHaveTextContent('$500.00');

    const [incomeSlider, expenseSlider] = screen.getAllByRole('slider');

    fireEvent.change(incomeSlider, { target: { value: '2000' } });
    fireEvent.change(expenseSlider, { target: { value: '1000' } });

    expect(screen.getByText(/Monthly Income:/)).toHaveTextContent('$2000.00');
    expect(screen.getByText(/Monthly Expenses:/)).toHaveTextContent('$1000.00');
  });
});
