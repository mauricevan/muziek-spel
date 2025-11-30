// Game-specific types
// Re-export from features/game/types for backward compatibility
export * from '../features/game/types/game.types';

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

export interface ScoreContextType {
  score: number;
  streak: number;
  totalQuestions: number;
  correctAnswers: number;
  responseTime: number | null;
  lives: number;
  round: number;
  gameOver: boolean;
  startQuestion: () => void;
  answerQuestion: (isCorrect: boolean) => { points: number; timeInSeconds: number };
  resetGame: () => void;
  saveHighScore: (playerName?: string) => void;
  getHighScores: () => HighScore[];
}

export interface UseGameLogicReturn {
  getArtists: (genre: string, qtyArtists: number, usedArtistNames?: string[]) => Promise<GameArtistsResult | null>;
  getSongs: (artists: Artist[], correctIdx: number, qtySongs: number) => Promise<Track[]>;
  loading: boolean;
  error: string | null;
}

