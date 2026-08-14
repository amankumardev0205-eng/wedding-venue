import React from 'react';

export default function LoadingState({
  variant = 'spinner', // 'spinner' | 'skeleton' | 'dots'
  className = '',
  rows = 3,
  columns = 1,
  height = 'h-12',
}) {
  if (variant === 'skeleton') {
    return (
      <div 
        className={`w-full grid gap-4 animate-pulse ${className}`}
        style={{ gridTemplateColumns: `repeat(${columns}, minmax(0, 1fr))` }}
      >
        {Array.from({ length: rows * columns }).map((_, idx) => (
          <div 
            key={idx} 
            className={`w-full bg-stone-200 dark:bg-stone-800 rounded-xl ${height}`}
          />
        ))}
      </div>
    );
  }

  if (variant === 'dots') {
    return (
      <div className={`flex items-center justify-center py-10 w-full ${className}`}>
        <div className="flex gap-1.5 items-end justify-center select-none" aria-hidden="true">
          <span className="w-2.5 h-2.5 bg-primary rounded-full animate-bounce" style={{ animationDelay: '0s' }} />
          <span className="w-2.5 h-2.5 bg-primary rounded-full animate-bounce" style={{ animationDelay: '0.15s' }} />
          <span className="w-2.5 h-2.5 bg-primary rounded-full animate-bounce" style={{ animationDelay: '0.3s' }} />
        </div>
      </div>
    );
  }

  // Default elegant spinner
  return (
    <div className={`flex flex-col items-center justify-center py-12 px-6 w-full ${className}`}>
      <div className="relative flex items-center justify-center">
        {/* Outer rotating ring */}
        <div className="h-12 w-12 rounded-full border-2 border-primary/10 border-t-primary animate-spin" />
      </div>
    </div>
  );
}
