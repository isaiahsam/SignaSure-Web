'use client';

import { ReactNode } from 'react';
import { Header } from '@/components/layout';
import { Sidebar, MobileNav } from '@/components/layout';
import { AuthGuard } from '@/components/auth';

export default function DashboardLayout({ children }: { children: ReactNode }) {
  return (
    <AuthGuard>
      <div className="min-h-screen bg-gray-50 dark:bg-slate-900">
        <Header />
        <Sidebar />
        <main className="pb-20 lg:ml-64 lg:pb-8">
          <div className="mx-auto max-w-5xl px-4 py-6 sm:px-6 lg:px-8">
            {children}
          </div>
        </main>
        <MobileNav />
      </div>
    </AuthGuard>
  );
}
