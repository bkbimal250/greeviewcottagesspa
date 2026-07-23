import type { Metadata, Viewport } from "next";
import { Inter, Playfair_Display } from "next/font/google";
import { ToastContainer } from "react-toastify";

import Footer from "@/components/layout/Footer";
import Header from "@/components/layout/Header";

import "react-toastify/dist/ReactToastify.css";
import "./globals.css";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  display: "swap",
});

const playfairDisplay = Playfair_Display({
  variable: "--font-playfair",
  subsets: ["latin"],
  display: "swap",
});

const siteUrl =
  process.env.NEXT_PUBLIC_SITE_URL || "https://greencottagesandspa.in";

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),

  title: {
    default: "Green View Cottages | Cottage Stay in Mount Abu",
    template: "%s | Green View Cottages",
  },

  description:
    "Book a peaceful cottage stay at Green View Cottages in Dhundai, Mount Abu, Rajasthan. Check availability and reserve your cottage online.",

  keywords: [
    "Green View Cottages",
    "cottages in Mount Abu",
    "Mount Abu cottage booking",
    "stay in Mount Abu",
    "Dhundai cottages",
    "family cottages Mount Abu",
  ],

  applicationName: "Green View Cottages",

  authors: [
    {
      name: "Green View Cottages",
    },
  ],

  creator: "Green View Cottages",
  publisher: "Green View Cottages",

  alternates: {
    canonical: "/",
  },

  openGraph: {
    type: "website",
    locale: "en_IN",
    url: "/",
    siteName: "Green View Cottages",
    title: "Green View Cottages | Cottage Stay in Mount Abu",
    description:
      "Check cottage availability and book your peaceful stay at Green View Cottages in Mount Abu.",
    images: [
      {
        url: "/images/property-cover.jpg",
        width: 1200,
        height: 630,
        alt: "Green View Cottages in Mount Abu",
      },
    ],
  },

  twitter: {
    card: "summary_large_image",
    title: "Green View Cottages",
    description:
      "Check availability and book a comfortable cottage stay in Mount Abu.",
    images: ["/images/property-cover.jpg"],
  },

  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-image-preview": "large",
      "max-snippet": -1,
      "max-video-preview": -1,
    },
  },

  icons: {
    icon: [
      {
        url: "/favicon.ico",
      },
    ],
    apple: [
      {
        url: "/apple-touch-icon.png",
      },
    ],
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
  themeColor: "#2f6b45",
};

interface RootLayoutProps {
  children: React.ReactNode;
}

export default function RootLayout({
  children,
}: Readonly<RootLayoutProps>) {
  return (
    <html
      lang="en"
      data-scroll-behavior="smooth"
      suppressHydrationWarning
    >
      <body
        suppressHydrationWarning
        className={[
          inter.variable,
          playfairDisplay.variable,
          "min-h-screen bg-[var(--background)]",
          "font-[var(--font-inter)] text-[var(--foreground)]",
          "antialiased",
        ].join(" ")}
      >
        <div className="flex min-h-screen flex-col">
          <Header />

          <main id="main-content" className="flex-1">
            {children}
          </main>

          <Footer />
        </div>

        <ToastContainer
          position="top-right"
          autoClose={4000}
          hideProgressBar={false}
          newestOnTop
          closeOnClick
          pauseOnFocusLoss
          draggable
          pauseOnHover
          theme="light"
          limit={3}
          aria-label="Website notifications"
        />
      </body>
    </html>
  );
}
