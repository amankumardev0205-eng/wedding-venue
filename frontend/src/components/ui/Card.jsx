import React from 'react';

export function Card({ 
  children, 
  className = '', 
  hoverable = false, 
  ...props 
}) {
  return (
    <div 
      className={`bg-[var(--bg-card)] border border-[var(--border-medium)] rounded-2xl shadow-sm transition-all duration-300 ${
        hoverable ? 'hover:-translate-y-1 hover:shadow-md hover:border-primary/20 cursor-pointer' : ''
      } ${className}`}
      {...props}
    >
      {children}
    </div>
  );
}

export function CardHeader({ children, className = '', ...props }) {
  return (
    <div className={`p-6 pb-4 flex flex-col gap-1.5 ${className}`} {...props}>
      {children}
    </div>
  );
}

export function CardTitle({ children, className = '', ...props }) {
  return (
    <h3 className={`font-serif text-xl font-bold text-[var(--text-dark)] leading-tight ${className}`} {...props}>
      {children}
    </h3>
  );
}

export function CardDescription({ children, className = '', ...props }) {
  return (
    <p className={`text-sm text-[var(--text-muted)] leading-relaxed ${className}`} {...props}>
      {children}
    </p>
  );
}

export function CardContent({ children, className = '', ...props }) {
  return (
    <div className={`p-6 pt-0 ${className}`} {...props}>
      {children}
    </div>
  );
}

export function CardFooter({ children, className = '', ...props }) {
  return (
    <div className={`p-6 pt-0 border-t border-[var(--border-light)] mt-4 flex items-center justify-end gap-3 ${className}`} {...props}>
      {children}
    </div>
  );
}
