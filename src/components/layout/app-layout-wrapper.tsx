'use client';

import React from 'react';
import { usePathname } from 'next/navigation';
import { Sidebar } from '@/components/layout/sidebar';
import { Topbar } from '@/components/layout/topbar';
import { AgencyAuthProvider, useAgencyAuth } from '@/components/auth/agency-auth-guard';

function LayoutContent({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isPayRoute = pathname === '/pay' || pathname?.startsWith('/pay/');

  if (isPayRoute) {
    return (
      <div className="min-h-screen w-full bg-[#FAFBFD] dark:bg-[#0D0D0E] text-zinc-900 dark:text-zinc-100 flex flex-col justify-center">
        <main className="w-full flex-1 flex items-center justify-center p-3 sm:p-6">
          {children}
        </main>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-[#ECEEF2] dark:bg-[#111112] transition-colors duration-200">
      <Sidebar />
      <div className="flex-1 flex flex-col min-w-0 bg-[#ECEEF2] dark:bg-[#111112] transition-colors duration-200">
        <Topbar />
        <main className="flex-1 p-3 sm:p-4 md:p-5 w-full min-w-0">
          {children}
        </main>
      </div>
    </div>
  );
}

export function AppLayoutWrapper({ children }: { children: React.ReactNode }) {
  return (
    <AgencyAuthProvider>
      <LayoutContent>{children}</LayoutContent>
    </AgencyAuthProvider>
  );
}
