import {
  FaArrowLeft,
  FaHome,
  FaSearch,
} from "react-icons/fa";

import Button from "@/components/common/Button";
import Container from "@/components/layout/Container";

export default function CottageNotFound() {
  return (
    <Container className="py-16 sm:py-24">
      <section className="mx-auto max-w-2xl text-center">
        <div
          aria-hidden="true"
          className={[
            "mx-auto flex h-20 w-20 items-center justify-center",
            "rounded-full bg-[var(--primary-light)]",
            "text-3xl text-[var(--primary)]",
          ].join(" ")}
        >
          <FaSearch />
        </div>

        <p className="mt-6 text-sm font-semibold uppercase tracking-[0.2em] text-[var(--primary)]">
          Cottage unavailable
        </p>

        <h1 className="mt-3 font-[var(--font-playfair)] text-4xl font-bold text-[var(--foreground)] sm:text-5xl">
          Cottage not found
        </h1>

        <p className="mx-auto mt-4 max-w-lg text-sm leading-7 text-[var(--muted)] sm:text-base">
          This cottage may be inactive, removed or the page address may be
          incorrect. You can return to the cottage list and choose another
          available option.
        </p>

        <div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row">
          <Button
            href="/cottages"
            leftIcon={<FaArrowLeft aria-hidden="true" />}
          >
            View All Cottages
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