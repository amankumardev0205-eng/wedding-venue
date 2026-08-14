import React from 'react';
import Loader from '../Loader';

export default function Button({
  children,
  variant = 'primary',
  size = 'md',
  isLoading = false,
  leftIcon = null,
  rightIcon = null,
  className = '',
  disabled = false,
  type = 'button',
  ...props
}) {
  const baseStyles = 'inline-flex items-center justify-center font-semibold rounded-xl transition-all duration-250 active:scale-99 outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 disabled:opacity-50 disabled:pointer-events-none disabled:active:scale-100 select-none';

  const variants = {
    primary: 'bg-primary text-white hover:bg-primary-600 shadow-sm border border-transparent',
    secondary: 'bg-primary/5 text-primary hover:bg-primary/10 border border-primary/10',
    outline: 'bg-transparent text-[var(--text-body)] border border-[var(--border-medium)] hover:bg-primary/5 hover:border-primary/20',
    ghost: 'bg-transparent text-[var(--text-body)] hover:bg-primary/5 hover:text-primary',
    danger: 'bg-red-600 text-white hover:bg-red-700 shadow-sm border border-transparent focus-visible:ring-red-500',
  };

  const sizes = {
    sm: 'text-xs px-3 py-1.5 gap-1.5',
    md: 'text-sm px-5 py-2.5 gap-2',
    lg: 'text-base px-6 py-3 gap-2.5',
  };

  return (
    <button
      type={type}
      className={`${baseStyles} ${variants[variant]} ${sizes[size]} ${className}`}
      disabled={disabled || isLoading}
      {...props}
    >
      {isLoading && (
        <span className="shrink-0 animate-spin mr-1">
          {/* A simple elegant spinner for the button */}
          <svg className="h-4 w-4 text-current" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
          </svg>
        </span>
      )}
      {!isLoading && leftIcon && <span className="inline-flex shrink-0">{leftIcon}</span>}
      <span>{children}</span>
      {!isLoading && rightIcon && <span className="inline-flex shrink-0">{rightIcon}</span>}
    </button>
  );
}
