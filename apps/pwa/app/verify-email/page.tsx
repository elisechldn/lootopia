'use client';

import { useState, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { verifyEmailAction } from '@/lib/actions/auth.actions';
import { useUserStore } from '@/store/userStore';

function VerifyEmailForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get('token') ?? '';
  const { setUser } = useUserStore();
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  if (!token) {
    return (
      <div className="text-center space-y-4">
        <p className="text-sm text-destructive">Lien de vérification invalide.</p>
        <Link href="/register" className="text-primary font-medium underline underline-offset-2 text-sm">
          Créer un compte
        </Link>
      </div>
    );
  }

  const handleVerify = async () => {
    setLoading(true);
    setError('');
    try {
      const { user } = await verifyEmailAction(token);
      setUser(user);
      router.replace('/');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Lien invalide ou expiré');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-4">
      {error ? (
        <>
          <p className="text-sm text-destructive text-center">{error}</p>
          <Link href="/register" className="block text-center text-primary font-medium underline underline-offset-2 text-sm">
            Créer un nouveau compte
          </Link>
        </>
      ) : (
        <>
          <p className="text-muted-foreground text-sm text-center mb-4">
            Cliquez pour confirmer votre email et accéder à votre compte.
          </p>
          <button
            onClick={handleVerify}
            disabled={loading}
            className="w-full py-3 bg-primary text-primary-foreground rounded-lg font-semibold text-sm disabled:opacity-50 transition-opacity"
          >
            {loading ? 'Vérification...' : 'Confirmer mon email'}
          </button>
        </>
      )}
    </div>
  );
}

export default function VerifyEmailPage() {
  return (
    <main className="min-h-screen flex flex-col items-center justify-center p-6 bg-background">
      <div className="w-full max-w-sm">
        <h1 className="text-3xl font-bold text-center mb-1">Lootopia</h1>
        <p className="text-muted-foreground text-center mb-8 text-sm">
          Confirmation d&apos;email
        </p>
        <Suspense fallback={<p className="text-center text-sm text-muted-foreground">Chargement...</p>}>
          <VerifyEmailForm />
        </Suspense>
        <p className="text-center text-sm mt-6">
          <Link href="/login" className="text-primary font-medium underline underline-offset-2">
            Retour à la connexion
          </Link>
        </p>
      </div>
    </main>
  );
}
