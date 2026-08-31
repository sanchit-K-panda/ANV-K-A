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
    <html lang="en" className="dark">
      <body className="bg-soc-base text-soc-textPrimary antialiased selection:bg-soc-accent selection:text-white flex min-h-screen overflow-x-hidden">
        <Suspense fallback={<div className="w-64 bg-soc-panel border-r border-soc-border" />}>
          <Sidebar />
        </Suspense>
        
        <div className="flex-1 flex flex-col min-w-0 h-screen overflow-y-auto">
          <Topbar />
          <main className="p-6 flex-1 bg-soc-base">
            <Suspense fallback={<div className="p-8 font-mono text-xs text-soc-textSecondary">Loading telemetry...</div>}>
              {children}
            </Suspense>
          </main>
        </div>
      </body>
    </html>
  );
}
