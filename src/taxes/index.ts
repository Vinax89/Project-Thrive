export type FilingStatus = 'single' | 'married_joint' | 'married_separate' | 'head';

type Bracket = { upTo: number | null; rate: number };
type RateTable = Record<string, Bracket[]>;

// Load all JSON rate tables at build time
const modules = import.meta.glob('./data/*.json', {
  eager: true,
  import: 'default'
}) as Record<string, RateTable>;

const tables: Record<string, Record<number, RateTable>> = {};
for (const path of Object.keys(modules)) {
  const file = path.split('/').pop()!; // e.g., federal_2025.json
  const [state, yearStr] = file.replace('.json', '').split('_');
  const year = Number(yearStr);
  tables[state] ??= {};
  tables[state][year] = modules[path];
}

export function estimateTax(
  state: string,
  year: number,
  income: number,
  filingStatus: FilingStatus = 'single'
) {
  const table = tables[state]?.[year];
  if (!table) throw new Error(`No tax table for ${state} ${year}`);
  const brackets = table[filingStatus] ?? table['single'];
  let tax = 0;
  let prev = 0;
  for (const b of brackets) {
    const upTo = b.upTo ?? Infinity;
    const amount = Math.max(0, Math.min(income, upTo) - prev);
    tax += amount * b.rate;
    prev = upTo;
    if (income <= upTo) break;
  }
  return Math.round(tax * 100) / 100;
}

export function getStates() {
  return Object.keys(tables);
}

export function getYears(state: string): number[] {
  return Object.keys(tables[state] ?? {})
    .map((y) => Number(y))
    .sort((a, b) => a - b);
}
