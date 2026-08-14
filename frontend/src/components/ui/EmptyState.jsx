import React from 'react';
import { Calendar } from 'lucide-react';

export default function EmptyState({
  icon = <Calendar className="h-10 w-10 text-[var(--text-muted)]" />,
  title = 'No records found',
  description = 'There is currently no data to display in this list.',
  action = null,
  className = '',
}) {
  return (
    <div className={`flex flex-col items-center justify-center text-center p-8 md:p-12 border border-[var(--border-light)] border-dashed rounded-2xl bg-white/40 dark:bg-[#1A1618]/25 min-h-[300px] w-full ${className}`}>
      <div className="flex h-16 w-16 items-center justify-center rounded-full bg-primary/5 text-primary mb-5 shadow-sm">
        {icon}
      </div>
      <h3 className="font-serif text-lg font-bold text-[var(--text-dark)] mb-1.5 leading-tight">
        {title}
      </h3>
      <p className="text-sm text-[var(--text-muted)] max-w-sm mb-6 leading-relaxed">
        {description}
      </p>
      {action && <div className="inline-flex shrink-0 select-none">{action}</div>}
    </div>
  );
}
