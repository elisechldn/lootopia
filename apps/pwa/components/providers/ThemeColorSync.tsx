"use client";

import { useEffect } from "react";
import { useTheme } from "next-themes";

/** Couleurs alignées sur --background de globals.css (thème rétro). */
const THEME_COLORS: Record<"light" | "dark", string> = {
  light: "#E4D9BF",
  dark: "#211913",
};

/**
 * Synchronise <meta name="theme-color"> avec le thème résolu par next-themes.
 * Nécessaire car next-themes ne gère pas ce meta : sans cela, la barre de statut
 * (Android Chrome notamment) suivrait l'OS via les media queries SSR même après
 * un override manuel du thème.
 */
export default function ThemeColorSync() {
  const { resolvedTheme } = useTheme();

  useEffect(() => {
    if (resolvedTheme !== "light" && resolvedTheme !== "dark") return;

    const color = THEME_COLORS[resolvedTheme];
    const metas = document.querySelectorAll<HTMLMetaElement>('meta[name="theme-color"]');

    if (metas.length === 0) {
      const meta = document.createElement("meta");
      meta.name = "theme-color";
      meta.content = color;
      document.head.appendChild(meta);
      return;
    }

    metas.forEach((meta) => {
      // Neutralise les media queries posées par viewport.themeColor pour imposer l'override
      meta.removeAttribute("media");
      meta.content = color;
    });
  }, [resolvedTheme]);

  return null;
}
