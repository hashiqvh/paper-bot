'use client';

import { AdminDashboard } from '@/app/dashboard/admin/AdminDashboard';
import { ClientDashboard } from '@/app/dashboard/client/ClientDashboard';
import { Header } from '@/components/Header';
import { Sidebar } from '@/components/Sidebar';
import { useAuth } from '@/contexts/AuthContext';


import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

function DashboardRouter() {
  const { user } = useAuth();

  switch (user?.role) {
    case 'admin':
      return <AdminDashboard />;

    case 'client':
      return <ClientDashboard />;
    default:
      return <AdminDashboard />;
  }
}

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { isAuthenticated } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!isAuthenticated) {
      router.push('/login');
    }
  }, [isAuthenticated, router]);

  if (!isAuthenticated) {
    return null;
  }

  return (
    <div className="flex h-screen overflow-hidden">
      <Sidebar />
      <div className="flex-1 flex flex-col overflow-hidden">
        <Header />
        <main className="flex-1 overflow-y-auto bg-slate-50 p-6">
          <DashboardRouter />
        </main>
      </div>
    </div>
  );
}

