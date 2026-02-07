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

  grainScale: 1.5,
  grainStrength: 0.15,
  halationThreshold: 0.8,
  halationIntensity: 0.6,
  
  filmProfile: 'classic-chrome',

  setImageUrl: (url) => set({ imageUrl: url }),
  setParam: (key, value) => set((state) => ({ ...state, [key]: value })),
}))
