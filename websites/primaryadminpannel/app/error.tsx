"use client";

import { useEffect } from "react";
import { FaExclamationTriangle, FaRedoAlt } from "react-icons/fa";

import Button from "@/components/common/Button";

interface ErrorPageProps {
  error: Error & {
    digest?: string;
  };
  reset: () => void;
}

export default function ErrorPage({
  error,
  reset,
}: ErrorPageProps) {
  useEffect(() => {
    console.error("Application error:", error);
  }, [error]);

  return (
    <main className="flex min-h-screen items-center justify-center bg-[var(--background)] px-4 py-10">
      <section className="w-full max-w-lg rounded-[var(--radius-xl)] border border-[var(--border)] bg-white p-6 text-center shadow-sm sm:p-10">
        <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-[var(--danger-light)] text-2xl text-[var(--danger)]">
          <FaExclamationTriangle aria-hidden="true" />
        </div>

        <h1 className="mt-6 text-2xl font-bold text-[var(--foreground)]">
          Something went wrong
        </h1>

        <p className="mt-3 text-sm leading-6 text-[var(--muted)]">
          An unexpected error occurred while loading this page.
          Please try again.
        </p>

        {error.digest ? (
          <p className="mt-3 text-xs text-gray-400">
            Error reference: {error.digest}
          </p>
        ) : null}

        <div className="mt-7 flex justify-center">
          <Button
            type="button"
            leftIcon={<FaRedoAlt aria-hidden="true" />}
            onClick={reset}
          >
            Try Again
          </Button>
        </div>
      </section>
    </main>
  );
}