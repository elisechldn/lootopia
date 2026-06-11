"use client";

import Link from "next/link";
import { useActionState, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import { Suspense } from "react";
import { verifyEmailAction } from "@/lib/actions/auth.actions";

function VerifyEmailContent() {
    const searchParams = useSearchParams();
    const token = searchParams.get("token") ?? "";
    const [state, action, isPending] = useActionState(verifyEmailAction, undefined);

    if (!token) {
        return (
            <div className="text-center">
                <p className="text-sm text-red-600 mb-4">Lien de vérification invalide.</p>
                <Link href="/register" className="text-sm text-foreground underline hover:text-muted-foreground">
                    Créer un compte
                </Link>
            </div>
        );
    }

    return (
        <div className="text-center">
            {state?.error ? (
                <>
                    <p className="text-sm text-red-600 mb-4">{state.error}</p>
                    <Link href="/register" className="text-sm text-foreground underline hover:text-muted-foreground">
                        Créer un nouveau compte
                    </Link>
                </>
            ) : (
                <form action={action}>
                    <input type="hidden" name="token" value={token} />
                    <p className="text-sm text-muted-foreground mb-6">
                        Cliquez sur le bouton pour confirmer votre email et accéder à votre compte.
                    </p>
                    <button
                        type="submit"
                        disabled={isPending}
                        className="w-full bg-gray-900 text-white text-sm font-semibold py-3 rounded-xl hover:bg-gray-800 transition-colors disabled:opacity-60"
                    >
                        {isPending ? 'Vérification...' : 'Confirmer mon email'}
                    </button>
                </form>
            )}
        </div>
    );
}

export default function VerifyEmailPage() {
    return (
        <div className="w-full max-w-sm bg-card rounded-2xl shadow-sm border border-border px-8 py-10">
            <div className="flex flex-col items-center gap-3 mb-8">
                <h1 className="text-xl font-bold text-foreground">Confirmation d&apos;email</h1>
            </div>
            <Suspense fallback={<p className="text-center text-sm text-muted-foreground">Chargement...</p>}>
                <VerifyEmailContent />
            </Suspense>
            <div className="mt-6 text-center">
                <Link href="/login" className="text-sm text-muted-foreground underline hover:text-foreground">
                    Retour à la connexion
                </Link>
            </div>
        </div>
    );
}
