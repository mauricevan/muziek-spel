// Game-specific types
import type { AudioDBArtist, AudioDBTrack } from '../../../types/api.types';

export interface Artist {
  name: string;
  id: string;
  thumb: string | null;
  genre: string | null;
}

export interface Track {
  idTrack: string;
  strTrack: string;
  strArtist: string;
  strAlbumThumb: string | null;
  preview_url?: string | null;
}

export interface Album {
  idAlbum: string;
  strAlbum: string;
  strAlbumThumb: string | null;
  idArtist: string;
  strArtist: string;
}

export interface GameArtistsResult {
  _artists: Artist[];
  _correctIdx: number;
}

export interface HighScore {
  name: string;
  score: number;
  accuracy: string;
  date: string;
  totalQuestions: number;
  correctAnswers: number;
  rounds: number;
}

export interface UseGameLogicReturn {
  getArtists: (genre: string, qtyArtists: number, usedArtistNames?: string[]) => Promise<GameArtistsResult | null>;
  getSongs: (artists: Artist[], correctIdx: number, qtySongs: number) => Promise<Track[]>;
  loading: boolean;
  error: string | null;
}

