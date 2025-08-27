import { fireEvent, render, screen } from '@testing-library/react';
import { expect, test, vi } from 'vitest';
import CommandPalette from './CommandPalette';

test('filters commands by label or keywords regardless of case', () => {
  const commands = [
    { id: '1', label: 'Alpha', action: vi.fn(), keywords: 'first' },
    { id: '2', label: 'Beta', action: vi.fn(), keywords: 'second' }
  ];
  render(<CommandPalette open={true} onClose={() => {}} commands={commands} />);
  const input = screen.getByPlaceholderText(/type a command/i);
  fireEvent.change(input, { target: { value: 'SECOND' } });
  expect(screen.queryByText('Beta')).not.toBeNull();
  expect(screen.queryByText('Alpha')).toBeNull();
});

test('renders nothing when closed', () => {
  const { container } = render(<CommandPalette open={false} onClose={() => {}} commands={[]} />);
  expect(container.firstChild).toBeNull();
});
