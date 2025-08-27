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

type QueueItem = { id: string; balance: number; apr: number };

class PriorityQueue {
  private data: QueueItem[] = [];
  private index = new Map<string, number>();
  constructor(private compare: (a: QueueItem, b: QueueItem) => number) {}

  private swap(i: number, j: number) {
    [this.data[i], this.data[j]] = [this.data[j], this.data[i]];
    this.index.set(this.data[i].id, i);
    this.index.set(this.data[j].id, j);
  }

  private bubbleUp(pos: number) {
    while (pos > 0) {
      const parent = (pos - 1) >> 1;
      if (this.compare(this.data[pos], this.data[parent]) >= 0) break;
      this.swap(pos, parent);
      pos = parent;
    }
  }

  private bubbleDown(pos: number) {
    const n = this.data.length;
    // eslint-disable-next-line no-constant-condition
    while (true) {
      const left = pos * 2 + 1;
      const right = left + 1;
      let best = pos;
      if (left < n && this.compare(this.data[left], this.data[best]) < 0) best = left;
      if (right < n && this.compare(this.data[right], this.data[best]) < 0) best = right;
      if (best === pos) break;
      this.swap(pos, best);
      pos = best;
    }
  }

  peek() { return this.data[0]; }
  size() { return this.data.length; }

  push(item: QueueItem) {
    this.data.push(item);
    this.index.set(item.id, this.data.length - 1);
    this.bubbleUp(this.data.length - 1);
  }

  pop() {
    if (this.data.length === 0) return undefined;
    const top = this.data[0];
    const last = this.data.pop()!;
    this.index.delete(top.id);
    if (this.data.length > 0) {
      this.data[0] = last;
      this.index.set(last.id, 0);
      this.bubbleDown(0);
    }
    return top;
  }

  update(item: QueueItem) {
    const idx = this.index.get(item.id);
    if (idx === undefined) {
      this.push(item);
    } else {
      this.data[idx] = item;
      this.bubbleUp(idx);
      this.bubbleDown(idx);
    }
  }

  remove(id: string) {
    const idx = this.index.get(id);
    if (idx === undefined) return;
    const last = this.data.pop()!;
    this.index.delete(id);
    if (idx === this.data.length) return;
    this.data[idx] = last;
    this.index.set(last.id, idx);
    this.bubbleUp(idx);
    this.bubbleDown(idx);
  }
}

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
  const aprs: Record<string, number> = Object.fromEntries(ds.map(d => [d.id, d.apr]));
  let totalInterest = 0;

  const snowballQ = new PriorityQueue((a, b) => {
    if (a.balance !== b.balance) return a.balance - b.balance;
    if (a.apr !== b.apr) return a.apr - b.apr;
    return a.id.localeCompare(b.id);
  });
  const avalancheQ = new PriorityQueue((a, b) => {
    if (a.apr !== b.apr) return b.apr - a.apr;
    if (a.balance !== b.balance) return a.balance - b.balance;
    return a.id.localeCompare(b.id);
  });
  for (const d of ds) {
    const bal = balances[d.id];
    if (bal > EPS) {
      snowballQ.push({ id: d.id, balance: bal, apr: d.apr });
      avalancheQ.push({ id: d.id, balance: bal, apr: d.apr });
    }
  }

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
    const q = method === 'snowball' ? snowballQ : avalancheQ;
    while (q.size() > 0) {
      const top = q.peek();
      if (top && balances[top.id] > EPS) return top.id;
      q.pop();
    }
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

    // update queues after interest and minimum payments
    for (const d of ds) {
      const bal = balances[d.id];
      if (bal > EPS) {
        snowballQ.update({ id: d.id, balance: bal, apr: d.apr });
        avalancheQ.update({ id: d.id, balance: bal, apr: d.apr });
      } else {
        snowballQ.remove(d.id);
        avalancheQ.remove(d.id);
      }
    }

    const targetId = pickTarget();
    if (targetId && remaining > EPS) {
      const pay = Math.min(remaining, balances[targetId]);
      balances[targetId] -= pay;
      remaining -= pay;
      const bal = balances[targetId];
      if (bal > EPS) {
        snowballQ.update({ id: targetId, balance: bal, apr: aprs[targetId] });
        avalancheQ.update({ id: targetId, balance: bal, apr: aprs[targetId] });
      } else {
        snowballQ.remove(targetId);
        avalancheQ.remove(targetId);
      }
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
