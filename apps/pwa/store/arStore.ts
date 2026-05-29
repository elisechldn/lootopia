import { create } from 'zustand'

type Coords = {
  lat: number;
  long: number;
  accuracy: number;
  distMoved: number;
}

type ARStore = {
  coords: Coords | null;
  setCoords: (coords: Coords) => void;
}

export const useARStore = create<ARStore>((set) => ({
  coords: null,
  setCoords: (coords) => set({ coords }),
}))
