'use client';

import React from 'react';

export type ButtonVariant =
  | 'primary'
  | 'secondary'
  | 'outline'
  | 'ghost'
  | 'emerald'
  | 'amber'
  | 'danger';

export type ButtonSize = 'sm' | 'md' | 'lg' | 'icon';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  children?: React.ReactNode;
  icon?: React.ReactNode;
  isLoading?: boolean;
}

export function Button({
  variant = 'primary',
  size = 'md',
  children,
  icon,
  isLoading = false,
  className = '',
  disabled,
  ...props
}: ButtonProps) {
  const variantStyles: Record<ButtonVariant, string> = {
    primary:
      'bg-zinc-900 hover:bg-zinc-800 text-white dark:bg-[#8B7CFF] dark:hover:bg-[#7866FF] dark:text-[#0F0F10] font-semibold shadow-xs focus:ring-2 focus:ring-zinc-400 dark:focus:ring-[#8B7CFF]/50 active:scale-[0.99]',
    secondary:
      'bg-zinc-100 hover:bg-zinc-200 text-zinc-900 font-medium border border-zinc-200 dark:bg-[#232327] dark:hover:bg-[#2C2C31] dark:text-[#F5F5F5] dark:border-[#2C2C31] shadow-2xs active:scale-[0.99]',
    outline:
      'bg-transparent hover:bg-zinc-100 text-zinc-800 hover:text-zinc-950 font-medium border border-zinc-200 hover:border-zinc-300 dark:border-[#2C2C31] dark:text-[#F5F5F5] dark:hover:bg-[#1C1C1F] dark:hover:border-[#3F3F46] shadow-2xs active:scale-[0.99]',
    ghost:
      'bg-transparent hover:bg-zinc-100 text-zinc-600 hover:text-zinc-950 font-medium dark:hover:bg-[#1C1C1F] dark:text-[#A1A1AA] dark:hover:text-[#F5F5F5] active:scale-[0.99]',
    emerald:
      'bg-emerald-50 hover:bg-emerald-100 text-emerald-700 font-medium border border-emerald-200 dark:bg-[#064E3B]/70 dark:hover:bg-[#065F46] dark:text-[#34D399] dark:border-emerald-800/40 shadow-xs active:scale-[0.99]',
    amber:
      'bg-amber-50 hover:bg-amber-100 text-amber-800 font-medium border border-amber-200 dark:bg-[#78350F]/60 dark:hover:bg-[#78350F] dark:text-[#F5B74F] dark:border-amber-800/40 shadow-xs active:scale-[0.99]',
    danger:
      'bg-rose-50 hover:bg-rose-100 text-rose-700 font-medium border border-rose-200 dark:bg-[#7F1D1D]/60 dark:hover:bg-[#7F1D1D] dark:text-[#F87171] dark:border-rose-800/40 shadow-xs active:scale-[0.99]',
  };

  const sizeStyles: Record<ButtonSize, string> = {
    sm: 'text-xs px-2.5 py-1.5 rounded-[8px] gap-1.5',
    md: 'text-xs px-3.5 py-2 rounded-[8px] gap-2',
    lg: 'text-sm px-4.5 py-2.5 rounded-[10px] gap-2.5',
    icon: 'p-2 rounded-[8px]',
  };

  return (
    <button
      disabled={disabled || isLoading}
      className={`inline-flex items-center justify-center transition-all duration-150 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed select-none ${variantStyles[variant]} ${sizeStyles[size]} ${className}`}
      {...props}
    >
      {isLoading ? (
        <svg
          className="animate-spin h-4 w-4 text-current"
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
        >
          <circle
            className="opacity-25"
            cx="12"
            cy="12"
            r="10"
            stroke="currentColor"
            strokeWidth="4"
          />
          <path
            className="opacity-75"
            fill="currentColor"
            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
          />
        </svg>
      ) : (
        icon
      )}
      {children}
    </button>
  );
}
