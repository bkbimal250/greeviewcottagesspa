import type { Metadata } from "next";
import { FaPhoneAlt, FaWhatsapp } from "react-icons/fa";

import Button from "@/components/common/Button";
import ContactActions from "@/components/common/ContactActions";
import Container from "@/components/layout/Container";
import PropertyCoverHero from "@/components/layout/PropertyCoverHero";

export const metadata: Metadata = {
  title: "Online Booking Temporarily Paused",
  description:
    "Online cottage booking is temporarily paused. Please contact Green View Cottages by phone or WhatsApp for availability and booking assistance.",
};

export default function BookingPausedPage() {
  return (
    <PropertyCoverHero className="py-16 sm:py-20">
      <Container>
        <div className="mx-auto max-w-3xl rounded-lg border border-[var(--border)] bg-white p-6 text-center shadow-[var(--shadow-sm)] sm:p-10">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-[var(--primary-light)] text-2xl text-[var(--primary)]">
            <FaWhatsapp aria-hidden="true" />
          </div>

          <p className="mt-6 text-sm font-semibold uppercase tracking-[0.16em] text-[var(--primary)]">
            Direct assistance
          </p>

          <h1 className="mt-3 font-[var(--font-playfair)] text-4xl font-bold leading-tight text-[var(--foreground)] sm:text-5xl">
            Online booking is temporarily paused
          </h1>

          <p className="mx-auto mt-4 max-w-2xl text-sm leading-7 text-[var(--muted)] sm:text-base">
            Razorpay registration is currently in progress. Please call or
            message Green View Cottages on WhatsApp to check availability,
            confirm pricing and complete your cottage enquiry.
          </p>

          <ContactActions
            layout="stack"
            whatsappLabel="WhatsApp for Availability"
            callLabel="Call Property"
            className="mx-auto mt-8 max-w-sm"
          />

          <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:justify-center">
            <Button href="/cottages" variant="secondary">
              View Cottages
            </Button>

            <Button
              href="/contact"
              variant="light"
              leftIcon={<FaPhoneAlt aria-hidden="true" />}
            >
              Contact Details
            </Button>
          </div>
        </div>
      </Container>
    </PropertyCoverHero>
  );
}
