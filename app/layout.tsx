import type { Metadata } from "next";
import { Hanken_Grotesk, Manrope } from "next/font/google";

import { ThemeProvider } from "@/components/theme-provider";
import { AppProviders } from "@/components/app-providers";
import { getSiteUrl } from "@/lib/site-url";

import "./globals.css";

const manrope = Manrope({
  variable: "--font-heading",
  subsets: ["latin"],
  weight: ["600", "700", "800"],
});

const hanken = Hanken_Grotesk({
  variable: "--font-body",
  subsets: ["latin"],
  weight: ["400", "500", "600"],
});

const siteUrl = getSiteUrl();

const defaultTitle = "Sprint Poker — Free Online Planning Poker & Story Pointing";
const defaultDescription =
  "Free sprint poker and planning poker for agile teams. Estimate user stories with Fibonacci cards in real time — no login, no signup. Create a room and share a code.";

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: defaultTitle,
    template: "%s | Sprint Poker",
  },
  description: defaultDescription,
  keywords: [
    "free sprint poker",
    "free planning poker",
    "online planning poker",
    "planning poker no login",
    "story pointing tool",
    "agile estimation",
    "scrum poker online",
    "fibonacci planning poker",
    "story points estimator",
    "remote sprint planning",
    "sprint poker",
    "planning poker",
    "story points",
    "agile",
    "scrum",
  ],
  alternates: {
    canonical: siteUrl,
  },
  openGraph: {
    type: "website",
    locale: "en_US",
    url: siteUrl,
    siteName: "Sprint Poker",
    title: defaultTitle,
    description: defaultDescription,
  },
  twitter: {
    card: "summary_large_image",
    title: defaultTitle,
    description: defaultDescription,
  },
  robots: {
    index: true,
    follow: true,
  },
  category: "technology",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${manrope.variable} ${hanken.variable} h-full antialiased`}
      suppressHydrationWarning
    >
      <body className="min-h-full flex flex-col bg-background text-foreground">
        <ThemeProvider
          attribute="class"
          defaultTheme="dark"
          enableSystem
          disableTransitionOnChange
        >
          <AppProviders>{children}</AppProviders>
        </ThemeProvider>
      </body>
    </html>
  );
}
