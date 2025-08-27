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

export function exportICS(filename: string, plans: BNPLPlan[], obligations: Obligation[]) {
  const lines: string[] = [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'PRODID:-//Project Thrive//EN'
  ];
  plans.forEach(p => {
    p.dueDates.forEach(d => {
      lines.push(
        'BEGIN:VEVENT',
        `UID:${p.id}-${d}@project-thrive`,
        `SUMMARY:${p.provider} payment due`,
        `DTSTART;VALUE=DATE:${d.replace(/-/g, '')}`,
        'END:VEVENT'
      );
    });
  });
  obligations.forEach(o => {
    if (!o.dueDate) return;
    lines.push(
      'BEGIN:VEVENT',
      `UID:obl-${o.id}@project-thrive`,
      `SUMMARY:${o.name} due`,
      `DTSTART;VALUE=DATE:${o.dueDate.replace(/-/g, '')}`,
      'END:VEVENT'
    );
  });
  lines.push('END:VCALENDAR');
  const blob = new Blob([lines.join('\r\n')], { type: 'text/calendar' });
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
