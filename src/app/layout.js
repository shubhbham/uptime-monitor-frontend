import {
  ClerkProvider,
  SignInButton,
  SignUpButton,
  SignedIn,
  SignedOut,
  UserButton,
} from "@clerk/nextjs";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata = {
  title: "PulseWatch",
  description: "Modern uptime monitoring for developers",
};

export default function RootLayout({ children }) {
  return (
    <ClerkProvider>
      <html lang="en" suppressHydrationWarning>
        <body
          suppressHydrationWarning
          className={`${geistSans.variable} ${geistMono.variable} antialiased bg-gradient-to-br from-gray-950 via-gray-900 to-black overflow-x-hidden`}
        >
          {/* ================= FLOATING GLASS NAV ================= */}
          <nav
            className="
              fixed top-5 left-1/2 -translate-x-1/2 z-50
              w-[92%] max-w-7xl
              rounded-2xl
              backdrop-blur-2xl bg-white/10
              border border-white/20
              shadow-[0_20px_60px_rgba(0,0,0,0.6)]
              px-6 py-3
              transition-all duration-500 ease-out
              hover:bg-white/15 hover:shadow-indigo-500/20
            "
          >
            <div className="flex items-center justify-between">
              {/* BRAND */}
              <div className="flex items-center gap-3 group">
                <div
                  className="
                    h-10 w-10 rounded-2xl
                    bg-gradient-to-br from-indigo-500 to-purple-600
                    flex items-center justify-center
                    shadow-lg shadow-indigo-500/40
                    transition-transform duration-500
                    group-hover:scale-110
                  "
                >
                  <span className="text-white text-xl font-bold animate-pulse">
                    ⚡
                  </span>
                </div>
                <span className="text-lg font-semibold text-white tracking-tight">
                  PulseWatch
                </span>
              </div>

              {/* NAV LINKS */}
              <div className="hidden md:flex items-center gap-8 text-sm font-medium text-gray-200">
                <a
                  href="/monitors"
                  className="relative transition hover:text-white after:absolute after:left-0 after:-bottom-1 after:h-[2px] after:w-0 after:bg-indigo-400 after:transition-all hover:after:w-full"
                >
                  Monitors
                </a>
                <a
                  href="/docs"
                  className="relative transition hover:text-white after:absolute after:left-0 after:-bottom-1 after:h-[2px] after:w-0 after:bg-indigo-400 after:transition-all hover:after:w-full"
                >
                  Docs
                </a>
                <a
                  href="/status"
                  className="relative transition hover:text-white after:absolute after:left-0 after:-bottom-1 after:h-[2px] after:w-0 after:bg-indigo-400 after:transition-all hover:after:w-full"
                >
                  Status
                </a>
              </div>

              {/* AUTH */}
              <div className="flex items-center gap-4">
                <SignedOut>
                  <SignInButton>
                    <button className="text-sm text-gray-300 hover:text-white transition">
                      Sign in
                    </button>
                  </SignInButton>

                  <SignUpButton>
                    <button
                      className="
                        rounded-full
                        bg-gradient-to-r from-indigo-500 to-purple-600
                        px-4 py-2
                        text-sm font-semibold text-white
                        shadow-md shadow-indigo-500/40
                        transition-all
                        hover:scale-105 hover:shadow-indigo-500/70
                      "
                    >
                      Get started
                    </button>
                  </SignUpButton>
                </SignedOut>

                <SignedIn>
                  <UserButton
                    appearance={{
                      elements: {
                        avatarBox:
                          "h-9 w-9 rounded-full ring-2 ring-indigo-500/50",
                      },
                    }}
                  />
                </SignedIn>
              </div>
            </div>
          </nav>

          {/* ================= PAGE CONTENT ================= */}
          <main className="pt-28 min-h-screen">
            {children}
          </main>
        </body>
      </html>
    </ClerkProvider>
  );
}
