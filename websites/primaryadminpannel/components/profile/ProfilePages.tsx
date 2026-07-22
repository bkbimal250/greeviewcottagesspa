"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState, type FormEvent } from "react";
import { FaSave } from "react-icons/fa";

import Button from "@/components/common/Button";
import Input from "@/components/common/Input";
import { getApiErrorMessage } from "@/lib/api";
import { updateStoredUser } from "@/lib/auth";
import authService from "@/services/auth.service";
import type { User } from "@/types/auth";

type LoadState = "loading" | "ready" | "error";

function PageHeader({ title, description, action }: { title: string; description: string; action?: React.ReactNode }) {
  return (
    <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
      <div>
        <p className="text-sm font-semibold text-[var(--primary)]">Green View Cottages</p>
        <h1 className="mt-1 text-2xl font-bold text-[var(--foreground)]">{title}</h1>
        <p className="mt-2 max-w-3xl text-sm leading-6 text-[var(--muted)]">{description}</p>
      </div>
      {action ? <div className="shrink-0">{action}</div> : null}
    </div>
  );
}

function Notice({ kind = "info", children }: { kind?: "info" | "error" | "success"; children: React.ReactNode }) {
  const classes = {
    info: "border-blue-200 bg-blue-50 text-blue-800",
    error: "border-red-200 bg-red-50 text-red-700",
    success: "border-green-200 bg-green-50 text-green-800",
  };
  return <div className={`rounded-lg border px-4 py-3 text-sm ${classes[kind]}`}>{children}</div>;
}

function formatDate(value?: string | null) {
  return value ? new Intl.DateTimeFormat("en-IN", { dateStyle: "medium", timeStyle: "short" }).format(new Date(value)) : "-";
}

function useProfile() {
  const [user, setUser] = useState<User | null>(null);
  const [state, setState] = useState<LoadState>("loading");
  const [error, setError] = useState("");

  function load() {
    setState("loading");
    setError("");
    authService
      .getProfile()
      .then((profile) => {
        setUser(profile);
        updateStoredUser(profile);
        setState("ready");
      })
      .catch((caught) => {
        setError(getApiErrorMessage(caught));
        setState("error");
      });
  }

  useEffect(() => {
    const timeoutId = window.setTimeout(load, 0);
    return () => window.clearTimeout(timeoutId);
  }, []);

  return { user, state, error, setError, load };
}

export function ProfilePageClient() {
  const { user, state, error } = useProfile();

  return (
    <section className="space-y-5">
      <PageHeader
        title="My Profile"
        description="View the currently signed-in Green View Cottages admin profile."
        action={<Button href="/profile/edit">Edit profile</Button>}
      />
      {state === "loading" ? <Notice>Loading profile...</Notice> : null}
      {state === "error" ? <Notice kind="error">{error}</Notice> : null}
      {user ? (
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {[
            ["Name", user.full_name || "-"],
            ["Email", user.email],
            ["Phone", user.phone || "-"],
            ["Role", user.role.replaceAll("_", " ")],
            ["Staff", user.is_staff ? "Yes" : "No"],
            ["Active", user.is_active ? "Yes" : "No"],
            ["Last login", formatDate(user.last_login)],
            ["Created", formatDate(user.created_at)],
            ["Updated", formatDate(user.updated_at)],
          ].map(([label, value]) => (
            <div key={label} className="rounded-lg border border-[var(--border)] bg-white p-4">
              <p className="text-xs font-semibold uppercase text-[var(--muted)]">{label}</p>
              <p className="mt-2 font-semibold text-[var(--foreground)]">{value}</p>
            </div>
          ))}
        </div>
      ) : null}
    </section>
  );
}

export function ProfileEditPageClient() {
  const router = useRouter();
  const { user, state, error, setError } = useProfile();
  const [saving, setSaving] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const data = new FormData(event.currentTarget);
    setSaving(true);
    setError("");
    try {
      const updated = await authService.updateProfile({
        full_name: String(data.get("full_name") || "").trim(),
        phone: String(data.get("phone") || "").trim(),
      });
      updateStoredUser(updated);
      router.push("/profile");
    } catch (caught) {
      setError(getApiErrorMessage(caught));
    } finally {
      setSaving(false);
    }
  }

  return (
    <section className="space-y-5">
      <PageHeader title="Edit Profile" description="Update backend-supported profile fields." />
      {state === "loading" ? <Notice>Loading profile...</Notice> : null}
      {state === "error" ? <Notice kind="error">{error}</Notice> : null}
      {user ? (
        <form onSubmit={handleSubmit} className="space-y-5 rounded-lg border border-[var(--border)] bg-white p-5">
          {error ? <Notice kind="error">{error}</Notice> : null}
          <div className="grid gap-4 md:grid-cols-2">
            <Input name="full_name" label="Full name" defaultValue={user.full_name || ""} />
            <Input name="phone" label="Phone" defaultValue={user.phone || ""} />
            <Input label="Email" value={user.email} disabled onChange={() => undefined} />
            <Input label="Role" value={user.role.replaceAll("_", " ")} disabled onChange={() => undefined} />
          </div>
          <Button type="submit" loading={saving} leftIcon={<FaSave />}>Save profile</Button>
        </form>
      ) : null}
    </section>
  );
}

export function ChangePasswordPageClient() {
  return (
    <section className="space-y-5">
      <PageHeader title="Change Password" description="Password change is not exposed by the current Django API." />
      <Notice>
        The backend currently supports login, token refresh, logout and profile update. Add a password-change endpoint before enabling this screen.
      </Notice>
    </section>
  );
}
