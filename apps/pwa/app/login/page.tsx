'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { loginSchema, type LoginFormData } from '@repo/types/auth';
import { loginAction } from '@/lib/actions/auth.actions';
import { useUserStore } from '@/store/userStore';

export default function LoginPage() {
  const router = useRouter();
  const { setUser } = useUserStore();
  const [serverError, setServerError] = useState('');

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
  });

  const onSubmit = async (data: LoginFormData) => {
    setServerError('');
    try {
      const { user } = await loginAction(data.email, data.password);
      setUser(user);
      router.replace('/');
    } catch (err) {
      setServerError(err instanceof Error ? err.message : 'Erreur de connexion');
    }
  };

  return (
    <main className="min-h-screen flex flex-col items-center justify-center p-6 bg-background">
      <div className="w-full max-w-sm">
        <h1 className="text-3xl font-bold text-center mb-1">Lootopia</h1>
        <p className="text-muted-foreground text-center mb-8 text-sm">
          Connectez-vous pour jouer
        </p>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
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
              autoComplete="current-password"
              className="w-full px-3 py-2.5 border border-border rounded-lg text-sm bg-background focus:outline-none focus:ring-2 focus:ring-ring"
            />
            {errors.password && (
              <p className="text-sm text-destructive">{errors.password.message}</p>
            )}
          </div>

          <div className="flex justify-end">
            <Link
              href="/forgot-password"
              className="text-sm text-primary underline underline-offset-2 active:opacity-70"
            >
              Mot de passe oublié ?
            </Link>
          </div>

          {serverError && (
            <p className="text-sm text-destructive">{serverError}</p>
          )}

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full py-3 bg-primary text-primary-foreground rounded-lg font-semibold text-sm disabled:opacity-50 transition-opacity active:opacity-90"
          >
            {isSubmitting ? 'Connexion...' : 'Se connecter'}
          </button>
        </form>

        <p className="text-center text-sm mt-6">
          Pas encore de compte ?{' '}
          <Link
            href="/register"
            className="text-primary font-medium underline underline-offset-2 active:opacity-70"
          >
            S&apos;inscrire
          </Link>
        </p>
      </div>
    </main>
  );
}
