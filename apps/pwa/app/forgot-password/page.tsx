'use client';

import { useState } from 'react';
import Link from 'next/link';
import { forgotPasswordAction } from '@/lib/actions/auth.actions';

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await forgotPasswordAction(email);
    } finally {
      setLoading(false);
      setSubmitted(true);
    }
  };

  return (
    <main className="min-h-screen flex flex-col items-center justify-center p-6 bg-background">
      <div className="w-full max-w-sm">
        <h1 className="text-3xl font-bold text-center mb-1">Lootopia</h1>
        <p className="text-muted-foreground text-center mb-8 text-sm">
          Réinitialisation du mot de passe
        </p>

        {submitted ? (
          <div className="rounded-lg bg-green-50 border border-green-200 px-4 py-3 text-sm text-green-700 text-center">
            Si cet email est associé à un compte, un lien de réinitialisation a été envoyé.
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-1">
              <label className="text-sm font-medium">Email</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                autoComplete="email"
                className="w-full px-3 py-2.5 border border-border rounded-lg text-sm bg-background focus:outline-none focus:ring-2 focus:ring-ring"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 bg-primary text-primary-foreground rounded-lg font-semibold text-sm disabled:opacity-50 transition-opacity"
            >
              {loading ? 'Envoi...' : 'Envoyer le lien'}
            </button>
          </form>
        )}

        <p className="text-center text-sm mt-6">
          <Link href="/login" className="text-primary font-medium underline underline-offset-2">
            Retour à la connexion
          </Link>
        </p>
      </div>
    </main>
  );
}
