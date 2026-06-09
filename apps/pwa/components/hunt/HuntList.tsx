'use client';

import Link from 'next/link';
import { MapPin } from 'lucide-react';
import type { NearbyHunt } from '@/services/hunt.service';
import { HuntCard } from './HuntCard';

interface HuntListProps {
  hunts: NearbyHunt[];
  ref?: React.Ref<HTMLDivElement>;
}

export function HuntList({ hunts, ref }: HuntListProps) {
  return (
    <div ref={ref} className="flex-1 overflow-y-auto overscroll-y-none">
      {hunts.length === 0 ? (
        <div className="h-full flex flex-col items-center justify-center gap-2 px-4 text-center">
          <MapPin size={40} className="text-muted-foreground/40" />
          <p className="font-medium">Aucune chasse à proximité</p>
          <p className="text-sm text-muted-foreground">
            Essayez d&apos;agrandir la zone de recherche
          </p>
        </div>
      ) : (
        <div className="px-4 pb-4 pt-2 space-y-3 flex flex-col">
          {hunts.map((hunt) => (
            <Link key={hunt.id} href={`/hunts/${hunt.id}`} className="block transition-transform active:scale-[0.98]">
              <HuntCard hunt={hunt} />
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
