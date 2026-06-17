'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { registerPlayerSchema, type RegisterPlayerFormData } from '@repo/types/auth';
import { registerPlayer } from '@/services/auth.service';

export default function RegisterPage() {
  const router = useRouter();
  const [serverError, setServerError] = useState('');

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<RegisterPlayerFormData>({
    resolver: zodResolver(registerPlayerSchema),
  });

  const onSubmit = async (data: RegisterPlayerFormData) => {
    setServerError('');
    try {
      await registerPlayer({
        firstname: data.firstname,
        lastname: data.lastname,
        email: data.email,
        password: data.password,
      });
      router.push('/register/confirm');
    } catch (err) {
      setServerError(
        err instanceof Error ? err.message : "Erreur lors de l'inscription",
      );
    }
  };

  return (
    <main className="min-h-screen flex flex-col items-center justify-center p-6 bg-background">
      <div className="w-full max-w-sm">
        <h1 className="text-3xl font-bold text-center mb-1">Lootopia</h1>
        <p className="text-muted-foreground text-center mb-8 text-sm">
          Créez votre compte joueur
        </p>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1">
              <label className="text-sm font-medium">Prénom</label>
              <input
                {...register('firstname')}
                className="w-full px-3 py-2.5 border border-border rounded-lg text-sm bg-background focus:outline-none focus:ring-2 focus:ring-ring"
              />
              {errors.firstname && (
                <p className="text-sm text-destructive">
                  {errors.firstname.message}
                </p>
              )}
            </div>
            <div className="space-y-1">
              <label className="text-sm font-medium">Nom</label>
              <input
                {...register('lastname')}
                className="w-full px-3 py-2.5 border border-border rounded-lg text-sm bg-background focus:outline-none focus:ring-2 focus:ring-ring"
              />
              {errors.lastname && (
                <p className="text-sm text-destructive">
                  {errors.lastname.message}
                </p>
              )}
            </div>
          </div>

          <div className="space-y-1">
            <label className="text-sm font-medium">Email</label>
            <input
              type="email"
              {...register('email')}
              autoComplete="email"
              className="w-full px-3 py-2.5 border border-border rounded-lg text-sm bg-background focus:outline-none focus:ring-2 focus:ring-ring"
            />
            {errors.email && (
              <p className="text-sm text-destructive">{errors.email.message}</p>
            )}
          </div>

          <div className="space-y-1">
            <label className="text-sm font-medium">Mot de passe</label>
            <input
              type="password"
              {...register('password')}
              autoComplete="new-password"
              className="w-full px-3 py-2.5 border border-border rounded-lg text-sm bg-background focus:outline-none focus:ring-2 focus:ring-ring"
            />
            {errors.password && (
              <p className="text-sm text-destructive">
                {errors.password.message}
              </p>
            )}
          </div>

          <div className="space-y-1">
            <label className="text-sm font-medium">
              Confirmation mot de passe
            </label>
            <input
              type="password"
              {...register('confirmPassword')}
              autoComplete="new-password"
              className="w-full px-3 py-2.5 border border-border rounded-lg text-sm bg-background focus:outline-none focus:ring-2 focus:ring-ring"
            />
            {errors.confirmPassword && (
              <p className="text-sm text-destructive">
                {errors.confirmPassword.message}
              </p>
            )}
          </div>

          {serverError && (
            <p className="text-sm text-destructive">{serverError}</p>
          )}

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full py-3 bg-primary text-primary-foreground rounded-lg font-semibold text-sm disabled:opacity-50 transition-opacity active:opacity-90"
          >
            {isSubmitting ? 'Création...' : "S'inscrire"}
          </button>
        </form>

        <p className="text-center text-sm mt-6">
          Déjà un compte ?{' '}
          <Link
            href="/login"
            className="text-primary font-medium underline underline-offset-2 active:opacity-70"
          >
            Se connecter
          </Link>
        </p>
      </div>
    </main>
  );
}
