"use client";

import Link from "next/link";
import { useActionState } from "react";
import { resetPasswordAction } from "@/lib/actions/auth.actions";

export default function ResetPasswordForm({ token }: { token: string }) {
    const [state, action, isPending] = useActionState(resetPasswordAction, undefined);

    return (
        <div className="w-full max-w-sm bg-card rounded-2xl shadow-sm border border-border px-8 py-10">
            <div className="flex flex-col items-center gap-3 mb-8">
                <h1 className="text-xl font-bold text-foreground">Nouveau mot de passe</h1>
                <p className="text-sm text-muted-foreground text-center">
                    Choisis un nouveau mot de passe pour ton compte.
                </p>
            </div>

            {state?.error && (
                <div className="mb-4 px-4 py-3 rounded-lg bg-red-50 border border-red-100 text-sm text-red-600">
                    {state.error}
                </div>
            )}

            <form action={action} className="flex flex-col gap-3">
                <input type="hidden" name="token" value={token} />
                <input
                    name="password"
                    type="password"
                    placeholder="Nouveau mot de passe"
                    required
                    minLength={8}
                    className="w-full px-4 py-3 rounded-lg border border-border text-sm text-foreground placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-900"
                />
                <input
                    name="confirmPassword"
                    type="password"
                    placeholder="Confirmer le mot de passe"
                    required
                    minLength={8}
                    className="w-full px-4 py-3 rounded-lg border border-border text-sm text-foreground placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-900"
                />
                <button
                    type="submit"
                    disabled={isPending}
                    className="w-full bg-gray-900 text-white text-sm font-semibold py-3 rounded-xl hover:bg-gray-800 transition-colors disabled:opacity-60 mt-2"
                >
                    {isPending ? 'Réinitialisation...' : 'Réinitialiser le mot de passe'}
                </button>
            </form>

            <div className="mt-6 text-center">
                <Link href="/login" className="text-sm text-muted-foreground underline hover:text-foreground">
                    Retour à la connexion
                </Link>
            </div>
        </div>
    );
}
