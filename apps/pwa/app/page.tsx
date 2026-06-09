'use client';

import { Suspense, useCallback, useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { Loader2, RefreshCw } from 'lucide-react';
import TopBar        from '@/components/ui/TopBar';
import TabNavigation from '@/components/ui/TabNavigation';
import ViewToggle    from '@/components/hunt/ViewToggle';
import { HuntList }  from '@/components/hunt/HuntList';
import { HuntMap }   from '@/components/hunt/HuntMap';
import { useUserStore } from '@/store/userStore';
import { useSettingsStore } from '@/store/settingsStore';
import { getNearbyHunts, type NearbyHunt } from '@/services/hunt.service';
import { usePullToRefresh } from '@/hooks/usePullToRefresh';

const INDICATOR_MAX_HEIGHT = 48;
const PULL_MAX = 80;

function HomeContent() {
  const searchParams = useSearchParams();
  const { user } = useUserStore();
  const searchRadius = useSettingsStore((s) => s.searchRadius);

  const initialView = searchParams.get('view') === 'map' ? 'map' : 'list';
  const [view, setView] = useState<'list' | 'map'>(initialView);
  const [hunts, setHunts] = useState<NearbyHunt[]>([]);
  const [coords, setCoords] = useState<{ lat: number; lon: number } | null>(null);
  const [status, setStatus] = useState<'loading' | 'geoerror' | 'ready'>('loading');

  const [listEl, setListEl] = useState<HTMLDivElement | null>(null);

  const refreshHunts = useCallback(async () => {
    if (!coords) return;
    const h = await getNearbyHunts(coords.lat, coords.lon, searchRadius);
    setHunts(h);
  }, [coords, searchRadius]);

  const { pullDistance, isRefreshing } = usePullToRefresh(listEl, refreshHunts);

  useEffect(() => {
    if (!navigator.geolocation) {
      setStatus('geoerror');
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (pos) => { setCoords({ lat: pos.coords.latitude, lon: pos.coords.longitude }); },
      () => { setStatus('geoerror'); },
      { timeout: 8000 },
    );
  }, []);

  useEffect(() => {
    if (!coords) return;
    refreshHunts().then(() => setStatus('ready'));
  }, [coords, searchRadius]); // eslint-disable-line react-hooks/exhaustive-deps

  const greeting = user ? `Bonjour ${user.firstname} !` : '';

  const indicatorHeight = isRefreshing
    ? INDICATOR_MAX_HEIGHT
    : pullDistance > 0
      ? (pullDistance / 80) * INDICATOR_MAX_HEIGHT
      : 0;

  const rotationDeg = (pullDistance / 80) * 360;

  return (
    <div className="flex flex-col h-screen">
      <TopBar greeting={greeting} />
      <div className="flex flex-col flex-1 pt-topbar overflow-hidden">
        {/* Toggle Liste / Carte */}
        <div className="px-4 py-2 border-b border-border flex items-center justify-between">
          <ViewToggle value={view} onChange={setView} />
          {status === 'geoerror' && (
            <span className="text-xs text-muted-foreground">
              Géolocalisation indisponible
            </span>
          )}
        </div>

        {/* Indicateur pull-to-refresh */}
        {view === 'list' && indicatorHeight > 0 && (
          <div
            className="flex items-center justify-center text-muted-foreground overflow-hidden"
            style={{
              height: indicatorHeight,
              opacity: isRefreshing ? 1 : pullDistance / PULL_MAX,
            }}
          >
            {isRefreshing ? (
              <Loader2 size={20} className="animate-spin" />
            ) : (
              <RefreshCw size={20} style={{ transform: `rotate(${rotationDeg}deg)` }} />
            )}
          </div>
        )}

        {/* Contenu principal */}
        {status === 'loading' ? (
          <div className="flex-1 flex items-center justify-center gap-2 text-muted-foreground">
            <Loader2 size={20} className="animate-spin" />
            <span className="text-sm">Localisation en cours…</span>
          </div>
        ) : view === 'list' ? (
          <HuntList ref={setListEl} hunts={hunts} />
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
