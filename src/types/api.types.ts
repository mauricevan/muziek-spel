// API Response Types

export interface SpotifyTrack {
  id: string;
  name: string;
  artists: Array<{ name: string }>;
  album: {
    name: string;
    images: Array<{ url: string }>;
  };
  preview_url: string | null;
}

export interface DeezerTrack {
  id: number;
  title: string;
  artist: {
    id: number;
    name: string;
  };
  album: {
    id: number;
    title: string;
    cover: string;
  };
  preview: string | null;
}

export interface DeezerArtist {
  id: number;
  name: string;
  picture: string;
  picture_small: string;
  picture_medium: string;
  picture_big: string;
  picture_xl: string;
}

export interface AudioDBArtist {
  idArtist: string;
  strArtist: string;
  strArtistThumb: string | null;
  strGenre: string | null;
  strBiographyEN?: string;
  strCountry?: string;
  strWebsite?: string;
}

export interface AudioDBAlbum {
  idAlbum: string;
  strAlbum: string;
  strAlbumThumb: string | null;
  idArtist: string;
  strArtist: string;
  intYearReleased?: string;
}

export interface AudioDBTrack {
  idTrack: string;
  strTrack: string;
  strArtist: string;
  strAlbum: string;
  strAlbumThumb: string | null;
  intDuration?: string;
}

