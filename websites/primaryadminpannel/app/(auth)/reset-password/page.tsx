"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import {
  useState,
  type FormEvent,
} from "react";
import {
  FaArrowLeft,
  FaCheckCircle,
  FaKey,
  FaLock,
} from "react-icons/fa";

import Button from "@/components/common/Button";
import Input from "@/components/common/Input";

interface ResetPasswordFormData {
  password: string;
  confirmPassword: string;
}

interface ResetPasswordErrors {
  password?: string;
  confirmPassword?: string;
  general?: string;
}

export default function ResetPasswordPage() {
  const searchParams = useSearchParams();
  const token = searchParams.get("token");

  const [formData, setFormData] =
    useState<ResetPasswordFormData>({
      password: "",
      confirmPassword: "",
    });

  const [errors, setErrors] =
    useState<ResetPasswordErrors>({});

  const [loading, setLoading] = useState(false);
  const [completed, setCompleted] = useState(false);

  function validateForm(): boolean {
    const nextErrors: ResetPasswordErrors = {};

    if (!formData.password) {
      nextErrors.password =
        "New password is required.";
    } else if (formData.password.length < 8) {
      nextErrors.password =
        "Password must contain at least 8 characters.";
    } else if (
      !/[A-Z]/.test(formData.password) ||
      !/[a-z]/.test(formData.password) ||
      !/[0-9]/.test(formData.password)
    ) {
      nextErrors.password =
        "Use uppercase, lowercase and at least one number.";
    }

    if (!formData.confirmPassword) {
      nextErrors.confirmPassword =
        "Please confirm your new password.";
    } else if (
      formData.password !==
      formData.confirmPassword
    ) {
      nextErrors.confirmPassword =
        "Passwords do not match.";
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

    if (!token) {
      setErrors({
        general:
          "The password reset link is invalid or incomplete.",
      });

      return;
    }

    setLoading(true);
    setErrors({});

    try {
      /*
       * Replace this temporary request with your
       * reset-password API.
       *
       * Example:
       *
       * const response = await fetch(
       *   "/api/auth/reset-password",
       *   {
       *     method: "POST",
       *     headers: {
       *       "Content-Type": "application/json",
       *     },
       *     body: JSON.stringify({
       *       token,
       *       password: formData.password,
       *       confirmPassword:
       *         formData.confirmPassword,
       *     }),
       *   },
       * );
       *
       * const result = await response.json();
       *
       * if (!response.ok) {
       *   throw new Error(
       *     result.message ||
       *       "Unable to reset password.",
       *   );
       * }
       */

      await new Promise((resolve) =>
        window.setTimeout(resolve, 800),
      );

      setCompleted(true);
    } catch (error) {
      setErrors({
        general:
          error instanceof Error
            ? error.message
            : "Unable to reset your password. Please try again.",
      });
    } finally {
      setLoading(false);
    }
  }

  if (completed) {
    return (
      <section className="rounded-[var(--radius-xl)] border border-[var(--border)] bg-white p-6 text-center shadow-sm sm:p-8">
        <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-green-100 text-2xl text-green-600">
          <FaCheckCircle aria-hidden="true" />
        </div>

        <h1 className="mt-6 text-2xl font-bold text-[var(--foreground)]">
          Password reset successful
        </h1>

        <p className="mt-3 text-sm leading-6 text-[var(--muted)]">
          Your password has been updated. You can now
          sign in using your new password.
        </p>

        <div className="mt-7">
          <Button
            href="/login"
            fullWidth
            leftIcon={
              <FaArrowLeft aria-hidden="true" />
            }
          >
            Continue to Sign In
          </Button>
        </div>
      </section>
    );
  }

  return (
    <section className="rounded-[var(--radius-xl)] border border-[var(--border)] bg-white p-6 shadow-sm sm:p-8">
      <div>
        <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-[var(--primary-light)] text-xl text-[var(--primary)]">
          <FaKey aria-hidden="true" />
        </div>

        <p className="mt-5 text-sm font-semibold text-[var(--primary)]">
          Create a new password
        </p>

        <h1 className="mt-2 text-3xl font-bold tracking-tight text-[var(--foreground)]">
          Reset your password
        </h1>

        <p className="mt-3 text-sm leading-6 text-[var(--muted)]">
          Choose a strong password that you have not
          used before.
        </p>
      </div>

      {!token ? (
        <div
          role="alert"
          className="mt-6 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm leading-6 text-amber-800"
        >
          This reset link does not contain a valid token.
          Please request a new password reset link.
        </div>
      ) : null}

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
          id="new-password"
          name="password"
          type="password"
          label="New password"
          placeholder="Enter your new password"
          autoComplete="new-password"
          value={formData.password}
          error={errors.password}
          helperText="Use at least 8 characters with uppercase, lowercase and a number."
          leftIcon={<FaLock aria-hidden="true" />}
          disabled={loading || !token}
          required
          onChange={(event) => {
            setFormData((current) => ({
              ...current,
              password: event.target.value,
            }));

            if (errors.password || errors.general) {
              setErrors((current) => ({
                ...current,
                password: undefined,
                general: undefined,
              }));
            }
          }}
        />

        <Input
          id="confirm-password"
          name="confirmPassword"
          type="password"
          label="Confirm new password"
          placeholder="Re-enter your new password"
          autoComplete="new-password"
          value={formData.confirmPassword}
          error={errors.confirmPassword}
          leftIcon={<FaLock aria-hidden="true" />}
          disabled={loading || !token}
          required
          onChange={(event) => {
            setFormData((current) => ({
              ...current,
              confirmPassword:
                event.target.value,
            }));

            if (
              errors.confirmPassword ||
              errors.general
            ) {
              setErrors((current) => ({
                ...current,
                confirmPassword: undefined,
                general: undefined,
              }));
            }
          }}
        />

        <Button
          type="submit"
          fullWidth
          loading={loading}
          loadingText="Resetting password..."
          disabled={!token}
          leftIcon={<FaKey aria-hidden="true" />}
        >
          Reset Password
        </Button>
      </form>

      <div className="mt-6 text-center">
        <Link
          href="/login"
          className={[
            "inline-flex items-center gap-2 rounded-md",
            "text-sm font-semibold",
            "text-[var(--primary)]",
            "transition-colors hover:underline",
            "focus-visible:outline-none",
            "focus-visible:ring-2",
            "focus-visible:ring-[var(--primary)]",
            "focus-visible:ring-offset-2",
          ].join(" ")}
        >
          <FaArrowLeft aria-hidden="true" />
          Back to Sign In
        </Link>
      </div>
    </section>
  );
}