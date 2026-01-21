'use client';

import { AuthGuard } from '@/components/auth/auth-guard';
import { Header } from '@/components/layout/header';
import { Sidebar } from '@/components/layout/sidebar';

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <AuthGuard>
      <div className="min-h-screen bg-slate-50 dark:bg-slate-900">
        <Header />
        <Sidebar />
        <main className="lg:pl-64 pb-16 lg:pb-0">
          <div className="p-4 md:p-6 lg:p-8">{children}</div>
        </main>
      </div>
    </AuthGuard>
  );
}
