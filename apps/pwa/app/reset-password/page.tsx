'use client';

import { useState, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { resetPasswordAction } from '@/lib/actions/auth.actions';

function ResetPasswordForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get('token') ?? '';

  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  if (!token) {
    return (
      <div className="text-center space-y-4">
        <p className="text-sm text-muted-foreground">
          Ce lien de réinitialisation est invalide ou a expiré.
        </p>
        <Link href="/forgot-password" className="text-primary font-medium underline underline-offset-2 text-sm active:opacity-70">
          Demander un nouveau lien
        </Link>
      </div>
    );
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (password !== confirm) {
      setError('Les mots de passe ne correspondent pas');
      return;
    }
    setLoading(true);
    setError('');
    try {
      await resetPasswordAction(token, password);
      router.replace('/login');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Token invalide ou expiré');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-1">
        <label className="text-sm font-medium">Nouveau mot de passe</label>
        <input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
          minLength={8}
          autoComplete="new-password"
          className="w-full px-3 py-2.5 border border-border rounded-lg text-sm bg-background focus:outline-none focus:ring-2 focus:ring-ring"
        />
      </div>

      <div className="space-y-1">
        <label className="text-sm font-medium">Confirmer le mot de passe</label>
        <input
          type="password"
          value={confirm}
          onChange={(e) => setConfirm(e.target.value)}
          required
          minLength={8}
          autoComplete="new-password"
          className="w-full px-3 py-2.5 border border-border rounded-lg text-sm bg-background focus:outline-none focus:ring-2 focus:ring-ring"
        />
      </div>

      {error && <p className="text-sm text-destructive">{error}</p>}

      <button
        type="submit"
        disabled={loading}
        className="w-full py-3 bg-primary text-primary-foreground rounded-lg font-semibold text-sm disabled:opacity-50 transition-opacity active:opacity-90"
      >
        {loading ? 'Réinitialisation...' : 'Réinitialiser le mot de passe'}
      </button>
    </form>
  );
}

export default function ResetPasswordPage() {
  console.log("cpicpi")
  return (
    <main className="min-h-screen flex flex-col items-center justify-center p-6 bg-background">
      <div className="w-full max-w-sm">
        <h1 className="text-3xl font-bold text-center mb-1">Lootopia</h1>
        <p className="text-muted-foreground text-center mb-8 text-sm">
          Nouveau mot de passe
        </p>

        <Suspense fallback={<p className="text-center text-sm text-muted-foreground">Chargement...</p>}>
          <ResetPasswordForm />
        </Suspense>

        <p className="text-center text-sm mt-6">
          <Link href="/login" className="text-primary font-medium underline underline-offset-2 active:opacity-70">
            Retour à la connexion
          </Link>
        </p>
      </div>
    </main>
  );
}
