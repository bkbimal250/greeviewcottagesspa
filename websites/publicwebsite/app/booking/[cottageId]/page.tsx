"use client";

import Link from "next/link";
import {
  FormEvent,
  useEffect,
  useMemo,
  useState,
} from "react";
import { useParams, useRouter, useSearchParams } from "next/navigation";
import {
  FaArrowLeft,
  FaBed,
  FaCalendarAlt,
  FaCheckCircle,
  FaCreditCard,
  FaExclamationTriangle,
  FaHome,
  FaLock,
  FaMinus,
  FaMoneyBillWave,
  FaPlus,
  FaUsers,
} from "react-icons/fa";
import { toast } from "react-toastify";

import Button from "@/components/common/Button";
import ErrorMessage from "@/components/common/ErrorMessage";
import Input from "@/components/common/Input";
import LoadingSpinner from "@/components/common/LoadingSpinner";
import Price from "@/components/common/Price";
import Select from "@/components/common/Select";
import Textarea from "@/components/common/Textarea";
import Container from "@/components/layout/Container";
import type {
  RazorpayCheckoutOptions,
  RazorpayCheckoutResponse,
  RazorpayFailureResponse,
} from "@/types/payment";

interface Cottage {
  id: string;
  name: string;
  slug: string;
  cottage_code: string;
  room_type: string;
  bed_type: string;
  maximum_guests: number;
  maximum_adults?: number;
  maximum_children?: number;
  base_price: string;
  saturday_price: string;
  sunday_price: string;
  thumbnail?: string | null;
  status: string;
}

interface CottageAvailability {
  cottage: Cottage;
  pricing: {
    number_of_nights?: number;
    total_nights?: number;
    room_amount?: string;
    price_per_night?: string | number;
    subtotal: string;
    tax_percentage: string;
    tax_amount?: string;
    tax?: string | number;
    discount_amount: string;
    grand_total?: string;
    total_amount?: string | number;
    weekday_nights?: number;
    saturday_nights?: number;
    sunday_nights?: number;
  };
}

interface BookingResponseData {
  booking_id: string;
  booking_status: string;
  payment_status: string;
  guest_name?: string;
  cottage_name?: string;
  check_in_date?: string;
  check_out_date?: string;
  number_of_nights?: number;
  adults?: number;
  children?: number;
  grand_total?: string;
  amount_paid?: string;
  balance_amount?: string;
  property_name?: string;
  property_phone?: string;
}

interface RazorpayOrderData {
  id: string;
  booking_id: string;
  amount: string;
  currency: string;
  razorpay_order_id: string;
  razorpay_key_id: string;
}

interface ApiResponse<T> {
  success: boolean;
  message: string;
  data: T;
  errors?: Record<string, string[] | string>;
}

interface BookingFormValues {
  guest_name: string;
  guest_phone: string;
  guest_email: string;
  guest_address: string;
  guest_city: string;
  guest_state: string;
  guest_country: string;
  guest_pincode: string;
  expected_arrival_time: string;
  payment_method: string;
  special_request: string;
  whatsapp_opt_in: boolean;
  email_opt_in: boolean;
  sms_opt_in: boolean;
  preferred_notification_channel: string;
}

type FieldErrors = Partial<Record<keyof BookingFormValues, string>>;
type BookingFormStep = "guest" | "payment";

const apiBaseUrl =
  process.env.NEXT_PUBLIC_API_BASE_URL ||
  "https://api.backend.greencottagesandspa.in/api/v1";

const initialFormValues: BookingFormValues = {
  guest_name: "",
  guest_phone: "",
  guest_email: "",
  guest_address: "",
  guest_city: "",
  guest_state: "Rajasthan",
  guest_country: "India",
  guest_pincode: "",
  expected_arrival_time: "",
  payment_method: "online_gateway",
  special_request: "",
  whatsapp_opt_in: true,
  email_opt_in: false,
  sms_opt_in: true,
  preferred_notification_channel: "all",
};

let razorpayScriptPromise: Promise<void> | null = null;

function getBackendOrigin(): string {
  return apiBaseUrl.replace(/\/api\/v1\/?$/, "");
}

function getImageUrl(image?: string | null): string {
  if (!image) {
    return "/images/cottage-placeholder.jpg";
  }

  if (
    image.startsWith("http://") ||
    image.startsWith("https://")
  ) {
    return image;
  }

  if (image.startsWith("/media/")) {
    return `${getBackendOrigin()}${image}`;
  }

  if (image.startsWith("/")) {
    return image;
  }

  return `${getBackendOrigin()}/${image.replace(/^\/+/, "")}`;
}

function isValidDate(value: string | null): value is string {
  if (!value || !/^\d{4}-\d{2}-\d{2}$/.test(value)) {
    return false;
  }

  return !Number.isNaN(
    new Date(`${value}T00:00:00`).getTime(),
  );
}

function formatDate(value: string): string {
  return new Intl.DateTimeFormat("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
  }).format(new Date(`${value}T00:00:00`));
}

function getPricingValue(
  availability: CottageAvailability | null,
  key: keyof NonNullable<CottageAvailability["pricing"]>,
): string | number | undefined {
  return availability?.pricing[key];
}

function toAmount(value: string | number | undefined): string {
  if (value === undefined || value === null || value === "") {
    return "0";
  }

  return String(value);
}

function getNumberValue(value: string | number | undefined): number {
  const numberValue =
    typeof value === "number" ? value : Number.parseFloat(String(value));

  return Number.isFinite(numberValue) ? numberValue : 0;
}

function parseGuestCount(
  value: string | null,
  fallback: number,
  min: number,
): number {
  const parsedValue = Number.parseInt(value || "", 10);

  if (!Number.isFinite(parsedValue)) {
    return fallback;
  }

  return Math.max(min, parsedValue);
}

function clampCount(value: number, min: number, max: number): number {
  if (!Number.isFinite(value)) {
    return min;
  }

  return Math.min(max, Math.max(min, value));
}

function extractAvailableCottages(
  data: CottageAvailability[],
): CottageAvailability[] {
  return Array.isArray(data) ? data : [];
}

function firstError(
  errors?: Record<string, string[] | string>,
): string | undefined {
  if (!errors) {
    return undefined;
  }

  return Object.values(errors)
    .flatMap((messages) =>
      Array.isArray(messages) ? messages : [messages],
    )
    .find(Boolean);
}

async function fetchWithTimeout(
  input: RequestInfo | URL,
  init: RequestInit = {},
  timeoutMs = 15000,
): Promise<Response> {
  const controller = new AbortController();
  const timeoutError = new DOMException(
    "The server took too long to respond. Please try again.",
    "AbortError",
  );
  const timeoutId = window.setTimeout(
    () => controller.abort(timeoutError),
    timeoutMs,
  );

  try {
    return await fetch(input, {
      ...init,
      signal: controller.signal,
    });
  } catch (error) {
    if (
      controller.signal.aborted ||
      (error instanceof DOMException && error.name === "AbortError")
    ) {
      throw new Error(
        "The server took too long to respond. Please try again.",
      );
    }

    throw error;
  } finally {
    window.clearTimeout(timeoutId);
  }
}

async function postEnvelope<T>(
  path: string,
  payload: Record<string, unknown>,
  timeoutMs = 45000,
): Promise<T> {
  const response = await fetchWithTimeout(path, {
    method: "POST",
    cache: "no-store",
    headers: {
      Accept: "application/json",
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload),
  }, timeoutMs);

  const result = (await response.json()) as ApiResponse<T>;

  if (!response.ok || !result.success) {
    throw new Error(
      firstError(result.errors) ||
        result.message ||
        "Request could not be completed.",
    );
  }

  return result.data;
}

function loadRazorpayScript(): Promise<void> {
  if (typeof window === "undefined") {
    return Promise.reject(
      new Error("Online payment can only be started in the browser."),
    );
  }

  if (window.Razorpay) {
    return Promise.resolve();
  }

  if (razorpayScriptPromise) {
    return razorpayScriptPromise;
  }

  razorpayScriptPromise = new Promise((resolve, reject) => {
    const script = document.createElement("script");
    script.src = "https://checkout.razorpay.com/v1/checkout.js";
    script.async = true;
    script.onload = () => resolve();
    script.onerror = () =>
      reject(
        new Error(
          "Unable to load Razorpay checkout. Please try again.",
        ),
      );

    document.body.appendChild(script);
  });

  return razorpayScriptPromise;
}

function paiseFromRupees(amount: string | number): number {
  const parsedAmount =
    typeof amount === "number"
      ? amount
      : Number.parseFloat(String(amount));

  if (!Number.isFinite(parsedAmount)) {
    return 0;
  }

  return Math.round(parsedAmount * 100);
}

function openRazorpayCheckout(
  options: RazorpayCheckoutOptions,
): Promise<RazorpayCheckoutResponse> {
  return new Promise((resolve, reject) => {
    if (!window.Razorpay) {
      reject(new Error("Razorpay checkout is unavailable."));
      return;
    }

    const checkout = new window.Razorpay({
      ...options,
      handler: resolve,
      modal: {
        confirm_close: true,
        ondismiss: () =>
          reject(
            new Error(
              "Payment was cancelled. Your booking is saved, but payment is pending.",
            ),
          ),
      },
    });

    checkout.on("payment.failed", (response: RazorpayFailureResponse) => {
      reject(
        new Error(
          response.error.description ||
            "Payment failed. Please try again.",
        ),
      );
    });

    checkout.open();
  });
}

export default function BookingPage() {
  const router = useRouter();
  const routeParams = useParams<{ cottageId: string }>();
  const searchParams = useSearchParams();

  const cottageId = routeParams.cottageId;
  const checkIn = searchParams.get("check_in");
  const checkOut = searchParams.get("check_out");
  const adults = parseGuestCount(searchParams.get("adults"), 1, 1);
  const children = parseGuestCount(searchParams.get("children"), 0, 0);

  const datesAreValid =
    isValidDate(checkIn) &&
    isValidDate(checkOut) &&
    new Date(`${checkOut}T00:00:00`) >
      new Date(`${checkIn}T00:00:00`);

  const [cottage, setCottage] = useState<Cottage | null>(null);
  const [availability, setAvailability] =
    useState<CottageAvailability | null>(null);

  const [formValues, setFormValues] =
    useState<BookingFormValues>(initialFormValues);

  const [fieldErrors, setFieldErrors] =
    useState<FieldErrors>({});

  const [pageError, setPageError] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [bookingStep, setBookingStep] =
    useState<BookingFormStep>("guest");

  const searchQuery = useMemo(() => {
    if (!checkIn || !checkOut) {
      return "";
    }

    return new URLSearchParams({
      check_in: checkIn,
      check_out: checkOut,
      adults: String(adults),
      children: String(children),
    }).toString();
  }, [adults, checkIn, checkOut, children]);

  function updateBookingGuestCount(
    field: "adults" | "children",
    value: number,
  ) {
    if (!checkIn || !checkOut) {
      return;
    }

    const maximumGuests = cottage?.maximum_guests || 16;
    const maximumAdults = Math.max(
      1,
      Math.min(cottage?.maximum_adults || 8, maximumGuests),
    );
    const maximumChildren = Math.max(
      0,
      Math.min(cottage?.maximum_children || 8, maximumGuests - 1),
    );

    let nextAdults = adults;
    let nextChildren = children;

    if (field === "adults") {
      nextAdults = clampCount(
        value,
        1,
        Math.min(maximumAdults, maximumGuests - nextChildren),
      );
      nextChildren = clampCount(
        nextChildren,
        0,
        Math.min(maximumChildren, maximumGuests - nextAdults),
      );
    } else {
      nextChildren = clampCount(
        value,
        0,
        Math.min(maximumChildren, maximumGuests - nextAdults),
      );
    }

    const nextQuery = new URLSearchParams({
      check_in: checkIn,
      check_out: checkOut,
      adults: String(nextAdults),
      children: String(nextChildren),
    });

    router.replace(`/booking/${cottageId}?${nextQuery.toString()}`);
  }

  useEffect(() => {
    let cancelled = false;
    const selectedCheckIn = checkIn || "";
    const selectedCheckOut = checkOut || "";

    async function loadBookingInformation() {
      if (!datesAreValid || !selectedCheckIn || !selectedCheckOut) {
        if (!cancelled) {
          setIsLoading(false);
          setPageError(
            "Valid check-in and check-out dates are required before booking.",
          );
        }

        return;
      }

      setIsLoading(true);
      setPageError("");
      setCottage(null);
      setAvailability(null);

      try {
        const availabilityQuery = new URLSearchParams({
          check_in: selectedCheckIn,
          check_out: selectedCheckOut,
          adults: String(adults),
          children: String(children),
        });

        const availabilityResponse = await fetchWithTimeout(
          `/api/cottages/available?${availabilityQuery.toString()}`,
          {
            cache: "no-store",
            headers: {
              Accept: "application/json",
            },
          },
        );

        const availabilityResult =
          (await availabilityResponse.json()) as ApiResponse<
            CottageAvailability[]
          >;

        if (
          !availabilityResponse.ok ||
          !availabilityResult.success
        ) {
          throw new Error(
            availabilityResult.message ||
              "Unable to confirm cottage availability.",
          );
        }

        const availableCottages = extractAvailableCottages(
          availabilityResult.data,
        );

        const selectedAvailability = availableCottages.find(
          (item) => item.cottage.id === cottageId,
        );

        if (!selectedAvailability) {
          throw new Error(
            "This cottage is not available for the selected dates and guests. Please change the date or guest count.",
          );
        }

        if (!cancelled) {
          setCottage(selectedAvailability.cottage);
          setAvailability(selectedAvailability);
        }
      } catch (error) {
        if (!cancelled) {
          setPageError(
            error instanceof Error
              ? error.message
              : "Unable to prepare this booking.",
          );
        }
      } finally {
        if (!cancelled) {
          setIsLoading(false);
        }
      }
    }

    void loadBookingInformation();

    return () => {
      cancelled = true;
    };
  }, [
    cottageId,
    checkIn,
    checkOut,
    adults,
    children,
    datesAreValid,
  ]);

  function updateField<K extends keyof BookingFormValues>(
    field: K,
    value: BookingFormValues[K],
  ) {
    setFormValues((current) => ({
      ...current,
      [field]: value,
    }));

    setFieldErrors((current) => ({
      ...current,
      [field]: undefined,
    }));
  }

  function validateGuestStep(): boolean {
    const errors: FieldErrors = {};

    if (!formValues.guest_name.trim()) {
      errors.guest_name = "Guest name is required.";
    }

    const phone = formValues.guest_phone.replace(/\D/g, "");

    if (phone.length < 10 || phone.length > 15) {
      errors.guest_phone = "Enter a valid phone number.";
    }

    if (
      formValues.guest_email &&
      !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(
        formValues.guest_email,
      )
    ) {
      errors.guest_email = "Enter a valid email address.";
    }

    const pincode = formValues.guest_pincode.trim();
    if (pincode && !/^[A-Za-z0-9 -]{3,12}$/.test(pincode)) {
      errors.guest_pincode = "Enter a valid pincode.";
    }

    setFieldErrors(errors);

    return Object.keys(errors).length === 0;
  }

  function validateForm(): boolean {
    const isGuestStepValid = validateGuestStep();
    if (!isGuestStepValid) {
      setBookingStep("guest");
      return false;
    }

    const errors: FieldErrors = {};

    if (
      formValues.email_opt_in &&
      !formValues.guest_email.trim()
    ) {
      errors.guest_email =
        "Email is required when email notifications are enabled.";
    }

    if (
      formValues.preferred_notification_channel === "email" &&
      !formValues.guest_email.trim()
    ) {
      errors.preferred_notification_channel =
        "Enter an email before selecting email notifications.";
    }

    setFieldErrors(errors);
    return Object.keys(errors).length === 0;
  }

  async function handleSubmit(
    event: FormEvent<HTMLFormElement>,
  ) {
    event.preventDefault();

    if (
      isSubmitting ||
      !cottage ||
      !availability ||
      !checkIn ||
      !checkOut ||
      pageError
    ) {
      if (pageError) {
        toast.error(pageError);
      }

      return;
    }

    if (bookingStep === "guest") {
      if (!validateGuestStep()) {
        toast.error("Please complete guest details.");
        return;
      }

      setBookingStep("payment");
      window.scrollTo({ top: 0, behavior: "smooth" });
      return;
    }

    if (!validateForm()) {
      toast.error("Please correct the form details.");
      return;
    }

    setIsSubmitting(true);
    setPageError("");

    try {
      const payload: Record<string, unknown> = {
        cottage_id: cottage.id,
        guest_name: formValues.guest_name.trim(),
        guest_phone: formValues.guest_phone.trim(),
        guest_email:
          formValues.guest_email.trim() || undefined,
        guest_address:
          formValues.guest_address.trim() || undefined,
        guest_city:
          formValues.guest_city.trim() || undefined,
        guest_state:
          formValues.guest_state.trim() || undefined,
        guest_country:
          formValues.guest_country.trim() || undefined,
        guest_pincode:
          formValues.guest_pincode.trim() || undefined,
        check_in_date: checkIn,
        check_out_date: checkOut,
        adults,
        children,
        expected_arrival_time:
          formValues.expected_arrival_time || undefined,
        payment_method: formValues.payment_method,
        special_request:
          formValues.special_request.trim() || undefined,
        whatsapp_opt_in: formValues.whatsapp_opt_in,
        email_opt_in:
          Boolean(formValues.guest_email.trim()) &&
          formValues.email_opt_in,
        sms_opt_in: formValues.sms_opt_in,
        preferred_notification_channel:
          formValues.preferred_notification_channel,
      };

      let bookingData: BookingResponseData;

      try {
        bookingData = await postEnvelope<BookingResponseData>(
          "/api/bookings",
          payload,
        );
      } catch (error) {
        throw error;
      }

      const bookingId = bookingData.booking_id;

      if (!bookingId) {
        throw new Error(
          "Booking was created but no booking ID was returned.",
        );
      }

      sessionStorage.setItem(
        `booking-confirmation:${bookingId}`,
        JSON.stringify(bookingData),
      );

      if (formValues.payment_method === "online_gateway") {
        toast.info("Booking saved. Opening secure payment...");

        const order = await postEnvelope<RazorpayOrderData>(
          "/api/payments/razorpay/orders",
          {
            booking_id: bookingId,
            guest_phone: formValues.guest_phone.trim(),
            amount: bookingData.balance_amount || grandTotal,
          },
          45000,
        );

        if (!order.razorpay_key_id || !order.razorpay_order_id) {
          throw new Error(
            "Razorpay order was created without payment details. Please check Razorpay credentials.",
          );
        }

        await loadRazorpayScript();

        const payment = await openRazorpayCheckout({
          key: order.razorpay_key_id,
          amount: paiseFromRupees(order.amount),
          currency: order.currency || "INR",
          name: "Green View Cottages",
          description: `${cottage.name} booking ${bookingId}`,
          order_id: order.razorpay_order_id,
          prefill: {
            name: formValues.guest_name.trim(),
            email: formValues.guest_email.trim() || undefined,
            contact: formValues.guest_phone.trim(),
          },
          notes: {
            booking_id: bookingId,
            cottage: cottage.name,
          },
          theme: {
            color: "#2f7d4f",
          },
          config: {
            display: {
              blocks: {
                allowed_methods: {
                  name: "Payment Options",
                  instruments: [
                    { method: "upi" },
                    { method: "card" },
                    { method: "netbanking" },
                  ],
                },
              },
              sequence: ["block.allowed_methods"],
              preferences: {
                show_default_blocks: false,
              },
            },
          },
          handler: () => undefined,
          modal: {
            confirm_close: true,
            ondismiss: () => undefined,
          },
        });

        await postEnvelope(
          "/api/payments/razorpay/confirm",
          {
            booking_id: bookingId,
            guest_phone: formValues.guest_phone.trim(),
            razorpay_order_id: payment.razorpay_order_id,
            razorpay_payment_id: payment.razorpay_payment_id,
            razorpay_signature: payment.razorpay_signature,
          },
          45000,
        );

        toast.success("Payment verified. Your booking is confirmed.");
      } else {
        toast.success("Your cottage booking has been created.");
      }

      router.push(
        `/booking/confirmation/${encodeURIComponent(
          bookingId,
        )}?phone=${encodeURIComponent(formValues.guest_phone.trim())}`,
      );
    } catch (error) {
      const message =
        error instanceof Error
          ? error.message
          : "Unable to complete this booking.";

      setPageError(message);
      toast.error(message);
    } finally {
      setIsSubmitting(false);
    }
  }

  if (isLoading) {
    return (
      <Container className="py-16">
        <LoadingSpinner
          size="lg"
          label="Checking cottage availability..."
          fullScreen
        />
      </Container>
    );
  }

  if (pageError && !cottage) {
    const backToSearchHref = searchQuery
      ? `/search?${searchQuery}`
      : "/cottages";

    return (
      <Container className="py-16">
        <ErrorMessage
          title="Unable to continue booking"
          message={pageError}
          details={
            <div className="flex flex-wrap gap-3">
              <Link
                href={backToSearchHref}
                className="inline-flex min-h-10 items-center justify-center rounded-full bg-red-700 px-4 text-sm font-semibold text-white transition hover:bg-red-800"
              >
                Select another date
              </Link>

              <Link
                href="/cottages"
                className="inline-flex min-h-10 items-center justify-center rounded-full border border-red-300 px-4 text-sm font-semibold text-red-800 transition hover:bg-red-100"
              >
                View cottages
              </Link>
            </div>
          }
        />
      </Container>
    );
  }

  if (!datesAreValid || !checkIn || !checkOut) {
    return (
      <Container className="py-16">
        <ErrorMessage
          title="Stay dates are missing"
          message="Select valid check-in and check-out dates before starting a booking."
          details={
            <Link
              href="/cottages"
              className="font-semibold underline"
            >
              Choose a cottage and select dates
            </Link>
          }
        />
      </Container>
    );
  }

  if (!cottage || !availability) {
    return null;
  }

  const displayedNights =
    getNumberValue(getPricingValue(availability, "number_of_nights")) ||
    getNumberValue(getPricingValue(availability, "total_nights")) ||
    1;

  const roomAmount = toAmount(
    getPricingValue(availability, "room_amount") ||
      getPricingValue(availability, "subtotal"),
  );

  const taxAmount = toAmount(
    getPricingValue(availability, "tax_amount") ||
      getPricingValue(availability, "tax"),
  );

  const discountAmount = toAmount(
    getPricingValue(availability, "discount_amount"),
  );

  const grandTotal = toAmount(
    getPricingValue(availability, "grand_total") ||
      getPricingValue(availability, "total_amount"),
  );

  const weekdayNights = getNumberValue(
    getPricingValue(availability, "weekday_nights"),
  );
  const saturdayNights = getNumberValue(
    getPricingValue(availability, "saturday_nights"),
  );
  const sundayNights = getNumberValue(
    getPricingValue(availability, "sunday_nights"),
  );
  const guestSummary = `${adults} ${
    adults === 1 ? "adult" : "adults"
  }, ${children} ${children === 1 ? "child" : "children"}`;
  const maximumGuests = cottage.maximum_guests || 16;
  const maximumAdults = Math.max(
    1,
    Math.min(cottage.maximum_adults || 8, maximumGuests),
  );
  const maximumChildren = Math.max(
    0,
    Math.min(cottage.maximum_children || 8, maximumGuests - 1),
  );
  const maxAdultsForSelectedChildren = Math.max(
    1,
    Math.min(maximumAdults, maximumGuests - children),
  );
  const maxChildrenForSelectedAdults = Math.max(
    0,
    Math.min(maximumChildren, maximumGuests - adults),
  );

  return (
    <>
      <section className="border-b border-[var(--border)] bg-white py-5">
        <Container>
          <Link
            href={`/search?${searchQuery}`}
            className="inline-flex items-center gap-2 text-sm font-semibold text-[var(--primary)]"
          >
            <FaArrowLeft aria-hidden="true" />
            Back to Search Results
          </Link>
        </Container>
      </section>

      <section className="bg-[#1f2a22] py-10 text-white">
        <Container>
          <p className="text-sm font-semibold uppercase tracking-wider text-[var(--secondary)]">
            Guest booking
          </p>

          <h1 className="mt-2 font-[var(--font-playfair)] text-4xl font-bold">
            Complete your cottage booking
          </h1>

          <p className="mt-3 max-w-2xl text-white/75">
            Enter your contact details. You do not need to create an
            account.
          </p>
        </Container>
      </section>

      <section className="section">
        <Container>
          {pageError ? (
            <ErrorMessage
              title="Booking could not be completed"
              message={pageError}
              className="mb-7"
            />
          ) : null}

          <div className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_400px]">
            <form
              onSubmit={handleSubmit}
              noValidate
              className="card p-5 sm:p-7"
            >
              <div className="border-b border-[var(--border)] pb-5">
                <h2 className="text-2xl font-bold">
                  {bookingStep === "guest"
                    ? "Guest information"
                    : "Confirm and pay"}
                </h2>

                <p className="mt-2 text-sm text-[var(--muted)]">
                  {bookingStep === "guest"
                    ? "First add guest contact and address details."
                    : "Review notification preferences and complete the final payment step."}
                </p>

                <div className="mt-5 grid grid-cols-2 gap-3 text-sm">
                  {[
                    { key: "guest", label: "1. Guest details" },
                    { key: "payment", label: "2. Final payment" },
                  ].map((step) => (
                    <div
                      key={step.key}
                      className={[
                        "rounded-full border px-3 py-2 text-center font-semibold",
                        bookingStep === step.key
                          ? "border-[var(--primary)] bg-[var(--primary-light)] text-[var(--primary)]"
                          : "border-[var(--border)] bg-white text-[var(--muted)]",
                      ].join(" ")}
                    >
                      {step.label}
                    </div>
                  ))}
                </div>
              </div>

              <div className="mt-6 rounded-lg border border-[var(--border)] bg-[var(--surface-muted)] p-4">
                <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-start">
                  <div>
                    <h3 className="flex items-center gap-2 font-bold text-[var(--foreground)]">
                      <FaUsers
                        aria-hidden="true"
                        className="text-[var(--primary)]"
                      />
                      Guests
                    </h3>

                    <p className="mt-1 text-xs leading-5 text-[var(--muted)]">
                      Capacity is checked by the backend for this cottage.
                    </p>
                  </div>

                  <p className="text-sm font-semibold text-[var(--primary)]">
                    {guestSummary}
                  </p>
                </div>

                <div className="mt-4 grid gap-3 sm:grid-cols-2">
                  {[
                    {
                      label: "Adults",
                      value: adults,
                      min: 1,
                      max: maxAdultsForSelectedChildren,
                      onChange: (nextValue: number) =>
                        updateBookingGuestCount("adults", nextValue),
                    },
                    {
                      label: "Children",
                      value: children,
                      min: 0,
                      max: maxChildrenForSelectedAdults,
                      onChange: (nextValue: number) =>
                        updateBookingGuestCount("children", nextValue),
                    },
                  ].map((item) => (
                    <div
                      key={item.label}
                      className="flex items-center justify-between gap-3 rounded-lg border border-[var(--border)] bg-white p-4"
                    >
                      <div>
                        <p className="text-sm font-semibold text-[var(--foreground)]">
                          {item.label}
                        </p>

                        <p className="mt-0.5 text-xs text-[var(--muted)]">
                          Max {item.max}
                        </p>
                      </div>

                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          aria-label={`Decrease ${item.label.toLowerCase()}`}
                          disabled={item.value <= item.min}
                          onClick={() =>
                            item.onChange(
                              clampCount(
                                item.value - 1,
                                item.min,
                                item.max,
                              ),
                            )
                          }
                          className="flex h-9 w-9 items-center justify-center rounded-full border border-[var(--border)] text-[var(--primary)] transition hover:bg-[var(--primary-light)] disabled:pointer-events-none disabled:opacity-40"
                        >
                          <FaMinus aria-hidden="true" />
                        </button>

                        <span className="w-8 text-center text-base font-bold">
                          {item.value}
                        </span>

                        <button
                          type="button"
                          aria-label={`Increase ${item.label.toLowerCase()}`}
                          disabled={item.value >= item.max}
                          onClick={() =>
                            item.onChange(
                              clampCount(
                                item.value + 1,
                                item.min,
                                item.max,
                              ),
                            )
                          }
                          className="flex h-9 w-9 items-center justify-center rounded-full border border-[var(--border)] text-[var(--primary)] transition hover:bg-[var(--primary-light)] disabled:pointer-events-none disabled:opacity-40"
                        >
                          <FaPlus aria-hidden="true" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="mt-6 grid gap-5 sm:grid-cols-2">
                <Input
                  id="guest_name"
                  label="Guest name"
                  placeholder="Enter full name"
                  required
                  value={formValues.guest_name}
                  error={fieldErrors.guest_name}
                  onChange={(event) =>
                    updateField(
                      "guest_name",
                      event.target.value,
                    )
                  }
                  containerClassName="sm:col-span-2"
                />

                <Input
                  id="guest_phone"
                  label="Phone number"
                  type="tel"
                  inputMode="tel"
                  placeholder="+91 98765 43210"
                  required
                  value={formValues.guest_phone}
                  error={fieldErrors.guest_phone}
                  helperText="Use the same number later to check your booking."
                  onChange={(event) =>
                    updateField(
                      "guest_phone",
                      event.target.value,
                    )
                  }
                />

                <Input
                  id="guest_email"
                  label="Email address"
                  type="email"
                  placeholder="guest@example.com"
                  value={formValues.guest_email}
                  error={fieldErrors.guest_email}
                  helperText="Optional"
                  onChange={(event) => {
                    const email = event.target.value;

                    updateField("guest_email", email);

                    if (!email.trim()) {
                      updateField("email_opt_in", false);

                      if (
                        formValues.preferred_notification_channel ===
                        "email"
                      ) {
                        updateField(
                          "preferred_notification_channel",
                          "whatsapp",
                        );
                      }
                    } else {
                      updateField("email_opt_in", true);
                    }
                  }}
                />

                <Textarea
                  id="guest_address"
                  label="Guest address"
                  placeholder="House number, street, area"
                  value={formValues.guest_address}
                  error={fieldErrors.guest_address}
                  helperText="Optional, but helpful for invoice and guest records."
                  rows={3}
                  maxLength={500}
                  onChange={(event) =>
                    updateField(
                      "guest_address",
                      event.target.value,
                    )
                  }
                  containerClassName="sm:col-span-2"
                />

                <Input
                  id="guest_city"
                  label="City"
                  placeholder="City"
                  value={formValues.guest_city}
                  error={fieldErrors.guest_city}
                  onChange={(event) =>
                    updateField(
                      "guest_city",
                      event.target.value,
                    )
                  }
                />

                <Input
                  id="guest_state"
                  label="State"
                  placeholder="State"
                  value={formValues.guest_state}
                  error={fieldErrors.guest_state}
                  onChange={(event) =>
                    updateField(
                      "guest_state",
                      event.target.value,
                    )
                  }
                />

                <Input
                  id="guest_country"
                  label="Country"
                  placeholder="Country"
                  value={formValues.guest_country}
                  error={fieldErrors.guest_country}
                  onChange={(event) =>
                    updateField(
                      "guest_country",
                      event.target.value,
                    )
                  }
                />

                <Input
                  id="guest_pincode"
                  label="Pincode"
                  placeholder="307501"
                  inputMode="text"
                  value={formValues.guest_pincode}
                  error={fieldErrors.guest_pincode}
                  onChange={(event) =>
                    updateField(
                      "guest_pincode",
                      event.target.value,
                    )
                  }
                />

                <Input
                  id="expected_arrival_time"
                  label="Expected arrival time"
                  type="time"
                  value={formValues.expected_arrival_time}
                  onChange={(event) =>
                    updateField(
                      "expected_arrival_time",
                      event.target.value,
                    )
                  }
                />

                <Select
                  id="payment_method"
                  label="Payment method"
                  containerClassName={bookingStep === "payment" ? "" : "hidden"}
                  value={formValues.payment_method}
                  options={[
                    {
                      label: "Book online with Razorpay",
                      value: "online_gateway",
                    },
                    {
                      label: "Pay at property",
                      value: "pay_at_property",
                    },
                  ]}
                  onChange={(event) =>
                    updateField(
                      "payment_method",
                      event.target.value,
                    )
                  }
                />

                <div
                  className={[
                    bookingStep === "payment" ? "" : "hidden",
                    "rounded-lg border p-4 sm:col-span-2",
                    formValues.payment_method === "online_gateway"
                      ? "border-[var(--primary)]/30 bg-[var(--primary-light)]"
                      : "border-[var(--border)] bg-[var(--surface-muted)]",
                  ].join(" ")}
                >
                  <div className="flex items-start gap-3">
                    <div
                      aria-hidden="true"
                      className="mt-0.5 flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-white text-[var(--primary)]"
                    >
                      {formValues.payment_method === "online_gateway" ? (
                        <FaCreditCard />
                      ) : (
                        <FaMoneyBillWave />
                      )}
                    </div>

                    <div>
                      <h3 className="font-bold text-[var(--foreground)]">
                        {formValues.payment_method === "online_gateway"
                          ? "Secure online payment"
                          : "Reserve now, pay later"}
                      </h3>

                      <p className="mt-1 text-sm leading-6 text-[var(--muted)]">
                        {formValues.payment_method === "online_gateway"
                          ? "Your booking is saved first, then Razorpay opens with UPI, QR, card and other enabled payment options. Payment is marked paid only after backend verification."
                          : "Your booking will be saved with payment pending. The property team can collect payment directly."}
                      </p>
                    </div>
                  </div>
                </div>

                <Textarea
                  id="special_request"
                  label="Special request"
                  placeholder="Share arrival information or other requests."
                  value={formValues.special_request}
                  maxLength={500}
                  showCharacterCount
                  onChange={(event) =>
                    updateField(
                      "special_request",
                      event.target.value,
                    )
                  }
                  containerClassName="sm:col-span-2"
                />
              </div>

              <div
                className={[
                  "mt-8 border-t border-[var(--border)] pt-6",
                  bookingStep === "payment" ? "" : "hidden",
                ].join(" ")}
              >
                <h2 className="text-lg font-bold">
                  Booking notifications
                </h2>

                <div className="mt-4 grid gap-4">
                  <label className="flex cursor-pointer items-start gap-3">
                    <input
                      type="checkbox"
                      checked={formValues.whatsapp_opt_in}
                      onChange={(event) =>
                        updateField(
                          "whatsapp_opt_in",
                          event.target.checked,
                        )
                      }
                      className="mt-1 h-4 w-4 accent-[var(--primary)]"
                    />

                    <span>
                      <span className="block text-sm font-semibold">
                        WhatsApp confirmation
                      </span>

                      <span className="text-xs text-[var(--muted)]">
                        Receive booking details and booking ID on
                        WhatsApp.
                      </span>
                    </span>
                  </label>

                  <label className="flex cursor-pointer items-start gap-3">
                    <input
                      type="checkbox"
                      checked={formValues.email_opt_in}
                      disabled={!formValues.guest_email.trim()}
                      onChange={(event) =>
                        updateField(
                          "email_opt_in",
                          event.target.checked,
                        )
                      }
                      className="mt-1 h-4 w-4 accent-[var(--primary)]"
                    />

                    <span>
                      <span className="block text-sm font-semibold">
                        Email confirmation
                      </span>

                      <span className="text-xs text-[var(--muted)]">
                        Available after entering an email address.
                      </span>
                    </span>
                  </label>

                  <label className="flex cursor-pointer items-start gap-3">
                    <input
                      type="checkbox"
                      checked={formValues.sms_opt_in}
                      onChange={(event) =>
                        updateField(
                          "sms_opt_in",
                          event.target.checked,
                        )
                      }
                      className="mt-1 h-4 w-4 accent-[var(--primary)]"
                    />

                    <span>
                      <span className="block text-sm font-semibold">
                        SMS confirmation
                      </span>

                      <span className="text-xs text-[var(--muted)]">
                        Receive a short booking message by SMS.
                      </span>
                    </span>
                  </label>

                  <Select
                    id="preferred_notification_channel"
                    label="Preferred notification"
                    value={
                      formValues.preferred_notification_channel
                    }
                    error={
                      fieldErrors.preferred_notification_channel
                    }
                    options={[
                      {
                        label: "WhatsApp",
                        value: "whatsapp",
                        disabled:
                          !formValues.whatsapp_opt_in,
                      },
                      {
                        label: "Email",
                        value: "email",
                        disabled:
                          !formValues.email_opt_in ||
                          !formValues.guest_email.trim(),
                      },
                      {
                        label: "SMS",
                        value: "sms",
                        disabled: !formValues.sms_opt_in,
                      },
                      {
                        label: "All selected channels",
                        value: "all",
                      },
                    ]}
                    onChange={(event) =>
                      updateField(
                        "preferred_notification_channel",
                        event.target.value,
                      )
                    }
                  />
                </div>
              </div>

              <div className="mt-8 rounded-[var(--radius-md)] bg-[var(--surface-muted)] p-4">
                <div className="flex items-start gap-3">
                  <FaLock
                    aria-hidden="true"
                    className="mt-1 shrink-0 text-[var(--primary)]"
                  />

                  <p className="text-sm leading-6 text-[var(--muted)]">
                    Your final amount and availability are checked
                    again by the backend before the booking is
                    confirmed.
                  </p>
                </div>
              </div>

              <Button
                type="submit"
                size="lg"
                fullWidth
                loading={isSubmitting}
                loadingText={
                  bookingStep === "guest"
                    ? "Checking Details..."
                    : formValues.payment_method === "online_gateway"
                    ? "Starting Payment..."
                    : "Creating Booking..."
                }
                leftIcon={
                  formValues.payment_method === "online_gateway" ? (
                    <FaCreditCard aria-hidden="true" />
                  ) : (
                    <FaCheckCircle aria-hidden="true" />
                  )
                }
                className="mt-6"
                disabled={Boolean(pageError)}
              >
                {bookingStep === "guest"
                  ? "Continue to Final Step"
                  : formValues.payment_method === "online_gateway"
                    ? "Create Pending Booking & Pay"
                    : "Create Pending Booking"}
              </Button>

              {bookingStep === "payment" ? (
                <Button
                  type="button"
                  variant="ghost"
                  fullWidth
                  className="mt-3"
                  disabled={isSubmitting}
                  onClick={() => setBookingStep("guest")}
                >
                  Back to Guest Details
                </Button>
              ) : null}

              <p className="mt-4 text-center text-xs leading-5 text-[var(--muted)]">
                By confirming, you agree to the property booking and
                cancellation policies.
              </p>
            </form>

            <aside className="lg:sticky lg:top-24 lg:self-start">
              <div className="overflow-hidden rounded-lg border border-[var(--border)] bg-white shadow-[var(--shadow-md)]">
                <img
                  src={getImageUrl(cottage.thumbnail)}
                  alt={cottage.name}
                  className="aspect-[16/9] w-full object-cover"
                />

                <div className="p-6">
                  <p className="text-xs font-semibold uppercase tracking-wider text-[var(--primary)]">
                    {cottage.room_type}
                  </p>

                  <h2 className="mt-1 text-2xl font-bold">
                    {cottage.name}
                  </h2>

                  <div className="mt-4 grid gap-3 text-sm">
                    <div className="flex items-center gap-3">
                      <FaCalendarAlt
                        aria-hidden="true"
                        className="text-[var(--primary)]"
                      />

                      <span>
                        {formatDate(checkIn)} - {formatDate(checkOut)}
                      </span>
                    </div>

                    <div className="flex items-center gap-3">
                      <FaHome
                        aria-hidden="true"
                        className="text-[var(--primary)]"
                      />

                      <span>
                        {displayedNights}{" "}
                        {Number(displayedNights) === 1
                          ? "night"
                          : "nights"}
                      </span>
                    </div>

                    <div className="flex items-center gap-3">
                      <FaUsers
                        aria-hidden="true"
                        className="text-[var(--primary)]"
                      />

                      <span>{guestSummary}</span>
                    </div>

                    <div className="flex items-center gap-3">
                      <FaBed
                        aria-hidden="true"
                        className="text-[var(--primary)]"
                      />

                      <span>{cottage.bed_type}</span>
                    </div>
                  </div>

                  <div className="mt-6 border-t border-[var(--border)] pt-5">
                    <h3 className="font-bold text-[var(--foreground)]">
                      Booking summary
                    </h3>

                    <p className="mt-1 text-xs text-[var(--muted)]">
                      Backend-calculated for selected dates.
                    </p>

                    <dl className="mt-4 grid gap-3 text-sm">
                      {weekdayNights > 0 ? (
                        <div className="flex justify-between gap-4">
                          <dt className="text-[var(--muted)]">
                            Weekday nights
                          </dt>

                          <dd className="font-semibold">
                            {weekdayNights}
                          </dd>
                        </div>
                      ) : null}

                      {saturdayNights > 0 ? (
                        <div className="flex justify-between gap-4">
                          <dt className="text-[var(--muted)]">
                            Saturday nights
                          </dt>

                          <dd className="font-semibold">
                            {saturdayNights}
                          </dd>
                        </div>
                      ) : null}

                      {sundayNights > 0 ? (
                        <div className="flex justify-between gap-4">
                          <dt className="text-[var(--muted)]">
                            Sunday nights
                          </dt>

                          <dd className="font-semibold">
                            {sundayNights}
                          </dd>
                        </div>
                      ) : null}

                      <div className="flex justify-between gap-4">
                        <dt className="text-[var(--muted)]">
                          Room subtotal
                        </dt>

                        <dd>
                          <Price
                            amount={roomAmount}
                            className="text-sm"
                          />
                        </dd>
                      </div>

                      {getNumberValue(taxAmount) > 0 ? (
                        <div className="flex justify-between gap-4">
                          <dt className="text-[var(--muted)]">
                            Tax
                          </dt>

                          <dd>
                            <Price
                              amount={taxAmount}
                              className="text-sm"
                            />
                          </dd>
                        </div>
                      ) : null}

                      {getNumberValue(discountAmount) > 0 ? (
                        <div className="flex justify-between gap-4">
                          <dt className="text-[var(--muted)]">
                            Discount
                          </dt>

                          <dd className="text-[var(--success)]">
                            -
                            <Price
                              amount={discountAmount}
                              className="text-sm text-[var(--success)]"
                            />
                          </dd>
                        </div>
                      ) : null}

                      <div className="rounded-lg bg-[var(--primary-light)] p-4">
                        <div className="flex items-end justify-between gap-4">
                          <dt className="font-bold text-[var(--foreground)]">
                            Grand total
                          </dt>

                          <dd>
                            <Price
                              amount={grandTotal}
                              className="text-3xl text-[var(--primary)]"
                            />
                          </dd>
                        </div>

                        <p className="mt-2 text-xs leading-5 text-[var(--muted)]">
                          This is the amount used for online payment.
                        </p>
                      </div>
                    </dl>
                  </div>

                  <div className="mt-5 flex items-start gap-3 rounded-lg border border-emerald-100 bg-emerald-50 p-4">
                    <FaCheckCircle
                      aria-hidden="true"
                      className="mt-1 shrink-0 text-emerald-700"
                    />

                    <p className="text-xs leading-5 text-emerald-900">
                      This cottage was available when the page loaded.
                      Availability will be checked again before saving
                      your booking.
                    </p>
                  </div>
                </div>
              </div>

              <div className="mt-5 flex items-start gap-3 rounded-[var(--radius-lg)] border border-amber-200 bg-amber-50 p-5">
                <FaExclamationTriangle
                  aria-hidden="true"
                  className="mt-1 shrink-0 text-amber-700"
                />

                <p className="text-sm leading-6 text-amber-900">
                  Keep your Booking ID after confirmation. You will
                  need it with your registered phone number to check
                  the booking later.
                </p>
              </div>
            </aside>
          </div>
        </Container>
      </section>
    </>
  );
}
