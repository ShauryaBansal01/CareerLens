import React from 'react';

export const Badge = ({ className = '', variant = 'default', children }) => {
  const baseStyles = "inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border";
  
  const variants = {
    default: "bg-[var(--bg-main)] text-[var(--text-muted)] border-[var(--border-color)]",
    primary: "bg-primary-50 text-primary-600 border-primary-200 dark:bg-primary-900/30 dark:text-primary-400 dark:border-primary-800",
    success: "bg-accent-50 text-success border-accent-200 dark:bg-accent-900/30 dark:text-accent-400 dark:border-accent-800",
    warning: "bg-amber-50 text-warning border-amber-200 dark:bg-amber-900/30 dark:text-amber-400 dark:border-amber-800",
    error: "bg-red-50 text-error border-red-200 dark:bg-red-900/30 dark:text-red-400 dark:border-red-800",
  };

  return (
    <span className={`${baseStyles} ${variants[variant]} ${className}`}>
      {children}
    </span>
  );
};
