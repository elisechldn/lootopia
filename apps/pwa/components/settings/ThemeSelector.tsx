'use client';

import { useEffect, useState } from 'react';
import { useTheme } from 'next-themes';
import { Sun, Moon, Monitor } from 'lucide-react';
import { ToggleGroup, ToggleGroupItem } from '@/components/ui/ToggleGroup';

const THEME_OPTIONS = [
  { value: 'light', label: 'Clair', Icon: Sun },
  { value: 'dark', label: 'Sombre', Icon: Moon },
  { value: 'system', label: 'Auto', Icon: Monitor },
] as const;

type ThemeValue = (typeof THEME_OPTIONS)[number]['value'];

function isThemeValue(value: unknown): value is ThemeValue {
  return value === 'light' || value === 'dark' || value === 'system';
}

export default function ThemeSelector() {
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => setMounted(true), []);

  // Le thème (localStorage) est inconnu du serveur : rendre sans sélection
  // avant montage évite tout mismatch d'hydratation.
  const selected = mounted && isThemeValue(theme) ? [theme] : [];

  return (
    <ToggleGroup
      value={selected}
      onValueChange={(values) => {
        const next = values[0];
        // Ignore la désélection (@base-ui renvoie un tableau vide si on re-clique l'option active)
        if (isThemeValue(next)) setTheme(next);
      }}
      aria-label="Choisir le thème"
    >
      {THEME_OPTIONS.map(({ value, label, Icon }) => (
        <ToggleGroupItem key={value} value={value} aria-label={label}>
          <Icon size={16} />
        </ToggleGroupItem>
      ))}
    </ToggleGroup>
  );
}
