"use client";

import NavAuth from "@/components/layout/Navbar/NavAuth";
import NavLinks from "@/components/layout/Navbar/NavLinks";
import NavLogo from "@/components/layout/Navbar/NavLogo";
import NavMobileSheet from "@/components/layout/Navbar/NavMobileSheet";

export default function Navbar() {
  const isLoggedIn = true;
  const userEmail = "joueur@lootopia.fr";

  return (
    <nav
      className="sticky top-0 z-50 w-full border-b border-white/10 bg-white/70 dark:bg-black/50 backdrop-blur-md"
      aria-label="Main navigation"
    >
      <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">
        <NavLogo />
        <NavLinks />
        <NavAuth isLoggedIn={isLoggedIn} userEmail={userEmail} />
        <NavMobileSheet isLoggedIn={isLoggedIn} userEmail={userEmail} />
      </div>
    </nav>
  );
}
