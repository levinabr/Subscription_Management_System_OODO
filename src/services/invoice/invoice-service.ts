import prisma from '@/lib/db/prisma';
import { InvoiceListQuery } from '@/validations/invoice/invoice-schema';
import { Prisma } from '@prisma/client';
import nodemailer from 'nodemailer';

export class InvoiceService {
  /**
   * Lists invoices with pagination, search, status, date-range, and overdue filters.
   * Enforces customer ownership when customerId is specified.
   */
  static async listInvoices(params: InvoiceListQuery & { enforcedCustomerId?: string }) {
    const page = Math.max(1, params.page || 1);
    const limit = Math.max(1, Math.min(100, params.limit || 20));
    const skip = (page - 1) * limit;

    const where: Prisma.InvoiceWhereInput = {};

    // Customer scoping
    if (params.enforcedCustomerId) {
      where.customerId = params.enforcedCustomerId;
    } else if (params.customerId) {
      where.customerId = params.customerId;
    }

    // Status filter
    if (params.status) {
      where.status = params.status;
    }

    // Date range
    if (params.startDate || params.endDate) {
      where.issuedAt = {};
      if (params.startDate) where.issuedAt.gte = new Date(params.startDate);
      if (params.endDate) where.issuedAt.lte = new Date(params.endDate);
    }

    // Overdue filter: dueAt < now and status is CONFIRMED
    if (params.overdue) {
      where.dueAt = { lt: new Date() };
      where.status = 'CONFIRMED';
    }

    // Search filter across invoiceNo, customer name, customer email
    if (params.search && params.search.trim() !== '') {
      const searchTerm = params.search.trim();
      where.OR = [
        { invoiceNo: { contains: searchTerm } },
        { customer: { name: { contains: searchTerm } } },
        { customer: { email: { contains: searchTerm } } },
      ];
    }

    const [invoices, total] = await Promise.all([
      prisma.invoice.findMany({
        where,
        include: {
          customer: true,
          subscription: true,
          lines: true,
          discountRule: true,
        },
        orderBy: {
          issuedAt: 'desc',
        },
        skip,
        take: limit,
      }),
      prisma.invoice.count({ where }),
    ]);

    return {
      invoices,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  /**
   * Retrieves a single invoice by ID with line items and customer information.
   * Optional customerId ensures customer ownership.
   */
  static async getInvoiceById(id: string, enforcedCustomerId?: string) {
    const invoice = await prisma.invoice.findUnique({
      where: { id },
      include: {
        customer: true,
        subscription: {
          include: {
            plan: true,
          },
        },
        lines: true,
        discountRule: true,
      },
    });

    if (!invoice) {
      return null;
    }

    if (enforcedCustomerId && invoice.customerId !== enforcedCustomerId) {
      throw new Error('Forbidden: You do not have access to this invoice');
    }

    return invoice;
  }

  /**
   * Confirms a DRAFT invoice. Only Staff or Admin can confirm.
   */
  static async confirmInvoice(id: string) {
    const invoice = await prisma.invoice.findUnique({
      where: { id },
    });

    if (!invoice) {
      throw new Error('Invoice not found');
    }

    if (invoice.status !== 'DRAFT') {
      throw new Error(`Cannot confirm an invoice with status ${invoice.status}. Only DRAFT invoices can be confirmed.`);
    }

    return prisma.invoice.update({
      where: { id },
      data: {
        status: 'CONFIRMED',
      },
      include: {
        customer: true,
        subscription: true,
        lines: true,
      },
    });
  }

  /**
   * Cancels an invoice.
   * Only DRAFT or CONFIRMED invoices can be cancelled.
   * PAID invoices CANNOT be cancelled.
   */
  static async cancelInvoice(id: string, reason?: string) {
    const invoice = await prisma.invoice.findUnique({
      where: { id },
    });

    if (!invoice) {
      throw new Error('Invoice not found');
    }

    if (invoice.status === 'PAID') {
      throw new Error('Cannot cancel a PAID invoice');
    }

    if (invoice.status === 'CANCELLED') {
      throw new Error('Invoice is already cancelled');
    }

    return prisma.invoice.update({
      where: { id },
      data: {
        status: 'CANCELLED',
      },
      include: {
        customer: true,
        subscription: true,
        lines: true,
      },
    });
  }

  /**
   * Sends an invoice to customer via SMTP if configured.
   * Updates sentAt only if email was sent successfully.
   */
  static async sendInvoice(id: string, overrideEmail?: string) {
    const invoice = await prisma.invoice.findUnique({
      where: { id },
      include: {
        customer: true,
        subscription: true,
        lines: true,
      },
    });

    if (!invoice) {
      throw new Error('Invoice not found');
    }

    if (invoice.status === 'CANCELLED') {
      throw new Error('Cannot send a CANCELLED invoice');
    }

    const recipientEmail = overrideEmail || invoice.customer.email;
    if (!recipientEmail) {
      throw new Error('No recipient email address available for customer');
    }

    // Check SMTP configuration
    const smtpHost = process.env.SMTP_HOST;
    const smtpPort = process.env.SMTP_PORT ? parseInt(process.env.SMTP_PORT, 10) : 587;
    const smtpUser = process.env.SMTP_USER;
    const smtpPass = process.env.SMTP_PASS;
    const smtpFrom = process.env.SMTP_FROM || 'billing@planzo.io';

    if (!smtpHost || !smtpUser) {
      throw new Error(
        'SMTP service is not configured. Please configure SMTP_HOST, SMTP_PORT, SMTP_USER, and SMTP_PASS in environment variables.'
      );
    }

    const transporter = nodemailer.createTransport({
      host: smtpHost,
      port: smtpPort,
      secure: smtpPort === 465,
      auth: {
        user: smtpUser,
        pass: smtpPass,
      },
    });

    const formattedTotal = (invoice.totalPaise / 100).toFixed(2);
    const subject = `Invoice ${invoice.invoiceNo} from PLANZO - ₹${formattedTotal}`;

    const textContent = `
Dear ${invoice.customer.name},

Please find your invoice details below:

Invoice Number: ${invoice.invoiceNo}
Subscription: ${invoice.subscription.subscriptionNo}
Billing Period: ${invoice.periodStart.toISOString().slice(0, 10)} to ${invoice.periodEnd.toISOString().slice(0, 10)}
Due Date: ${invoice.dueAt.toISOString().slice(0, 10)}
Status: ${invoice.status}

Breakdown:
Subtotal: ₹${(invoice.subtotalPaise / 100).toFixed(2)}
Discount: -₹${(invoice.discountPaise / 100).toFixed(2)}
Tax: ₹${(invoice.taxPaise / 100).toFixed(2)}
Total Due: ₹${formattedTotal}

Thank you for choosing PLANZO!
`;

    await transporter.sendMail({
      from: smtpFrom,
      to: recipientEmail,
      subject,
      text: textContent,
    });

    // Update sentAt only after verified sending
    const sentAt = new Date();
    return prisma.invoice.update({
      where: { id },
      data: { sentAt },
    });
  }
}
