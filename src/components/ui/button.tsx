'use client';

import { forwardRef, ButtonHTMLAttributes } from 'react';
import { cn } from '@/lib/utils';
import { Loader2 } from 'lucide-react';

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger';
  size?: 'sm' | 'md' | 'lg';
  isLoading?: boolean;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
}

const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      className,
      variant = 'primary',
      size = 'md',
      isLoading = false,
      leftIcon,
      rightIcon,
      disabled,
      children,
      ...props
    },
    ref
  ) => {
    const baseStyles =
      'inline-flex items-center justify-center font-medium transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed';

    const variantStyles = {
      primary:
        'bg-primary-600 text-white hover:bg-primary-700 active:bg-primary-800 focus:ring-primary-500',
      secondary:
        'bg-slate-100 text-slate-900 hover:bg-slate-200 active:bg-slate-300 dark:bg-slate-800 dark:text-slate-100 dark:hover:bg-slate-700 focus:ring-slate-500',
      outline:
        'border border-slate-300 bg-transparent hover:bg-slate-50 dark:border-slate-600 dark:hover:bg-slate-800 focus:ring-slate-500',
      ghost:
        'bg-transparent hover:bg-slate-100 dark:hover:bg-slate-800 focus:ring-slate-500',
      danger:
        'bg-red-600 text-white hover:bg-red-700 active:bg-red-800 focus:ring-red-500',
    };

    const sizeStyles = {
      sm: 'text-sm px-3 py-1.5 rounded-md gap-1.5',
      md: 'text-sm px-4 py-2 rounded-lg gap-2',
      lg: 'text-base px-6 py-3 rounded-lg gap-2',
    };

    return (
      <button
        ref={ref}
        disabled={disabled || isLoading}
        className={cn(
          baseStyles,
          variantStyles[variant],
          sizeStyles[size],
          className
        )}
        {...props}
      >
        {isLoading ? (
          <Loader2 className="h-4 w-4 animate-spin" />
        ) : (
          leftIcon
        )}
        {children}
        {!isLoading && rightIcon}
      </button>
    );
  }
);

Button.displayName = 'Button';

export { Button };
