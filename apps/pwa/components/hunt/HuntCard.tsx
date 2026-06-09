'use client';

import Image from 'next/image';
import { Trophy, ChevronRight } from 'lucide-react';
import type { NearbyHunt } from '@/services/hunt.service';
import { formatRewardType } from '@/lib/reward';
import { assetUrl } from '@/lib/assets';

function formatDist(meters: number | null): string | null {
  if (meters == null) return null;
  return meters < 1000 ? `${Math.round(meters)} m` : `${(meters / 1000).toFixed(1)} km`;
}

export function HuntCard({ hunt }: { hunt: NearbyHunt }) {
  const dist = formatDist(hunt.distance);
  const cover = assetUrl(hunt.coverImage);
  return (
    <div className="bg-card border border-border rounded-[25px] overflow-hidden h-[120px] flex items-stretch shadow-sm">
      {/* Image + titre en overlay (même pattern que HuntHero) */}
      <div className="relative w-1/2 shrink-0 bg-muted">
        {cover && (
          <Image
            src={cover}
            alt={hunt.title}
            fill
            className="object-cover"
            sizes="50vw"
          />
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-black via-black/20 to-transparent" />
        <p className="absolute bottom-2 left-2 right-2 font-black text-xl leading-7 tracking-[-0.5px] text-white truncate">
          {hunt.title}
        </p>
      </div>

      {/* Contenu */}
      <div className="flex-1 min-w-0 flex flex-col justify-start p-[10px] overflow-hidden">
        {hunt.rewardType && (
          <div className="flex items-center gap-[5px]">
            <Trophy size={16} className="text-amber-500 shrink-0" />
            <span className="font-semibold text-xs leading-7 tracking-[-0.5px] text-amber-500 truncate">
              {formatRewardType(hunt.rewardType)}
            </span>
          </div>
        )}

        {dist && (
          <div>
              <span className="font-semibold text-xs leading-7 tracking-[-0.5px] text-muted-foreground" >zone de départ:{' '}</span>
              <span className="bg-muted px-2 self-start border border-border rounded-full font-semibold text-xs leading-7 tracking-[-0.5px] text-muted-foreground">
              {dist}
            </span>
          </div>
        )}
      </div>

      {/* Chevron */}
      <div className="w-1/6 flex items-center justify-center shrink-0">
        <ChevronRight size={24} className="text-muted-foreground" />
      </div>
    </div>
  );
}
