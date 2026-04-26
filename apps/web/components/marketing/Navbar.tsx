"use client";

import Link from "next/link";
import React, {useState} from "react";

export default function Navbar() {
    const [menuOpen, setMenuOpen] = useState(false);

    return (
        <header className="sticky top-0 z-50 bg-card border-b border-border">
            <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
                {/* Logo */}
                <Link href="/apps/web/public" className="flex items-center gap-2 font-bold text-foreground text-lg">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"
                         className="w-7 h-7 text-muted-foreground">
                        <path strokeLinecap="round" strokeLinejoin="round"
                              d="M9 6.75V15m6-6v8.25m.503 3.498l4.875-2.437c.381-.19.622-.58.622-1.006V4.82c0-.836-.88-1.38-1.628-1.006l-3.869 1.934c-.317.159-.69.159-1.006 0L9.503 3.252a1.125 1.125 0 00-1.006 0L3.622 5.689C3.24 5.88 3 6.27 3 6.695V19.18c0 .836.88 1.38 1.628 1.006l3.869-1.934c.317-.159.69-.159 1.006 0l4.994 2.497c.317.158.69.158 1.006 0z"/>
                    </svg>
                    <span>Lootopia</span>
                </Link>

                {/* Desktop nav */}
                <nav className="hidden md:flex items-center gap-8 text-sm text-muted-foreground font-medium">
                    <Link href="#how-it-works" className="hover:text-foreground transition-colors">
                        Comment ça marche ?
                    </Link>
                    <Link href="#features" className="hover:text-foreground transition-colors">
                        Fonctionnalités
                    </Link>
                    <Link href="#contact" className="hover:text-foreground transition-colors">
                        Contact
                    </Link>
                </nav>

                {/* Auth buttons */}
                <div className="hidden md:flex items-center gap-3">
                    <Link
                        href="/login"
                        className="text-sm font-medium text-foreground/80 hover:text-foreground transition-colors px-3 py-2"
                    >
                        Se connecter
                    </Link>
                    <Link
                        href="/register"
                        className="text-sm font-medium bg-gray-900 text-white px-4 py-2 rounded-lg hover:bg-gray-800 transition-colors"
                    >
                        S&apos;inscrire
                    </Link>
                </div>

                {/* Mobile hamburger */}
                <button
                    className="md:hidden p-2 rounded-lg hover:bg-muted"
                    onClick={() => setMenuOpen(!menuOpen)}
                    aria-label="Menu"
                >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        {menuOpen ? (
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                                  d="M6 18L18 6M6 6l12 12"/>
                        ) : (
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                                  d="M4 6h16M4 12h16M4 18h16"/>
                        )}
                    </svg>
                </button>
            </div>

            {/* Mobile menu */}
            {menuOpen && (
                <div
                    className="md:hidden border-t border-border bg-card px-6 py-4 flex flex-col gap-4 text-sm font-medium">
                    <Link href="#how-it-works" className="text-foreground/80 hover:text-foreground">Comment ça marche ?</Link>
                    <Link href="#features" className="text-foreground/80 hover:text-foreground">Fonctionnalités</Link>
                    <Link href="#contact" className="text-foreground/80 hover:text-foreground">Contact</Link>
                    <hr className="border-border"/>
                    <Link href="/auth/login" className="text-foreground/80 hover:text-foreground">Se connecter</Link>
                    <Link
                        href="/auth/register"
                        className="bg-gray-900 text-white px-4 py-2 rounded-lg text-center hover:bg-gray-800"
                    >
                        S&apos;inscrire
                    </Link>
                </div>
            )}
        </header>
    );
}