import React from 'react';
import { cn } from '../../utils';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'danger' | 'ghost' | 'outline';
  size?: 'sm' | 'md' | 'lg' | 'icon';
}

export const Button: React.FC<ButtonProps> = ({ 
  className, 
  variant = 'primary', 
  size = 'md',
  children,
  ...props 
}) => {
  const variants = {
    primary: 'bg-amber-500 hover:bg-amber-600 text-stone-900 font-semibold',
    secondary: 'bg-stone-700 hover:bg-stone-600 text-stone-100',
    danger: 'bg-red-500/10 hover:bg-red-500/20 text-red-500 border border-red-500/20',
    ghost: 'hover:bg-stone-800 text-stone-400 hover:text-stone-200',
    outline: 'border border-stone-600 text-stone-300 hover:border-stone-400 hover:text-stone-100'
  };

  const sizes = {
    sm: 'px-3 py-1.5 text-xs',
    md: 'px-4 py-2 text-sm',
    lg: 'px-6 py-3 text-base',
    icon: 'p-2'
  };

  return (
    <button
      className={cn(
        'rounded-lg transition-colors flex items-center justify-center gap-2 active:scale-95 disabled:opacity-50 disabled:pointer-events-none',
        variants[variant],
        sizes[size],
        className
      )}
      {...props}
    >
      {children}
    </button>
  );
};
