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
      <main className="h-screen w-full bg-slate-50 text-slate-900 flex flex-col justify-center items-center p-3 sm:p-4 md:p-6 overflow-hidden selection:bg-slate-900 selection:text-white">
        {children}
      </main>
    );
  }

  return (
    <div className="flex min-h-screen w-full overflow-x-hidden bg-slate-50">
      <Suspense fallback={<div className="w-60 bg-white border-r border-slate-200" />}>
        <Sidebar />
      </Suspense>

      <div className="flex-1 flex flex-col min-w-0 h-screen overflow-y-auto bg-slate-50">
        <Topbar />
        <main className="p-6 md:p-8 flex-1 max-w-7xl w-full mx-auto">
          <Suspense fallback={<div className="p-8 font-mono text-xs text-slate-500">Loading telemetry...</div>}>
            {children}
          </Suspense>
        </main>
      </div>
    </div>
  );
}
