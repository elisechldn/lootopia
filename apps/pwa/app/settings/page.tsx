'use client';

import TopBar from '@/components/ui/TopBar';
import TabNavigation from '@/components/ui/TabNavigation';
import { useSettingsStore } from '@/store/settingsStore';

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
    <div className="flex flex-col h-screen">
      <TopBar />

      <div className="flex-1 overflow-y-auto pt-topbar pb-safe-3">
        <div className="px-4 pt-4 pb-6 space-y-6">

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
            {GPS_SLIDERS.map((config) => (
              <SettingSlider
                key={config.field}
                config={config}
                value={settings[config.field]}
                onChange={(v) => settings.set({ [config.field]: v })}
              />
            ))}
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

  return (
    <div className="px-4 py-4 space-y-2">
      <div className="flex items-center justify-between gap-2">
        <span className="text-sm font-medium">{label}</span>
        <span className="text-sm font-mono text-primary tabular-nums">{displayValue}</span>
      </div>
      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        className="w-full h-1.5 rounded-full appearance-none bg-muted accent-primary cursor-pointer"
      />
      <p className="text-xs text-muted-foreground">{description}</p>
    </div>
  );
}
