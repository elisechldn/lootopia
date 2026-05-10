import Link from "next/link";
import React from "react";

export default function Footer() {
    return (
        <footer className="bg-card text-foreground/80">
            <div className="max-w-7xl mx-auto px-6 py-12">
                {/* Top grid */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-10 mb-10">
                    {/* Brand */}
                    <div className="col-span-2 md:col-span-1">
                        <Link href="/apps/web/public"
                              className="flex items-center gap-2 text-black font-semibold text-base mb-3">
                            <span
                                className="inline-flex items-center justify-center w-7 h-7 bg-card/10 rounded-lg text-sm">🏠</span>
                            Lootopia
                        </Link>
                        <p className="text-sm leading-relaxed text-foreground/80">
                            Chasses au trésor numériques en réalité augmentée pour les explorateurs urbains.
                        </p>
                    </div>

                    {/* Product */}
                    <div>
                        <h4 className="text-black text-sm font-semibold mb-4">Produit</h4>
                        <ul className="flex flex-col gap-2 text-sm">
                            <li><Link href="#features"
                                      className="hover:text-white transition-colors">Caractéristiques</Link>
                            </li>
                            <li><Link href="#how-it-works" className="hover:text-white transition-colors">Comment ça
                                marche</Link></li>
                            <li><Link href="/pricing" className="hover:text-white transition-colors">Tarification</Link>
                            </li>
                        </ul>
                    </div>

                    {/* Company */}
                    <div>
                        <h4 className="text-black text-sm font-semibold mb-4">Entreprise</h4>
                        <ul className="flex flex-col gap-2 text-sm">
                            <li><Link href="/about" className="hover:text-white transition-colors">À propos</Link></li>
                            <li><Link href="#contact" className="hover:text-white transition-colors">Contact</Link></li>
                            <li><Link href="/support" className="hover:text-white transition-colors">Support</Link></li>
                        </ul>
                    </div>

                    {/* Legal */}
                    <div>
                        <h4 className="text-black text-sm font-semibold mb-4">Légal</h4>
                        <ul className="flex flex-col gap-2 text-sm">
                            <li><Link href="/privacy"
                                      className="hover:text-white transition-colors">Confidentialité</Link></li>
                            <li><Link href="/terms" className="hover:text-white transition-colors">Conditions
                                d'utilisation</Link></li>
                        </ul>
                    </div>
                </div>

                <hr className="border-border"/>

                {/* Bottom bar */}
                <div className="border-gray-800 pt-10 text-center text-foreground">
                    © 2025 Lootopia. Tous droits réservés.
                </div>
            </div>
        </footer>
    );
}