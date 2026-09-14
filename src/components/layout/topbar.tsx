'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  PanelLeft,
  PanelLeftOpen,
  Search,
  Sparkles,
  Bell,
  LogOut,
  Plus,
  ChevronRight,
  Shield,
} from 'lucide-react';
import { useCRM } from '@/lib/store';
import { useAgencyAuth } from '@/components/auth/agency-auth-guard';
import { CommandPalette } from '@/components/ui/command-palette';
import { ThemeToggle } from '@/components/ui/theme-toggle';

const SEGMENT_NAMES: Record<string, string> = {
  '': 'Overview',
  'organizations': 'Organizations',
  'individuals': 'Individuals',
  'client-hub': 'Organizations',
  'ai-studio': 'AI Studio',
  'leads': 'Lead Pipeline',
  'clients': 'Organizations',
  'projects': 'Projects',
  'payments': 'Payments',
  'reports': 'Reports',
};

const SECTION_MAP: Record<string, string> = {
  '': 'Workspace',
  'leads': 'Workspace',
  'organizations': 'Workspace',
  'individuals': 'Workspace',
  'clients': 'Workspace',
  'projects': 'Workspace',
  'client-hub': 'Workspace',
  'payments': 'Operations',
  'ai-studio': 'Intelligence',
  'reports': 'Intelligence',
};

function formatSegment(
  segment: string,
  clients: { id: string; organizationName: string }[],
  projects: { id: string; title: string }[]
): string {
  const lower = segment.toLowerCase();
  if (SEGMENT_NAMES[lower]) {
    return SEGMENT_NAMES[lower];
  }

  const clientMatch = clients.find((c) => c.id === segment);
  if (clientMatch) return clientMatch.organizationName;

  const projectMatch = projects.find((p) => p.id === segment);
  if (projectMatch) return projectMatch.title;

  if (segment.length > 20 && segment.includes('-')) {
    return 'Workspace Details';
  }

  return segment
    .replace(/[-_]+/g, ' ')
    .replace(/\b[a-z]/g, (char) => char.toUpperCase());
}

export function Topbar() {
  const pathname = usePathname();
  const { clients, projects, activityLogs, toggleMobileNav } = useCRM();
  const { authenticatedUser, logout } = useAgencyAuth();
  const [showNotifications, setShowNotifications] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);

  // Generate dynamic breadcrumb segments
  const cleanPath = (pathname || '/').replace(/\/+$/, '');
  const rawSegments = cleanPath.split('/').filter(Boolean);

  const rootSegment = rawSegments[0]?.toLowerCase() || '';
  const section = SECTION_MAP[rootSegment] || 'Workspace';

  const breadcrumbs =
    rawSegments.length === 0
      ? [{ label: 'Overview', href: '/' }]
      : rawSegments.map((seg, idx) => ({
          label: formatSegment(seg, clients, projects),
          href: `/${rawSegments.slice(0, idx + 1).join('/')}`,
        }));

  return (
    <>
      <header className="h-16 px-4 md:px-6 border-b border-zinc-200/90 dark:border-[#2C2C31] bg-[#F4F5F7]/95 dark:bg-[#111112]/90 backdrop-blur-md sticky top-0 z-30 flex items-center justify-between gap-4 transition-colors duration-200">
        {/* Left: Sidebar Toggle (mobile) & Dynamic Breadcrumbs */}
        <div className="flex items-center gap-3 shrink-0 min-w-0 max-w-[60%] sm:max-w-none">
          {/* Mobile Toggle Button */}
          <div className="relative group/toggle md:hidden flex items-center justify-center shrink-0">
            <button
              type="button"
              onClick={toggleMobileNav}
              className="h-8.5 w-8.5 rounded-lg text-zinc-500 dark:text-[#8B8B94] hover:text-zinc-900 dark:hover:text-[#9A9AA0] hover:bg-[#E5E8EC] dark:hover:bg-[#232327] border border-zinc-200/90 dark:border-[#2C2C31] transition-colors cursor-pointer flex items-center justify-center group"
              aria-label="Open navigation drawer"
            >
              <PanelLeft className="h-[18px] w-[18px] block group-hover/toggle:hidden" strokeWidth={1.6} />
              <PanelLeftOpen className="h-[18px] w-[18px] hidden group-hover/toggle:block animate-fade-in" strokeWidth={1.6} />
            </button>
          </div>

          {/* Dynamic Breadcrumbs */}
          <nav aria-label="Breadcrumb" className="flex items-center gap-1.5 text-xs truncate">
            <span className="font-medium text-zinc-400 dark:text-[#71717A] hidden sm:inline shrink-0">{section}</span>

            {breadcrumbs.map((crumb, idx) => {
              const isLast = idx === breadcrumbs.length - 1;
              return (
                <React.Fragment key={crumb.href}>
                  <ChevronRight className="h-3.5 w-3.5 text-zinc-300 dark:text-[#3F3F46] shrink-0" />
                  {isLast ? (
                    <span className="font-semibold text-zinc-900 dark:text-[#F5F5F5] tracking-tight truncate">
                      {crumb.label}
                    </span>
                  ) : (
                    <Link
                      href={crumb.href}
                      className="text-zinc-500 dark:text-[#71717A] hover:text-zinc-900 dark:hover:text-[#D4D4D8] transition-colors truncate hidden sm:inline"
                    >
                      {crumb.label}
                    </Link>
                  )}
                </React.Fragment>
              );
            })}
          </nav>
        </div>

        {/* Center: Global Search Bar (⌘K / Ctrl+K) */}
        <div className="flex-1 max-w-md mx-auto hidden sm:block">
          <button
            onClick={() => setIsSearchOpen(true)}
            className="w-full flex items-center justify-between px-3.5 py-1.5 rounded-xl border border-zinc-200/90 dark:border-[#2C2C31] bg-[#ECEEF2] dark:bg-[#1C1C1F] hover:bg-[#E5E8EC] dark:hover:bg-[#232327] hover:border-zinc-300 dark:hover:border-[#3F3F46] text-xs text-zinc-600 dark:text-[#A1A1AA] hover:text-zinc-950 dark:hover:text-[#F5F5F5] transition-all cursor-pointer group shadow-2xs"
          >
            <div className="flex items-center gap-2.5 truncate">
              <Search className="h-3.5 w-3.5 text-zinc-400 dark:text-[#71717A] group-hover:text-zinc-700 dark:group-hover:text-[#F5F5F5] transition-colors shrink-0" />
              <span className="truncate">Search leads, clients, projects, payments...</span>
            </div>
            <kbd className="inline-flex items-center gap-0.5 text-[10px] font-mono font-medium bg-zinc-200/90 dark:bg-[#232327] border border-zinc-300/80 dark:border-[#2C2C31] px-1.5 py-0.5 rounded text-zinc-700 dark:text-[#71717A] shrink-0">
              ⌘K
            </kbd>
          </button>
        </div>

        {/* Right: Quick Action Dock */}
        <div className="flex items-center gap-2 shrink-0">
          {/* AI Shortcut */}
          <Link
            href="/ai-studio"
            className="hidden md:inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-zinc-200/90 dark:border-[#2C2C31] bg-[#F4F5F7] dark:bg-[#1C1C1F] hover:bg-[#ECEEF2] dark:hover:bg-[#232327] hover:border-zinc-300 dark:hover:border-[#3F3F46] text-xs font-medium text-zinc-600 dark:text-[#A1A1AA] hover:text-zinc-900 dark:hover:text-[#F5F5F5] transition-all duration-150 shadow-2xs group"
            title="Google AI Assistant & SOW Generator"
          >
            <Sparkles className="h-3.5 w-3.5 text-zinc-400 dark:text-[#8B8B94] group-hover:text-amber-500 dark:group-hover:text-[#F5F5F5] transition-colors" />
            <span>AI Studio</span>
          </Link>

          {/* Theme Toggle Button */}
          <ThemeToggle />

          {/* Agency Security Logout / Lock Button */}
          {authenticatedUser && (
            <div className="flex items-center gap-1.5">
              <span className="text-[11px] font-medium text-zinc-500 dark:text-zinc-400 px-2 py-1 rounded-md bg-zinc-100 dark:bg-zinc-800/80 border border-zinc-200/80 dark:border-zinc-700/60 hidden lg:inline-block">
                Master Admin
              </span>
              <button
                type="button"
                onClick={logout}
                className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg border border-rose-200/80 dark:border-rose-900/40 bg-rose-50/70 dark:bg-rose-950/20 hover:bg-rose-100 dark:hover:bg-rose-900/40 text-xs font-semibold text-rose-700 dark:text-rose-300 transition-all cursor-pointer shadow-2xs group"
              >
                <LogOut className="h-3.5 w-3.5 text-rose-500 dark:text-rose-400 group-hover:translate-x-0.5 transition-transform" />
                <span>Logout</span>
              </button>
            </div>
          )}

          {/* Notifications Popover */}
          <div className="relative">
            <button
              onClick={() => setShowNotifications(!showNotifications)}
              className="p-2 rounded-lg text-zinc-500 dark:text-[#8B8B94] hover:text-zinc-900 dark:hover:text-[#F5F5F5] hover:bg-zinc-100 dark:hover:bg-[#1C1C1F] transition-all relative cursor-pointer border border-transparent hover:border-zinc-200 dark:hover:border-[#2C2C31]"
              title="Live Activity Feed"
            >
              <Bell className="h-4 w-4" />
              {activityLogs.length > 0 && (
                <span className="absolute top-1.5 right-1.5 h-2 w-2 rounded-full bg-indigo-500 dark:bg-[#F5F5F5] ring-2 ring-white dark:ring-[#111112]" />
              )}
            </button>

            {showNotifications && (
              <>
                <div className="fixed inset-0 z-40" onClick={() => setShowNotifications(false)} />
                <div className="absolute right-0 mt-2 w-80 rounded-2xl border border-zinc-200 dark:border-[#2C2C31] bg-white dark:bg-[#1C1C1F] shadow-2xl p-4 z-50 animate-fade-in text-xs">
                  <div className="flex items-center justify-between pb-3 border-b border-zinc-100 dark:border-[#2C2C31]">
                    <span className="font-semibold text-zinc-900 dark:text-[#F5F5F5]">Live Activity Feed</span>
                    <span className="text-[10px] text-zinc-400 dark:text-[#71717A] font-mono">Qdelta HQ</span>
                  </div>
                  <div className="divide-y divide-zinc-100 dark:divide-[#2C2C31] max-h-64 overflow-y-auto mt-2">
                    {activityLogs.slice(0, 5).map((log) => (
                      <div key={log.id} className="py-2.5">
                        <p className="font-medium text-zinc-800 dark:text-[#F5F5F5]">{log.title}</p>
                        <p className="text-zinc-500 dark:text-[#A1A1AA] text-[11px] mt-0.5 line-clamp-2">{log.description}</p>
                        <span className="text-[10px] text-zinc-400 dark:text-[#71717A] font-mono mt-1 block">
                          {log.timestamp === 'Just now' ? 'Just now' : new Date(log.timestamp || log.createdAt || Date.now()).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              </>
            )}
          </div>

          {/* Primary CTA: New Lead */}
          <Link
            href="/leads"
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-zinc-900 hover:bg-zinc-800 text-white dark:bg-white dark:hover:bg-zinc-200 dark:text-zinc-950 text-xs font-semibold shadow-xs transition-all duration-150 cursor-pointer group"
          >
            <Plus className="h-3.5 w-3.5 stroke-[2.5]" />
            <span className="hidden sm:inline">New Lead</span>
            <span className="sm:hidden">New</span>
          </Link>
        </div>
      </header>

      {/* Global Command Palette */}
      <CommandPalette isOpen={isSearchOpen} onClose={() => setIsSearchOpen(false)} />
    </>
  );
}
