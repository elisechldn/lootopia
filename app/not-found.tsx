import { Button } from "@/components/ui/button";
import Link from "next/link";

export default function NotFound() {
  return (
    <div className="flex min-h-[calc(100vh-4rem)] flex-col items-center justify-center gap-6 px-4">
      <h1 className="text-6xl font-bold tabular-nums text-muted-foreground">404</h1>
      <h2 className="text-xl font-semibold">Page introuvable</h2>
      <p className="max-w-sm text-center text-muted-foreground">La ressource demandée n’a pas été trouvée.</p>
      <Button asChild>
        <Link href="/">Retour à l’accueil</Link>
      </Button>
    </div>
  );
}
