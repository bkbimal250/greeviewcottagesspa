import {
  FaBan,
  FaCalendarCheck,
  FaClock,
  FaExclamationTriangle,
  FaIdCard,
  FaMoneyBillWave,
  FaSmokingBan,
  FaUserFriends,
} from "react-icons/fa";

import Container from "@/components/layout/Container";

export interface PropertyPolicy {
  id?: string;
  title: string;
  description: string;
  icon?: string;
}

interface PropertyPoliciesProps {
  policies?: PropertyPolicy[];
  title?: string;
  subtitle?: string;
  description?: string;
  checkInTime?: string;
  checkOutTime?: string;
  className?: string;
}

const policyIcons = {
  check_in: FaCalendarCheck,
  check_out: FaClock,
  identification: FaIdCard,
  guests: FaUserFriends,
  payment: FaMoneyBillWave,
  smoking: FaSmokingBan,
  prohibited: FaBan,
  warning: FaExclamationTriangle,
};

function normalizeKey(value?: string): keyof typeof policyIcons | "" {
  const key = (value || "")
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "_")
    .replace(/^_+|_+$/g, "");

  return key in policyIcons
    ? (key as keyof typeof policyIcons)
    : "";
}

function formatTime(value?: string): string {
  if (!value) {
    return "";
  }

  const [hoursString, minutesString] = value.split(":");
  const hours = Number(hoursString);
  const minutes = Number(minutesString || "0");

  if (!Number.isFinite(hours) || !Number.isFinite(minutes)) {
    return value;
  }

  const period = hours >= 12 ? "PM" : "AM";
  const displayHours = hours % 12 || 12;

  return `${displayHours}:${String(minutes).padStart(2, "0")} ${period}`;
}

export default function PropertyPolicies({
  policies,
  title = "Important property policies",
  subtitle = "Before your stay",
  description = "Please review the following policies before booking your cottage at Green View Cottages.",
  checkInTime = "10:00",
  checkOutTime = "10:00",
  className = "",
}: PropertyPoliciesProps) {
  const defaultPolicies: PropertyPolicy[] = [
    {
      id: "check-in",
      title: "Check-in",
      description: `Standard check-in time is ${formatTime(
        checkInTime,
      )}. Early check-in is subject to availability and may involve an additional charge.`,
      icon: "check_in",
    },
    {
      id: "check-out",
      title: "Check-out",
      description: `Standard check-out time is ${formatTime(
        checkOutTime,
      )}. Late check-out must be approved by the property team.`,
      icon: "check_out",
    },
    {
      id: "identification",
      title: "Valid identification",
      description:
        "All adult guests must carry valid government-issued photo identification for verification during check-in.",
      icon: "identification",
    },
    {
      id: "guest-capacity",
      title: "Guest capacity",
      description:
        "The number of guests must not exceed the maximum occupancy of the booked cottage without prior approval.",
      icon: "guests",
    },
    {
      id: "payment",
      title: "Payment and confirmation",
      description:
        "A reservation may remain pending until the required advance or full payment has been received and verified.",
      icon: "payment",
    },
    {
      id: "smoking",
      title: "Smoking policy",
      description:
        "Smoking may only be permitted in designated outdoor areas. Please avoid smoking inside cottages and enclosed common areas.",
      icon: "smoking",
    },
    {
      id: "prohibited",
      title: "Prohibited activities",
      description:
        "Illegal activities, excessive noise, property damage, unsafe conduct and disturbance to other guests are strictly prohibited.",
      icon: "prohibited",
    },
    {
      id: "cancellation",
      title: "Cancellation policy",
      description:
        "Cancellation charges and refund eligibility depend on the booking date, stay date, payment status and applicable rate conditions.",
      icon: "warning",
    },
  ];

  const propertyPolicies = policies ?? defaultPolicies;
  const featuredPolicies = propertyPolicies.slice(0, 8);
  const additionalPolicies = propertyPolicies.slice(8);

  return (
    <section
      className={[
        "section bg-[var(--surface-muted)]",
        className,
      ].join(" ")}
    >
      <Container>
        <div className="mx-auto max-w-3xl text-center">
          <p className="text-sm font-semibold uppercase tracking-[0.18em] text-[var(--primary)]">
            {subtitle}
          </p>

          <h2 className="mt-3 font-[var(--font-playfair)] text-4xl font-bold text-[var(--foreground)] sm:text-5xl">
            {title}
          </h2>

          <p className="mt-4 leading-7 text-[var(--muted)]">
            {description}
          </p>
        </div>

        <div className="mt-10 grid gap-4 md:grid-cols-2">
          {featuredPolicies.map((policy, index) => {
            const iconKey = normalizeKey(policy.icon);

            const Icon = iconKey
              ? policyIcons[iconKey]
              : FaExclamationTriangle;

            return (
              <article
                key={policy.id || `${policy.title}-${index}`}
                className={[
                  "group flex items-start gap-4 rounded-lg",
                  "border border-[var(--border)] bg-white p-5 sm:p-6",
                  "shadow-[var(--shadow-sm)] transition",
                  "hover:-translate-y-0.5 hover:border-[var(--primary)]/35",
                  "hover:shadow-[var(--shadow-md)]",
                ].join(" ")}
              >
                <div
                  aria-hidden="true"
                  className={[
                    "flex h-11 w-11 shrink-0 items-center justify-center",
                    "rounded-full bg-[var(--primary-light)]",
                    "text-lg text-[var(--primary)] transition",
                    "group-hover:bg-[var(--primary)] group-hover:text-white",
                  ].join(" ")}
                >
                  <Icon />
                </div>

                <div>
                  <h3 className="text-lg font-bold leading-snug text-[var(--foreground)]">
                    {policy.title}
                  </h3>

                  <p className="mt-2 text-sm leading-6 text-[var(--muted)]">
                    {policy.description}
                  </p>
                </div>
              </article>
            );
          })}
        </div>

        {additionalPolicies.length > 0 ? (
          <details className="group mt-6 rounded-lg border border-[var(--border)] bg-white p-5 shadow-[var(--shadow-sm)] sm:p-6">
            <summary className="flex cursor-pointer list-none flex-col justify-between gap-3 [&::-webkit-details-marker]:hidden sm:flex-row sm:items-center">
              <div>
                <p className="text-sm font-bold text-[var(--foreground)]">
                  More property rules
                </p>

                <p className="mt-1 text-sm text-[var(--muted)]">
                  Other rules shared by the property team.
                </p>
              </div>

              <span className="self-start rounded-full bg-[var(--primary-light)] px-3 py-1 text-xs font-semibold text-[var(--primary)] sm:self-auto">
                <span className="group-open:hidden">
                  Show {additionalPolicies.length} more
                </span>
                <span className="hidden group-open:inline">
                  Hide extra rules
                </span>
              </span>
            </summary>

            <div className="mt-5 grid gap-3 md:grid-cols-2">
              {additionalPolicies.map((policy, index) => (
                <div
                  key={policy.id || `${policy.title}-additional-${index}`}
                  className="rounded-lg bg-[var(--surface-muted)] p-4"
                >
                  <p className="text-sm font-bold text-[var(--foreground)]">
                    {policy.title}
                  </p>

                  <p className="mt-1 text-sm leading-6 text-[var(--muted)]">
                    {policy.description}
                  </p>
                </div>
              ))}
            </div>
          </details>
        ) : null}

        <div className="mt-8 rounded-lg border border-amber-200 bg-amber-50 p-5 sm:p-6">
          <div className="flex items-start gap-4">
            <FaExclamationTriangle
              aria-hidden="true"
              className="mt-1 shrink-0 text-xl text-amber-700"
            />

            <div>
              <h3 className="font-bold text-amber-900">
                Policy information may vary
              </h3>

              <p className="mt-2 text-sm leading-6 text-amber-800">
                Special dates, group bookings, promotional rates and
                peak-season reservations may have additional conditions.
                The terms shown in your booking confirmation will apply to
                your reservation.
              </p>
            </div>
          </div>
        </div>
      </Container>
    </section>
  );
}
