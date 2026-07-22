"use client";

import { useEffect } from "react";
import { FaExclamationTriangle, FaHome, FaRedoAlt } from "react-icons/fa";

import Button from "@/components/common/Button";
import Container from "@/components/layout/Container";

interface GlobalErrorProps {
  error: Error & {
    digest?: string;
  };
  reset: () => void;
}

export default function ErrorPage({
  error,
  reset,
}: GlobalErrorProps) {
  useEffect(() => {
    console.error("Public website error:", error);
  }, [error]);

  return (
    <Container className="py-16">
      <section
        role="alert"
        aria-live="assertive"
        className={[
          "mx-auto max-w-2xl rounded-[var(--radius-xl)]",
          "border border-red-200 bg-red-50 px-6 py-10",
          "text-center shadow-[var(--shadow-sm)]",
        ].join(" ")}
      >
        <div
          aria-hidden="true"
          className={[
            "mx-auto flex h-16 w-16 items-center justify-center",
            "rounded-full bg-red-100 text-2xl text-red-700",
          ].join(" ")}
        >
          <FaExclamationTriangle />
        </div>

        <h1 className="mt-5 text-2xl font-bold text-red-900 sm:text-3xl">
          Something went wrong
        </h1>

        <p className="mx-auto mt-3 max-w-lg text-sm leading-6 text-red-800 sm:text-base">
          We could not load this page right now. Please try again, or return
          to the homepage.
        </p>

        {error.digest ? (
          <p className="mt-3 text-xs text-red-700">
            Reference ID: {error.digest}
          </p>
        ) : null}

        <div className="mt-7 flex flex-col justify-center gap-3 sm:flex-row">
          <Button
            type="button"
            variant="danger"
            leftIcon={<FaRedoAlt aria-hidden="true" />}
            onClick={reset}
          >
            Try Again
          </Button>

          <Button
            href="/"
            variant="secondary"
            leftIcon={<FaHome aria-hidden="true" />}
          >
            Go to Homepage
          </Button>
        </div>
      </section>
    </Container>
  );
}