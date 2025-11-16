// Preset Spotify playlists voor verschillende tijdperken en genres
export const PRESET_PLAYLISTS = {
  '70s_80s': {
    id: '37i9dQZF1DWSV3Tk4GO2fq',
    name: "70s & 80s Classics",
    description: "Iconic hits from the 70s and 80s"
  },
  '90s': {
    id: '37i9dQZF1DXbTxeAdrVG2l',
    name: "90s Hits",
    description: "The best of the 90s"
  },
  '2000s': {
    id: '37i9dQZF1DX4o1oenSJRJd',
    name: "2000s Classics",
    description: "Top hits from the 2000s"
  },
  '2010s': {
    id: '37i9dQZF1DX5Ejj0EkURtP',
    name: "2010s Hits",
    description: "Best of the 2010s"
  },
  'current_hits': {
    id: '37i9dQZF1DXcBWIGoYBM5M',
    name: "Current Top Hits",
    description: "Today's top hits"
  },
  'all_decades': {
    id: '37i9dQZF1DX4UtSsGT1Sbe',
    name: "All Decades Mix",
    description: "Hits from every decade"
  },
  'rock_classics': {
    id: '37i9dQZF1DWXRqgorJj26U',
    name: "Rock Classics",
    description: "Timeless rock anthems"
  },
  'pop_classics': {
    id: '37i9dQZF1DX1lVhptIYRda',
    name: "Pop Classics",
    description: "Essential pop hits"
  }
};

// Game configuration constants
export const PREVIEW_DURATIONS = [10, 15, 20, 30];
export const QUESTION_COUNTS = [5, 10, 15, 20];
export const DIFFICULTY_MODES = {
  easy: { name: 'Easy', description: 'Guess the artist (multiple choice)' },
  medium: { name: 'Medium', description: 'Type the artist name' },
  hard: { name: 'Hard', description: 'Type artist + song title' }
};
