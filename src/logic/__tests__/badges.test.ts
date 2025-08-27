import { describe, it, expect } from 'vitest';
import { evaluateBadges } from '../badges';
import type { PlanStep } from '../debt';

const makeStep = (balances: Record<string, number>): PlanStep => ({
  month: 0,
  balances,
  payment: 0,
  interest: 0,
  principal: 0,
  targetId: ''
});

describe('evaluateBadges()', () => {
  it('unlocks X1 badge', () => {
    const step = makeStep({ 'x1 card': 0 });
    const result = evaluateBadges(step, new Set());
    expect(result).toEqual(['X1 Cleared']);
  });

  it('unlocks PayPal badge', () => {
    const step = makeStep({ PayPal: 0 });
    const result = evaluateBadges(step, new Set());
    expect(result).toEqual(['PayPal Done']);
  });

  it('unlocks Discover badge', () => {
    const step = makeStep({ 'Discover It': 0 });
    const result = evaluateBadges(step, new Set());
    expect(result).toEqual(['Discover Free']);
  });

  it('unlocks Apple badge', () => {
    const step = makeStep({ 'Apple Card': 0 });
    const result = evaluateBadges(step, new Set());
    expect(result).toEqual(['Apple Card Free']);
  });

  it('unlocks auto loan badges sequentially', () => {
    const auto = 'Auto Loan';
    const unlocked = new Set<string>();

    const step1 = makeStep({ [auto]: 25000 });
    expect(evaluateBadges(step1, unlocked)).toEqual(['Auto Loan <$30k']);

    const step2 = makeStep({ [auto]: 15000 });
    expect(evaluateBadges(step2, unlocked)).toEqual(['Auto Loan <$20k']);

    const step3 = makeStep({ [auto]: 5000 });
    expect(evaluateBadges(step3, unlocked)).toEqual(['Auto Loan <$10k']);
  });
});

