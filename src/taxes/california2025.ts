export function estimateCaliforniaTax(income: number) {
  const brackets = [
    { upTo: 10412, rate: 0.01 },
    { upTo: 24684, rate: 0.02 },
    { upTo: 38959, rate: 0.04 },
    { upTo: 54082, rate: 0.06 },
    { upTo: 68350, rate: 0.08 },
    { upTo: 349137, rate: 0.093 },
    { upTo: 418961, rate: 0.103 },
    { upTo: 698271, rate: 0.113 },
    { upTo: Infinity, rate: 0.123 }
  ];
  let tax = 0, prev = 0;
  for (const b of brackets) {
    const amt = Math.max(0, Math.min(income, b.upTo) - prev);
    tax += amt * b.rate;
    prev = b.upTo;
    if (income <= b.upTo) break;
  }
  return Math.round(tax * 100) / 100;
}
