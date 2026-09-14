'use client';

import React from 'react';

export type BadgeVariant =
  | 'default'
  | 'indigo'
  | 'emerald'
  | 'amber'
  | 'rose'
  | 'sky'
  | 'purple'
  | 'slate'
  | 'success'
  | 'warning'
  | 'secondary'
  | 'danger'
  | 'info';

interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?: BadgeVariant;
  size?: 'sm' | 'md';
  children: React.ReactNode;
  dot?: boolean;
}

export function Badge({
  variant = 'default',
  size = 'md',
  children,
  dot = false,
  className = '',
  ...props
}: BadgeProps) {
  const variantStyles: Record<BadgeVariant, { container: string; dot: string }> = {
    default: {
      container: 'bg-zinc-100 text-zinc-700 border-zinc-200 dark:bg-[#232327] dark:text-[#A1A1AA] dark:border-[#2C2C31]',
      dot: 'bg-zinc-500 dark:bg-[#71717A]',
    },
    secondary: {
      container: 'bg-zinc-100 text-zinc-700 border-zinc-200 dark:bg-[#232327] dark:text-[#A1A1AA] dark:border-[#2C2C31]',
      dot: 'bg-zinc-500 dark:bg-[#71717A]',
    },
    slate: {
      container: 'bg-zinc-100 text-zinc-700 border-zinc-200 dark:bg-[#232327] dark:text-[#A1A1AA] dark:border-[#2C2C31]',
      dot: 'bg-zinc-500 dark:bg-[#71717A]',
    },
    indigo: {
      container: 'bg-indigo-50 text-indigo-700 border-indigo-200 dark:bg-[#8B7CFF]/15 dark:text-[#A99CFF] dark:border-[#8B7CFF]/30',
      dot: 'bg-indigo-600 dark:bg-[#8B7CFF]',
    },
    purple: {
      container: 'bg-purple-50 text-purple-700 border-purple-200 dark:bg-[#8B7CFF]/15 dark:text-[#A99CFF] dark:border-[#8B7CFF]/30',
      dot: 'bg-purple-600 dark:bg-[#8B7CFF]',
    },
    emerald: {
      container: 'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-[#34D399]/15 dark:text-[#34D399] dark:border-[#34D399]/30',
      dot: 'bg-emerald-600 dark:bg-[#34D399]',
    },
    success: {
      container: 'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-[#34D399]/15 dark:text-[#34D399] dark:border-[#34D399]/30',
      dot: 'bg-emerald-600 dark:bg-[#34D399]',
    },
    amber: {
      container: 'bg-amber-50 text-amber-800 border-amber-200 dark:bg-[#F5B74F]/15 dark:text-[#F5B74F] dark:border-[#F5B74F]/30',
      dot: 'bg-amber-500 dark:bg-[#F5B74F]',
    },
    warning: {
      container: 'bg-amber-50 text-amber-800 border-amber-200 dark:bg-[#F5B74F]/15 dark:text-[#F5B74F] dark:border-[#F5B74F]/30',
      dot: 'bg-amber-500 dark:bg-[#F5B74F]',
    },
    rose: {
      container: 'bg-rose-50 text-rose-700 border-rose-200 dark:bg-[#F87171]/15 dark:text-[#F87171] dark:border-[#F87171]/30',
      dot: 'bg-rose-600 dark:bg-[#F87171]',
    },
    danger: {
      container: 'bg-rose-50 text-rose-700 border-rose-200 dark:bg-[#F87171]/15 dark:text-[#F87171] dark:border-[#F87171]/30',
      dot: 'bg-rose-600 dark:bg-[#F87171]',
    },
    sky: {
      container: 'bg-sky-50 text-sky-700 border-sky-200 dark:bg-[#38BDF8]/15 dark:text-[#38BDF8] dark:border-[#38BDF8]/30',
      dot: 'bg-sky-500 dark:bg-[#38BDF8]',
    },
    info: {
      container: 'bg-sky-50 text-sky-700 border-sky-200 dark:bg-[#38BDF8]/15 dark:text-[#38BDF8] dark:border-[#38BDF8]/30',
      dot: 'bg-sky-500 dark:bg-[#38BDF8]',
    },
  };

  const currentVariant = variantStyles[variant] || variantStyles.default;

  const sizeStyles = {
    sm: 'text-[10px] px-1.5 py-0.5 gap-1',
    md: 'text-[11px] px-2 py-0.5 gap-1.5',
  };

  return (
    <span
      className={`inline-flex items-center font-medium rounded-full border ${currentVariant.container} ${sizeStyles[size]} ${className}`}
      {...props}
    >
      {dot && <span className={`h-1.5 w-1.5 rounded-full shrink-0 ${currentVariant.dot}`} />}
      {children}
    </span>
  );
}
