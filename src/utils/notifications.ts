import type { BNPLPlan, Obligation } from '../types';

const KEY_PREFIX = 'reminder:';

export function isReminderEnabled(id: string): boolean {
  if (typeof localStorage === 'undefined') return false;
  return localStorage.getItem(KEY_PREFIX + id) === '1';
}

export function setReminderEnabled(id: string, enabled: boolean): void {
  if (typeof localStorage === 'undefined') return;
  if (enabled) localStorage.setItem(KEY_PREFIX + id, '1');
  else localStorage.removeItem(KEY_PREFIX + id);
}

interface ReminderItem {
  id: string;
  title: string;
  due: string;
}

function collectDueToday(plans: BNPLPlan[], obligations: Obligation[]): ReminderItem[] {
  const items: ReminderItem[] = [];
  const now = new Date();
  const start = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const end = new Date(start.getTime() + 86400000);

  plans.forEach(p => {
    if (!isReminderEnabled(p.id)) return;
    p.dueDates.forEach(d => {
      const dd = new Date(d + 'T00:00:00');
      if (dd >= start && dd < end) {
        items.push({ id: `${p.id}-${d}`, title: `${p.provider} payment`, due: d });
      }
    });
  });

  obligations.forEach(o => {
    if (!o.dueDate) return;
    if (!isReminderEnabled(o.id)) return;
    const dd = new Date(o.dueDate + 'T00:00:00');
    if (dd >= start && dd < end) {
      items.push({ id: `obl-${o.id}`, title: `${o.name} due`, due: o.dueDate });
    }
  });

  return items;
}

async function notify(items: ReminderItem[]) {
  if (!items.length) return;
  if (!('Notification' in window)) return;
  const perm = await Notification.requestPermission();
  if (perm !== 'granted') return;

  if ('serviceWorker' in navigator) {
    try {
      await navigator.serviceWorker.register('/sw.js');
      const reg = await navigator.serviceWorker.ready;
      reg.active?.postMessage({ type: 'schedule', items });
      return;
    } catch {
      // fall through to direct notifications
    }
  }

  items.forEach(i => new Notification(i.title, { body: `Due ${i.due}` }));
}

let timer: number | undefined;

export function startDailyChecks(plans: BNPLPlan[], obligations: Obligation[]): void {
  if (timer) clearTimeout(timer);
  notify(collectDueToday(plans, obligations));

  const now = new Date();
  const next = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1);
  timer = window.setTimeout(() => startDailyChecks(plans, obligations), next.getTime() - now.getTime());
}

export function collectCalendarItems(plans: BNPLPlan[], obligations: Obligation[]) {
  const items: { title: string; date: string; }[] = [];
  plans.forEach(p => {
    p.dueDates.forEach(d => items.push({ title: `${p.provider} payment`, date: d }));
  });
  obligations.forEach(o => {
    if (o.dueDate) items.push({ title: o.name, date: o.dueDate });
  });
  return items;
}
