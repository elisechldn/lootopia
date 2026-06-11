"use client";

import { ThemeProvider as NextThemesProvider } from "next-themes";
import ThemeColorSync from "@/components/providers/ThemeColorSync";

export default function ThemeProvider({ children }: { children: React.ReactNode }) {
  return (
    <NextThemesProvider
      attribute="class" // pose .dark sur <html> → matche @custom-variant dark de globals.css
      defaultTheme="system"
      enableSystem
      disableTransitionOnChange
    >
      <ThemeColorSync />
      {children}
    </NextThemesProvider>
  );
}
