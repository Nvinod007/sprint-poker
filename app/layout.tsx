import type { Metadata } from "next";
import { Hanken_Grotesk, Manrope } from "next/font/google";

import { ThemeProvider } from "@/components/theme-provider";
import { AppProviders } from "@/components/app-providers";

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

const siteUrl =
  process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: "Sprint Poker | Efficient Story Pointing",
    template: "%s | Sprint Poker",
  },
  description:
    "Estimate user stories together with your team. Real-time planning poker — no login required.",
  keywords: [
    "sprint poker",
    "planning poker",
    "story points",
    "agile",
    "scrum",
    "estimation",
  ],
  openGraph: {
    type: "website",
    locale: "en_US",
    url: siteUrl,
    siteName: "Sprint Poker",
    title: "Sprint Poker | Efficient Story Pointing",
    description:
      "Estimate user stories together with your team. Real-time planning poker — no login required.",
  },
  twitter: {
    card: "summary_large_image",
    title: "Sprint Poker | Efficient Story Pointing",
    description:
      "Estimate user stories together with your team. Real-time planning poker — no login required.",
  },
  robots: {
    index: true,
    follow: true,
  },
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
