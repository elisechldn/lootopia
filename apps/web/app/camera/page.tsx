"use client";

import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import dynamic from "next/dynamic";
import QRCode       from "qrcode";
import { toLanUrl } from "@/lib/lan-url";

const MarkerArTester = dynamic(() => import("@/components/partner/MarkerArTester"), {
    ssr: false,
    loading: () => (
        <div className="flex h-screen items-center justify-center text-sm text-muted-foreground">
            Chargement de la caméra AR…
        </div>
    ),
});

function isMobileUserAgent(ua: string): boolean {
    return /Mobi|Android|iPhone|iPad|iPod/i.test(ua);
}

export default function CameraPage() {
    const searchParams = useSearchParams();
    const pattern = searchParams.get("pattern");
    const glb = searchParams.get("glb");
    console.log("GLB => ", glb)

    const [device, setDevice] = useState<"checking" | "mobile" | "desktop">("checking");
    const [qrCodeUrl, setQrCodeUrl] = useState<string | null>(null);

    useEffect(() => {
        setDevice(isMobileUserAgent(navigator.userAgent) ? "mobile" : "desktop");
    }, []);

    useEffect(() => {
        if (device !== "desktop") return;
        QRCode.toDataURL(toLanUrl(window.location.href), { width: 256, margin: 1 })
            .then(setQrCodeUrl)
            .catch(() => setQrCodeUrl(null));
    }, [device]);

    if (!pattern) {
        return (
            <div className="flex h-screen items-center justify-center px-6 text-center text-sm text-muted-foreground">
                Aucun marqueur à tester. Revenez à l&apos;édition de la chasse et
                générez le QR code depuis l&apos;étape concernée.
            </div>
        );
    }

    if (device === "checking") {
        return (
            <div className="flex h-screen items-center justify-center text-sm text-muted-foreground">
                Chargement…
            </div>
        );
    }

    if (device === "desktop") {
        return (
            <div className="flex h-screen flex-col items-center justify-center gap-4 px-6 text-center">
                <h1 className="text-lg font-semibold">Test du marqueur AR</h1>
                <p className="max-w-sm text-sm text-muted-foreground">
                    Cette page est accessible uniquement depuis un mobile. Scannez le
                    QR code ci-dessous avec votre téléphone pour ouvrir la caméra de
                    test.
                </p>
                {qrCodeUrl && (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                        src={qrCodeUrl}
                        alt="QR code vers la page de test du marqueur"
                        className="size-64 rounded-lg border border-border"
                    />
                )}
            </div>
        );
    }

    return <MarkerArTester patternUrl={pattern} glbFilepath={glb} />;
}
