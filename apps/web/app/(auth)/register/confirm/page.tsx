import Link from "next/link";

export default function RegisterConfirmPage() {
    return (
        <div className="w-full max-w-sm bg-card rounded-2xl shadow-sm border border-border px-8 py-10 text-center">
            <div className="flex flex-col items-center gap-4 mb-6">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="w-12 h-12 text-green-500">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M21.75 6.75v10.5a2.25 2.25 0 01-2.25 2.25h-15a2.25 2.25 0 01-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25m19.5 0v.243a2.25 2.25 0 01-1.07 1.916l-7.5 4.615a2.25 2.25 0 01-2.36 0L3.32 8.91a2.25 2.25 0 01-1.07-1.916V6.75" />
                </svg>
                <h1 className="text-xl font-bold text-foreground">Vérifiez votre email</h1>
            </div>
            <p className="text-sm text-muted-foreground mb-6">
                Un email de confirmation a été envoyé à votre adresse. Cliquez sur le lien dans l&apos;email pour activer votre compte.
            </p>
            <Link href="/login" className="text-sm text-foreground underline hover:text-muted-foreground">
                Retour à la connexion
            </Link>
        </div>
    );
}
