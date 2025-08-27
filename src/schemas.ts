import { z } from "zod";

export const Recurrence = z.union([z.literal("none"), z.literal("weekly"), z.literal("biweekly"), z.literal("monthly")]);
export const DebtSchema = z.object({
  id: z.string().min(1),
  name: z.string().min(1),
  amount: z.number().nonnegative(),
  dueDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  recurrence: Recurrence,
  autopay: z.boolean(),
  notes: z.string().optional(),
  color: z.string().optional(),
  paidDates: z.array(z.string()).optional()
});
export const DebtArray = z.array(DebtSchema);
export type DebtDTO = z.infer<typeof DebtSchema>;
