import React, { Suspense } from 'react';
import './globals.css';
import { Sidebar } from '@/components/Sidebar';
import { Topbar } from '@/components/Topbar';

export const metadata = {
  title: 'ANVĪKṢA : Supervisory SOC Intelligence Command Centre',
  description: 'Air-gapped supervisory analytics and behavioural threat detection platform for Security Operations Centres.',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="bg-slate-50 text-slate-900 antialiased selection:bg-blue-600 selection:text-white flex min-h-screen overflow-x-hidden">
        <Suspense fallback={<div className="w-64 bg-white border-r border-slate-200" />}>
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
      </body>
    </html>
  );
}
