'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  Squares2X2Icon,
  UsersIcon,
  BuildingOffice2Icon,
  UserIcon,
  FolderIcon,
  CreditCardIcon,
  GlobeAltIcon,
  SparklesIcon,
  ArrowTrendingUpIcon,
  RectangleStackIcon,
} from '@heroicons/react/24/outline';
import {
  PanelLeft,
  PanelLeftClose,
  PanelLeftOpen,
} from 'lucide-react';
import { useCRM } from '@/lib/store';

interface NavItem {
  href: string;
  label: string;
  icon: React.ComponentType<{ className?: string; strokeWidth?: number }>;
  badge?: number | null;
}

interface NavSection {
  group: string;
  items: NavItem[];
}

export function Sidebar() {
  const pathname = usePathname();
  const [mounted, setMounted] = useState(false);
  const {
    leads,
    payments,
    projects,
    isSidebarCollapsed,
    toggleSidebar,
    isMobileNavOpen,
    setIsMobileNavOpen,
  } = useCRM();

  useEffect(() => {
    setMounted(true);
  }, []);

  // Close mobile nav on route change
  useEffect(() => {
    setIsMobileNavOpen(false);
  }, [pathname, setIsMobileNavOpen]);

  // Close mobile nav on Escape key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isMobileNavOpen) {
        setIsMobileNavOpen(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isMobileNavOpen, setIsMobileNavOpen]);

  const leadsAttentionCount = leads.filter((l) => l.status === 'New' || l.status === 'Payment Received').length;
  const paymentsPendingCount = payments.filter((p) => p.status === 'Link Sent').length;
  const projectsAttentionCount = projects.filter((p) => p.status === 'In Progress' || p.status === 'Planning').length;

  const NAV_SECTIONS: NavSection[] = [
    {
      group: 'Workspace',
      items: [
        {
          href: '/',
          label: 'Overview',
          icon: Squares2X2Icon,
        },
        {
          href: '/leads',
          label: 'Leads',
          icon: UsersIcon,
          badge: leadsAttentionCount > 0 ? leadsAttentionCount : null,
        },
        {
          href: '/organizations',
          label: 'Organizations',
          icon: BuildingOffice2Icon,
        },
        {
          href: '/individuals',
          label: 'Individuals',
          icon: UserIcon,
        },
        {
          href: '/projects',
          label: 'Projects',
          icon: FolderIcon,
          badge: projectsAttentionCount > 0 ? projectsAttentionCount : null,
        },
      ],
    },
    {
      group: 'Operations',
      items: [
        {
          href: '/payments',
          label: 'Payments',
          icon: CreditCardIcon,
          badge: paymentsPendingCount > 0 ? paymentsPendingCount : null,
        },
      ],
    },
    {
      group: 'Intelligence',
      items: [
        {
          href: '/ai-studio',
          label: 'AI Studio',
          icon: SparklesIcon,
        },
        {
          href: '/reports',
          label: 'Reports',
          icon: ArrowTrendingUpIcon,
        },
      ],
    },
  ];

  return (
    <>
      {/* ============================================================ */}
      {/* 1. DESKTOP SIDEBAR (EXPANDED ~240px ⇄ COLLAPSED ~64px)       */}
      {/* ============================================================ */}
      <aside
        className={`hidden md:flex shrink-0 border-r border-zinc-200/90 dark:border-[#2C2C31] bg-[#F4F5F7] dark:bg-[#111112] flex-col justify-between min-h-screen sticky top-0 h-screen select-none z-20 transition-all duration-300 ease-in-out ${
          isSidebarCollapsed ? 'w-[64px]' : 'w-[240px]'
        }`}
      >
        <div
          className={`flex flex-col flex-1 min-h-0 overflow-y-auto transition-all duration-300 ${
            isSidebarCollapsed ? 'w-[64px]' : 'w-[240px]'
          }`}
        >
          {/* Brand Header */}
          <div
            className={`h-16 flex items-center border-b border-zinc-200/90 dark:border-[#2C2C31] bg-[#F4F5F7] dark:bg-[#111112] shrink-0 transition-all duration-300 ${
              isSidebarCollapsed ? 'justify-center px-2' : 'justify-between px-4'
            }`}
          >
            {isSidebarCollapsed ? (
              <div className="relative group/toggle flex items-center justify-center">
                <button
                  type="button"
                  onClick={toggleSidebar}
                  className="h-9 w-9 rounded-[8px] text-zinc-900 dark:text-[#F5F5F5] hover:bg-zinc-100 dark:hover:bg-[#232327] transition-colors duration-150 cursor-ew-resize flex items-center justify-center group"
                  aria-label="Open sidebar"
                >
                  <span className="font-bold text-[18px] tracking-tight block group-hover/toggle:hidden">Q</span>
                  <PanelLeftOpen className="h-[18px] w-[18px] hidden group-hover/toggle:block text-zinc-500 dark:text-[#9A9AA0] animate-fade-in" strokeWidth={1.6} />
                </button>
                <div className="absolute left-full ml-2.5 top-1/2 -translate-y-1/2 hidden group-hover/toggle:flex items-center px-2.5 py-1 rounded-[6px] bg-zinc-900 dark:bg-[#1E1E20] border border-zinc-800 dark:border-[#2C2C31] shadow-2xl text-[11px] font-medium text-zinc-100 dark:text-[#F5F5F5] whitespace-nowrap z-50 pointer-events-none animate-fade-in">
                  <span>Open sidebar</span>
                </div>
              </div>
            ) : (
              <>
                <Link href="/" className="flex items-center group">
                  <span className="font-semibold text-zinc-900 dark:text-[#F5F5F5] text-[17px] tracking-tight">
                    Qdelta
                  </span>
                </Link>

                {/* Sidebar Toggle Icon with Arrow Morph & Tooltip */}
                <div className="relative group/toggle flex items-center justify-center">
                  <button
                    type="button"
                    onClick={toggleSidebar}
                    className="h-8.5 w-8.5 rounded-[8px] text-zinc-500 dark:text-[#8B8B94] hover:text-zinc-900 dark:hover:text-[#9A9AA0] hover:bg-zinc-100 dark:hover:bg-[#232327] transition-colors duration-150 cursor-ew-resize flex items-center justify-center group"
                    aria-label="Close sidebar"
                  >
                    <PanelLeft className="h-[18px] w-[18px] block group-hover/toggle:hidden" strokeWidth={1.6} />
                    <PanelLeftClose className="h-[18px] w-[18px] hidden group-hover/toggle:block text-zinc-500 dark:text-[#9A9AA0] animate-fade-in" strokeWidth={1.6} />
                  </button>
                  <div className="absolute right-0 top-full mt-2 hidden group-hover/toggle:flex items-center px-2.5 py-1 rounded-[6px] bg-zinc-900 dark:bg-[#1E1E20] border border-zinc-800 dark:border-[#2C2C31] shadow-2xl text-[11px] font-medium text-zinc-100 dark:text-[#F5F5F5] whitespace-nowrap z-50 pointer-events-none animate-fade-in">
                    <span>Close sidebar</span>
                  </div>
                </div>
              </>
            )}
          </div>

          {/* Navigation Sections */}
          <nav
            className={`py-4 space-y-[18px] flex-1 animate-antigravity transition-all duration-300 ${
              isSidebarCollapsed ? 'px-2' : 'px-2.5'
            }`}
          >
            {NAV_SECTIONS.map((section, sectionIdx) => (
              <div key={section.group}>
                {isSidebarCollapsed ? (
                  sectionIdx > 0 ? (
                    <div className="h-px bg-zinc-200 dark:bg-[#2C2C31] mx-2 my-2.5" />
                  ) : null
                ) : (
                  <div className="px-3 mb-2 text-[13px] font-medium leading-[18px] text-zinc-400 dark:text-[#71717A] select-none">
                    {section.group}
                  </div>
                )}

                <div className="space-y-[3px]">
                  {section.items.map((item) => {
                    const isActive = item.href === '/' ? pathname === '/' : pathname.startsWith(item.href);
                    const Icon = item.icon;

                    if (isSidebarCollapsed) {
                      return (
                        <div key={item.href} className="relative group flex justify-center">
                          <Link
                            href={item.href}
                            className={`relative flex items-center justify-center w-10 h-[38px] rounded-[8px] transition-all duration-200 ease-out ${
                              isActive
                                ? 'bg-zinc-100 dark:bg-[#2E2E32] text-zinc-950 dark:text-[#FFFFFF] font-medium shadow-2xs'
                                : 'text-zinc-500 dark:text-[#8B8B94] hover:text-zinc-950 dark:hover:text-[#FFFFFF] hover:bg-zinc-100 dark:hover:bg-[#232327] hover:-translate-y-0.5 hover:shadow-2xs'
                            }`}
                          >
                            <Icon
                              className={`h-[18px] w-[18px] shrink-0 transition-colors duration-200 ${
                                isActive
                                  ? 'text-zinc-950 dark:text-[#FFFFFF]'
                                  : 'text-zinc-500 dark:text-[#8B8B94] group-hover:text-zinc-950 dark:group-hover:text-[#FFFFFF]'
                              }`}
                            />
                            {mounted && item.badge !== undefined && item.badge !== null && (
                              <span className="absolute top-1.5 right-1.5 h-2 w-2 rounded-full bg-indigo-600 dark:bg-[#FFFFFF] ring-2 ring-white dark:ring-[#111112]" />
                            )}
                          </Link>

                          {/* Floating Tooltip in Collapsed Mode */}
                          <div className="absolute left-full ml-2.5 top-1/2 -translate-y-1/2 hidden group-hover:flex items-center gap-1.5 px-2.5 py-1 rounded-[6px] bg-zinc-900 dark:bg-[#1E1E20] border border-zinc-800 dark:border-[#2C2C31] shadow-2xl text-[11px] font-medium text-zinc-100 dark:text-[#F5F5F5] whitespace-nowrap z-50 pointer-events-none animate-fade-in">
                            <span>{item.label}</span>
                            {mounted && item.badge !== undefined && item.badge !== null && (
                              <span suppressHydrationWarning className="text-[10px] text-zinc-400 dark:text-[#A1A1AA] font-mono">({item.badge})</span>
                            )}
                          </div>
                        </div>
                      );
                    }

                    return (
                      <Link
                        key={item.href}
                        href={item.href}
                        className={`relative flex items-center justify-between px-3 h-[38px] rounded-[8px] transition-all duration-200 ease-out group ${
                          isActive
                            ? 'bg-zinc-100 dark:bg-[#2E2E32] text-zinc-950 dark:text-[#FFFFFF] font-medium shadow-2xs'
                            : 'text-zinc-600 dark:text-[#ECECEC] hover:text-zinc-950 dark:hover:text-[#FFFFFF] hover:bg-zinc-100 dark:hover:bg-[#232327] hover:-translate-y-0.5 hover:shadow-2xs font-normal'
                        }`}
                      >
                        <div className="flex items-center gap-[11px]">
                          <Icon
                            className={`h-[18px] w-[18px] shrink-0 transition-colors duration-200 ${
                              isActive
                                ? 'text-zinc-950 dark:text-[#FFFFFF]'
                                : 'text-zinc-500 dark:text-[#8B8B94] group-hover:text-zinc-950 dark:group-hover:text-[#FFFFFF]'
                            }`}
                          />
                          <span
                            className={`text-[14px] leading-[20px] tracking-[-0.01em] transition-colors duration-200 ${
                              isActive
                                ? 'font-medium text-zinc-950 dark:text-[#FFFFFF]'
                                : 'font-normal text-zinc-600 dark:text-[#ECECEC] group-hover:text-zinc-950 dark:group-hover:text-[#FFFFFF]'
                            }`}
                          >
                            {item.label}
                          </span>
                        </div>

                        {mounted && item.badge !== undefined && item.badge !== null && (
                          <span
                            suppressHydrationWarning
                            className={`h-[20px] min-w-[20px] px-1.5 inline-flex items-center justify-center rounded-full text-[11px] font-medium font-mono border transition-colors duration-200 ${
                              isActive
                                ? 'bg-zinc-200 text-zinc-900 border-zinc-300 dark:bg-[#38383E] dark:text-[#FFFFFF] dark:border-[#4A4A52]'
                                : 'bg-zinc-100 text-zinc-500 group-hover:text-zinc-900 border-zinc-200 dark:bg-[#232327] dark:text-[#A1A1AA] dark:group-hover:text-[#FFFFFF] dark:border-[#2C2C31]'
                            }`}
                          >
                            {item.badge}
                          </span>
                        )}
                      </Link>
                    );
                  })}
                </div>
              </div>
            ))}
          </nav>
        </div>
      </aside>

      {/* ============================================================ */}
      {/* 2. MOBILE NAVIGATION DRAWER (Slide-out Overlay)              */}
      {/* ============================================================ */}
      {isMobileNavOpen && (
        <div className="fixed inset-0 z-50 md:hidden flex">
          {/* Backdrop overlay */}
          <div
            className="fixed inset-0 bg-black/60 dark:bg-black/70 backdrop-blur-xs transition-opacity animate-fade-in"
            onClick={() => setIsMobileNavOpen(false)}
            aria-hidden="true"
          />

          {/* Slide-out Drawer */}
          <div className="relative w-[260px] max-w-[85vw] h-full bg-[#F4F5F7] dark:bg-[#111112] border-r border-zinc-200/90 dark:border-[#2C2C31] shadow-2xl flex flex-col justify-between z-10 animate-fade-in">
            <div className="flex flex-col flex-1 min-h-0 overflow-y-auto">
              {/* Drawer Header */}
              <div className="h-16 flex items-center justify-between px-4 border-b border-zinc-200/90 dark:border-[#2C2C31] bg-[#F4F5F7] dark:bg-[#111112] shrink-0">
                <Link
                  href="/"
                  onClick={() => setIsMobileNavOpen(false)}
                  className="flex items-center group"
                >
                  <span className="font-semibold text-zinc-900 dark:text-[#F5F5F5] text-[17px] tracking-tight">
                    Qdelta
                  </span>
                </Link>

                <div className="relative group/toggle flex items-center justify-center">
                  <button
                    onClick={() => setIsMobileNavOpen(false)}
                    className="h-8.5 w-8.5 rounded-[8px] text-zinc-500 dark:text-[#8B8B94] hover:text-zinc-900 dark:hover:text-[#9A9AA0] hover:bg-zinc-100 dark:hover:bg-[#232327] transition-colors duration-150 cursor-ew-resize flex items-center justify-center group"
                    aria-label="Close navigation"
                  >
                    <PanelLeft className="h-[18px] w-[18px] block group-hover/toggle:hidden" strokeWidth={1.6} />
                    <PanelLeftClose className="h-[18px] w-[18px] hidden group-hover/toggle:block text-zinc-500 dark:text-[#9A9AA0] animate-fade-in" strokeWidth={1.6} />
                  </button>
                </div>
              </div>

              {/* Navigation Sections */}
              <nav className="px-2.5 py-4 space-y-[18px] flex-1 animate-antigravity">
                {NAV_SECTIONS.map((section) => (
                  <div key={section.group}>
                    <div className="px-3 mb-2 text-[13px] font-medium leading-[18px] text-zinc-400 dark:text-[#71717A] select-none">
                      {section.group}
                    </div>
                    <div className="space-y-[3px]">
                      {section.items.map((item) => {
                        const isActive = item.href === '/' ? pathname === '/' : pathname.startsWith(item.href);
                        const Icon = item.icon;

                        return (
                          <Link
                            key={item.href}
                            href={item.href}
                            onClick={() => setIsMobileNavOpen(false)}
                            className={`relative flex items-center justify-between px-3 h-[38px] rounded-[8px] transition-all duration-200 ease-out group ${
                              isActive
                                ? 'bg-zinc-100 dark:bg-[#2E2E32] text-zinc-950 dark:text-[#FFFFFF] font-medium shadow-2xs'
                                : 'text-zinc-600 dark:text-[#ECECEC] hover:text-zinc-950 dark:hover:text-[#FFFFFF] hover:bg-zinc-100 dark:hover:bg-[#232327] hover:-translate-y-0.5 hover:shadow-2xs font-normal'
                            }`}
                          >
                            <div className="flex items-center gap-[11px]">
                              <Icon
                                className={`h-[18px] w-[18px] shrink-0 transition-colors duration-200 ${
                                  isActive
                                    ? 'text-zinc-950 dark:text-[#FFFFFF]'
                                    : 'text-zinc-500 dark:text-[#8B8B94] group-hover:text-zinc-950 dark:group-hover:text-[#FFFFFF]'
                                }`}
                              />
                              <span
                                className={`text-[14px] leading-[20px] tracking-[-0.01em] transition-colors duration-200 ${
                                  isActive
                                    ? 'font-medium text-zinc-950 dark:text-[#FFFFFF]'
                                    : 'font-normal text-zinc-600 dark:text-[#ECECEC] group-hover:text-zinc-950 dark:group-hover:text-[#FFFFFF]'
                                }`}
                              >
                                {item.label}
                              </span>
                            </div>

                            {mounted && item.badge !== undefined && item.badge !== null && (
                              <span
                                suppressHydrationWarning
                                className={`h-[20px] min-w-[20px] px-1.5 inline-flex items-center justify-center rounded-full text-[11px] font-medium font-mono border transition-colors duration-200 ${
                                  isActive
                                    ? 'bg-zinc-200 text-zinc-900 border-zinc-300 dark:bg-[#38383E] dark:text-[#FFFFFF] dark:border-[#4A4A52]'
                                    : 'bg-zinc-100 text-zinc-500 group-hover:text-zinc-900 border-zinc-200 dark:bg-[#232327] dark:text-[#A1A1AA] dark:group-hover:text-[#FFFFFF] dark:border-[#2C2C31]'
                                }`}
                              >
                                {item.badge}
                              </span>
                            )}
                          </Link>
                        );
                      })}
                    </div>
                  </div>
                ))}
              </nav>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
