import React from 'react';

export const Input = React.forwardRef(({ className = '', label, error, ...props }, ref) => {
  return (
    <div className="w-full">
      {label && (
        <label className="block text-sm font-medium text-[var(--text-main)] mb-1.5">
          {label}
        </label>
      )}
      <input
        ref={ref}
        className={`w-full px-3 py-2 bg-[var(--bg-card)] border rounded-input text-[var(--text-main)] placeholder-[var(--text-muted)] focus:outline-none focus:ring-2 focus:border-transparent transition-all duration-200 ${
          error 
            ? 'border-error focus:ring-red-200 dark:focus:ring-red-900/30' 
            : 'border-[var(--border-color)] focus:ring-primary-100 dark:focus:ring-primary-900/30 focus:border-primary-500'
        } ${className}`}
        {...props}
      />
      {error && (
        <p className="mt-1.5 text-sm text-error">{error}</p>
      )}
    </div>
  );
});

Input.displayName = 'Input';
