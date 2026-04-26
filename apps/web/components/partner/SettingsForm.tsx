"use client";

import { useState, useEffect } from "react";

type Theme = "light" | "dark" | "system";

export default function SettingsForm() {
    const [theme, setTheme] = useState<Theme>("system");
    const [mounted, setMounted] = useState(false);

    const applyTheme = (t: Theme) => {
        const root = document.documentElement;
        if (t === "dark") {
            root.classList.add("dark");
        } else if (t === "light") {
            root.classList.remove("dark");
        } else {
            const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
            prefersDark ? root.classList.add("dark") : root.classList.remove("dark");
        }
    };

    useEffect(() => {
        const storedTheme = localStorage.getItem("lootopia_theme") as Theme | null;
        if (storedTheme) setTheme(storedTheme);
        applyTheme(storedTheme ?? "system");
        setMounted(true);
    }, []);

    const handleThemeChange = (t: Theme) => {
        setTheme(t);
        localStorage.setItem("lootopia_theme", t);
        applyTheme(t);
    };

    const themes: { value: Theme; label: string; icon: React.ReactNode }[] = [
        {
            value: "light",
            label: "Clair",
            icon: (
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="w-5 h-5">
                    <path strokeLinecap="round" strokeLinejoin="round"
                          d="M12 3v2.25m6.364.386l-1.591 1.591M21 12h-2.25m-.386 6.364l-1.591-1.591M12 18.75V21m-4.773-4.227l-1.591 1.591M5.25 12H3m4.227-4.773L5.636 5.636M15.75 12a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0z"/>
                </svg>
            ),
        },
        {
            value: "dark",
            label: "Sombre",
            icon: (
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="w-5 h-5">
                    <path strokeLinecap="round" strokeLinejoin="round"
                          d="M21.752 15.002A9.718 9.718 0 0118 15.75c-5.385 0-9.75-4.365-9.75-9.75 0-1.33.266-2.597.748-3.752A9.753 9.753 0 003 11.25C3 16.635 7.365 21 12.75 21a9.753 9.753 0 009.002-5.998z"/>
                </svg>
            ),
        },
        {
            value: "system",
            label: "Système",
            icon: (
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="w-5 h-5">
                    <path strokeLinecap="round" strokeLinejoin="round"
                          d="M9 17.25v1.007a3 3 0 01-.879 2.122L7.5 21h9l-.621-.621A3 3 0 0115 18.257V17.25m6-12V15a2.25 2.25 0 01-2.25 2.25H5.25A2.25 2.25 0 013 15V5.25m18 0A2.25 2.25 0 0018.75 3H5.25A2.25 2.25 0 003 5.25m18 0H3"/>
                </svg>
            ),
        },
    ];

    if (!mounted) return null;

    return (
        <div className="space-y-6">
            <div className="bg-card border border-border rounded-xl p-6 space-y-4">
                <h2 className="text-sm font-semibold text-foreground">Apparence</h2>
                <p className="text-xs text-muted-foreground/70">
                    Choisissez le thème de l&apos;interface.
                </p>
                <div className="grid grid-cols-3 gap-3">
                    {themes.map((t) => (
                        <button
                            key={t.value}
                            onClick={() => handleThemeChange(t.value)}
                            className={`flex flex-col items-center gap-2 p-4 rounded-xl border-2 transition-colors ${
                                theme === t.value
                                    ? "border-primary bg-muted/50"
                                    : "border-border hover:border-muted-foreground/30 hover:bg-muted/50"
                            }`}
                        >
                            <div className={theme === t.value ? "text-foreground" : "text-muted-foreground/70"}>
                                {t.icon}
                            </div>
                            <span className={`text-xs font-medium ${
                                theme === t.value ? "text-foreground" : "text-muted-foreground"
                            }`}>
                                {t.label}
                            </span>
                        </button>
                    ))}
                </div>
            </div>
        </div>
    );
}