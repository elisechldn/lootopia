'use client';

import Link from 'next/link';
import { Search, UserCircle } from 'lucide-react';

type TopBarProps = {
  greeting?: string;
  onSearchClick?: () => void;
};

export default function TopBar({ greeting, onSearchClick }: TopBarProps) {
  return (
    <header className="h-topbar fixed w-full flex flex-col px-4 bg-background">
        <div className="h-[var(--safe-top)]" />
        <div className="flex flex-1 justify-center items-center w-full">
            <div className="text-lg font-bold text-foreground flex-1 whitespace-nowrap overflow-hidden text-ellipsis">
                {greeting ?? 'Lootopia'}
            </div>
            <div className="flex items-center gap-1 shrink-0">
                {onSearchClick && (
                  <button
                    onClick={onSearchClick}
                    aria-label="Rechercher"
                    className="flex items-center justify-center w-9 h-9 rounded-full text-foreground bg-transparent border-0 cursor-pointer transition-[background] duration-150 hover:bg-gray-500/10 active:bg-gray-500/20"
                  >
                    <Search size={20} />
                  </button>
                )}
                <Link
                  href="/profile"
                  aria-label="Profil"
                  className="flex items-center justify-center w-9 h-9 rounded-full text-foreground bg-transparent border-0 cursor-pointer transition-[background] duration-150 hover:bg-gray-500/10 active:bg-gray-500/20"
                >
                  <UserCircle size={22} />
                </Link>
            </div>
        </div>
    </header>
  );
}
