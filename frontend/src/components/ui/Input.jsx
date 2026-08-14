import React, { forwardRef } from 'react';

const Input = forwardRef(({
  label = '',
  error = '',
  description = '',
  leftIcon = null,
  rightIcon = null,
  className = '',
  id,
  type = 'text',
  ...props
}, ref) => {
  const inputId = id || `input-${Math.random().toString(36).substr(2, 9)}`;
  const errorId = `${inputId}-error`;
  const descId = `${inputId}-description`;

  return (
    <div className={`w-full flex flex-col gap-1.5 ${className}`}>
      {label && (
        <label 
          htmlFor={inputId} 
          className="text-sm font-semibold text-[var(--text-dark)] select-none"
        >
          {label}
        </label>
      )}

      <div className="relative flex items-center w-full">
        {leftIcon && (
          <span className="absolute left-4 text-[var(--text-muted)] pointer-events-none z-10 shrink-0">
            {leftIcon}
          </span>
        )}

        <input
          id={inputId}
          type={type}
          ref={ref}
          className={`w-full px-4 py-2.5 text-sm bg-[var(--bg-card)] text-[var(--text-body)] border border-[var(--border-medium)] rounded-xl transition-all duration-200 outline-none placeholder:text-[var(--text-muted)] focus:border-primary focus:ring-2 focus:ring-primary/10 disabled:opacity-50 disabled:bg-stone-50 dark:disabled:bg-stone-900/20 ${
            leftIcon ? 'pl-11' : ''
          } ${
            rightIcon ? 'pr-11' : ''
          } ${
            error 
              ? 'border-red-500 focus:border-red-500 focus:ring-red-500/10' 
              : 'border-[var(--border-medium)]'
          }`}
          aria-invalid={!!error}
          aria-describedby={`${error ? errorId : ''} ${description ? descId : ''}`.trim() || undefined}
          {...props}
        />

        {rightIcon && (
          <span className="absolute right-4 text-[var(--text-muted)] pointer-events-none z-10 shrink-0">
            {rightIcon}
          </span>
        )}
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

Input.displayName = 'Input';

export default Input;
