'use client';

import Link from 'next/link';

export default function RegisterConfirmPage() {
  return (
    <main className="min-h-screen flex flex-col items-center justify-center p-6 bg-background">
      <div className="w-full max-w-sm text-center">
        <h1 className="text-3xl font-bold mb-1">Lootopia</h1>
        <div className="flex justify-center my-6">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="w-12 h-12 text-green-500">
            <path strokeLinecap="round" strokeLinejoin="round" d="M21.75 6.75v10.5a2.25 2.25 0 01-2.25 2.25h-15a2.25 2.25 0 01-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25m19.5 0v.243a2.25 2.25 0 01-1.07 1.916l-7.5 4.615a2.25 2.25 0 01-2.36 0L3.32 8.91a2.25 2.25 0 01-1.07-1.916V6.75" />
          </svg>
        </div>
        <p className="text-muted-foreground text-sm mb-6">
          Un email de confirmation a été envoyé. Cliquez sur le lien pour activer votre compte.
        </p>
        <Link href="/login" className="text-primary font-medium underline underline-offset-2 text-sm">
          Retour à la connexion
        </Link>
      </div>
    </main>
  );
}
