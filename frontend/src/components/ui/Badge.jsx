import React from 'react';

export default function Badge({ 
  children, 
  variant = 'primary', 
  className = '', 
  ...props 
}) {
  const baseStyles = 'inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold select-none border tracking-wide transition-colors duration-150';

  const variants = {
    primary: 'bg-primary/10 text-primary border-primary/25',
    secondary: 'bg-stone-100 text-stone-800 border-stone-200 dark:bg-stone-800/40 dark:text-stone-300 dark:border-stone-700/50',
    success: 'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/20 dark:text-emerald-400 dark:border-emerald-900/50',
    warning: 'bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-950/20 dark:text-amber-400 dark:border-amber-900/50',
    danger: 'bg-red-50 text-red-700 border-red-200 dark:bg-red-950/20 dark:text-red-400 dark:border-red-900/50',
    neutral: 'bg-white text-[var(--text-body)] border-[var(--border-medium)] dark:bg-[#1A1618] dark:border-[var(--border-medium)]',
  };

  return (
    <span 
      className={`${baseStyles} ${variants[variant]} ${className}`} 
      {...props}
    >
      {children}
    </span>
  );
}
