import "./globals.css";
import { Geist, Geist_Mono } from "next/font/google";
import { ThemeProvider } from "@/components/providers/theme-provider";
import { ReduxProvider } from "@/components/providers/redux-provider";
import { LoginPersistProvider } from "@/components/providers/login-persist";
import { Toaster } from "@/components/ui/sonner";

import type { Metadata, Viewport } from "next";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Endurofy",
  description:
    "Track your endurance activities, stay consistent, and achieve your fitness goals faster",
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: "Endurofy",
  },
  formatDetection: {
    telephone: false,
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  viewportFit: "cover",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <link rel="manifest" href="/manifest.json" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta
          name="apple-mobile-web-app-status-bar-style"
          content="black-translucent"
        />
        <meta name="apple-mobile-web-app-title" content="Endurofy" />

        {/* Favicon */}
        <link rel="icon" href="/favicon.ico" sizes="32x32" />
        <link
          rel="icon"
          href="/icons/favicon-16x16.png"
          sizes="16x16"
          type="image/png"
        />
        <link
          rel="icon"
          href="/icons/favicon-32x32.png"
          sizes="32x32"
          type="image/png"
        />

        {/* Apple Touch Icons */}
        <link
          rel="apple-touch-icon"
          sizes="120x120"
          href="/icons/icon-120x120.png"
        />
        <link
          rel="apple-touch-icon"
          sizes="152x152"
          href="/icons/icon-152x152.png"
        />
        <link
          rel="apple-touch-icon"
          sizes="167x167"
          href="/icons/icon-167x167.png"
        />
        <link
          rel="apple-touch-icon"
          sizes="180x180"
          href="/icons/icon-180x180.png"
        />

        {/* Android Chrome Icons */}
        <link
          rel="icon"
          href="/icons/icon-192x192.png"
          sizes="192x192"
          type="image/png"
        />
        <link
          rel="icon"
          href="/icons/icon-512x512.png"
          sizes="512x512"
          type="image/png"
        />
      </head>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <ReduxProvider>
          <LoginPersistProvider>
            <ThemeProvider
              attribute="class"
              defaultTheme="system"
              enableSystem
              disableTransitionOnChange
            >
              {children}
              <Toaster richColors position="top-center" />
            </ThemeProvider>
          </LoginPersistProvider>
        </ReduxProvider>
      </body>
    </html>
  );
}
