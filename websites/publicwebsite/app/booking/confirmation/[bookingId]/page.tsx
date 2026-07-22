"use client";

import { useEffect, useState } from "react";
import { useParams, useSearchParams } from "next/navigation";
import Link from "next/link";

import BookingConfirmation, {
  type BookingConfirmationData,
} from "@/components/booking/BookingConfirmation";
import ErrorMessage from "@/components/common/ErrorMessage";
import LoadingSpinner from "@/components/common/LoadingSpinner";
import Container from "@/components/layout/Container";

interface ApiResponse<T> {
  success: boolean;
  message: string;
  data: T;
  errors?: Record<string, string[] | string>;
}

function firstError(errors?: Record<string, string[] | string>): string {
  if (!errors) {
    return "";
  }

  const value = Object.values(errors)[0];
  return Array.isArray(value) ? value[0] || "" : value || "";
}

export default function BookingConfirmationPage() {
  const params = useParams<{ bookingId: string }>();
  const searchParams = useSearchParams();
  const bookingId = params.bookingId;
  const guestPhone = searchParams.get("phone") || "";

  const [booking, setBooking] =
    useState<BookingConfirmationData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState("");

  useEffect(() => {
    let cancelled = false;

    async function loadBooking() {
      setIsLoading(true);
      setErrorMessage("");

      try {
        if (guestPhone) {
          const response = await fetch("/api/bookings/lookup", {
            method: "POST",
            cache: "no-store",
            headers: {
              Accept: "application/json",
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              booking_id: bookingId,
              guest_phone: guestPhone,
            }),
          });

          const result =
            (await response.json()) as ApiResponse<BookingConfirmationData>;

          if (!response.ok || !result.success) {
            throw new Error(
              firstError(result.errors) ||
                result.message ||
                "Unable to load booking confirmation.",
            );
          }

          if (!cancelled) {
            setBooking(result.data);
          }

          return;
        }

        const stored = sessionStorage.getItem(
          `booking-confirmation:${bookingId}`,
        );

        if (stored) {
          if (!cancelled) {
            setBooking(JSON.parse(stored) as BookingConfirmationData);
          }

          return;
        }

        throw new Error(
          "Enter your booking ID and registered phone number to view this booking.",
        );
      } catch (error) {
        if (!cancelled) {
          console.error("Unable to load booking confirmation:", error);
          setErrorMessage(
            error instanceof Error
              ? error.message
              : "Unable to load booking confirmation.",
          );
        }
      } finally {
        if (!cancelled) {
          setIsLoading(false);
        }
      }
    }

    void loadBooking();

    return () => {
      cancelled = true;
    };
  }, [bookingId, guestPhone]);

  if (isLoading) {
    return (
      <Container className="py-16">
        <LoadingSpinner
          size="lg"
          label="Loading booking confirmation..."
          fullScreen
        />
      </Container>
    );
  }

  if (!booking) {
    return (
      <Container className="py-16">
        <ErrorMessage
          title="Booking confirmation unavailable"
          message={errorMessage}
          details={
            <Link
              href="/manage-booking"
              className="font-semibold underline"
            >
              Look up booking
            </Link>
          }
        />
      </Container>
    );
  }

  return (
    <Container className="py-12 sm:py-16">
      <BookingConfirmation booking={booking} />
    </Container>
  );
}
