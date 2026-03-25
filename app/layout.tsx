import type { Metadata } from "next";
import "./globals.css";
import MetaPixel from "./components/meta-pixel";
import { ThemeProvider } from "@/components/theme-provider";
import { ThemeToggle } from "@/components/theme-toggle";

export const metadata: Metadata = {
  metadataBase: new URL("https://stackaura.co.za"),
  title: {
    default: "Stackaura",
    template: "%s | Stackaura",
  },
  description:
    "Payment orchestration infrastructure for merchants, platforms, and developers.",
  applicationName: "Stackaura",
  keywords: [
    "Stackaura",
    "payment orchestration",
    "payments infrastructure",
    "fintech infrastructure",
    "merchant API",
    "South Africa fintech",
  ],
  openGraph: {
    title: "Stackaura",
    description:
      "Payment orchestration infrastructure for merchants, platforms, and developers.",
    url: "https://stackaura.co.za",
    siteName: "Stackaura",
    type: "website",
    images: [
      {
        url: "/stackaura-logo.png",
        width: 1200,
        height: 630,
        alt: "Stackaura",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Stackaura",
    description:
      "Payment orchestration infrastructure for merchants, platforms, and developers.",
    images: ["/stackaura-logo.png"],
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body>
        <ThemeProvider attribute="class" defaultTheme="system" enableSystem disableTransitionOnChange>
          <MetaPixel />
          {children}
          <ThemeToggle />
        </ThemeProvider>
      </body>
    </html>
  );
}
