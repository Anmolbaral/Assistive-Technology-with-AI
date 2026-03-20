import type { Metadata } from "next";
import { Lexend, Source_Sans_3 } from "next/font/google";
import "../styles/globals.css";
import { brand } from "@/lib/theme";
import Link from "next/link";
import ClientFocusHandler from "@/components/content/ClientFocusHandler";
import { Analytics } from "@vercel/analytics/react";
import { HeaderNav } from "@/components/layout/HeaderNav";

const sourceSans = Source_Sans_3({
  subsets: ["latin"],
  variable: "--font-body",
  display: "swap",
});

const lexend = Lexend({
  subsets: ["latin"],
  variable: "--font-heading",
  display: "swap",
});

export const metadata: Metadata = {
  title: "TechBridge Learning - AI & AT Training",
  description:
    "Privacy-first AI assistant for K-12 educators seeking assistive technology resources.",
  keywords: ["assistive technology", "AT", "K-12", "education", "AI", "SETT framework"],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${sourceSans.variable} ${lexend.variable}`}>
      <body className={`${sourceSans.className} font-sans antialiased`}>
        {/* Skip to main content */}
        <a href="#main-content" className="skip-link">
          Skip to main content
        </a>

        {/* Header */}
        <header role="banner" className="border-b bg-background sticky top-0 z-50 print:hidden">
          <div className="container mx-auto px-4 py-4 flex items-center justify-between">
            <Link href="/" className="flex items-center gap-3 hover:opacity-80 transition-opacity">
              <div
                className="w-10 h-10 rounded-full flex items-center justify-center text-white font-bold"
                style={{ backgroundColor: brand.colors.primary }}
              >
                TB
              </div>
              <div>
                <h1 className="font-bold text-lg">TechBridge Learning</h1>
                <p className="text-xs text-muted-foreground">AI & AT Training</p>
              </div>
            </Link>

            <HeaderNav />
          </div>
        </header>

        {/* Main content */}
        <main id="main-content" role="main" tabIndex={-1} className="min-h-screen outline-none">
          <ClientFocusHandler />
          {children}
        </main>

        {/* Footer */}
        <footer role="contentinfo" className="border-t bg-muted/30 mt-16 print:hidden">
          <div className="container mx-auto px-4 py-8">
            <div className="grid md:grid-cols-3 gap-8">
            <div>
              <h3 className="font-semibold mb-2">TechBridge Learning</h3>
              <p className="text-sm text-muted-foreground">
                Supporting educators with privacy-first AI for assistive technology
                resources.
              </p>
            </div>
            <div>
              <h3 className="font-semibold mb-2">Resources</h3>
              <ul className="space-y-2 text-sm">
                <li>
                  <a
                    href="https://www.joyzabala.com/links-resources"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-muted-foreground hover:text-primary transition-colors"
                  >
                    SETT Framework
                  </a>
                </li>
              </ul>
            </div>
              <div>
                <h3 className="font-semibold mb-2">Privacy</h3>
                <p className="text-sm text-muted-foreground">
                  Your queries are private and never shared. No student data is
                  collected or stored.
                </p>
              </div>
            </div>
            <div className="mt-8 pt-8 border-t text-center text-sm text-muted-foreground">
              © {new Date().getFullYear()} TechBridge Learning. Built with privacy
              and accessibility in mind.
            </div>
          </div>
        </footer>

        {/* ARIA live region for announcements */}
        <div
          id="aria-live-announcer"
          className="sr-only"
          role="status"
          aria-live="polite"
          aria-atomic="true"
        />

        {/* Vercel Analytics */}
        <Analytics />
      </body>
    </html>
  );
}

