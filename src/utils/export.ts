import jsPDF from 'jspdf';
import { Parser } from 'json2csv';
import { BNPLPlan, Obligation } from '../types';

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
    'PRODID:-//ChatPay//Project Thrive//EN'
  ];

  const dtstamp = new Date().toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z';

  for (const plan of plans) {
    plan.dueDates.forEach((d, i) => {
      const date = d.replace(/-/g, '').split('T')[0];
      lines.push(
        'BEGIN:VEVENT',
        `UID:bnpl-${plan.id}-${i}@chatpay`,
        `DTSTAMP:${dtstamp}`,
        `SUMMARY:BNPL ${plan.description}`,
        `DTSTART;VALUE=DATE:${date}`,
        `DTEND;VALUE=DATE:${date}`,
        'END:VEVENT'
      );
    });
  }

  const cadenceMap: Record<Obligation['cadence'], string> = {
    weekly: 'FREQ=WEEKLY',
    biweekly: 'FREQ=WEEKLY;INTERVAL=2',
    monthly: 'FREQ=MONTHLY',
    quarterly: 'FREQ=MONTHLY;INTERVAL=3',
    yearly: 'FREQ=YEARLY'
  };

  for (const ob of obligations) {
    if (ob.dueDate) {
      const date = ob.dueDate.replace(/-/g, '').split('T')[0];
      lines.push(
        'BEGIN:VEVENT',
        `UID:obligation-${ob.id}@chatpay`,
        `DTSTAMP:${dtstamp}`,
        `SUMMARY:Obligation ${ob.name}`,
        `DTSTART;VALUE=DATE:${date}`,
        `DTEND;VALUE=DATE:${date}`,
        `RRULE:${cadenceMap[ob.cadence]}`,
        'END:VEVENT'
      );
    }
  }

  lines.push('END:VCALENDAR');
  const blob = new Blob([lines.join('\n')], { type: 'text/calendar;charset=utf-8' });
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
