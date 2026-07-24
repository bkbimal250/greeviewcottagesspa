import type { Metadata, Viewport } from "next";
import { Inter, Playfair_Display } from "next/font/google";
import { ToastContainer } from "react-toastify";

import Footer from "@/components/layout/Footer";
import Header from "@/components/layout/Header";
import JsonLd from "@/components/seo/JsonLd";
import { absoluteUrl, contactConfig, siteConfig } from "@/lib/config/contact";

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

const siteUrl = siteConfig.url;

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),

  title: {
    default: "Green View Cottages & Spa | Nature Stay and Wellness Retreat",
    template: "%s | Green View Cottages & Spa",
  },

  description:
    "Plan a peaceful cottage stay at Green View Cottages & Spa in Mount Abu with direct booking assistance, comfortable cottages and calm natural surroundings.",

  keywords: [
    "Green View Cottages",
    "cottages in Mount Abu",
    "Mount Abu cottage booking",
    "stay in Mount Abu",
    "Dhundai cottages",
    "family cottages Mount Abu",
  ],

  applicationName: siteConfig.name,

  authors: [
    {
      name: siteConfig.name,
    },
  ],

  creator: siteConfig.name,
  publisher: siteConfig.name,

  alternates: {
    canonical: "/",
  },

  openGraph: {
    type: "website",
    locale: "en_IN",
    url: "/",
    siteName: siteConfig.name,
    title: "Green View Cottages & Spa | Nature Stay and Wellness Retreat",
    description:
      "Explore comfortable cottages, calm surroundings and direct booking assistance at Green View Cottages & Spa in Mount Abu.",
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
    title: "Green View Cottages & Spa",
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
  const organizationSchema = {
    "@context": "https://schema.org",
    "@type": "LodgingBusiness",
    name: siteConfig.name,
    url: siteConfig.url,
    telephone: contactConfig.displayPhone || undefined,
    email: contactConfig.email || undefined,
    address: contactConfig.address,
    image: absoluteUrl("/images/property-cover.jpg"),
  };

  const websiteSchema = {
    "@context": "https://schema.org",
    "@type": "WebSite",
    name: siteConfig.name,
    url: siteConfig.url,
  };

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
        <a href="#main-content" className="skip-link">
          Skip to content
        </a>

        <div className="flex min-h-screen flex-col">
          <Header />

          <main id="main-content" className="flex-1">
            {children}
          </main>

          <Footer />
        </div>

        <JsonLd data={[organizationSchema, websiteSchema]} />

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
