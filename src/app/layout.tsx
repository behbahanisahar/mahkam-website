import type { Metadata } from "next";
import { Suspense } from "react";
import localFont from "next/font/local";
import "./globals.css";
import { OrganizationJsonLd, LocalBusinessJsonLd } from "@/components/seo/OrganizationJsonLd";
import { NavigationProgress } from "@/components/ui/NavigationProgress";
import { ScrollProgress } from "@/components/ui/ScrollProgress";
import { getSiteName, getSiteUrl } from "@/lib/site";

const shabnam = localFont({
  src: [
    { path: "./fonts/shabnam/Shabnam-Light.woff2", weight: "300", style: "normal" },
    { path: "./fonts/shabnam/Shabnam-Regular.woff2", weight: "400", style: "normal" },
    { path: "./fonts/shabnam/Shabnam-Medium.woff2", weight: "500", style: "normal" },
    { path: "./fonts/shabnam/Shabnam-Medium.woff2", weight: "600", style: "normal" },
    { path: "./fonts/shabnam/Shabnam-Bold.woff2", weight: "700", style: "normal" },
    { path: "./fonts/shabnam/Shabnam-Bold.woff2", weight: "800", style: "normal" },
  ],
  variable: "--font-shabnam",
  display: "swap",
  fallback: ["Tahoma", "Arial", "sans-serif"],
});

const siteUrl = getSiteUrl();
const siteName = getSiteName();

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: `${siteName} | تولیدکننده سیم و کابل برق`,
    template: `%s | ${siteName}`,
  },
  description:
    "شرکت گسترش سیم و کابل مهکام — مشاهده محصولات، مشخصات فنی و دریافت قیمت روز از کانال تلگرام. نرخ دلار، مس و آلومینیوم.",
  keywords: [
    "سیم و کابل",
    "مهکام",
    "کابل برق",
    "سیم افشان",
    "کابل قدرت",
    "قیمت کابل",
    "تولیدکننده کابل",
  ],
  openGraph: {
    type: "website",
    locale: "fa_IR",
    siteName,
    url: siteUrl,
    title: siteName,
    description:
      "مشاهده محصولات سیم و کابل مهکام، مشخصات فنی و استعلام قیمت از تلگرام.",
    images: [{ url: "/images/mahkam-logo.png", alt: siteName }],
  },
  twitter: {
    card: "summary_large_image",
    title: siteName,
    description:
      "مشاهده محصولات سیم و کابل مهکام، مشخصات فنی و استعلام قیمت از تلگرام.",
    images: ["/images/mahkam-logo.png"],
  },
  robots: { index: true, follow: true },
  alternates: { canonical: "/" },
  icons: {
    icon: [
      { url: "/favicon-32.png", sizes: "32x32", type: "image/png" },
      { url: "/images/mahkam-logo.png", type: "image/png" },
    ],
    apple: [{ url: "/apple-touch-icon.png", sizes: "180x180", type: "image/png" }],
    shortcut: "/favicon-32.png",
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="fa" dir="rtl" className={`${shabnam.variable} h-full`}>
      <body className={`${shabnam.className} min-h-full antialiased`}>
        <OrganizationJsonLd />
        <LocalBusinessJsonLd />
        <ScrollProgress />
        <Suspense fallback={null}>
          <NavigationProgress />
        </Suspense>
        {children}
      </body>
    </html>
  );
}
