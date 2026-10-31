import { describe, it, expect } from 'vitest';
import {
  getNextBillingDate,
  getBillingPeriod,
  addMonthsClamped,
  addYearsClamped,
  toUtcDateOnly,
  isLeapYear,
} from '@/lib/billing/billing-dates';

describe('Billing Dates Engine', () => {
  it('correctly calculates daily billing dates', () => {
    const start = new Date(Date.UTC(2026, 0, 1)); // 2026-01-01
    const next = getNextBillingDate(start, 'DAILY');
    expect(next.toISOString()).toBe('2026-01-02T00:00:00.000Z');

    // Cross-month daily
    const endOfMonth = new Date(Date.UTC(2026, 0, 31)); // 2026-01-31
    const nextMonth = getNextBillingDate(endOfMonth, 'DAILY');
    expect(nextMonth.toISOString()).toBe('2026-02-01T00:00:00.000Z');
  });

  it('correctly calculates weekly billing dates (+7 calendar days)', () => {
    const start = new Date(Date.UTC(2026, 0, 1)); // 2026-01-01
    const next = getNextBillingDate(start, 'WEEKLY');
    expect(next.toISOString()).toBe('2026-01-08T00:00:00.000Z');

    // Cross-month weekly
    const jan28 = new Date(Date.UTC(2026, 0, 28)); // 2026-01-28
    const feb4 = getNextBillingDate(jan28, 'WEEKLY');
    expect(feb4.toISOString()).toBe('2026-02-04T00:00:00.000Z');
  });

  describe('Month-end clamping behavior', () => {
    it('clamps Jan 31 to Feb 28 on a non-leap year (2026)', () => {
      const jan31 = new Date(Date.UTC(2026, 0, 31));
      const next = getNextBillingDate(jan31, 'MONTHLY');
      expect(next.toISOString()).toBe('2026-02-28T00:00:00.000Z');
    });

    it('clamps Jan 31 to Feb 29 on a leap year (2024)', () => {
      expect(isLeapYear(2024)).toBe(true);
      const jan31 = new Date(Date.UTC(2024, 0, 31));
      const next = getNextBillingDate(jan31, 'MONTHLY');
      expect(next.toISOString()).toBe('2024-02-29T00:00:00.000Z');
    });

    it('clamps March 31 to April 30', () => {
      const mar31 = new Date(Date.UTC(2026, 2, 31)); // Month index 2 = March
      const next = getNextBillingDate(mar31, 'MONTHLY');
      expect(next.toISOString()).toBe('2026-04-30T00:00:00.000Z');
    });

    it('clamps May 31 to June 30', () => {
      const may31 = new Date(Date.UTC(2026, 4, 31)); // Month index 4 = May
      const next = getNextBillingDate(may31, 'MONTHLY');
      expect(next.toISOString()).toBe('2026-06-30T00:00:00.000Z');
    });

    it('clamps August 31 to September 30', () => {
      const aug31 = new Date(Date.UTC(2026, 7, 31)); // Month index 7 = August
      const next = getNextBillingDate(aug31, 'MONTHLY');
      expect(next.toISOString()).toBe('2026-09-30T00:00:00.000Z');
    });

    it('clamps October 31 to November 30', () => {
      const oct31 = new Date(Date.UTC(2026, 9, 31)); // Month index 9 = October
      const next = getNextBillingDate(oct31, 'MONTHLY');
      expect(next.toISOString()).toBe('2026-11-30T00:00:00.000Z');
    });

    it('advances across year boundary (Dec 15 -> Jan 15 of next year)', () => {
      const dec15 = new Date(Date.UTC(2026, 11, 15));
      const next = getNextBillingDate(dec15, 'MONTHLY');
      expect(next.toISOString()).toBe('2027-01-15T00:00:00.000Z');
    });
  });

  describe('Leap-year annual billing', () => {
    it('advances Feb 29 on leap year (2024) to Feb 28 on non-leap year (2025)', () => {
      const leapDay = new Date(Date.UTC(2024, 1, 29)); // 2024-02-29
      const next = getNextBillingDate(leapDay, 'YEARLY');
      expect(next.toISOString()).toBe('2025-02-28T00:00:00.000Z');
    });

    it('advances standard annual billing correctly (Feb 28, 2023 -> Feb 28, 2024)', () => {
      const feb28 = new Date(Date.UTC(2023, 1, 28));
      const next = getNextBillingDate(feb28, 'YEARLY');
      expect(next.toISOString()).toBe('2024-02-28T00:00:00.000Z');
    });
  });

  describe('getBillingPeriod calculation', () => {
    it('computes accurate UTC periodStart and periodEnd for monthly interval', () => {
      const dueDate = new Date(Date.UTC(2026, 0, 1)); // 2026-01-01
      const period = getBillingPeriod(dueDate, 'MONTHLY');
      expect(period.periodStart.toISOString()).toBe('2026-01-01T00:00:00.000Z');
      expect(period.periodEnd.toISOString()).toBe('2026-01-31T23:59:59.999Z');
    });

    it('computes accurate period for daily interval', () => {
      const dueDate = new Date(Date.UTC(2026, 0, 1));
      const period = getBillingPeriod(dueDate, 'DAILY');
      expect(period.periodStart.toISOString()).toBe('2026-01-01T00:00:00.000Z');
      expect(period.periodEnd.toISOString()).toBe('2026-01-01T23:59:59.999Z');
    });

    it('computes accurate period for weekly interval', () => {
      const dueDate = new Date(Date.UTC(2026, 0, 1));
      const period = getBillingPeriod(dueDate, 'WEEKLY');
      expect(period.periodStart.toISOString()).toBe('2026-01-01T00:00:00.000Z');
      expect(period.periodEnd.toISOString()).toBe('2026-01-07T23:59:59.999Z');
    });
  });
});
