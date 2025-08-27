import type { PlanStep } from './debt';

type BadgeCheck = {
  id: string;
  label: string;
  test: (s: PlanStep) => boolean;
};

export const BADGES: BadgeCheck[] = [
  { id: 'x1-cleared', label: 'X1 Cleared', test: s => Object.keys(s.balances).some(k => k.includes('x1') && s.balances[k] <= 0.01) },
  { id: 'paypal-cleared', label: 'PayPal Done', test: s => {
    const ids = Object.keys(s.balances).filter(k => k.toLowerCase().includes('paypal'));
    return ids.length > 0 && ids.every(k => s.balances[k] <= 0.01);
  }},
  { id: 'discover-cleared', label: 'Discover Free', test: s => Object.keys(s.balances).some(k => k.toLowerCase().includes('discover') && s.balances[k] <= 0.01) },
  { id: 'apple-cleared', label: 'Apple Card Free', test: s => Object.keys(s.balances).some(k => k.toLowerCase().includes('apple') && s.balances[k] <= 0.01) },
  { id: 'auto-30k', label: 'Auto Loan <$30k', test: s => Object.keys(s.balances).some(k => k.toLowerCase().includes('auto') && s.balances[k] < 30000) },
  { id: 'auto-20k', label: 'Auto Loan <$20k', test: s => Object.keys(s.balances).some(k => k.toLowerCase().includes('auto') && s.balances[k] < 20000) },
  { id: 'auto-10k', label: 'Auto Loan <$10k', test: s => Object.keys(s.balances).some(k => k.toLowerCase().includes('auto') && s.balances[k] < 10000) }
];

export function evaluateBadges(step: PlanStep, unlocked: Set<string>) {
  const newly: string[] = [];
  for (const b of BADGES) {
    if (!unlocked.has(b.id) && b.test(step)) {
      unlocked.add(b.id);
      newly.push(b.label);
    }
  }
  return newly;
}
