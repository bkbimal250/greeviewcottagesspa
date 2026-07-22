"use client";

import type { ReactNode } from "react";
import { useEffect } from "react";
import { useRouter } from "next/navigation";

import AdminFooter from "@/components/layout/AdminFooter";
import AdminHeader from "@/components/layout/AdminHeader";
import AdminSidebar from "@/components/layout/AdminSidebar";
import LoadingSpinner from "@/components/common/LoadingSpinner";
import useAuth from "@/hooks/useAuth";
import {
  canAccessAdminPanel,
  clearAuthSession,
} from "@/lib/auth";

interface DashboardLayoutProps {
  children: ReactNode;
}

export default function DashboardLayout({
  children,
}: DashboardLayoutProps) {
  const router = useRouter();
  const { user, isLoading, logout } = useAuth();
  const canAccess = canAccessAdminPanel(user);

  useEffect(() => {
    if (isLoading) {
      return;
    }

    if (!canAccess) {
      clearAuthSession();
      router.replace("/login");
    }
  }, [canAccess, isLoading, router]);

  if (isLoading || !canAccess || !user) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-[var(--background)]">
        <LoadingSpinner label="Checking access..." />
      </main>
    );
  }

  const adminUser = {
    name: user.full_name,
    email: user.email,
    role: user.role,
  };

  return (
    <div className="min-h-screen bg-[var(--background)]">
      <div className="lg:flex">
        <AdminSidebar
          brandName="Green View Cottages"
          brandSubtitle="Admin Panel"
          onLogout={logout}
          className="hidden lg:flex"
        />

        <div className="min-w-0 flex-1">
          <AdminHeader
            user={adminUser}
            brandName="Green View Cottages"
            brandSubtitle="Admin Panel"
            onLogout={logout}
          />

          <main className="px-4 py-6 sm:px-6 lg:px-8">
            {children}
          </main>

          <AdminFooter />
        </div>
      </div>
    </div>
  );
}
