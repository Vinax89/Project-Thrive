export type Cadence = 'weekly' | 'biweekly' | 'monthly' | 'quarterly' | 'yearly';
export type TxnType = 'income' | 'expense';

export interface Debt {
  id: string;
  name: string;
  balance: number;
  apr: number; // percent
  minPayment: number;
}

export interface BNPLPlan {
  id: string;
  provider: 'PayPal' | 'Affirm' | 'Klarna';
  description: string;
  total: number;
  remaining: number;
  dueDates: string[]; // ISO dates
  apr?: number;
}

export interface Budget {
  id: string;
  category: string;
  allocated: number;
  spent: number;
}

export interface Obligation {
  id: string;
  name: string;
  amount: number;
  cadence: Cadence;
  dueDate?: string;
}

export interface Goal {
  id: string;
  name: string;
  target: number;
  current: number;
  due?: string;
  priority?: number;
}

export interface RecurringTransaction {
  id: string;
  name: string;
  type: TxnType;
  amount: number;
  cadence: Cadence;
}

export interface Transaction {
  id: string;
  name: string;
  type: TxnType;
  amount: number;
  date: string;
  category?: string;
}

export interface CashFlowProjectionPoint {
  label: string;
  endingBalance: number;
}

export interface ImportPayload {
  budgets: Budget[];
  debts: Debt[];
  bnpl: BNPLPlan[];
  recurring: RecurringTransaction[];
  goals: Goal[];
}
