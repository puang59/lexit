import type { Metadata } from "next";
import { Instrument_Serif } from "next/font/google";
import { ConvexClientProvider } from "@/utility/ConvexClientProvider";
import { Analytics } from "@vercel/analytics/next";
import Script from "next/script";
import "./globals.css";
import ThemeToggle from "@/components/ThemeToggle";

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
      { url: "/banner.png", width: 1200, height: 630, alt: "Lexit - Expand your vocabulary" },
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
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        {/* Apply correct theme before paint to prevent flicker */}
        <Script id="theme-init" strategy="beforeInteractive">
          {`(function(){try{var k='theme';var p=localStorage.getItem(k);var r=document.documentElement;if(p==='dark'||(!p&&window.matchMedia('(prefers-color-scheme: dark)').matches)){r.classList.add('dark')}else{r.classList.remove('dark')}}catch(e){}})();`}
        </Script>

        {/* Optional: theme-color for browser UI */}
        <meta name="theme-color" media="(prefers-color-scheme: light)" content="#ffffff" />
        <meta name="theme-color" media="(prefers-color-scheme: dark)" content="#111114" />
      </head>
      <body className={`${InstrumentSerif.variable} antialiased`}>
        <ConvexClientProvider>
          {/* Site-wide header with theme toggle */}
          <header className="w-full flex items-center justify-end px-4 py-3">
            <ThemeToggle />
          </header>

          {children}

          <Analytics />

          {/* Theme-aware footer */}
          <footer className="fixed bottom-0 left-0 right-0 text-center py-3 text-xs text-gray-500 bg-white/80 backdrop-blur-sm dark:bg-black/40">
            This is Open Source •{" "}
            <a
              href="https://github.com/puang59/lexit"
              target="_blank"
              rel="noopener noreferrer"
              className="text-black hover:underline dark:text-white"
            >
              View on GitHub
            </a>
          </footer>
        </ConvexClientProvider>
      </body>
    </html>
  );
}
