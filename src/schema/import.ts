import { z } from 'zod';

const budgetSchema = z.object({
  id: z.string(),
  category: z.string(),
  allocated: z.number(),
  spent: z.number()
});

const debtSchema = z.object({
  id: z.string(),
  name: z.string(),
  balance: z.number(),
  apr: z.number(),
  minPayment: z.number()
});

const bnplPlanSchema = z.object({
  id: z.string(),
  provider: z.enum(['PayPal', 'Affirm', 'Klarna']),
  description: z.string(),
  total: z.number(),
  remaining: z.number(),
  dueDates: z.array(z.string()),
  apr: z.number().optional()
});

const recurringTransactionSchema = z.object({
  id: z.string(),
  name: z.string(),
  type: z.enum(['income', 'expense']),
  amount: z.number(),
  cadence: z.enum(['weekly', 'biweekly', 'monthly', 'quarterly', 'yearly'])
});

const goalSchema = z.object({
  id: z.string(),
  name: z.string(),
  target: z.number(),
  current: z.number(),
  due: z.string().optional(),
  priority: z.number().optional()
});

const obligationSchema = z.object({
  id: z.string(),
  name: z.string(),
  amount: z.number(),
  cadence: z.enum(['weekly', 'biweekly', 'monthly', 'quarterly', 'yearly']),
  dueDate: z.string().optional()
});

const transactionSchema = z.object({
  id: z.string(),
  name: z.string(),
  type: z.enum(['income', 'expense']),
  amount: z.number(),
  date: z.string(),
  category: z.string().optional()
});

export const importSchema = z.object({
  budgets: z.array(budgetSchema),
  debts: z.array(debtSchema),
  bnplPlans: z.array(bnplPlanSchema),
  recurring: z.array(recurringTransactionSchema),
  goals: z.array(goalSchema),
  obligations: z.array(obligationSchema).optional(),
  transactions: z.array(transactionSchema).optional()
});

export type ImportPayload = z.infer<typeof importSchema>;
