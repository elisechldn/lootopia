'use client';

import Link from 'next/link';
import { MapPin, Trophy, ChevronRight } from 'lucide-react';
import type { NearbyHunt }              from '@/services/hunt.service';

function formatDist(meters: number | null): string | null {
  if (meters == null) return null;
  return meters < 1000 ? `${Math.round(meters)} m` : `${(meters / 1000).toFixed(1)} km`;
}

function HuntCard({ hunt }: { hunt: NearbyHunt }) {
  const dist = formatDist(hunt.distance);

  return (
    <div className="bg-card border border-border rounded-xl overflow-hidden flex flex-col shadow-sm">
      <div className="h-24 bg-muted relative">
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
        {dist && (
          <span className="absolute top-2 right-2 flex items-center gap-1 text-xs bg-black/50 text-white px-2 py-0.5 rounded-full">
            <MapPin size={10} /> {dist}
          </span>
        )}
        <p className="absolute bottom-2 left-3 right-3 text-white font-semibold text-sm leading-tight line-clamp-1">
          {hunt.title}
        </p>
      </div>

      <div className="p-3 flex items-start justify-between gap-2">
        <div className="flex-1 min-w-0">
          {hunt.shortDescription && (
            <p className="text-xs text-muted-foreground line-clamp-2">{hunt.shortDescription}</p>
          )}
          {hunt.rewardValue && (
            <div className="flex items-center gap-1 mt-1.5 text-xs text-amber-600 dark:text-amber-400">
              <Trophy size={11} />
              <span className="truncate">{hunt.rewardValue}</span>
            </div>
          )}
        </div>
        <ChevronRight size={16} className="text-muted-foreground flex-shrink-0 mt-0.5" />
      </div>
    </div>
  );
}

export function HuntList({ hunts }: { hunts: NearbyHunt[] }) {
  if (hunts.length === 0) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center gap-2 px-4 text-center">
        <MapPin size={40} className="text-muted-foreground/40" />
        <p className="font-medium">Aucune chasse à proximité</p>
        <p className="text-sm text-muted-foreground">
          Essayez d&apos;agrandir la zone de recherche
        </p>
      </div>
    );
  }

  return (
    <div className="overflow-y-auto px-4 pb-4 pt-2 space-y-3 flex flex-col">
      {hunts.map((hunt) => (
        <Link key={hunt.id} href={`/hunts/${hunt.id}`}>
          <HuntCard hunt={hunt} />
        </Link>
      ))}
    </div>
  );
}
