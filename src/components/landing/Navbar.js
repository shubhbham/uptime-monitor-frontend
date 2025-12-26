"use client";

import Link from "next/link";
import { useState } from "react";
import { useAuth, UserButton, SignInButton, SignUpButton } from "@clerk/nextjs";
import { ArrowRight, LayoutDashboard, Key, Menu, X, Activity } from "lucide-react";

export default function Navbar() {
    const { isSignedIn, isLoaded } = useAuth();
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

    const toggleMenu = () => setIsMobileMenuOpen(!isMobileMenuOpen);

    return (
        <nav className="fixed top-0 left-0 right-0 z-50 border-b border-white/5 bg-black/50 backdrop-blur-xl transition-all">
            <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-6">
                {/* Logo */}
                <Link href="/" className="flex items-center gap-2 group z-50">
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
                <div className="hidden md:flex items-center gap-6 text-sm font-medium text-gray-400">
                    <Link href="#features" className="hover:text-white transition-colors">Features</Link>
                    <Link href="#pricing" className="hover:text-white transition-colors">Pricing</Link>

                    {isSignedIn && (
                        <>
                            <div className="h-4 w-px bg-white/10" />
                            <Link href="/monitors" className="flex items-center gap-1.5 hover:text-white transition-colors">
                                <Activity size={14} /> Monitors
                            </Link>
                            <Link href="/print-token" className="flex items-center gap-1.5 hover:text-white transition-colors">
                                <Key size={14} /> API
                            </Link>
                        </>
                    )}
                </div>

                {/* Auth / Action */}
                <div className="flex items-center gap-4">
                    {!isLoaded ? (
                        <div className="h-8 w-8 rounded-full bg-white/5 animate-pulse" />
                    ) : isSignedIn ? (
                        <div className="flex items-center gap-4">
                            <UserButton
                                afterSignOutUrl="/"
                                appearance={{
                                    elements: {
                                        avatarBox: "h-8 w-8 ring-2 ring-white/10 hover:ring-white/30 transition-all"
                                    }
                                }}
                            />
                            {/* Mobile Menu Button */}
                            <button
                                onClick={toggleMenu}
                                className="md:hidden p-2 text-gray-400 hover:text-white"
                            >
                                {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
                            </button>
                        </div>
                    ) : (
                        <div className="flex items-center gap-3">
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
                        </div>
                    )}
                </div>
            </div>

            {/* Mobile Menu Overlay */}
            {isMobileMenuOpen && (
                <div className="md:hidden absolute top-16 left-0 right-0 bg-gray-950 border-b border-white/10 p-4 shadow-2xl animate-in slide-in-from-top-5">
                    <div className="flex flex-col gap-4 text-sm font-medium text-gray-300">
                        <Link href="#features" onClick={toggleMenu} className="p-2 hover:bg-white/5 rounded-lg">Features</Link>
                        <Link href="#pricing" onClick={toggleMenu} className="p-2 hover:bg-white/5 rounded-lg">Pricing</Link>
                        {isSignedIn && (
                            <>
                                <hr className="border-white/5" />
                                <Link href="/monitors" onClick={toggleMenu} className="p-2 hover:bg-white/5 rounded-lg flex items-center gap-2">
                                    <Activity size={16} /> Monitors Dashboard
                                </Link>
                                <Link href="/print-token" onClick={toggleMenu} className="p-2 hover:bg-white/5 rounded-lg flex items-center gap-2">
                                    <Key size={16} /> API Access
                                </Link>
                            </>
                        )}
                        {!isSignedIn && (
                            <div className="sm:hidden pt-2 border-t border-white/5">
                                <SignInButton mode="modal">
                                    <button onClick={toggleMenu} className="w-full text-left p-2 hover:bg-white/5 rounded-lg">
                                        Log in
                                    </button>
                                </SignInButton>
                            </div>
                        )}
                    </div>
                </div>
            )}
        </nav>
    );
}
