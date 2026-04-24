'use client';

import dynamic             from 'next/dynamic';
import type { NearbyHunt } from '@/services/hunt.service';

type Props = {
  hunts: NearbyHunt[];
  center: { lat: number; lon: number };
};

// Leaflet utilise window — désactivation du SSR obligatoire
const LeafletMap = dynamic(() => import('./_LeafletMap'), { ssr: false });

export function HuntMap({ hunts, center }: Props) {
  return (
    <div className="flex-1 overflow-hidden">
      <LeafletMap hunts={hunts} center={center} />
    </div>
  );
}
