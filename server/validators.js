const { z } = require('zod');

const Recurrence = z.enum(['none','weekly','biweekly','monthly']);
const Debt = z.object({
  id: z.string().min(1),
  name: z.string().min(1),
  amount: z.number().nonnegative(),
  dueDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  recurrence: Recurrence,
  autopay: z.boolean(),
  notes: z.string().optional(),
  color: z.string().optional(),
  paidDates: z.array(z.string()).optional(),
});

module.exports = { Debt };
