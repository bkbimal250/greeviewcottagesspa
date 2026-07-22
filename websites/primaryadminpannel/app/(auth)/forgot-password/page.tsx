"use client";

import Link from "next/link";
import {
  useState,
  type FormEvent,
} from "react";
import {
  FaArrowLeft,
  FaEnvelope,
  FaPaperPlane,
} from "react-icons/fa";

import Button from "@/components/common/Button";
import Input from "@/components/common/Input";

interface ForgotPasswordErrors {
  email?: string;
  general?: string;
}

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [errors, setErrors] =
    useState<ForgotPasswordErrors>({});
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  function validateEmail(): boolean {
    const trimmedEmail = email.trim();

    if (!trimmedEmail) {
      setErrors({
        email: "Email address is required.",
      });

      return false;
    }

    if (
      !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(
        trimmedEmail,
      )
    ) {
      setErrors({
        email:
          "Please enter a valid email address.",
      });

      return false;
    }

    setErrors({});
    return true;
  }

  async function handleSubmit(
    event: FormEvent<HTMLFormElement>,
  ) {
    event.preventDefault();

    if (!validateEmail()) {
      return;
    }

    setLoading(true);
    setErrors({});

    try {
      /*
       * Replace this temporary request with your
       * forgot-password API.
       *
       * Example:
       *
       * const response = await fetch(
       *   "/api/auth/forgot-password",
       *   {
       *     method: "POST",
       *     headers: {
       *       "Content-Type": "application/json",
       *     },
       *     body: JSON.stringify({
       *       email: email.trim(),
       *     }),
       *   },
       * );
       *
       * const result = await response.json();
       *
       * if (!response.ok) {
       *   throw new Error(
       *     result.message ||
       *       "Unable to send reset instructions.",
       *   );
       * }
       */

      await new Promise((resolve) =>
        window.setTimeout(resolve, 800),
      );

      setSubmitted(true);
    } catch (error) {
      setErrors({
        general:
          error instanceof Error
            ? error.message
            : "Unable to send reset instructions. Please try again.",
      });
    } finally {
      setLoading(false);
    }
  }

  if (submitted) {
    return (
      <section className="rounded-[var(--radius-xl)] border border-[var(--border)] bg-white p-6 text-center shadow-sm sm:p-8">
        <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-[var(--primary-light)] text-2xl text-[var(--primary)]">
          <FaPaperPlane aria-hidden="true" />
        </div>

        <h1 className="mt-6 text-2xl font-bold text-[var(--foreground)]">
          Check your email
        </h1>

        <p className="mt-3 text-sm leading-6 text-[var(--muted)]">
          Password reset instructions have been sent to{" "}
          <span className="font-semibold text-[var(--foreground)]">
            {email.trim()}
          </span>
          .
        </p>

        <p className="mt-2 text-sm leading-6 text-[var(--muted)]">
          Please check your inbox and spam folder. The
          reset link may expire after a limited time.
        </p>

        <div className="mt-7 space-y-3">
          <Button
            href="/login"
            fullWidth
            leftIcon={
              <FaArrowLeft aria-hidden="true" />
            }
          >
            Back to Sign In
          </Button>

          <button
            type="button"
            onClick={() => setSubmitted(false)}
            className={[
              "rounded-md text-sm font-semibold",
              "text-[var(--primary)]",
              "hover:underline",
              "focus-visible:outline-none",
              "focus-visible:ring-2",
              "focus-visible:ring-[var(--primary)]",
              "focus-visible:ring-offset-2",
            ].join(" ")}
          >
            Use a different email address
          </button>
        </div>
      </section>
    );
  }

  return (
    <section className="rounded-[var(--radius-xl)] border border-[var(--border)] bg-white p-6 shadow-sm sm:p-8">
      <div>
        <p className="text-sm font-semibold text-[var(--primary)]">
          Password recovery
        </p>

        <h1 className="mt-2 text-3xl font-bold tracking-tight text-[var(--foreground)]">
          Forgot your password?
        </h1>

        <p className="mt-3 text-sm leading-6 text-[var(--muted)]">
          Enter your administrator email address and
          we will send you instructions to reset your
          password.
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
          id="forgot-password-email"
          name="email"
          type="email"
          label="Email address"
          placeholder="admin@example.com"
          autoComplete="email"
          value={email}
          error={errors.email}
          leftIcon={
            <FaEnvelope aria-hidden="true" />
          }
          disabled={loading}
          required
          onChange={(event) => {
            setEmail(event.target.value);

            if (errors.email || errors.general) {
              setErrors({});
            }
          }}
        />

        <Button
          type="submit"
          fullWidth
          loading={loading}
          loadingText="Sending instructions..."
          leftIcon={
            <FaPaperPlane aria-hidden="true" />
          }
        >
          Send Reset Instructions
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