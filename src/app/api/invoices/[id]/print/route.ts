import { NextRequest, NextResponse } from 'next/server';
import { getSessionUser } from '@/lib/auth/session';
import { getInvoiceDetails } from '@/services/payment/payment.service';

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const user = await getSessionUser(req);
    const customerScope = user?.role === 'CUSTOMER' ? user.customerId || 'non-existent' : undefined;

    const invoice: any = await getInvoiceDetails(id, customerScope);
    if (!invoice) {
      return NextResponse.json({ error: 'Invoice not found' }, { status: 404 });
    }

    // Format currency paise to INR
    const formatINR = (paise: number) => `₹${(paise / 100).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
    const formatDate = (date: Date) => new Date(date).toLocaleDateString('en-IN', { year: 'numeric', month: 'short', day: 'numeric' });

    const html = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>Invoice #${invoice.invoiceNo} - Brightloop</title>
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif; color: #1f2937; margin: 0; padding: 40px; background: #fff; }
    .header { display: flex; justify-content: space-between; border-bottom: 2px solid #e5e7eb; padding-bottom: 24px; margin-bottom: 30px; }
    .logo { font-size: 24px; font-weight: 800; color: #0f172a; }
    .badge { display: inline-block; padding: 4px 12px; border-radius: 9999px; font-size: 12px; font-weight: 700; text-transform: uppercase; }
    .badge-paid { background: #dcfce7; color: #15803d; }
    .badge-confirmed { background: #fef3c7; color: #b45309; }
    .badge-draft { background: #f3f4f6; color: #4b5563; }
    .badge-cancelled { background: #fee2e2; color: #b91c1c; }
    .meta-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 30px; margin-bottom: 30px; }
    .card { background: #f9fafb; border: 1px solid #e5e7eb; border-radius: 8px; padding: 18px; }
    .card h3 { margin-top: 0; font-size: 13px; text-transform: uppercase; color: #6b7280; letter-spacing: 0.05em; }
    table { width: 100%; border-collapse: collapse; margin-bottom: 30px; }
    th { text-align: left; padding: 12px; background: #f9fafb; border-bottom: 2px solid #e5e7eb; font-size: 12px; text-transform: uppercase; color: #4b5563; }
    td { padding: 12px; border-bottom: 1px solid #e5e7eb; font-size: 14px; }
    .text-right { text-align: right; }
    .totals { width: 350px; margin-left: auto; margin-bottom: 30px; }
    .totals-row { display: flex; justify-content: space-between; padding: 6px 0; font-size: 14px; }
    .totals-row.grand { border-top: 2px solid #111827; font-size: 16px; font-weight: 700; padding-top: 10px; margin-top: 6px; }
    .payments-table { margin-top: 20px; font-size: 13px; }
    @media print {
      body { padding: 0; }
      .no-print { display: none; }
    }
  </style>
</head>
<body>
  <div class="no-print" style="margin-bottom: 20px; display: flex; justify-content: flex-end; gap: 10px;">
    <button onclick="window.print()" style="padding: 8px 16px; background: #16a34a; color: white; border: none; border-radius: 6px; cursor: pointer; font-weight: 600;">Print Invoice</button>
  </div>
  <div class="header">
    <div>
      <div class="logo">Brightloop Software</div>
      <div style="color: #6b7280; font-size: 13px; margin-top: 4px;">Subscription Control Center</div>
    </div>
    <div style="text-align: right;">
      <h1 style="margin: 0; font-size: 24px;">INVOICE</h1>
      <div style="font-size: 15px; font-weight: 600; color: #374151; margin-top: 4px;">#${invoice.invoiceNo}</div>
      <div style="margin-top: 6px;">
        <span class="badge badge-${invoice.status.toLowerCase()}">${invoice.status}</span>
        ${invoice.isOverdue ? '<span class="badge" style="background:#fee2e2; color:#b91c1c;">OVERDUE</span>' : ''}
      </div>
    </div>
  </div>

  <div class="meta-grid">
    <div class="card">
      <h3>Billed To</h3>
      <div style="font-weight: 700; font-size: 16px;">${invoice.customer.businessName}</div>
      <div style="color: #4b5563; font-size: 14px; margin-top: 4px;">${invoice.customer.billingEmail}</div>
      ${invoice.customer.phone ? `<div style="color: #4b5563; font-size: 14px;">${invoice.customer.phone}</div>` : ''}
      ${invoice.customer.addressLine1 ? `<div style="color: #4b5563; font-size: 14px; margin-top: 4px;">${invoice.customer.addressLine1}, ${invoice.customer.city || ''} ${invoice.customer.postalCode || ''}</div>` : ''}
      ${invoice.customer.taxId ? `<div style="color: #6b7280; font-size: 12px; margin-top: 6px;">Tax ID: ${invoice.customer.taxId}</div>` : ''}
    </div>
    <div class="card">
      <h3>Invoice Details</h3>
      <div class="totals-row"><span>Issued Date:</span> <strong>${formatDate(invoice.issuedAt)}</strong></div>
      <div class="totals-row"><span>Due Date:</span> <strong>${formatDate(invoice.dueAt)}</strong></div>
      <div class="totals-row"><span>Billing Period:</span> <span>${formatDate(invoice.periodStart)} – ${formatDate(invoice.periodEnd)}</span></div>
      ${invoice.paidAt ? `<div class="totals-row"><span>Paid Date:</span> <strong style="color: #15803d;">${formatDate(invoice.paidAt)}</strong></div>` : ''}
    </div>
  </div>

  <table>
    <thead>
      <tr>
        <th>Description</th>
        <th class="text-right">Qty</th>
        <th class="text-right">Unit Price</th>
        <th class="text-right">Tax</th>
        <th class="text-right">Amount</th>
      </tr>
    </thead>
    <tbody>
      ${invoice.lines && invoice.lines.length > 0 ? invoice.lines.map((line: any) => `
        <tr>
          <td>${line.description}</td>
          <td class="text-right">${line.quantity}</td>
          <td class="text-right">${formatINR(line.unitPricePaise)}</td>
          <td class="text-right">${formatINR(line.taxPaise)}</td>
          <td class="text-right">${formatINR(line.totalPaise)}</td>
        </tr>
      `).join('') : `
        <tr>
          <td>Subscription Recurring Charge</td>
          <td class="text-right">1</td>
          <td class="text-right">${formatINR(invoice.subtotalPaise)}</td>
          <td class="text-right">${formatINR(invoice.taxPaise)}</td>
          <td class="text-right">${formatINR(invoice.totalPaise)}</td>
        </tr>
      `}
    </tbody>
  </table>

  <div class="totals">
    <div class="totals-row"><span>Subtotal</span><span>${formatINR(invoice.subtotalPaise)}</span></div>
    ${invoice.discountPaise > 0 ? `<div class="totals-row" style="color: #16a34a;"><span>Discount</span><span>-${formatINR(invoice.discountPaise)}</span></div>` : ''}
    <div class="totals-row"><span>Tax</span><span>${formatINR(invoice.taxPaise)}</span></div>
    <div class="totals-row grand"><span>Total Due</span><span>${formatINR(invoice.totalPaise)}</span></div>
    <div class="totals-row" style="color: #15803d;"><span>Total Paid</span><span>${formatINR(invoice.totalPaidPaise)}</span></div>
    <div class="totals-row" style="font-weight: 700; color: ${invoice.outstandingPaise > 0 ? '#b91c1c' : '#15803d'};">
      <span>Outstanding Balance</span>
      <span>${formatINR(invoice.outstandingPaise)}</span>
    </div>
  </div>

  ${invoice.payments && invoice.payments.length > 0 ? `
    <div style="margin-top: 40px; border-top: 1px solid #e5e7eb; padding-top: 20px;">
      <h3 style="font-size: 14px; text-transform: uppercase; color: #6b7280;">Payment History</h3>
      <table class="payments-table">
        <thead>
          <tr>
            <th>Date</th>
            <th>Method</th>
            <th>Reference</th>
            <th class="text-right">Amount</th>
          </tr>
        </thead>
        <tbody>
          ${invoice.payments.map((p: any) => `
            <tr>
              <td>${formatDate(p.paidAt)}</td>
              <td>${p.method}</td>
              <td>${p.reference || '—'}</td>
              <td class="text-right" style="color: #15803d; font-weight: 600;">${formatINR(p.amountPaise)}</td>
            </tr>
          `).join('')}
        </tbody>
      </table>
    </div>
  ` : ''}
</body>
</html>`;

    return new NextResponse(html, {
      headers: {
        'Content-Type': 'text/html; charset=utf-8',
      },
    });
  } catch (error: any) {
    const status = error.statusCode || 500;
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status }
    );
  }
}
