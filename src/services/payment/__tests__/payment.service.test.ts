import { describe, it, expect, vi, beforeEach } from 'vitest';
import { recordInvoicePayment, invoiceMutex, getInvoiceDetails } from '../payment.service';
import { prisma } from '@/lib/db/prisma';

// Mock prisma client
vi.mock('@/lib/db/prisma', () => ({
  prisma: {
    $transaction: vi.fn(),
    invoice: {
      findFirst: vi.fn(),
      findUnique: vi.fn(),
      findMany: vi.fn(),
      update: vi.fn(),
      count: vi.fn(),
    },
    payment: {
      create: vi.fn(),
      findMany: vi.fn(),
      count: vi.fn(),
    },
    user: {
      findUnique: vi.fn(),
      upsert: vi.fn(),
    },
  },
}));

describe('Payment Service & Transactional Workflow', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  const baseInvoice = {
    id: 'inv_101',
    invoiceNo: 'INV-2026-0001',
    status: 'CONFIRMED',
    totalPaise: 100000, // ₹1,000.00
    dueAt: new Date(Date.now() + 86400000), // tomorrow
    customer: { id: 'cust_01', businessName: 'Acme Inc' },
    payments: [] as { id: string; amountPaise: number }[],
  };

  it('should successfully record a partial payment on a confirmed invoice and keep status CONFIRMED', async () => {
    const mockTx = {
      invoice: {
        findUnique: vi.fn().mockResolvedValue({
          ...baseInvoice,
          payments: [],
        }),
        update: vi.fn(),
      },
      user: {
        findUnique: vi.fn().mockResolvedValue({ id: 'usr_staff' }),
      },
      payment: {
        create: vi.fn().mockImplementation(({ data }) =>
          Promise.resolve({
            id: 'pay_01',
            ...data,
            recordedByUser: { id: 'usr_staff', name: 'Joe Staff', email: 'joe@staff.com' },
          })
        ),
      },
    };

    (prisma.$transaction as any).mockImplementation((cb: any) => cb(mockTx));

    const result = await recordInvoicePayment(
      'inv_101',
      {
        amountPaise: 40000, // ₹400
        method: 'UPI',
        paidAt: new Date(),
        reference: 'UPI-123',
      },
      'usr_staff'
    );

    expect(result.payment.amountPaise).toBe(40000);
    expect(result.invoice.status).toBe('CONFIRMED');
    expect(result.invoice.totalPaidPaise).toBe(40000);
    expect(result.invoice.outstandingPaise).toBe(60000);
    expect(result.invoice.isFullyPaid).toBe(false);

    // Invoice update to PAID should NOT be called for partial payment
    expect(mockTx.invoice.update).not.toHaveBeenCalled();
  });

  it('should mark invoice as PAID and set paidAt when full payment is recorded', async () => {
    const paymentDate = new Date();
    const mockTx = {
      invoice: {
        findUnique: vi.fn().mockResolvedValue({
          ...baseInvoice,
          payments: [{ id: 'prev_pay', amountPaise: 60000 }], // ₹600 already paid
        }),
        update: vi.fn().mockResolvedValue({
          ...baseInvoice,
          status: 'PAID',
          paidAt: paymentDate,
        }),
      },
      user: {
        findUnique: vi.fn().mockResolvedValue({ id: 'usr_staff' }),
      },
      payment: {
        create: vi.fn().mockImplementation(({ data }) =>
          Promise.resolve({
            id: 'pay_02',
            ...data,
            recordedByUser: { id: 'usr_staff', name: 'Joe Staff', email: 'joe@staff.com' },
          })
        ),
      },
    };

    (prisma.$transaction as any).mockImplementation((cb: any) => cb(mockTx));

    const result = await recordInvoicePayment(
      'inv_101',
      {
        amountPaise: 40000, // Remaining ₹400
        method: 'BANK_TRANSFER',
        paidAt: paymentDate,
        reference: 'NEFT-888',
      },
      'usr_staff'
    );

    expect(result.invoice.status).toBe('PAID');
    expect(result.invoice.totalPaidPaise).toBe(100000);
    expect(result.invoice.outstandingPaise).toBe(0);
    expect(result.invoice.isFullyPaid).toBe(true);

    // Invoice update must be called with status: 'PAID' and paidAt
    expect(mockTx.invoice.update).toHaveBeenCalledWith({
      where: { id: 'inv_101' },
      data: {
        status: 'PAID',
        paidAt: paymentDate,
      },
    });
  });

  it('should reject payment if invoice status is DRAFT', async () => {
    const mockTx = {
      invoice: {
        findUnique: vi.fn().mockResolvedValue({
          ...baseInvoice,
          status: 'DRAFT',
        }),
      },
    };

    (prisma.$transaction as any).mockImplementation((cb: any) => cb(mockTx));

    await expect(
      recordInvoicePayment(
        'inv_101',
        {
          amountPaise: 10000,
          method: 'CARD',
          paidAt: new Date(),
        },
        'usr_staff'
      )
    ).rejects.toThrow(/Cannot record payment for a DRAFT invoice/);
  });

  it('should reject payment if invoice status is CANCELLED', async () => {
    const mockTx = {
      invoice: {
        findUnique: vi.fn().mockResolvedValue({
          ...baseInvoice,
          status: 'CANCELLED',
        }),
      },
    };

    (prisma.$transaction as any).mockImplementation((cb: any) => cb(mockTx));

    await expect(
      recordInvoicePayment(
        'inv_101',
        {
          amountPaise: 10000,
          method: 'CARD',
          paidAt: new Date(),
        },
        'usr_staff'
      )
    ).rejects.toThrow(/Cannot record payment for a CANCELLED invoice/);
  });

  it('should reject payment if invoice is already fully PAID', async () => {
    const mockTx = {
      invoice: {
        findUnique: vi.fn().mockResolvedValue({
          ...baseInvoice,
          status: 'PAID',
        }),
      },
    };

    (prisma.$transaction as any).mockImplementation((cb: any) => cb(mockTx));

    await expect(
      recordInvoicePayment(
        'inv_101',
        {
          amountPaise: 10000,
          method: 'CARD',
          paidAt: new Date(),
        },
        'usr_staff'
      )
    ).rejects.toThrow(/Invoice is already fully PAID/);
  });

  it('should reject overpayment when amount exceeds outstanding balance', async () => {
    const mockTx = {
      invoice: {
        findUnique: vi.fn().mockResolvedValue({
          ...baseInvoice,
          totalPaise: 100000, // ₹1,000 total
          payments: [{ id: 'p1', amountPaise: 80000 }], // ₹800 paid, ₹200 outstanding
        }),
      },
    };

    (prisma.$transaction as any).mockImplementation((cb: any) => cb(mockTx));

    await expect(
      recordInvoicePayment(
        'inv_101',
        {
          amountPaise: 25000, // ₹250 (exceeds ₹200)
          method: 'UPI',
          paidAt: new Date(),
        },
        'usr_staff'
      )
    ).rejects.toThrow(/exceeds outstanding balance/);
  });

  it('should serialize concurrent payment requests using mutex', async () => {
    const sequence: number[] = [];

    // Simulate two concurrent requests running with mutex
    const task1 = invoiceMutex.runWithLock('inv_mutex_test', async () => {
      sequence.push(1);
      await new Promise((resolve) => setTimeout(resolve, 50));
      sequence.push(2);
    });

    const task2 = invoiceMutex.runWithLock('inv_mutex_test', async () => {
      sequence.push(3);
      await new Promise((resolve) => setTimeout(resolve, 10));
      sequence.push(4);
    });

    await Promise.all([task1, task2]);

    // Task 1 must complete fully before Task 2 starts!
    expect(sequence).toEqual([1, 2, 3, 4]);
  });

  it('should enforce customer ownership scope in getInvoiceDetails', async () => {
    (prisma.invoice.findFirst as any).mockResolvedValue({
      id: 'inv_target',
      invoiceNo: 'INV-100',
      customerId: 'cust_secret_A',
      status: 'CONFIRMED',
      totalPaise: 50000,
      dueAt: new Date(),
      payments: [],
      customer: { id: 'cust_secret_A', businessName: 'Customer A' },
      lines: [],
    });

    // Customer B tries to view Customer A's invoice
    await expect(
      getInvoiceDetails('inv_target', 'cust_intruder_B')
    ).rejects.toThrow(/Access denied: You do not own this invoice/);

    // Customer A accessing their own invoice succeeds
    const result = await getInvoiceDetails('inv_target', 'cust_secret_A');
    expect(result).not.toBeNull();
    expect(result?.invoiceNo).toBe('INV-100');
  });
});
