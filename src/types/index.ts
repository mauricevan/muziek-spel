// Global type definitions
export * from './api.types';
export * from './game.types';

// Common types
export type Genre = 
  | 'pop' 
  | 'rock' 
  | 'hip-hop' 
  | 'electronic' 
  | 'jazz' 
  | 'classical' 
  | 'country' 
  | 'r-n-b' 
  | 'latin' 
  | 'indie';

export interface GameConfig {
  selectedGenre: Genre;
  qtySongs: number;
  qtyArtists: number;
  previewDuration: number;
}

export interface User {
  id: string;
  name: string;
  email?: string;
}

