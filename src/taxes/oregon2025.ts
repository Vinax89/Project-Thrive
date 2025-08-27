export function estimateOregonTax(income: number) {
  const brackets = [
    { upTo: 4400, rate: 0.0475 },
    { upTo: 11000, rate: 0.0675 },
    { upTo: 125000, rate: 0.0875 },
    { upTo: Infinity, rate: 0.099 }
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
