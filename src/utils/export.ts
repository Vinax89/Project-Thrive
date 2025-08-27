import jsPDF from 'jspdf';
import { Parser } from 'json2csv';
import type { BNPLPlan, Obligation } from '../types';

export function exportJSON(filename: string, data: unknown) {
  const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
  triggerDownload(filename, blob);
}

export function exportCSV(filename: string, rows: Record<string, unknown>[]) {
  const parser = new Parser();
  const csv = parser.parse(rows);
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
  triggerDownload(filename, blob);
}

export function exportCSVBudgets(filename: string, budgets: { id:string; category:string; allocated:number; spent:number; }[]) {
  exportCSV(filename, budgets);
}

export function exportPDF(filename: string, text: string) {
  const doc = new jsPDF({ unit: 'pt', format: 'a4' });
  const margin = 40;
  const maxWidth = 595.28 - margin * 2;
  const lines = doc.splitTextToSize(text, maxWidth);
  doc.text(lines, margin, margin);
  doc.save(filename);
}

export function exportICS(filename: string, bnpl: BNPLPlan[], obligations: Obligation[]) {
  const pad = (n: number) => String(n).padStart(2, '0');
  const fmt = (iso: string) => {
    const d = new Date(iso);
    return (
      d.getUTCFullYear().toString() +
      pad(d.getUTCMonth() + 1) +
      pad(d.getUTCDate()) +
      'T' +
      pad(d.getUTCHours()) +
      pad(d.getUTCMinutes()) +
      pad(d.getUTCSeconds()) +
      'Z'
    );
  };
  const fmtDate = (d: Date) =>
    d.getUTCFullYear().toString() + pad(d.getUTCMonth() + 1) + pad(d.getUTCDate());
  const events: string[] = [];
  bnpl.forEach((plan) => {
    plan.dueDates.forEach((date, i) => {
      const startDate = new Date(date);
      const endDate = new Date(startDate);
      endDate.setUTCDate(startDate.getUTCDate() + 1);
      const endStr = fmtDate(endDate);
      events.push(
        [
          'BEGIN:VEVENT',
          `UID:bnpl-${plan.id}-${i}@chatpay`,
          `SUMMARY:${plan.description} payment`,
          `DTSTART:${fmt(date)}`,
          `DTEND:${endStr}`,
          'END:VEVENT',
        ].join('\n')
      );
    });
  });
  obligations.forEach((o) => {
    if (o.dueDate) {
      const startDate = new Date(o.dueDate);
      const endDate = new Date(startDate);
      endDate.setUTCDate(startDate.getUTCDate() + 1);
      const endStr = fmtDate(endDate);
      events.push(
        [
          'BEGIN:VEVENT',
          `UID:obl-${o.id}@chatpay`,
          `SUMMARY:${o.name}`,
          `DTSTART:${fmt(o.dueDate)}`,
          `DTEND:${endStr}`,
          'END:VEVENT',
        ].join('\n')
      );
    }
  });
  const ics = ['BEGIN:VCALENDAR', 'VERSION:2.0', ...events, 'END:VCALENDAR'].join('\n');
  const blob = new Blob([ics], { type: 'text/calendar;charset=utf-8' });
  triggerDownload(filename, blob);
}

function triggerDownload(filename: string, blob: Blob) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  a.rel = 'noopener';
  a.click();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}
