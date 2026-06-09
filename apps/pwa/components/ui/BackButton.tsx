"use client";

import Link from "next/link";
import { ArrowLeft } from "lucide-react";

type Props = {
  href?: string;
  onClick?: () => void;
  variant?: "overlay" | "muted";
  className?: string;
};

const VARIANT_CLASSES = {
  overlay: "bg-black/30 text-white hover:bg-black/50",
  muted: "bg-muted hover:bg-muted/80",
};

export default function BackButton({ href, onClick, variant = "overlay", className = "" }: Props) {
  const cn = `flex h-9 w-9 items-center justify-center rounded-full transition-colors ${VARIANT_CLASSES[variant]} ${className}`;

  if (href) {
    return (
      <Link href={href} className={cn} aria-label="Retour">
        <ArrowLeft size={18} />
      </Link>
    );
  }

  return (
    <button onClick={onClick} className={cn} aria-label="Retour">
      <ArrowLeft size={18} />
    </button>
  );
}
