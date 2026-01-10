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
      <div className="bg-gray-50 min-h-screen">
        <Sidebar />
        <main className="lg:pl-64 min-h-screen transition-all duration-300">
          <div className="p-6 lg:p-8 pt-16 lg:pt-8">
            {children}
          </div>
        </main>
      </div>
    </AuthProvider>
  );
}
