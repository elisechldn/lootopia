import Link from "next/link";

export default function SupportPage() {
  return (
    <main className="min-h-screen bg-card flex items-center justify-center px-6">
      <div className="text-center max-w-md">
        <div className="text-6xl mb-6">🚧</div>
        <h1 className="text-2xl font-bold text-foreground mb-3">
          Page en cours de construction
        </h1>
        <p className="text-foreground/70 leading-relaxed mb-8">
          Notre centre d&apos;aide arrive bientôt. En attendant, contactez-nous
          à{" "}
          <a
            href="mailto:support@lootopia.fr"
            className="underline hover:text-foreground transition-colors"
          >
            support@lootopia.fr
          </a>
          .
        </p>
        <Link
          href="/"
          className="text-sm text-foreground/60 underline hover:text-foreground transition-colors"
        >
          ← Retour à l&apos;accueil
        </Link>
      </div>
    </main>
  );
}
