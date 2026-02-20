"use client";

import Link from "next/link";
import { Menu, LogOut } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetTrigger,
} from "@/components/ui/sheet";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface NavMobileSheetProps {
  isLoggedIn: boolean;
  userEmail: string;
}

const links = [
  { href: "/#how-it-works", label: "Comment ça marche ?" },
  { href: "/#features", label: "Fonctionnalités" },
  { href: "/#contact", label: "Contact" },
] as const;

export default function NavMobileSheet({
  isLoggedIn,
  userEmail,
}: Readonly<NavMobileSheetProps>) {
  return (
    <Sheet>
      <SheetTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className="md:hidden"
          aria-label="Open navigation menu"
        >
          <Menu className="size-5" />
        </Button>
      </SheetTrigger>
      <SheetContent side="right" className="flex flex-col gap-6">
        <nav className="flex flex-col gap-4" aria-label="Navigation mobile">
          {links.map(({ href, label }) => (
            <Link
              key={href}
              href={href}
              className="text-base font-medium text-foreground hover:text-foreground/80 transition-colors py-2"
              aria-label={label}
            >
              {label}
            </Link>
          ))}
        </nav>
        <div className="mt-auto pt-4 border-t">
          {isLoggedIn ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="w-full justify-start font-normal">
                  {userEmail}
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                <DropdownMenuItem asChild>
                  <Link href="/dashboard">Dashboard</Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link href="/settings">Paramètres</Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link href="/signout" aria-label="Sign out">
                    <LogOut className="mr-2 size-4" />
                    Déconnexion
                  </Link>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <div className="flex flex-col gap-2">
              <Button variant="outline" asChild className="w-full">
                <Link href="/signin">Se connecter</Link>
              </Button>
              <Button asChild className="w-full">
                <Link href="/signup">S&apos;inscrire</Link>
              </Button>
            </div>
          )}
        </div>
      </SheetContent>
    </Sheet>
  );
}
