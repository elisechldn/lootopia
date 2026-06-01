import Link from "next/link";
import { ArrowLeft } from "lucide-react";

interface HuntHeroProps {
  title: string;
  imageUrl?: string;
  backHref?: string;
}

export default function HuntHero({ title, imageUrl, backHref }: HuntHeroProps) {
    console.log("IMG -> ", imageUrl)
  return (
    <div className="relative h-64 w-full overflow-hidden bg-neutral-900">
      {imageUrl && (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={imageUrl}
          alt={title}
          className="absolute inset-0 h-full w-full object-cover"
        />
      )}
      <div className="absolute inset-0 bg-gradient-to-t from-black via-black/20 to-transparent" />
      {backHref && (
        <Link
          href={backHref}
          className="absolute top-4 left-4 flex h-9 w-9 items-center justify-center rounded-full bg-black/30 text-white transition-colors hover:bg-black/50"
          aria-label="Retour"
        >
          <ArrowLeft size={18} />
        </Link>
      )}
      <h1 className="absolute bottom-4 left-4 right-4 text-2xl font-bold text-white">
        {title}
      </h1>
    </div>
  );
}
