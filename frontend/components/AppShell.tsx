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

  // Floating-panel shell: sidebar and topbar are inset rounded surfaces
  // over the paper canvas — not edge-glued chrome.
  return (
    <div className="flex h-screen w-full gap-3 p-3 overflow-hidden bg-soc-bg">
      <Suspense fallback={<div className="w-60 rounded-2xl bg-soc-panel border border-soc-border" />}>
        <Sidebar />
      </Suspense>

      <div className="flex-1 flex flex-col gap-3 min-w-0">
        <Topbar />

        <main className="flex-1 min-h-0 overflow-y-auto rounded-2xl border border-soc-border bg-soc-panel/40 shadow-card">
          <div className="p-5 md:p-7 w-full max-w-console mx-auto">
            <Suspense fallback={<div className="p-8 text-sm text-soc-textMuted">Loading telemetry...</div>}>
              {children}
            </Suspense>
          </div>
        </main>
      </div>
    </div>
  );
}
