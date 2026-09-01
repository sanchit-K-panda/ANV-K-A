import React from 'react';
import './globals.css';
import { AppShell } from '@/components/AppShell';

export const metadata = {
  title: 'ANVĪKṢA : Supervisory SOC Intelligence Command Centre',
  description: 'Air-gapped supervisory analytics and behavioural threat detection platform for Security Operations Centres.',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="bg-slate-50 text-slate-900 antialiased selection:bg-blue-600 selection:text-white flex min-h-screen overflow-x-hidden">
        <AppShell>{children}</AppShell>
      </body>
    </html>
  );
}
