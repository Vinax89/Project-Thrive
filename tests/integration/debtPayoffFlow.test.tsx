import { render, screen } from '@testing-library/react';
import DebtScheduleViewer from '../../src/components/DebtScheduleViewer';
import { payoff } from '../../src/logic/debt';

describe('debt payoff flow', () => {
  it('renders schedule from payoff plan', () => {
    const plan = payoff([
      { id: 'loan', name: 'Loan', balance: 1000, apr: 12, minPayment: 50 }
    ], 100);

    render(<DebtScheduleViewer plan={plan} />);

    expect(screen.getByText('Payments Breakdown')).toBeInTheDocument();
    expect(screen.getByText('Amortization Table')).toBeInTheDocument();
    const payment = `$${plan.schedule[0].payment.toFixed(2)}`;
    expect(screen.getAllByText(payment)[0]).toBeInTheDocument();
  });
});
