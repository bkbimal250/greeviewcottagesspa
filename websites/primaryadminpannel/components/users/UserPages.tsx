"use client";

import { useEffect, useState } from "react";

import Button from "@/components/common/Button";
import { getApiErrorMessage } from "@/lib/api";
import authService from "@/services/auth.service";
import type { User } from "@/types/auth";

function PageHeader({ title, description }: { title: string; description: string }) {
  return (
    <div>
      <p className="text-sm font-semibold text-[var(--primary)]">Green View Cottages</p>
      <h1 className="mt-1 text-2xl font-bold text-[var(--foreground)]">{title}</h1>
      <p className="mt-2 max-w-3xl text-sm leading-6 text-[var(--muted)]">{description}</p>
    </div>
  );
}

function Notice({ kind = "info", children }: { kind?: "info" | "error"; children: React.ReactNode }) {
  const classes = {
    info: "border-blue-200 bg-blue-50 text-blue-800",
    error: "border-red-200 bg-red-50 text-red-700",
  };
  return <div className={`rounded-lg border px-4 py-3 text-sm ${classes[kind]}`}>{children}</div>;
}

export function UsersPageClient() {
  const [user, setUser] = useState<User | null>(null);
  const [error, setError] = useState("");

  useEffect(() => {
    authService.getProfile().then(setUser).catch((caught) => setError(getApiErrorMessage(caught)));
  }, []);

  return (
    <section className="space-y-5">
      <PageHeader title="Users" description="Admin user management is not exposed by the current Django API." />
      {error ? <Notice kind="error">{error}</Notice> : null}
      <Notice>
        The backend currently exposes only the signed-in profile at `/auth/profile/`. Add staff user list/create/update endpoints before enabling user management.
      </Notice>
      {user ? (
        <div className="rounded-lg border border-[var(--border)] bg-white p-5">
          <p className="text-sm font-semibold text-[var(--muted)]">Current signed-in admin</p>
          <p className="mt-2 text-lg font-bold">{user.full_name || user.email}</p>
          <p className="text-sm text-[var(--muted)]">{user.email} - {user.role.replaceAll("_", " ")}</p>
          <div className="mt-4">
            <Button href="/profile" variant="secondary">View profile</Button>
          </div>
        </div>
      ) : null}
    </section>
  );
}

export function UserUnavailablePageClient({ title }: { title: string }) {
  return (
    <section className="space-y-5">
      <PageHeader title={title} description="This action needs backend staff user-management endpoints first." />
      <Notice>
        No backend endpoint exists yet for creating, editing or viewing other admin users. Use Django admin for staff accounts until API support is added.
      </Notice>
    </section>
  );
}
