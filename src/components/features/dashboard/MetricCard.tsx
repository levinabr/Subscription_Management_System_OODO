import React from 'react';

interface MetricCardProps {
  title: string;
  value: string;
  subtitle?: string;
  icon: React.ReactNode;
  badge?: {
    text: string;
    variant?: 'neutral' | 'emerald' | 'amber' | 'rose' | 'blue';
  };
  trend?: string;
}

export function MetricCard({ title, value, subtitle, icon, badge }: MetricCardProps) {
  const getBadgeStyle = () => {
    switch (badge?.variant) {
      case 'emerald':
        return 'bg-emerald-50 text-emerald-700 border-emerald-200';
      case 'amber':
        return 'bg-amber-50 text-amber-700 border-amber-200';
      case 'rose':
        return 'bg-rose-50 text-rose-700 border-rose-200';
      case 'blue':
        return 'bg-blue-50 text-blue-700 border-blue-200';
      default:
        return 'bg-slate-100 text-slate-700 border-slate-200';
    }
  };

  return (
    <div className="bg-white border border-slate-200/80 rounded-xl p-5 shadow-sm hover:shadow-md transition">
      <div className="flex items-center justify-between mb-3">
        <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">
          {title}
        </span>
        <div className="p-2 rounded-lg bg-slate-50 text-slate-600 border border-slate-100">
          {icon}
        </div>
      </div>

      <div className="flex items-baseline justify-between gap-2">
        <div className="text-2xl font-extrabold text-slate-900 tracking-tight">{value}</div>
        {badge && (
          <span
            className={`text-xs font-bold px-2 py-0.5 rounded-full border ${getBadgeStyle()}`}
          >
            {badge.text}
          </span>
        )}
      </div>

      {subtitle && <p className="text-xs text-slate-500 mt-2 font-medium">{subtitle}</p>}
    </div>
  );
}
