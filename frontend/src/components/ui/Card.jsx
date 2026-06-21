import React from 'react';
import { motion } from 'framer-motion';

export const Card = ({ className = '', children, hoverable = false, ...props }) => {
  return (
    <motion.div
      className={`bg-[var(--bg-card)] rounded-card border border-[var(--border-color)] shadow-soft overflow-hidden transition-all duration-200 ${
        hoverable ? 'hover:shadow-soft-hover hover:-translate-y-1' : ''
      } ${className}`}
      {...props}
    >
      {children}
    </motion.div>
  );
};

export const CardHeader = ({ className = '', children }) => (
  <div className={`px-6 py-5 border-b border-[var(--border-color)] ${className}`}>
    {children}
  </div>
);

export const CardTitle = ({ className = '', children }) => (
  <h3 className={`text-lg font-semibold leading-none tracking-tight ${className}`}>
    {children}
  </h3>
);

export const CardDescription = ({ className = '', children }) => (
  <p className={`text-sm text-[var(--text-muted)] mt-1.5 ${className}`}>
    {children}
  </p>
);

export const CardContent = ({ className = '', children }) => (
  <div className={`p-6 ${className}`}>
    {children}
  </div>
);

export const CardFooter = ({ className = '', children }) => (
  <div className={`px-6 py-4 bg-[var(--bg-main)] border-t border-[var(--border-color)] flex items-center ${className}`}>
    {children}
  </div>
);
