import { createSelector } from "@reduxjs/toolkit";
import type { RootState } from "@/store";

// Helper: is date within N days of now
function withinDays(dateISO: string, n: number) {
  const d = new Date(dateISO);
  const today = new Date();
  const inN = new Date(today.getFullYear(), today.getMonth(), today.getDate() + n);
  return d >= new Date(today.getFullYear(), today.getMonth(), today.getDate()) && d <= inN;
}

// Month key like 2025-09
function monthKey(d = new Date()) {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
}

export const selectHeaderBadges = createSelector(
  (s: RootState) => s.debts.items,
  (items) => {
    const today = new Date();
    const todayISO = today.toISOString().slice(0, 10);
    const mkey = monthKey(today);

    let overdue = 0, dueThisWeek = 0, monthTotal = 0;

    for (const d of items) {
      const amount = d.amount ?? 0;
      // Compute occurrences for THIS month cheaply
      const anchor = new Date(d.dueDate);
      const rec = d.recurrence ?? "none";
      const addAmount = () => { monthTotal += amount; };

      const inMonth = (dt: Date) => dt.getFullYear() === today.getFullYear() && dt.getMonth() === today.getMonth();

      if (rec === "none") {
        if (inMonth(anchor)) addAmount();
        if (d.dueDate < todayISO && !(d.paidDates ?? []).includes(d.dueDate)) overdue++;
        if (withinDays(d.dueDate, 7)) dueThisWeek++;
        continue;
      }

      if (rec === "monthly") {
        const occ = new Date(today.getFullYear(), today.getMonth(), anchor.getDate());
        if (inMonth(occ)) addAmount();
        const occISO = occ.toISOString().slice(0,10);
        if (occISO < todayISO && !(d.paidDates ?? []).includes(occISO)) overdue++;
        if (withinDays(occISO, 7)) dueThisWeek++;
        continue;
      }

      const step = rec === "weekly" ? 7 : 14;
      let cur = new Date(anchor);
      while (cur.getFullYear() < today.getFullYear() || (cur.getFullYear() === today.getFullYear() && cur.getMonth() < today.getMonth())) {
        cur = new Date(cur.getFullYear(), cur.getMonth(), cur.getDate() + step);
      }
      while (cur.getFullYear() === today.getFullYear() && cur.getMonth() === today.getMonth()) {
        addAmount();
        const iso = cur.toISOString().slice(0,10);
        if (iso < todayISO && !(d.paidDates ?? []).includes(iso)) overdue++;
        if (withinDays(iso, 7)) dueThisWeek++;
        cur = new Date(cur.getFullYear(), cur.getMonth(), cur.getDate() + step);
      }
    }

    return { key: mkey, overdue, dueThisWeek, monthTotal };
  }
);
