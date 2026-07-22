import { FaArrowLeft, FaSearch } from "react-icons/fa";

import Button from "@/components/common/Button";

export default function NotFoundPage() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-[var(--background)] px-4 py-10">
      <section className="w-full max-w-lg rounded-[var(--radius-xl)] border border-[var(--border)] bg-white p-6 text-center shadow-sm sm:p-10">
        <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-[var(--primary-light)] text-2xl text-[var(--primary)]">
          <FaSearch aria-hidden="true" />
        </div>

        <p className="mt-6 text-sm font-bold uppercase tracking-widest text-[var(--primary)]">
          Error 404
        </p>

        <h1 className="mt-2 text-3xl font-bold text-[var(--foreground)]">
          Page not found
        </h1>

        <p className="mt-3 text-sm leading-6 text-[var(--muted)]">
          The page you are looking for may have been removed,
          renamed or is temporarily unavailable.
        </p>

        <div className="mt-7 flex justify-center">
          <Button
            href="/admin"
            leftIcon={<FaArrowLeft aria-hidden="true" />}
          >
            Back to Dashboard
          </Button>
        </div>
      </section>
    </main>
  );
}