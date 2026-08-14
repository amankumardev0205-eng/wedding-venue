import React from 'react';

export default function PageHeader({ 
  title, 
  description = '', 
  actions = null, 
  className = '', 
  align = 'left', 
  ...props 
}) {
  const alignments = {
    left: 'text-left items-start justify-between md:flex-row md:items-end',
    center: 'text-center items-center justify-center flex-col',
    right: 'text-right items-end justify-between md:flex-row md:items-end',
  };

  return (
    <div 
      className={`flex flex-col gap-4 border-b border-[var(--border-light)] pb-6 mb-8 md:mb-10 w-full ${alignments[align]} ${className}`} 
      {...props}
    >
      <div className="flex flex-col gap-1.5 max-w-3xl">
        <h1 className="font-serif text-3xl md:text-4xl font-extrabold text-[var(--text-dark)] tracking-wide leading-tight">
          {title}
        </h1>
        {description && (
          <p className="text-sm md:text-base text-[var(--text-muted)] font-medium leading-relaxed">
            {description}
          </p>
        )}
      </div>
      
      {actions && (
        <div className="flex items-center gap-3 shrink-0 mt-2 md:mt-0 select-none">
          {actions}
        </div>
      )}
    </div>
  );
}
