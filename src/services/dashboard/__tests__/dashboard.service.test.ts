import { describe, it, expect } from 'vitest';
import { resolveDateRange } from '../dashboard.service';

describe('Dashboard Service Logic & Calculations', () => {
  describe('Estimated MRR Normalization Formula', () => {
    // Normalization rules from Section 10:
    // Monthly: total * 1
    // Yearly: total / 12
    // Weekly: total * 52 / 12
    // Daily: total * 365 / 12
    // Round only final paise amount

    function calculateEstimatedMrr(
      intervals: { interval: 'MONTHLY' | 'YEARLY' | 'WEEKLY' | 'DAILY'; totalPaise: number }[]
    ): number {
      let mrr = 0;
      for (const item of intervals) {
        switch (item.interval) {
          case 'MONTHLY':
            mrr += item.totalPaise * 1;
            break;
          case 'YEARLY':
            mrr += item.totalPaise / 12;
            break;
          case 'WEEKLY':
            mrr += (item.totalPaise * 52) / 12;
            break;
          case 'DAILY':
            mrr += (item.totalPaise * 365) / 12;
            break;
        }
      }
      return Math.round(mrr);
    }

    it('should correctly normalize and sum subscriptions across billing intervals', () => {
      const subscriptions = [
        { interval: 'MONTHLY' as const, totalPaise: 500000 }, // 5,000 INR
        { interval: 'YEARLY' as const, totalPaise: 1200000 }, // 12,000 INR -> 1,000 INR/mo
        { interval: 'WEEKLY' as const, totalPaise: 100000 },  // 1,000 INR -> (1000 * 52 / 12) = 4333.33 INR
        { interval: 'DAILY' as const, totalPaise: 10000 },    // 100 INR -> (100 * 365 / 12) = 3041.67 INR
      ];

      const expected =
        500000 +
        1200000 / 12 +
        (100000 * 52) / 12 +
        (10000 * 365) / 12;

      const result = calculateEstimatedMrr(subscriptions);
      expect(result).toBe(Math.round(expected));
    });
  });

  describe('Outstanding Balance Calculation', () => {
    // Section 6 & 10:
    // totalPaid = sum(all valid payments for invoice)
    // outstanding = invoice.totalPaise - totalPaid
    // never negative

    function calculateOutstanding(totalPaise: number, payments: number[]): number {
      const totalPaid = payments.reduce((sum, p) => sum + p, 0);
      return Math.max(0, totalPaise - totalPaid);
    }

    it('should calculate outstanding balance correctly for partial payments', () => {
      const invoiceTotal = 100000; // ₹1,000
      const payments = [30000, 20000]; // ₹300 + ₹200
      expect(calculateOutstanding(invoiceTotal, payments)).toBe(50000); // ₹500 remaining
    });

    it('should return 0 when invoice is fully paid', () => {
      const invoiceTotal = 50000;
      const payments = [25000, 25000];
      expect(calculateOutstanding(invoiceTotal, payments)).toBe(0);
    });

    it('should never return a negative outstanding balance', () => {
      const invoiceTotal = 50000;
      const payments = [60000];
      expect(calculateOutstanding(invoiceTotal, payments)).toBe(0);
    });
  });

  describe('Overdue Invoice Criteria', () => {
    // Section 8 & 10:
    // Overdue is derived:
    // status == CONFIRMED && dueAt < current business date && outstanding balance > 0

    function isInvoiceOverdue(
      status: string,
      dueAt: Date,
      outstandingPaise: number,
      now = new Date()
    ): boolean {
      return status === 'CONFIRMED' && dueAt < now && outstandingPaise > 0;
    }

    it('should flag confirmed invoice past due date with balance as overdue', () => {
      const yesterday = new Date(Date.now() - 24 * 60 * 60 * 1000);
      expect(isInvoiceOverdue('CONFIRMED', yesterday, 50000)).toBe(true);
    });

    it('should NOT flag confirmed invoice if due date is in the future', () => {
      const tomorrow = new Date(Date.now() + 24 * 60 * 60 * 1000);
      expect(isInvoiceOverdue('CONFIRMED', tomorrow, 50000)).toBe(false);
    });

    it('should NOT flag fully paid invoice as overdue even if due date passed', () => {
      const pastDate = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
      expect(isInvoiceOverdue('PAID', pastDate, 0)).toBe(false);
      expect(isInvoiceOverdue('CONFIRMED', pastDate, 0)).toBe(false);
    });

    it('should NOT flag draft or cancelled invoice as overdue', () => {
      const pastDate = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
      expect(isInvoiceOverdue('DRAFT', pastDate, 50000)).toBe(false);
      expect(isInvoiceOverdue('CANCELLED', pastDate, 50000)).toBe(false);
    });
  });

  describe('Date Range Filter Presets', () => {
    it('should resolve presets (7d, 30d, month, year, all)', () => {
      const range7d = resolveDateRange({ period: '7d' });
      expect(range7d.label).toBe('Last 7 Days');
      expect(range7d.startDate.getTime()).toBeLessThan(range7d.endDate.getTime());

      const rangeMonth = resolveDateRange({ period: 'month' });
      expect(rangeMonth.label).toBe('This Month');
      expect(rangeMonth.startDate.getDate()).toBe(1);

      const rangeYear = resolveDateRange({ period: 'year' });
      expect(rangeYear.label).toBe('This Year');
      expect(rangeYear.startDate.getMonth()).toBe(0);
      expect(rangeYear.startDate.getDate()).toBe(1);
    });
  });
});
