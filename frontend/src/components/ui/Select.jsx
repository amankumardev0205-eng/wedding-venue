import React, { forwardRef } from 'react';

const Select = forwardRef(({
  label = '',
  error = '',
  description = '',
  className = '',
  id,
  children,
  ...props
}, ref) => {
  const selectId = id || `select-${Math.random().toString(36).substr(2, 9)}`;
  const errorId = `${selectId}-error`;
  const descId = `${selectId}-description`;

  return (
    <div className={`w-full flex flex-col gap-1.5 ${className}`}>
      {label && (
        <label 
          htmlFor={selectId} 
          className="text-sm font-semibold text-[var(--text-dark)] select-none"
        >
          {label}
        </label>
      )}

      <div className="relative w-full">
        <select
          id={selectId}
          ref={ref}
          className={`w-full px-4 py-2.5 text-sm bg-[var(--bg-card)] text-[var(--text-body)] border border-[var(--border-medium)] rounded-xl transition-all duration-200 outline-none appearance-none focus:border-primary focus:ring-2 focus:ring-primary/10 disabled:opacity-50 disabled:bg-stone-50 dark:disabled:bg-stone-900/20 pr-10 ${
            error 
              ? 'border-red-500 focus:border-red-500 focus:ring-red-500/10' 
              : 'border-[var(--border-medium)]'
          }`}
          aria-invalid={!!error}
          aria-describedby={`${error ? errorId : ''} ${description ? descId : ''}`.trim() || undefined}
          {...props}
        >
          {children}
        </select>
        
        {/* Custom Chevron Arrow */}
        <div className="absolute inset-y-0 right-0 flex items-center pr-4 pointer-events-none text-[var(--text-muted)]">
          <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
          </svg>
        </div>
      </div>

      {description && !error && (
        <p id={descId} className="text-xs text-[var(--text-muted)]">
          {description}
        </p>
      )}

      {error && (
        <p id={errorId} className="text-xs text-red-500 font-medium" role="alert">
          {error}
        </p>
      )}
    </div>
  );
});

Select.displayName = 'Select';

export default Select;
