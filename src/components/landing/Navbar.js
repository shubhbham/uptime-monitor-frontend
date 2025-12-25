"use client";

import Link from "next/link";
import { useAuth, UserButton, SignInButton, SignUpButton } from "@clerk/nextjs";
import { ArrowRight, LayoutDashboard } from "lucide-react";

export default function Navbar() {
    const { isSignedIn, isLoaded } = useAuth();

    return (
        <nav className="fixed top-0 left-0 right-0 z-50 border-b border-white/5 bg-black/50 backdrop-blur-xl transition-all">
            <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-6">
                {/* Logo */}
                <Link href="/" className="flex items-center gap-2 group">
                    <div className="h-8 w-8 rounded-full bg-gradient-to-tr from-indigo-500 to-purple-500 p-[1px]">
                        <div className="h-full w-full rounded-full bg-black flex items-center justify-center">
                            <div className="h-3 w-3 rounded-full bg-white group-hover:bg-indigo-300 transition-colors" />
                        </div>
                    </div>
                    <span className="font-bold text-lg tracking-tight text-white group-hover:text-indigo-200 transition-colors">
                        {process.env.NEXT_PUBLIC_SITE_NAME || "Uptime Metrics"}
                    </span>
                </Link>

                {/* Desktop Links */}
                <div className="hidden md:flex items-center gap-8 text-sm font-medium text-gray-400">
                    <Link href="#features" className="hover:text-white transition-colors">Features</Link>
                    <Link href="#pricing" className="hover:text-white transition-colors">Pricing</Link>
                    <Link href="/docs" className="hover:text-white transition-colors">Docs</Link>
                </div>

                {/* Auth / Action */}
                <div className="flex items-center gap-4">
                    {!isLoaded ? (
                        <div className="h-8 w-8 rounded-full bg-white/5 animate-pulse" />
                    ) : isSignedIn ? (
                        <div className="flex items-center gap-4">
                            <Link
                                href="/monitors"
                                className="hidden sm:flex items-center gap-2 rounded-lg border border-white/10 bg-white/5 px-3 py-1.5 text-xs font-semibold text-white transition hover:bg-white/10"
                            >
                                <LayoutDashboard size={14} />
                                Dashboard
                            </Link>
                            <UserButton
                                afterSignOutUrl="/"
                                appearance={{
                                    elements: {
                                        avatarBox: "h-8 w-8"
                                    }
                                }}
                            />
                        </div>
                    ) : (
                        <>
                            <div className="hidden sm:block">
                                <SignInButton mode="modal">
                                    <button className="text-sm font-medium text-gray-300 hover:text-white transition-all duration-300 hover:tracking-wide">
                                        Log in
                                    </button>
                                </SignInButton>
                            </div>
                            
                            <SignUpButton mode="modal">
                                <button className="flex items-center gap-2 rounded-full bg-white px-4 py-1.5 text-sm font-semibold text-black transition-all duration-300 hover:bg-indigo-50 hover:scale-105 hover:shadow-[0_0_20px_rgba(255,255,255,0.3)] active:scale-95">
                                    Sign Up
                                    <ArrowRight size={14} />
                                </button>
                            </SignUpButton>
                        </>
                    )}
                </div>
            </div>
        </nav>
    );
}
