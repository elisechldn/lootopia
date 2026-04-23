'use client';

import { Suspense, useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { Loader2 }   from 'lucide-react';
import TopBar        from '@/components/ui/TobBar/TopBar';
import TabNavigation from '@/components/ui/TabNavigation/TabNavigation';
import ViewToggle    from '@/components/hunt/ViewToggle';
import { HuntList }  from '@/components/hunt/HuntList';
import { HuntMap }      from '@/components/hunt/HuntMap';
import { useUserStore } from '@/store/userStore';
import { getNearbyHunts, type NearbyHunt } from '@/services/hunt.service';

function HomeContent() {
  const searchParams = useSearchParams();
  const { user } = useUserStore();

  const initialView = searchParams.get('view') === 'map' ? 'map' : 'list';
  const [view, setView] = useState<'list' | 'map'>(initialView);
  const [hunts, setHunts] = useState<NearbyHunt[]>([]);
  const [coords, setCoords] = useState<{ lat: number; lon: number } | null>(null);
  const [status, setStatus] = useState<'loading' | 'geoerror' | 'ready'>('loading');

  useEffect(() => {
    if (!navigator.geolocation) {
      setStatus('geoerror');
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (pos) => { setCoords({ lat: pos.coords.latitude, lon: pos.coords.longitude }) },
      () => {
        // Géolocalisation refusée ou échouée — on charge quand même sans filtre de proximité
        setStatus('geoerror');
      },
      { timeout: 8000 },
    );
  }, []);

  useEffect(() => {
    console.log("COORDS UPDATE")
    if (!coords) return;
    getNearbyHunts(coords.lat, coords.lon).then((h) => {
      setHunts(h);
      setStatus('ready');
    });
  }, [coords]);

  const greeting = user ? `Bonjour ${user.firstname} !` : '';

  return (
    <div className="flex flex-col h-screen">
      <TopBar greeting={greeting} />

      {/* Offset du TopBar fixé */}
      <div className="flex flex-col flex-1 overflow-hidden pt-14">
        {/* Toggle Liste / Carte */}
        <div className="px-4 py-2 border-b border-border flex items-center justify-between">
          <ViewToggle value={view} onChange={setView} />
          {status === 'geoerror' && (
            <span className="text-xs text-muted-foreground">
              Géolocalisation indisponible
            </span>
          )}
        </div>

        {/* Contenu principal */}
        {status === 'loading' ? (
          <div className="flex-1 flex items-center justify-center gap-2 text-muted-foreground">
            <Loader2 size={20} className="animate-spin" />
            <span className="text-sm">Localisation en cours…</span>
          </div>
        ) : view === 'list' ? (
          <HuntList hunts={hunts} />
        ) : (
          <HuntMap
            hunts={hunts}
            center={coords ?? { lat: 48.8566, lon: 2.3522 }}
          />
        )}
      </div>

      <TabNavigation />
    </div>
  );
}

export default function HomePage() {
  return (
    <Suspense>
      <HomeContent />
    </Suspense>
  );
}
