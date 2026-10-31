/**
 * Billing Date Calculation Engine
 * 
 * Accurately calculates recurring billing dates and periods for PLANZO.
 * Uses strict UTC date handling to prevent timezone shifts across local environments.
 * Handles month-end anchoring and leap years deterministically.
 */

export type BillingInterval = 'DAILY' | 'WEEKLY' | 'MONTHLY' | 'YEARLY';

/**
 * Normalizes a date to UTC midnight (00:00:00.000Z).
 */
export function toUtcDateOnly(date: Date | string | number): Date {
  const d = new Date(date);
  return new Date(Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), d.getUTCDate(), 0, 0, 0, 0));
}

/**
 * Helper to check if a given year is a leap year.
 */
export function isLeapYear(year: number): boolean {
  return (year % 4 === 0 && year % 100 !== 0) || year % 400 === 0;
}

/**
 * Returns the number of days in a given UTC month (month index 0-11).
 */
export function getDaysInUtcMonth(year: number, monthIndex: number): number {
  // Day 0 of next month gives the last day of the target month
  return new Date(Date.UTC(year, monthIndex + 1, 0)).getUTCDate();
}

/**
 * Advances a date by one calendar month, clamping the day of the month
 * to the last valid day of the target month if needed.
 * 
 * Example:
 * Jan 31 -> Feb 28 (or Feb 29 in a leap year)
 * March 31 -> April 30
 * May 31 -> June 30
 * Aug 31 -> Sept 30
 * Oct 31 -> Nov 30
 */
export function addMonthsClamped(date: Date, months: number): Date {
  const normalized = toUtcDateOnly(date);
  const currentYear = normalized.getUTCFullYear();
  const currentMonth = normalized.getUTCMonth();
  const currentDay = normalized.getUTCDate();

  // Target year and month
  const totalMonths = currentMonth + months;
  const targetYear = currentYear + Math.floor(totalMonths / 12);
  const targetMonth = ((totalMonths % 12) + 12) % 12;

  // Maximum days in target month
  const maxDaysInTargetMonth = getDaysInUtcMonth(targetYear, targetMonth);
  const clampedDay = Math.min(currentDay, maxDaysInTargetMonth);

  return new Date(Date.UTC(targetYear, targetMonth, clampedDay, 0, 0, 0, 0));
}

/**
 * Advances a date by one calendar year, handling leap year cases:
 * Feb 29 on a leap year advances to Feb 28 on a non-leap year.
 */
export function addYearsClamped(date: Date, years: number): Date {
  const normalized = toUtcDateOnly(date);
  const currentYear = normalized.getUTCFullYear();
  const currentMonth = normalized.getUTCMonth();
  const currentDay = normalized.getUTCDate();

  const targetYear = currentYear + years;
  const maxDaysInTargetMonth = getDaysInUtcMonth(targetYear, currentMonth);
  const clampedDay = Math.min(currentDay, maxDaysInTargetMonth);

  return new Date(Date.UTC(targetYear, currentMonth, clampedDay, 0, 0, 0, 0));
}

/**
 * Calculates the next billing date given a current date and interval.
 * 
 * DAILY: Next calendar day (+1 UTC day)
 * WEEKLY: Seven calendar days later (+7 UTC days)
 * MONTHLY: Next calendar month with month-end clamping
 * YEARLY: Next calendar year with leap-year clamping
 */
export function getNextBillingDate(currentDate: Date | string | number, interval: string): Date {
  const normalized = toUtcDateOnly(currentDate);
  const upperInterval = interval.toUpperCase() as BillingInterval;

  switch (upperInterval) {
    case 'DAILY': {
      const next = new Date(normalized.getTime());
      next.setUTCDate(next.getUTCDate() + 1);
      return next;
    }
    case 'WEEKLY': {
      const next = new Date(normalized.getTime());
      next.setUTCDate(next.getUTCDate() + 7);
      return next;
    }
    case 'MONTHLY': {
      return addMonthsClamped(normalized, 1);
    }
    case 'YEARLY': {
      return addYearsClamped(normalized, 1);
    }
    default:
      throw new Error(`Unsupported billing interval: ${interval}`);
  }
}

/**
 * Calculates the billing period for a given due date and interval.
 * Returns { periodStart, periodEnd } where:
 * - periodStart is normalized to the beginning of the period (00:00:00.000Z)
 * - periodEnd is the end of the period (23:59:59.999Z on the day before next billing date)
 */
export function getBillingPeriod(
  currentDueDate: Date | string | number,
  interval: string
): { periodStart: Date; periodEnd: Date } {
  const periodStart = toUtcDateOnly(currentDueDate);
  const nextBilling = getNextBillingDate(periodStart, interval);
  
  // End of period is 1 millisecond before next billing start
  const periodEnd = new Date(nextBilling.getTime() - 1);
  return { periodStart, periodEnd };
}

/**
 * Calculates invoice due date from an issued date and payment terms in days.
 */
export function calculateDueDate(issuedAt: Date | string | number, paymentTermsDays: number): Date {
  const issued = toUtcDateOnly(issuedAt);
  const due = new Date(issued.getTime());
  due.setUTCDate(due.getUTCDate() + Math.max(0, paymentTermsDays));
  // End of the due day in UTC (23:59:59.999Z)
  return new Date(Date.UTC(due.getUTCFullYear(), due.getUTCMonth(), due.getUTCDate(), 23, 59, 59, 999));
}
