'use client';

import Link from 'next/link';
import { Search, UserCircle } from 'lucide-react';
import styles                 from './TopBar.module.css';

type TopBarProps = {
  greeting?: string;
  onSearchClick?: () => void;
};

export default function TopBar({ greeting, onSearchClick }: TopBarProps) {
  return (
    <header className={styles.topBar}>
      <span className={styles.logo}>
        {greeting ?? 'Lootopia'}
      </span>
      <div className={styles.actions}>
        {onSearchClick && (
          <button
            onClick={onSearchClick}
            aria-label="Rechercher"
            className={styles.iconBtn}
          >
            <Search size={20} />
          </button>
        )}
        <Link href="/profile" aria-label="Profil" className={styles.iconBtn}>
          <UserCircle size={22} />
        </Link>
      </div>
    </header>
  );
}
