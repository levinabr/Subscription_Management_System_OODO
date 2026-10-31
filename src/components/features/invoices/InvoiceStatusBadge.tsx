import React from 'react';

interface InvoiceStatusBadgeProps {
  status: string;
  isOverdue?: boolean;
  className?: string;
}

export function InvoiceStatusBadge({ status, isOverdue, className = '' }: InvoiceStatusBadgeProps) {
  let badgeStyle = 'bg-gray-100 text-gray-700 border-gray-200';
  let label = status;

  switch (status) {
    case 'PAID':
      badgeStyle = 'bg-green-100 text-green-800 border-green-200';
      label = 'Paid';
      break;
    case 'CONFIRMED':
      badgeStyle = 'bg-amber-100 text-amber-800 border-amber-200';
      label = 'Confirmed';
      break;
    case 'DRAFT':
      badgeStyle = 'bg-slate-100 text-slate-700 border-slate-200';
      label = 'Draft';
      break;
    case 'CANCELLED':
      badgeStyle = 'bg-red-100 text-red-700 border-red-200';
      label = 'Cancelled';
      break;
  }

  return (
    <div className={`inline-flex items-center gap-1.5 ${className}`}>
      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold border ${badgeStyle}`}>
        {label}
      </span>
      {isOverdue && (
        <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-bold bg-rose-100 text-rose-800 border border-rose-300 animate-pulse">
          OVERDUE
        </span>
      )}
    </div>
  );
}

export function formatINR(paise: number): string {
  return `₹${(paise / 100).toLocaleString('en-IN', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;
}
