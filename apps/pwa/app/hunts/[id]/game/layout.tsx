'use client';

import { useRouter } from 'next/navigation';
import { ArrowLeft } from 'lucide-react';

export default function GameLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();

  return (
    <div className="relative">
      <button
        onClick={() => router.back()}
        className="absolute top-4 left-4 z-[500] flex h-10 w-10 items-center justify-center rounded-full bg-black/30 backdrop-blur-md transition-colors hover:bg-black/50"
        aria-label="Retour"
      >
        <ArrowLeft size={18} className="text-white" />
      </button>
      {children}
    </div>
  );
}
