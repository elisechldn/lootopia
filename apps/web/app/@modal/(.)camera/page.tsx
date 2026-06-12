"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import QRCode       from "qrcode";
import { toLanUrl } from "@/lib/lan-url";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
}                   from "@/components/ui/dialog";

export default function CameraInterceptedModal() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const pattern = searchParams.get("pattern");

    const [qrCodeUrl, setQrCodeUrl] = useState<string | null>(null);

    useEffect(() => {
        QRCode.toDataURL(toLanUrl(window.location.href), { width: 256, margin: 1 })
            .then(setQrCodeUrl)
            .catch(() => setQrCodeUrl(null));
    }, []);

    return (
        <Dialog
            open
            onOpenChange={(open) => {
                if (!open) router.back();
            }}
        >
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>Tester le marqueur sur mobile</DialogTitle>
                    <DialogDescription>
                        Scannez ce QR code avec votre téléphone pour ouvrir la
                        caméra de test du marqueur.
                    </DialogDescription>
                </DialogHeader>

                {!pattern ? (
                    <p className="text-sm text-muted-foreground">
                        Aucun marqueur à tester.
                    </p>
                ) : qrCodeUrl ? (
                    <div className="flex justify-center">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                            src={qrCodeUrl}
                            alt="QR code vers la page de test du marqueur"
                            className="size-64 rounded-lg border border-border"
                        />
                    </div>
                ) : (
                    <p className="text-sm text-muted-foreground">
                        Génération du QR code…
                    </p>
                )}
            </DialogContent>
        </Dialog>
    );
}
