import Link from "next/link";

const links = [
  { href: "/#how-it-works", label: "Comment ça marche ?" },
  { href: "/#features", label: "Fonctionnalités" },
  { href: "/#contact", label: "Contact" },
] as const;

export default function NavLinks() {
  return (
    <nav className="hidden md:flex items-center gap-6" aria-label="Liens de navigation">
      {links.map(({ href, label }) => (
        <Link
          key={href}
          href={href}
          className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
          aria-label={label}
        >
          {label}
        </Link>
      ))}
    </nav>
  );
}
