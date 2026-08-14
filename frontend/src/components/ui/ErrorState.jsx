import React from 'react';
import { AlertCircle, RotateCcw } from 'lucide-react';
import Button from './Button';

export default function ErrorState({
  title = 'An error occurred',
  message = 'We encountered a problem loading this information. Please try again.',
  onRetry = null,
  className = '',
}) {
  return (
    <div className={`flex flex-col items-center justify-center text-center p-8 md:p-12 border border-red-200/50 rounded-2xl bg-red-50/10 dark:bg-red-950/5 min-h-[300px] w-full ${className}`}>
      <div className="flex h-16 w-16 items-center justify-center rounded-full bg-red-100 dark:bg-red-950/20 text-red-600 mb-5 shadow-sm">
        <AlertCircle className="h-8 w-8" />
      </div>
      
      <h3 className="font-serif text-lg font-bold text-red-600 mb-1.5 leading-tight">
        {title}
      </h3>
      
      <p className="text-sm text-[var(--text-muted)] max-w-sm mb-6 leading-relaxed">
        {message}
      </p>

      {onRetry && (
        <Button 
          variant="outline" 
          onClick={onRetry} 
          leftIcon={<RotateCcw size={14} />}
          className="border-red-200 hover:bg-red-50 hover:text-red-700 dark:border-red-900/50 dark:hover:bg-red-950/20"
        >
          Try Again
        </Button>
      )}
    </div>
  );
}
