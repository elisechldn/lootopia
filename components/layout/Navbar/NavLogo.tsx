import Link from "next/link";

export default function NavLogo() {
  return (
    <Link
      href="/"
      className="font-bold text-lg tracking-tight text-foreground hover:text-foreground/90 transition-colors"
      aria-label="Lootopia - Retour à l'accueil"
    >
      Lootopia
    </Link>
  );
}
