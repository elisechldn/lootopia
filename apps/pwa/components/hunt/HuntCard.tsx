'use client';

import Image from 'next/image';
import { Trophy, MapPin } from 'lucide-react';
import type { NearbyHunt } from '@/services/hunt.service';
import { formatRewardType } from '@/lib/reward';
import { assetUrl } from '@/lib/assets';
import { 
  Card, 
  CardHeader, 
  CardTitle, 
  CardDescription, 
  CardContent 
} from '@/components/ui/card';

function formatDist(meters: number | null): string | null {
  if (meters == null) return null;
  return meters < 1000 ? `${Math.round(meters)} m` : `${(meters / 1000).toFixed(1)} km`;
}

export function HuntCard({ hunt }: { hunt: NearbyHunt }) {
  const dist = formatDist(hunt.distance);
  const cover = assetUrl(hunt.coverImage);

  return (
    <Card className="overflow-hidden flex flex-col sm:flex-row items-stretch border border-border bg-card shadow-sm transition-colors hover:bg-accent/50">
      {/* Zone Image / Header */}
      <CardHeader className="relative p-0 w-full sm:w-1/2 h-32 sm:h-auto shrink-0 bg-muted">
        {cover && (
          <Image
            src={cover}
            alt={hunt.title}
            fill
            className="object-cover"
            sizes="(max-width: 640px) 100vw, 50vw"
          />
        )}
        {/* Overlay pour le texte et le dégradé */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />
        
        {dist && (
          <span className="absolute top-2 right-2 flex items-center gap-1 text-[11px] font-semibold bg-black/60 text-white px-2 py-0.5 rounded-full backdrop-blur-xs">
            <MapPin size={10} /> {dist}
          </span>
        )}
        
        <CardTitle className="absolute bottom-2 left-3 right-3 font-black text-sm text-white truncate">
          {hunt.title}
        </CardTitle>
      </CardHeader>

      {/* Zone Contenu / Description */}
      <CardContent className="flex-1 p-3 flex flex-col justify-between gap-2 min-w-0">
        <CardDescription className="text-xs text-muted-foreground line-clamp-2">
          {hunt.shortDescription || "Aucune description disponible."}
        </CardDescription>

        {/* Section récompense (Anciennement CardAction custom) */}
        {hunt.rewardType && (
          <div className="flex items-center gap-1.5 text-amber-500 mt-auto">
            <Trophy size={14} className="shrink-0" />
            <span className="font-semibold text-xs truncate">
              {formatRewardType(hunt.rewardType)} {hunt.rewardType ? `(${hunt.rewardType})` : ''}
            </span>
          </div>
        )}
      </CardContent>
    </Card>
  );
}