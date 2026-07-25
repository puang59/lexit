import type { Metadata } from "next";
import {
  ClerkProvider,
  SignInButton,
  SignUpButton,
  SignedIn,
  SignedOut,
  UserButton,
} from "@clerk/nextjs";
import { Instrument_Serif } from "next/font/google";
import { ConvexClientProvider } from "@/utility/ConvexClientProvider";
import { Analytics } from "@vercel/analytics/next";
import Notification from "@/components/Notification";
import "./globals.css";
import { KeyboardShortcutProvider } from "@/utility/KeyboardShortcutProvider";

const InstrumentSerif = Instrument_Serif({
  variable: "--font-instrument-serif",
  subsets: ["latin"],
  weight: "400",
});

export const metadata: Metadata = {
  title: "Lexit",
  description: "Expand your vocabulary, effortlessly.",
  manifest: "/manifest.json",
  icons: {
    icon: "/favicon.ico",
    apple: [
      { url: "/icons/apple-touch-icon.png", sizes: "180x180" },
      { url: "/icons/apple-touch-icon-152x152.png", sizes: "152x152" },
      { url: "/icons/apple-touch-icon-167x167.png", sizes: "167x167" },
    ],
  },
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "Lexit",
  },
  openGraph: {
    title: "Lexit",
    description: "Expand your vocabulary, effortlessly.",
    url: "https://lexit-two.vercel.app",
    siteName: "Lexit",
    images: [
      {
        url: "/banner.png",
        width: 1200,
        height: 630,
        alt: "Lexit - Expand your vocabulary",
      },
    ],
    locale: "en_US",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Lexit",
    description: "Expand your vocabulary, effortlessly.",
    images: ["/banner.png"],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <ClerkProvider>
      <html lang="en">
        <body className={`${InstrumentSerif.variable} antialiased`}>
          <KeyboardShortcutProvider>
            <ConvexClientProvider>
              <Notification />
              {children}
              <Analytics />
              <footer className="fixed bottom-0 left-0 right-0 text-center py-3 text-xs text-gray-500 bg-white/80 dark:bg-black/80 backdrop-blur-sm">
                <span className="mr-3">
                  This is Open Source •{" "}
                  <a
                    href="https://github.com/puang59/lexit"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-black hover:underline dark:text-white"
                  >
                    View on GitHub
                  </a>{" "}
                </span>
                |{" "}
                <span className="ml-3">
                  <kbd className="bg-gray-100 text-gray-600 text-xs px-1 py-0.5 rounded border mr-1 dark:bg-zinc-600 dark:text-gray-300">
                    Shift + ?
                  </kbd>{" "}
                  for shortcuts
                </span>
              </footer>
            </ConvexClientProvider>
          </KeyboardShortcutProvider>
          </body>
      </html>
    </ClerkProvider>
  );
}
