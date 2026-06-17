'use client';

import { useEffect, useState, useCallback } from 'react';
import Link from 'next/link';
import { HelpCircle, ChevronRight, LocateFixed, Loader2 } from 'lucide-react';
import TopBar from '@/components/ui/TopBar';
import TabNavigation from '@/components/ui/TabNavigation';
import ThemeSelector from '@/components/settings/ThemeSelector';
import { useSettingsStore, SETTINGS_DEFAULTS } from '@/store/settingsStore';

type SettingKey = 'smoothingFactor' | 'orientationChangeThreshold' | 'gpsMinDistance' | 'gpsMinAccuracy' | 'searchRadius';

type SliderConfig = {
  field: SettingKey;
  label: string;
  description: string;
  min: number;
  max: number;
  step: number;
  unit?: string;
  decimals?: number;
  /** Multiplicateur pour l'affichage uniquement (ex: 0.001 pour m→km). La valeur stockée reste en unité brute. */
  scale?: number;
};

const ORIENTATION_SLIDERS: SliderConfig[] = [
  {
    field: 'smoothingFactor',
    label: 'Facteur de lissage',
    description: 'Atténue les micro-tremblements du capteur. Plus élevé = plus fluide mais moins réactif.',
    min: 0,
    max: 1,
    step: 0.01,
    decimals: 2,
  },
  {
    field: 'orientationChangeThreshold',
    label: "Seuil de changement",
    description: 'Variation minimale de rotation pour déclencher une mise à jour. Plus bas = plus sensible.',
    min: 0,
    max: 0.5,
    step: 0.001,
    decimals: 3,
  },
];

const GPS_SLIDERS: SliderConfig[] = [
  {
    field: 'gpsMinDistance',
    label: 'Distance minimale',
    description: "Déplacement minimal en mètres entre deux mises à jour GPS. Réduit le jitter à l'arrêt.",
    min: 0,
    max: 50,
    step: 1,
    unit: 'm',
    decimals: 0,
  },
  {
    field: 'gpsMinAccuracy',
    label: 'Précision maximale',
    description: "Rayon d'incertitude GPS maximal accepté. Les lectures au-delà sont ignorées.",
    min: 10,
    max: 500,
    step: 5,
    unit: 'm',
    decimals: 0,
  },
  {
    field: 'searchRadius',
    label: 'Rayon de recherche',
    description: 'Distance maximale en km pour afficher les chasses à proximité sur la carte et la liste.',
    min: 1000,
    max: 100000,
    step: 1000,
    unit: 'km',
    decimals: 0,
    scale: 0.001,
  },
];

export default function SettingsPage() {
  const settings = useSettingsStore();

  return (
    <div className="flex flex-col h-screen pb-tabbar">
      <TopBar />

      <div className="flex-1 overflow-y-auto pt-topbar">
        <div className="px-4 pt-4 pb-6 space-y-6">

          <Section title="Apparence">
            <div className="px-4 py-4 flex items-center justify-between gap-3">
              <div className="min-w-0">
                <span className="text-sm font-medium">Thème</span>
                <p className="text-xs text-muted-foreground">Clair, sombre ou selon le système.</p>
              </div>
              <ThemeSelector />
            </div>
          </Section>

          <Section title="Orientation du capteur">
            {ORIENTATION_SLIDERS.map((config) => (
              <SettingSlider
                key={config.field}
                config={config}
                value={settings[config.field]}
                onChange={(v) => settings.set({ [config.field]: v })}
              />
            ))}
          </Section>

          <Section title="Géolocalisation">
            <GeolocationPermission />
            {GPS_SLIDERS.map((config) => (
              <SettingSlider
                key={config.field}
                config={config}
                value={settings[config.field]}
                onChange={(v) => settings.set({ [config.field]: v })}
              />
            ))}
          </Section>

          <Section title="Aide">
            <Link
              href="/rules"
              className="flex items-center gap-3 px-4 py-4 active:bg-foreground/5 transition-colors"
            >
              <HelpCircle size={18} className="shrink-0 text-muted-foreground" />
              <span className="flex-1 text-sm font-medium">Règles du jeu</span>
              <ChevronRight size={18} className="shrink-0 text-muted-foreground" />
            </Link>
          </Section>

          <button
            type="button"
            onClick={settings.reset}
            className="w-full py-3 rounded-xl border border-destructive/40 text-destructive text-sm font-medium hover:bg-destructive/5 active:bg-destructive/10 transition-colors"
          >
            Réinitialiser les paramètres par défaut
          </button>

        </div>
      </div>

      <TabNavigation />
    </div>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="space-y-4">
      <h2 className="font-semibold text-sm text-muted-foreground uppercase tracking-wide">{title}</h2>
      <div className="rounded-xl border border-border bg-card divide-y divide-border">
        {children}
      </div>
    </div>
  );
}

type GeoStatus = 'checking' | 'granted' | 'denied' | 'prompt' | 'unavailable';

function GeolocationPermission() {
  const [status, setStatus] = useState<GeoStatus>('checking');

  useEffect(() => {
    if (!navigator.permissions) {
      setStatus('unavailable');
      return;
    }
    let permStatus: PermissionStatus | null = null;
    const onChange = () => {
      if (permStatus) setStatus(permStatus.state as GeoStatus);
    };
    navigator.permissions.query({ name: 'geolocation' }).then((ps) => {
      permStatus = ps;
      setStatus(ps.state as GeoStatus);
      ps.addEventListener('change', onChange);
    }).catch(() => setStatus('unavailable'));
    return () => {
      permStatus?.removeEventListener('change', onChange);
    };
  }, []);

  const requestPermission = useCallback(() => {
    setStatus('checking');
    navigator.geolocation.getCurrentPosition(
      () => setStatus('granted'),
      (err) => setStatus(err.code === err.PERMISSION_DENIED ? 'denied' : 'granted'),
      { enableHighAccuracy: true, timeout: 10000 },
    );
  }, []);

  return (
    <div className="px-4 py-4 flex items-center justify-between gap-3">
      <div className="flex items-center gap-3 min-w-0">
        <LocateFixed size={18} className="shrink-0 text-muted-foreground" />
        <div className="min-w-0">
          <span className="text-sm font-medium">Permission</span>
          {status === 'denied' && (
            <p className="text-xs text-destructive">
              Refusée — activez-la dans les réglages du navigateur
            </p>
          )}
          {status === 'unavailable' && (
            <p className="text-xs text-muted-foreground">Non disponible sur cet appareil</p>
          )}
        </div>
      </div>
      {status === 'checking' && (
        <Loader2 size={18} className="shrink-0 animate-spin text-muted-foreground" />
      )}
      {status !== 'checking' && status !== 'unavailable' && (
        <button
          type="button"
          onClick={requestPermission}
          className={`shrink-0 text-xs font-medium px-3 py-1.5 rounded-full active:opacity-70 transition-opacity ${
            status === 'granted'
              ? 'text-green-600 bg-green-500/10'
              : status === 'denied'
                ? 'text-destructive bg-destructive/10'
                : 'text-primary bg-primary/10'
          }`}
        >
          {status === 'granted' ? 'Activée ✓' : status === 'denied' ? 'Réessayer' : 'Activer'}
        </button>
      )}
    </div>
  );
}

function SettingSlider({
  config,
  value,
  onChange,
}: {
  config: SliderConfig;
  value: number;
  onChange: (v: number) => void;
}) {
  const { label, description, min, max, step, unit, decimals = 2, scale = 1 } = config;
  const displayValue = (value * scale).toFixed(decimals) + (unit ? ` ${unit}` : '');
  // Portion remplie de la course, exposée en CSS var pour le gradient du track.
  const progress = max > min ? ((value - min) / (max - min)) * 100 : 0;

  return (
    <div className="px-4 py-4 space-y-2">
      <div className="flex items-center justify-between gap-2">
        <div className="flex items-baseline gap-2 min-w-0">
          <span className="text-sm font-medium">{label}</span>
          <span className="text-xs text-muted-foreground/60 tabular-nums shrink-0">
            déf. {(SETTINGS_DEFAULTS[config.field] * scale).toFixed(decimals)}{unit ? ` ${unit}` : ''}
          </span>
        </div>
        <span className="text-sm font-mono text-primary tabular-nums shrink-0">{displayValue}</span>
      </div>
      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        style={{ '--range-progress': `${progress}%` } as React.CSSProperties}
        className="range-retro w-full"
      />
      <p className="text-xs text-muted-foreground">{description}</p>
    </div>
  );
}
