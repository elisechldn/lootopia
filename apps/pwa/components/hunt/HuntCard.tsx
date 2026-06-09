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
    <div className="bg-card border border-border rounded-[25px] overflow-hidden flex items-stretch shadow-sm">
      {/* Image */}
      <div className="relative w-[177px] shrink-0 bg-muted">
        {cover && (
          <Image
            src={cover}
            alt={hunt.title}
            fill
            className="object-cover"
            sizes="177px"
          />
        )}
      </div>

      {/* Contenu */}
      <div className="flex-1 min-w-0 flex flex-col gap-[5px] p-[10px] overflow-hidden">
        <p className="font-black text-xl leading-7 tracking-[-0.5px] text-foreground truncate">
          {hunt.title}
        </p>

        {hunt.rewardType && (
          <div className="flex items-center gap-[5px]">
            <Trophy size={20} className="text-amber-500 shrink-0" />
            <span className="font-semibold text-xs leading-7 tracking-[-0.5px] text-amber-500 truncate">
              {formatRewardType(hunt.rewardType)}
            </span>
          </div>
        )}

        {dist && (
          <div>
              <span className="font-semibold text-xs leading-7 tracking-[-0.5px] text-muted-foreground" >zone de départ à {' '}</span>
              <span className="bg-muted px-2 self-start border border-border rounded-full font-semibold text-xs leading-7 tracking-[-0.5px] text-muted-foreground">
              {dist}
            </span>
          </div>
        )}
      </div>

      {/* Chevron */}
      <div className="w-[43px] flex items-center justify-center shrink-0">
        <ChevronRight size={24} className="text-muted-foreground" />
      </div>
    </div>
  );
}
