'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Home, User, Settings } from 'lucide-react';
import styles from './TabNavigation.module.css';

const TABS = [
  { label: 'Accueil', href: '/', icon: Home },
  { label: 'Profil', href: '/profile', icon: User },
  { label: 'Paramètres', href: '/setting', icon: Settings },
];

export default function TabNavigation() {
  const pathname = usePathname();

  return (
    <nav className={styles.tabBar}>
      {TABS.map((tab) => {
        const isActive = tab.href === '/' ? pathname === '/' : pathname.startsWith(tab.href.split('?')[0]!) && tab.href !== '/?view=map';
        const Icon = tab.icon;
        return (
          <Link
            key={tab.label}
            href={tab.href}
            className={`${styles.tab} ${isActive ? styles.active : ''}`}
            aria-label={tab.label}
          >
            <Icon size={22} className={styles.icon} />
            <span className={styles.label}>{tab.label}</span>
          </Link>
        );
      })}
    </nav>
  );
}
