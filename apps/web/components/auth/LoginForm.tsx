"use client";

import { useState } from "react";
import Link from "next/link";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { loginSchema, type LoginFormData } from "@repo/types/auth";
import { loginAction } from "@/lib/actions/auth.actions";

export default function LoginForm() {
    const [serverError, setServerError] = useState<string | null>(null);

    const {
        register,
        handleSubmit,
        formState: { errors, isSubmitting },
    } = useForm<LoginFormData>({
        resolver: zodResolver(loginSchema),
    });

    const onSubmit = async (data: LoginFormData) => {
        setServerError(null);
        const formData = new FormData();
        formData.set("email", data.email);
        formData.set("password", data.password);
        const result = await loginAction(undefined, formData);
        if (result?.error) {
            setServerError(result.error);
        }
    };

    return (
        <div className="w-full max-w-sm bg-card rounded-2xl shadow-sm border border-border px-8 py-10">
            <div className="flex flex-col items-center gap-3 mb-8">
                <h1 className="text-xl font-bold text-foreground">Connexion</h1>
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="w-10 h-10 text-foreground">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9 6.75V15m6-6v8.25m.503 3.498l4.875-2.437c.381-.19.622-.58.622-1.006V4.82c0-.836-.88-1.38-1.628-1.006l-3.869 1.934c-.317.159-.69.159-1.006 0L9.503 3.252a1.125 1.125 0 00-1.006 0L3.622 5.689C3.24 5.88 3 6.27 3 6.695V19.18c0 .836.88 1.38 1.628 1.006l3.869-1.934c.317-.159.69-.159 1.006 0l4.994 2.497c.317.158.69.158 1.006 0z"/>
                </svg>
            </div>

            {serverError && (
                <div className="mb-4 px-4 py-3 rounded-lg bg-red-50 border border-red-100 text-sm text-red-600">
                    {serverError}
                </div>
            )}

            <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-3 mb-6">
                <div>
                    <input
                        type="email"
                        placeholder="Email"
                        autoComplete="email"
                        {...register("email")}
                        className="w-full px-4 py-3 rounded-lg border border-border text-sm text-foreground placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-900"
                    />
                    {errors.email && (
                        <p className="mt-1 text-sm text-red-600">{errors.email.message}</p>
                    )}
                </div>
                <div>
                    <input
                        type="password"
                        placeholder="Mot de passe"
                        autoComplete="current-password"
                        {...register("password")}
                        className="w-full px-4 py-3 rounded-lg border border-border text-sm text-foreground placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-900"
                    />
                    {errors.password && (
                        <p className="mt-1 text-sm text-red-600">{errors.password.message}</p>
                    )}
                </div>

                <div className="flex items-center justify-between">
                    <label className="flex items-center gap-2 text-sm text-muted-foreground cursor-pointer">
                        <input type="checkbox" className="w-4 h-4 rounded border-gray-300" />
                        Se souvenir de moi
                    </label>
                    <Link href="/forgot-password" className="text-sm text-foreground underline hover:text-muted-foreground">
                        Mot de passe oublié ?
                    </Link>
                </div>

                <button type="submit" disabled={isSubmitting}
                        className="w-full bg-gray-900 text-white text-sm font-semibold py-3 rounded-xl hover:bg-gray-800 transition-colors disabled:opacity-60 mt-2">
                    {isSubmitting ? 'Connexion...' : 'Se connecter'}
                </button>
                <div className="text-sm flex justify-between items-center">
                    <p>Vous n&apos;avez pas de compte ?</p>
                    <Link href="/register" className="text-sm text-foreground underline hover:text-muted-foreground">
                        inscrivez-vous
                    </Link>
                </div>
            </form>
        </div>
    );
}
