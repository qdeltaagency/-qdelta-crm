'use client';

import React, { useEffect, useState } from 'react';
import { X } from 'lucide-react';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: React.ReactNode;
  subtitle?: React.ReactNode;
  icon?: React.ReactNode;
  children: React.ReactNode;
  maxWidth?: 'sm' | 'md' | 'lg' | 'xl' | '2xl' | '3xl' | string;
  closeOnBackdropClick?: boolean;
  closeOnEsc?: boolean;
  zIndex?: string | number;
}

export function Modal({
  isOpen,
  onClose,
  title,
  subtitle,
  icon,
  children,
  maxWidth = 'lg',
  closeOnBackdropClick = true,
  closeOnEsc = true,
  zIndex = 50,
}: ModalProps) {
  const [mounted, setMounted] = useState(false);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setMounted(true);
      const timer = setTimeout(() => setVisible(true), 15);
      document.body.style.overflow = 'hidden';
      return () => {
        clearTimeout(timer);
        document.body.style.overflow = 'unset';
      };
    } else {
      setVisible(false);
      const timer = setTimeout(() => setMounted(false), 240);
      document.body.style.overflow = 'unset';
      return () => {
        clearTimeout(timer);
        document.body.style.overflow = 'unset';
      };
    }
  }, [isOpen]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && closeOnEsc) onClose();
    };
    if (isOpen) {
      window.addEventListener('keydown', handleKeyDown);
    }
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose, closeOnEsc]);

  if (!mounted) return null;

  const maxWidthStyles: Record<string, string> = {
    sm: 'max-w-sm',
    md: 'max-w-md',
    lg: 'max-w-lg',
    xl: 'max-w-xl',
    '2xl': 'max-w-2xl',
    '3xl': 'max-w-3xl',
  };

  const widthClass = maxWidth.startsWith('max-w-') ? maxWidth : (maxWidthStyles[maxWidth] || 'max-w-lg');
  const numericZIndex = typeof zIndex === 'number' ? zIndex : parseInt(zIndex.replace(/\D/g, '') || '50', 10);

  return (
    <div
      style={{ zIndex: numericZIndex }}
      className={`fixed inset-0 flex items-center justify-center p-3 sm:p-4 md:p-6 overflow-y-auto transition-all duration-200 ease-out ${
        visible
          ? 'bg-black/60 backdrop-blur-xs opacity-100 pointer-events-auto'
          : 'bg-black/0 backdrop-blur-none opacity-0 pointer-events-none'
      }`}
      onClick={() => {
        if (closeOnBackdropClick) {
          onClose();
        }
      }}
    >
      <div
        className={`w-full ${widthClass} rounded-2xl border border-zinc-200/90 dark:border-zinc-800/90 bg-white dark:bg-[#121214] shadow-2xl shadow-black/20 dark:shadow-black/60 p-5 sm:p-6 my-auto max-h-[92vh] overflow-y-auto transform transition-all duration-200 ease-out ${
          visible ? 'scale-100 translate-y-0 opacity-100' : 'scale-95 translate-y-2 opacity-0'
        }`}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between pb-4 border-b border-zinc-100 dark:border-zinc-800/80">
          <div className="flex items-center gap-3">
            {icon && (
              <div className="h-10 w-10 rounded-xl bg-zinc-100 dark:bg-zinc-800/80 border border-zinc-200/80 dark:border-zinc-700/60 text-zinc-900 dark:text-zinc-100 flex items-center justify-center shrink-0 shadow-2xs">
                {icon}
              </div>
            )}
            <div>
              <h3 className="font-semibold text-base text-zinc-900 dark:text-zinc-100 tracking-tight leading-snug">{title}</h3>
              {subtitle && <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-0.5 font-normal">{subtitle}</p>}
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="h-8 w-8 rounded-lg text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100 hover:bg-zinc-100 dark:hover:bg-zinc-800/80 transition-colors cursor-pointer flex items-center justify-center shrink-0"
            aria-label="Close"
          >
            <X className="h-4.5 w-4.5" />
          </button>
        </div>

        <div className="pt-4 text-xs text-zinc-700 dark:text-zinc-200">{children}</div>
      </div>
    </div>
  );
}
