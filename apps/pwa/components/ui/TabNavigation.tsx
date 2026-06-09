'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Home, User, Settings } from 'lucide-react';

const TABS = [
  { label: 'Accueil', href: '/', icon: Home },
  { label: 'Profil', href: '/profile', icon: User },
  { label: 'Paramètres', href: '/settings', icon: Settings },
];

export default function TabNavigation() {
  const pathname = usePathname();

  return (
    <nav className="fixed bottom-0 w-full pt-3 pb-safe-3 flex flex-row items-stretch bg-background border-t border-border z-[1100]">
      {TABS.map((tab) => {
        const isActive = tab.href === '/' ? pathname === '/' : pathname.startsWith(tab.href);
        const Icon = tab.icon;
        return (
          <Link
            key={tab.label}
            href={tab.href}
            aria-label={tab.label}
            data-active={isActive}
            className="group flex-1 flex flex-col items-center justify-center gap-1 h-full cursor-pointer text-foreground opacity-50 data-[active=true]:opacity-100 transition-opacity duration-200 active:opacity-70"
          >
            <Icon size={22} className="block opacity-60 group-data-[active=true]:opacity-100" />
            <span className="text-[11px] font-medium">{tab.label}</span>
          </Link>
        );
      })}
    </nav>
  );
}
