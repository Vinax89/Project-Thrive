export type FilingStatus = 'single' | 'married_joint' | 'married_separate' | 'head';

type Bracket = { upTo: number; rate: number };
type Table = Record<FilingStatus, Bracket[]>;

const TABLE_2025: Table = {
  single: [
    { upTo: 11600, rate: 0.10 },
    { upTo: 47150, rate: 0.12 },
    { upTo: 100525, rate: 0.22 },
    { upTo: 191950, rate: 0.24 },
    { upTo: 243725, rate: 0.32 },
    { upTo: 609350, rate: 0.35 },
    { upTo: Infinity, rate: 0.37 }
  ],
  married_joint: [
    { upTo: 23200, rate: 0.10 },
    { upTo: 94300, rate: 0.12 },
    { upTo: 201050, rate: 0.22 },
    { upTo: 383900, rate: 0.24 },
    { upTo: 487450, rate: 0.32 },
    { upTo: 731200, rate: 0.35 },
    { upTo: Infinity, rate: 0.37 }
  ],
  married_separate: [
    { upTo: 11600, rate: 0.10 },
    { upTo: 47150, rate: 0.12 },
    { upTo: 100525, rate: 0.22 },
    { upTo: 191950, rate: 0.24 },
    { upTo: 243725, rate: 0.32 },
    { upTo: 365600, rate: 0.35 },
    { upTo: Infinity, rate: 0.37 }
  ],
  head: [
    { upTo: 16550, rate: 0.10 },
    { upTo: 63100, rate: 0.12 },
    { upTo: 100500, rate: 0.22 },
    { upTo: 191950, rate: 0.24 },
    { upTo: 243700, rate: 0.32 },
    { upTo: 609350, rate: 0.35 },
    { upTo: Infinity, rate: 0.37 }
  ]
};

export function estimateFederalTax(income: number, filingStatus: FilingStatus = 'single') {
  const brackets = TABLE_2025[filingStatus];
  let tax = 0;
  let prev = 0;
  for (const b of brackets) {
    const amount = Math.max(0, Math.min(income, b.upTo) - prev);
    tax += amount * b.rate;
    prev = b.upTo;
    if (income <= b.upTo) break;
  }
  return Math.max(0, Math.round(tax * 100) / 100);
}
