import type { Debt } from '../types';
export type { Debt };

export type PlanStep = {
  month: number;
  balances: Record<string, number>;
  payment: number;
  interest: number;
  principal: number;
  targetId: string;
  unlockedBadges?: string[];
};

export type PlanResult = {
  months: number;
  totalInterest: number;
  schedule: PlanStep[];
};

function round2(n: number) { return Math.round(n * 100) / 100; }
const EPS = 0.005;

export function payoff(
  debts: Debt[],
  monthlyBudget: number,
  method: 'snowball' | 'avalanche' = 'avalanche',
  maxMonths = 600,
  onMonth?: (step: PlanStep) => string[]
): PlanResult {
  const ds = debts.map(d => ({ ...d }));
  let month = 0;
  const schedule: PlanStep[] = [];
  const balances: Record<string, number> = Object.fromEntries(ds.map(d => [d.id, d.balance]));
  let totalInterest = 0;

  const allZero = () => ds.every(d => (balances[d.id] ?? 0) <= EPS);
  const minSum = ds.reduce((s, d) => s + Math.min(d.minPayment, balances[d.id] ?? d.balance), 0);

  if (monthlyBudget + 1e-6 < minSum && !allZero()) {
    schedule.push({
      month: 0,
      balances: { ...balances },
      payment: 0,
      interest: 0,
      principal: 0,
      targetId: '',
      unlockedBadges: ['Budget < sum(min payments): increase payoff budget or renegotiate mins']
    });
    return { months: 0, totalInterest: 0, schedule };
  }

  const pickTarget = () => {
    return ds.reduce<Debt | undefined>((best, d) => {
      const bal = balances[d.id];
      if (bal <= EPS) return best;
      if (!best) return d;
      const bestBal = balances[best.id];
      if (method === 'snowball') {
        if (bal < bestBal || (bal === bestBal && d.apr < best.apr)) return d;
        return best;
      } else {
        if (d.apr > best.apr || (d.apr === best.apr && bal < bestBal)) return d;
        return best;
      }
    }, undefined)?.id;
  };

  while (!allZero() && month < maxMonths) {
    month += 1;

    let interestThisMonth = 0;
    for (const d of ds) {
      const bal = balances[d.id];
      if (bal > EPS) {
        const i = (d.apr / 100) / 12 * bal;
        interestThisMonth += i;
        balances[d.id] = bal + i;
      }
    }
    totalInterest += interestThisMonth;

    let remaining = monthlyBudget;
    for (const d of ds) {
      const bal = balances[d.id];
      if (bal > EPS && d.minPayment > 0) {
        const pay = Math.min(d.minPayment, bal);
        balances[d.id] = bal - pay;
        remaining -= pay;
      }
    }

    const targetId = pickTarget();
    if (targetId && remaining > EPS) {
      const pay = Math.min(remaining, balances[targetId]);
      balances[targetId] -= pay;
      remaining -= pay;
    }

    for (const k of Object.keys(balances)) {
      if (balances[k] < EPS) balances[k] = 0;
    }

    const paymentThisMonth = monthlyBudget - Math.max(0, remaining);
    const principalPaid = Math.max(0, paymentThisMonth - interestThisMonth);

    const step: PlanStep = {
      month,
      balances: Object.fromEntries(Object.entries(balances).map(([k,v])=>[k, round2(v)])),
      payment: round2(paymentThisMonth),
      interest: round2(interestThisMonth),
      principal: round2(principalPaid),
      targetId: targetId ?? ''
    };

    if (onMonth) step.unlockedBadges = onMonth(step);
    schedule.push(step);
  }

  return { months: month, totalInterest: round2(totalInterest), schedule };
}
