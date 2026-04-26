"use client";

import { useEffect, useState } from "react";

export default function ThemeWrapper({ children }: { children: React.ReactNode }) {
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
    }, []);

    if (!mounted) {
        return (
            <div className="flex min-h-screen" style={{ visibility: "hidden" }}>
                {children}
            </div>
        );
    }

    return (
        <div className="flex min-h-screen">
            {children}
        </div>
    );
}