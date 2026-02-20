"use client";

import Link from "next/link";
import { LogOut } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface NavAuthProps {
  isLoggedIn: boolean;
  userEmail: string;
}

export default function NavAuth({
  isLoggedIn,
  userEmail,
}: Readonly<NavAuthProps>) {
  if (!isLoggedIn) {
    return (
      <div className="hidden md:flex items-center gap-2">
        <Button variant="ghost" asChild>
          <Link href="/signin">Se connecter</Link>
        </Button>
        <Button asChild>
          <Link href="/signup">S&apos;inscrire</Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="hidden md:block">
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" className="font-normal">
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
    </div>
  );
}
