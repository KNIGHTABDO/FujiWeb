import { create } from 'zustand'

export interface FilmState {
  // Input
  imageUrl: string | null;
  
  // Normalization
  exposure: number;
  contrast: number;
  temperature: number;

  // Physics
  grainScale: number;
  grainStrength: number;
  halationThreshold: number;
  halationIntensity: number;
  
  // Color Grading
  filmProfile: 'classic-chrome' | 'velvia' | 'provia';
  
  // Actions
  setImageUrl: (url: string) => void;
  setParam: (key: keyof FilmState, value: any) => void;
}

export const useFilmStore = create<FilmState>((set) => ({
  imageUrl: null,
  
  exposure: 0.0,
  contrast: 1.0,
  temperature: 6500,

  grainScale: 1.0,
  grainStrength: 0.05,
  halationThreshold: 0.9,
  halationIntensity: 0.2,
  
  filmProfile: 'classic-chrome',

  setImageUrl: (url) => set({ imageUrl: url }),
  setParam: (key, value) => set((state) => ({ ...state, [key]: value })),
}))
