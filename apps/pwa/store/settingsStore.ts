import { create } from 'zustand';
import { persist } from 'zustand/middleware';

type ARSettings = {
  smoothingFactor: number;
  orientationChangeThreshold: number;
  gpsMinDistance: number;
  gpsMinAccuracy: number;
  searchRadius: number;
};

const DEFAULTS: ARSettings = {
  smoothingFactor: 0.85,
  orientationChangeThreshold: 0.02,
  gpsMinDistance: 10,
  gpsMinAccuracy: 100,
  searchRadius: 20000,
};

type SettingsStore = ARSettings & {
  set: (patch: Partial<ARSettings>) => void;
  reset: () => void;
};

export const useSettingsStore = create<SettingsStore>()(
  persist(
    (set) => ({
      ...DEFAULTS,
      set: (patch) => set(patch),
      reset: () => set(DEFAULTS),
    }),
    {
      name: 'pwa_settings',
    },
  ),
);
