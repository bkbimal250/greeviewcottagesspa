import type { ReactNode } from "react";
import { FaHotel, FaShieldAlt } from "react-icons/fa";

interface AuthLayoutProps {
  children: ReactNode;
}

export default function AuthLayout({
  children,
}: AuthLayoutProps) {
  return (
    <main className="min-h-screen bg-[var(--background)]">
      <div className="grid min-h-screen lg:grid-cols-2">
        <section
          className={[
            "relative hidden overflow-hidden lg:flex",
            "flex-col justify-between",
            "bg-[var(--primary)] p-10 text-white",
          ].join(" ")}
        >
          <div
            aria-hidden="true"
            className="absolute -left-24 -top-24 h-80 w-80 rounded-full bg-white/10"
          />

          <div
            aria-hidden="true"
            className="absolute -bottom-32 -right-20 h-96 w-96 rounded-full bg-white/10"
          />

          <div className="relative z-10">
            <div className="flex items-center gap-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white text-xl text-[var(--primary)] shadow-lg">
                <FaHotel aria-hidden="true" />
              </div>

              <div>
                <p className="text-xl font-bold">
                  Green View Cottages
                </p>

                <p className="text-sm text-white/70">
                  Administration Panel
                </p>
              </div>
            </div>
          </div>

          <div className="relative z-10 max-w-xl">
            <p className="text-sm font-semibold uppercase tracking-[0.2em] text-white/70">
              Manage everything in one place
            </p>

            <h1 className="mt-4 text-4xl font-bold leading-tight xl:text-5xl">
              Powerful tools to manage cottage operations.
            </h1>

            <p className="mt-5 max-w-lg text-base leading-7 text-white/75">
              Manage property details, cottages, bookings,
              payments, guest enquiries and business
              performance securely from your admin dashboard.
            </p>

            <div className="mt-8 flex items-center gap-3 text-sm text-white/80">
              <span className="flex h-10 w-10 items-center justify-center rounded-full bg-white/10">
                <FaShieldAlt aria-hidden="true" />
              </span>

              <span>
                Secure access for authorized administrators
                only
              </span>
            </div>
          </div>

          <p className="relative z-10 text-xs text-white/60">
            Copyright {new Date().getFullYear()} Green View
            Cottages. All rights reserved.
          </p>
        </section>

        <section className="flex min-h-screen items-center justify-center px-4 py-10 sm:px-8 lg:px-12">
          <div className="w-full max-w-md">
            <div className="mb-8 flex items-center justify-center gap-3 lg:hidden">
              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-[var(--primary)] text-lg text-white">
                <FaHotel aria-hidden="true" />
              </div>

              <div>
                <p className="font-bold text-[var(--foreground)]">
                  Green View Cottages
                </p>

                <p className="text-xs text-[var(--muted)]">
                  Admin Panel
                </p>
              </div>
            </div>

            {children}
          </div>
        </section>
      </div>
    </main>
  );
}
