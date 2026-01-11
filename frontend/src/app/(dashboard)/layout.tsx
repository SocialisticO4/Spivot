"use client";

import { Sidebar } from "@/components/layout/Sidebar";
import { AuthProvider } from "@/components/auth/AuthProvider";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <AuthProvider>
      <div className="min-h-screen" style={{ background: 'var(--bg-page)' }}>
        <Sidebar />
        <main className="main-content pt-14 lg:pt-0">
          {children}
        </main>
      </div>
    </AuthProvider>
  );
}
