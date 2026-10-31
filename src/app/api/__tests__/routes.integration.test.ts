import { describe, it, expect, vi, beforeEach } from 'vitest';
import { NextRequest } from 'next/server';
import { POST as createPaymentHandler } from '../invoices/[id]/payments/route';
import { GET as getPaymentsHandler } from '../payments/route';
import { GET as getInvoiceHandler } from '../invoices/[id]/route';
import { GET as getDashboardSummaryHandler } from '../dashboard/summary/route';
import * as paymentService from '@/services/payment/payment.service';
import * as dashboardService from '@/services/dashboard/dashboard.service';

vi.mock('@/services/payment/payment.service');
vi.mock('@/services/dashboard/dashboard.service');

describe('API Route Handlers Integration & Access Controls', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('POST /api/invoices/:id/payments', () => {
    it('should reject payment recording if user is a CUSTOMER', async () => {
      const req = new NextRequest('http://localhost/api/invoices/inv_1/payments', {
        method: 'POST',
        headers: {
          'x-user-id': 'usr_cust',
          'x-user-role': 'CUSTOMER',
          'x-customer-id': 'cust_01',
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          amountPaise: 10000,
          method: 'UPI',
          paidAt: new Date().toISOString(),
        }),
      });

      const res = await createPaymentHandler(req, { params: Promise.resolve({ id: 'inv_1' }) });
      expect(res.status).toBe(403);
      const data = await res.json();
      expect(data.error).toMatch(/Staff or Admin role required/);
    });

    it('should reject invalid payload (e.g. negative amount)', async () => {
      const req = new NextRequest('http://localhost/api/invoices/inv_1/payments', {
        method: 'POST',
        headers: {
          'x-user-id': 'usr_staff',
          'x-user-role': 'STAFF',
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          amountPaise: -500,
          method: 'UPI',
          paidAt: new Date().toISOString(),
        }),
      });

      const res = await createPaymentHandler(req, { params: Promise.resolve({ id: 'inv_1' }) });
      expect(res.status).toBe(400);
      const data = await res.json();
      expect(data.error).toBe('Validation failed');
    });

    it('should call paymentService.recordInvoicePayment and return 201 for valid staff request', async () => {
      (paymentService.recordInvoicePayment as any).mockResolvedValue({
        payment: { id: 'pay_99', amountPaise: 50000, method: 'UPI' },
        invoice: { id: 'inv_1', invoiceNo: 'INV-001', status: 'CONFIRMED' },
      });

      const req = new NextRequest('http://localhost/api/invoices/inv_1/payments', {
        method: 'POST',
        headers: {
          'x-user-id': 'usr_staff_10',
          'x-user-role': 'STAFF',
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          amountPaise: 50000,
          method: 'UPI',
          paidAt: new Date().toISOString(),
          reference: 'UPI-REF-99',
        }),
      });

      const res = await createPaymentHandler(req, { params: Promise.resolve({ id: 'inv_1' }) });
      expect(res.status).toBe(201);
      const data = await res.json();
      expect(data.payment.id).toBe('pay_99');
      expect(paymentService.recordInvoicePayment).toHaveBeenCalledWith(
        'inv_1',
        expect.objectContaining({ amountPaise: 50000, method: 'UPI' }),
        'usr_staff_10'
      );
    });
  });

  describe('GET /api/payments scoping', () => {
    it('should pass customerScope to payment service when requested by customer', async () => {
      (paymentService.getPaymentHistory as any).mockResolvedValue({
        items: [],
        pagination: { page: 1, limit: 20, totalCount: 0, totalPages: 0 },
      });

      const req = new NextRequest('http://localhost/api/payments', {
        headers: {
          'x-user-id': 'usr_cust_2',
          'x-user-role': 'CUSTOMER',
          'x-customer-id': 'cust_only_me',
        },
      });

      const res = await getPaymentsHandler(req);
      expect(res.status).toBe(200);
      expect(paymentService.getPaymentHistory).toHaveBeenCalledWith(
        expect.any(Object),
        'cust_only_me'
      );
    });
  });

  describe('GET /api/invoices/:id customer ownership protection', () => {
    it('should return 403 when customer tries to access unowned invoice', async () => {
      const err = new Error('Access denied: You do not own this invoice.');
      (err as any).statusCode = 403;
      (paymentService.getInvoiceDetails as any).mockRejectedValue(err);

      const req = new NextRequest('http://localhost/api/invoices/inv_foreign', {
        headers: {
          'x-user-id': 'usr_cust_2',
          'x-user-role': 'CUSTOMER',
          'x-customer-id': 'cust_attacker',
        },
      });

      const res = await getInvoiceHandler(req, { params: Promise.resolve({ id: 'inv_foreign' }) });
      expect(res.status).toBe(403);
    });
  });

  describe('GET /api/dashboard/summary access protection', () => {
    it('should reject customers from accessing the staff finance dashboard with 403', async () => {
      const req = new NextRequest('http://localhost/api/dashboard/summary', {
        headers: {
          'x-user-id': 'usr_cust_3',
          'x-user-role': 'CUSTOMER',
          'x-customer-id': 'cust_03',
        },
      });

      const res = await getDashboardSummaryHandler(req);
      expect(res.status).toBe(403);
    });

    it('should allow staff to access dashboard summary', async () => {
      (dashboardService.getDashboardSummary as any).mockResolvedValue({
        metrics: {
          activeSubscriptions: 10,
          estimatedMrrPaise: 500000,
          paymentsReceivedPeriodPaise: 200000,
          outstandingBalancePaise: 100000,
          overdueInvoiceCount: 1,
          totalConfirmedInvoices: 5,
          totalPaidInvoices: 3,
        },
      });

      const req = new NextRequest('http://localhost/api/dashboard/summary', {
        headers: {
          'x-user-id': 'usr_staff',
          'x-user-role': 'STAFF',
        },
      });

      const res = await getDashboardSummaryHandler(req);
      expect(res.status).toBe(200);
      const data = await res.json();
      expect(data.metrics.activeSubscriptions).toBe(10);
    });
  });
});
