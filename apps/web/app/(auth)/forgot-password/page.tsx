"use client";

import Link from "next/link";
import { useActionState } from "react";
import { forgotPasswordAction } from "@/lib/actions/auth.actions";

export default function ForgotPasswordPage() {
    const [state, action, isPending] = useActionState(forgotPasswordAction, undefined);

    return (
        <div className="w-full max-w-sm bg-card rounded-2xl shadow-sm border border-border px-8 py-10">
            <div className="flex flex-col items-center gap-3 mb-8">
                <h1 className="text-xl font-bold text-foreground">Mot de passe oublié</h1>
                <p className="text-sm text-muted-foreground text-center">
                    Saisis ton email et nous t&apos;enverrons un lien de réinitialisation.
                </p>
            </div>

            {state?.success ? (
                <div className="px-4 py-3 rounded-lg bg-green-50 border border-green-100 text-sm text-green-700 text-center">
                    Si cet email est associé à un compte, un lien de réinitialisation a été envoyé.
                </div>
            ) : (
                <form action={action} className="flex flex-col gap-3">
                    <input
                        name="email"
                        type="email"
                        placeholder="Email"
                        required
                        className="w-full px-4 py-3 rounded-lg border border-border text-sm text-foreground placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-900"
                    />
                    <button
                        type="submit"
                        disabled={isPending}
                        className="w-full bg-gray-900 text-white text-sm font-semibold py-3 rounded-xl hover:bg-gray-800 transition-colors disabled:opacity-60 mt-2"
                    >
                        {isPending ? 'Envoi...' : 'Envoyer le lien'}
                    </button>
                </form>
            )}

            <div className="mt-6 text-center">
                <Link href="/login" className="text-sm text-muted-foreground underline hover:text-foreground">
                    Retour à la connexion
                </Link>
            </div>
        </div>
    );
}
