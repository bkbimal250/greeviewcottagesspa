"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  useState,
  type FormEvent,
} from "react";
import {
  FaEnvelope,
  FaLock,
  FaSignInAlt,
} from "react-icons/fa";

import Button from "@/components/common/Button";
import Checkbox from "@/components/common/Checkbox";
import Input from "@/components/common/Input";
import { getApiErrorMessage } from "@/lib/api";
import {
  canAccessAdminPanel,
  clearAuthSession,
  getLoginRedirectUrl,
  saveAuthSession,
} from "@/lib/auth";
import authService from "@/services/auth.service";

interface LoginFormData {
  email: string;
  password: string;
  rememberMe: boolean;
}

interface LoginErrors {
  email?: string;
  password?: string;
  general?: string;
}

export default function LoginPage() {
  const router = useRouter();

  const [formData, setFormData] =
    useState<LoginFormData>({
      email: "",
      password: "",
      rememberMe: false,
    });

  const [errors, setErrors] =
    useState<LoginErrors>({});

  const [loading, setLoading] = useState(false);

  function validateForm(): boolean {
    const nextErrors: LoginErrors = {};

    if (!formData.email.trim()) {
      nextErrors.email = "Email address is required.";
    } else if (
      !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(
        formData.email.trim(),
      )
    ) {
      nextErrors.email =
        "Please enter a valid email address.";
    }

    if (!formData.password) {
      nextErrors.password = "Password is required.";
    } else if (formData.password.length < 6) {
      nextErrors.password =
        "Password must contain at least 6 characters.";
    }

    setErrors(nextErrors);

    return Object.keys(nextErrors).length === 0;
  }

  async function handleSubmit(
    event: FormEvent<HTMLFormElement>,
  ) {
    event.preventDefault();

    if (!validateForm()) {
      return;
    }

    setLoading(true);
    setErrors({});

    try {
      const authResponse = await authService.login({
        identifier: formData.email.trim(),
        password: formData.password,
      });

      if (!canAccessAdminPanel(authResponse.user)) {
        clearAuthSession();
        setErrors({
          general:
            "Only super admin and admin accounts can access the admin panel.",
        });
        return;
      }

      saveAuthSession(
        authResponse,
        formData.rememberMe,
      );

      router.push(getLoginRedirectUrl("/dashboard"));
      router.refresh();
    } catch (error) {
      setErrors({
        general: getApiErrorMessage(
          error,
          "Unable to login. Please try again.",
        ),
      });
    } finally {
      setLoading(false);
    }
  }

  return (
    <section className="rounded-[var(--radius-xl)] border border-[var(--border)] bg-white p-6 shadow-sm sm:p-8">
      <div>
        <p className="text-sm font-semibold text-[var(--primary)]">
          Welcome back
        </p>

        <h1 className="mt-2 text-3xl font-bold tracking-tight text-[var(--foreground)]">
          Sign in to your account
        </h1>

        <p className="mt-3 text-sm leading-6 text-[var(--muted)]">
          Enter your administrator credentials to access
          the dashboard.
        </p>
      </div>

      {errors.general ? (
        <div
          role="alert"
          className="mt-6 rounded-xl border border-red-200 bg-[var(--danger-light)] px-4 py-3 text-sm text-red-800"
        >
          {errors.general}
        </div>
      ) : null}

      <form
        onSubmit={handleSubmit}
        className="mt-7 space-y-5"
        noValidate
      >
        <Input
          id="email"
          name="email"
          type="email"
          label="Email address"
          placeholder="admin@example.com"
          autoComplete="email"
          value={formData.email}
          error={errors.email}
          leftIcon={<FaEnvelope aria-hidden="true" />}
          disabled={loading}
          required
          onChange={(event) => {
            setFormData((current) => ({
              ...current,
              email: event.target.value,
            }));

            if (errors.email || errors.general) {
              setErrors((current) => ({
                ...current,
                email: undefined,
                general: undefined,
              }));
            }
          }}
        />

        <Input
          id="password"
          name="password"
          type="password"
          label="Password"
          placeholder="Enter your password"
          autoComplete="current-password"
          value={formData.password}
          error={errors.password}
          leftIcon={<FaLock aria-hidden="true" />}
          disabled={loading}
          required
          onChange={(event) => {
            setFormData((current) => ({
              ...current,
              password: event.target.value,
            }));

            if (
              errors.password ||
              errors.general
            ) {
              setErrors((current) => ({
                ...current,
                password: undefined,
                general: undefined,
              }));
            }
          }}
        />

        <div className="flex flex-wrap items-center justify-between gap-3">
          <Checkbox
            id="remember-me"
            label="Remember me"
            checked={formData.rememberMe}
            disabled={loading}
            onChange={(event) =>
              setFormData((current) => ({
                ...current,
                rememberMe: event.target.checked,
              }))
            }
          />

          <Link
            href="/forgot-password"
            className={[
              "rounded-md text-sm font-semibold",
              "text-[var(--primary)]",
              "transition-colors hover:underline",
              "focus-visible:outline-none",
              "focus-visible:ring-2",
              "focus-visible:ring-[var(--primary)]",
              "focus-visible:ring-offset-2",
            ].join(" ")}
          >
            Forgot password?
          </Link>
        </div>

        <Button
          type="submit"
          fullWidth
          loading={loading}
          loadingText="Signing in..."
          leftIcon={<FaSignInAlt aria-hidden="true" />}
        >
          Sign In
        </Button>
      </form>

      <p className="mt-6 text-center text-xs leading-5 text-[var(--muted)]">
        This area is restricted to authorized
        administrators only.
      </p>
    </section>
  );
}
