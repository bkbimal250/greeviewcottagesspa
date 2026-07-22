import type { Metadata } from "next";
import type { ReactNode } from "react";

import "@/app/globals.css";

export const metadata: Metadata = {
  title: {
    default: "Green View Cottages",
    template: "%s | Green View Cottages",
  },
  description:
    "Manage Green View Cottages properties, cottages, bookings, payments and guest operations.",
  robots: {
    index: false,
    follow: false,
  },
};

interface RootLayoutProps {
  children: ReactNode;
}

export default function RootLayout({
  children,
}: RootLayoutProps) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        suppressHydrationWarning
        className={[
          "min-h-screen",
          "bg-[var(--background)]",
          "text-[var(--foreground)]",
          "antialiased",
        ].join(" ")}
      >
        {children}
      </body>
    </html>
  );
}
