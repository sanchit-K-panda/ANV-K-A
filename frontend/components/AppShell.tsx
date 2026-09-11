'use client';

import React, { Suspense } from 'react';
import { usePathname } from 'next/navigation';
import { Sidebar } from '@/components/Sidebar';
import { Topbar } from '@/components/Topbar';

export function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isLoginPage = pathname === '/login';

  if (isLoginPage) {
    return (
      <main className="h-screen w-full bg-soc-bg text-soc-text flex flex-col overflow-hidden">
        {children}
      </main>
    );
  }

  // Unified enterprise console shell: docked sidebar, hairline headers, no floating islands
  return (
    <div className="flex h-screen w-full overflow-hidden bg-soc-bg text-soc-text">
      <Suspense fallback={<div className="w-64 border-r border-soc-border bg-soc-panel" />}>
        <Sidebar />
      </Suspense>

      <div className="flex-1 flex flex-col min-w-0 h-full overflow-hidden">
        <Topbar />

        <main className="flex-1 min-h-0 overflow-y-auto bg-soc-bg">
          <div className="p-4 md:p-6 w-full max-w-[1600px] mx-auto">
            <Suspense fallback={<div className="p-6 text-xs font-mono text-soc-textMuted">INITIALIZING_TELEMETRY...</div>}>
              {children}
            </Suspense>
          </div>
        </main>
      </div>
    </div>
  );
}
