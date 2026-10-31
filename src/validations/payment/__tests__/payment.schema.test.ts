import { describe, it, expect } from 'vitest';
import { CreatePaymentSchema, PaymentFilterSchema, InvoiceFilterSchema } from '../payment.schema';

describe('Payment Schema Validation', () => {
  it('should accept valid payment data', () => {
    const validData = {
      amountPaise: 125000,
      method: 'UPI',
      paidAt: '2026-11-01T10:30:00.000Z',
      reference: 'UPI-REF-12345',
      note: 'November subscription payment',
    };

    const result = CreatePaymentSchema.safeParse(validData);
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.amountPaise).toBe(125000);
      expect(result.data.method).toBe('UPI');
      expect(result.data.reference).toBe('UPI-REF-12345');
    }
  });

  it('should reject non-positive amounts (zero and negative)', () => {
    const zeroResult = CreatePaymentSchema.safeParse({
      amountPaise: 0,
      method: 'CARD',
      paidAt: new Date().toISOString(),
    });
    expect(zeroResult.success).toBe(false);

    const negativeResult = CreatePaymentSchema.safeParse({
      amountPaise: -5000,
      method: 'CARD',
      paidAt: new Date().toISOString(),
    });
    expect(negativeResult.success).toBe(false);
  });

  it('should reject non-integer (floating point) amounts', () => {
    const floatResult = CreatePaymentSchema.safeParse({
      amountPaise: 1250.75,
      method: 'CARD',
      paidAt: new Date().toISOString(),
    });
    expect(floatResult.success).toBe(false);
  });

  it('should accept all valid payment methods', () => {
    const methods = ['BANK_TRANSFER', 'CASH', 'CARD', 'UPI', 'OTHER'];
    for (const method of methods) {
      const res = CreatePaymentSchema.safeParse({
        amountPaise: 1000,
        method,
        paidAt: new Date().toISOString(),
      });
      expect(res.success).toBe(true);
    }
  });

  it('should reject unknown payment methods', () => {
    const res = CreatePaymentSchema.safeParse({
      amountPaise: 1000,
      method: 'CRYPTO',
      paidAt: new Date().toISOString(),
    });
    expect(res.success).toBe(false);
  });

  it('should reject bounded fields that exceed maximum limits', () => {
    const longRef = 'R'.repeat(101);
    const longNote = 'N'.repeat(501);

    const refResult = CreatePaymentSchema.safeParse({
      amountPaise: 1000,
      method: 'CASH',
      paidAt: new Date().toISOString(),
      reference: longRef,
    });
    expect(refResult.success).toBe(false);

    const noteResult = CreatePaymentSchema.safeParse({
      amountPaise: 1000,
      method: 'CASH',
      paidAt: new Date().toISOString(),
      note: longNote,
    });
    expect(noteResult.success).toBe(false);
  });

  it('should parse and sanitize empty optional strings', () => {
    const res = CreatePaymentSchema.safeParse({
      amountPaise: 1000,
      method: 'UPI',
      paidAt: new Date().toISOString(),
      reference: '',
      note: '   ',
    });
    expect(res.success).toBe(true);
    if (res.success) {
      expect(res.data.reference).toBeUndefined();
      expect(res.data.note).toBeUndefined();
    }
  });
});

describe('Invoice Filter Schema Validation', () => {
  it('should parse boolean isOverdue correctly', () => {
    const resTrue = InvoiceFilterSchema.safeParse({ isOverdue: 'true' });
    expect(resTrue.success).toBe(true);
    if (resTrue.success) expect(resTrue.data.isOverdue).toBe(true);

    const resFalse = InvoiceFilterSchema.safeParse({ isOverdue: false });
    expect(resFalse.success).toBe(true);
    if (resFalse.success) expect(resFalse.data.isOverdue).toBe(false);
  });
});
