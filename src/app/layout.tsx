import type { Metadata } from 'next';
import './globals.css';
import { CRMProvider } from '@/lib/store';
import { ToastProvider } from '@/components/ui/toast';
import { ThemeProvider } from '@/components/theme-provider';
import { AppLayoutWrapper } from '@/components/layout/app-layout-wrapper';

export const metadata: Metadata = {
  title: 'Qdelta OS — Agency Operations Platform',
  description: 'Internal operations, pipeline, client & cash flow platform for Qdelta Digital Studio',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html: `
              (function() {
                try {
                  var storageKey = 'qdelta-crm-theme';
                  var saved = localStorage.getItem(storageKey);
                  var systemDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
                  var theme = saved || 'dark';
                  var isDark = theme === 'dark' || (theme === 'system' && systemDark);
                  var root = document.documentElement;
                  if (isDark) {
                    root.classList.add('dark');
                    root.classList.remove('light');
                  } else {
                    root.classList.remove('dark');
                    root.classList.add('light');
                  }

                  var sidebarCollapsed = localStorage.getItem('qdelta_crm_sidebar_collapsed_v1');
                  if (sidebarCollapsed === 'true') {
                    root.classList.add('sidebar-collapsed');
                  } else {
                    root.classList.remove('sidebar-collapsed');
                  }
                } catch (e) {}
              })();
            `,
          }}
        />
      </head>
      <body className="bg-[#ECEEF2] dark:bg-[#111112] text-zinc-900 dark:text-[#F5F5F5] min-h-screen antialiased selection:bg-indigo-500/20 dark:selection:bg-[#8B7CFF]/30 transition-colors duration-200">
        <ThemeProvider defaultTheme="dark" storageKey="qdelta-crm-theme">
          <CRMProvider>
            <ToastProvider>
              <AppLayoutWrapper>{children}</AppLayoutWrapper>
            </ToastProvider>
          </CRMProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}

