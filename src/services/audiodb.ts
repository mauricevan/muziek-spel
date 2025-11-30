// TheAudioDB API Service
import type { AudioDBArtist, AudioDBAlbum, AudioDBTrack, Genre } from '../types/api.types';

const AUDIODB_BASE_URL = 'https://www.theaudiodb.com/api/v1/json';
const AUDIODB_API_KEY = '523532'; // Free API key (you can use '2' or get premium key)

const genreArtists: Record<string, string[]> = {
    'pop': [
        'Taylor Swift', 'Ed Sheeran', 'Ariana Grande', 'The Weeknd', 'Dua Lipa',
        'Justin Bieber', 'Katy Perry', 'Rihanna', 'Lady Gaga', 'Bruno Mars',
        'Adele', 'Shawn Mendes', 'Billie Eilish', 'Harry Styles', 'Olivia Rodrigo'
    ],
    'rock': [
        'Coldplay', 'Imagine Dragons', 'Queen', 'The Beatles', 'Foo Fighters',
        'Led Zeppelin', 'Pink Floyd', 'Nirvana', 'AC/DC', 'The Rolling Stones',
        'Red Hot Chili Peppers', 'Linkin Park', 'Green Day', 'U2', 'Guns N\' Roses'
    ],
    'hip-hop': [
        'Drake', 'Kendrick Lamar', 'Eminem', 'Kanye West', 'Jay-Z',
        'Travis Scott', 'J. Cole', 'Post Malone', 'Snoop Dogg', 'Dr. Dre',
        '50 Cent', 'Lil Wayne', 'Nicki Minaj', 'Cardi B', 'Tupac'
    ],
    'electronic': [
        'Daft Punk', 'Calvin Harris', 'Deadmau5', 'Skrillex', 'Avicii',
        'The Chainsmokers', 'Marshmello', 'David Guetta', 'Tiesto', 'Zedd',
        'Martin Garrix', 'Swedish House Mafia', 'Disclosure', 'Kygo', 'Diplo'
    ],
    'jazz': [
        'Miles Davis', 'John Coltrane', 'Ella Fitzgerald', 'Louis Armstrong', 'Billie Holiday',
        'Frank Sinatra', 'Nat King Cole', 'Duke Ellington', 'Nina Simone', 'Chet Baker',
        'Ray Charles', 'Sarah Vaughan', 'Dave Brubeck', 'Thelonious Monk', 'Charlie Parker'
    ],
    'classical': [
        'Mozart', 'Beethoven', 'Bach', 'Vivaldi', 'Chopin',
        'Tchaikovsky', 'Debussy', 'Schubert', 'Brahms', 'Handel',
        'Haydn', 'Liszt', 'Verdi', 'Wagner', 'Strauss'
    ],
    'country': [
        'Taylor Swift', 'Johnny Cash', 'Dolly Parton', 'Kenny Rogers', 'Garth Brooks',
        'Carrie Underwood', 'Luke Bryan', 'Blake Shelton', 'Tim McGraw', 'Keith Urban',
        'George Strait', 'Willie Nelson', 'Shania Twain', 'Brad Paisley', 'Miranda Lambert'
    ],
    'r-n-b': [
        'Beyonce', 'Usher', 'Alicia Keys', 'John Legend', 'Bruno Mars',
        'The Weeknd', 'Rihanna', 'Chris Brown', 'Ne-Yo', 'Mariah Carey',
        'Whitney Houston', 'Boyz II Men', 'TLC', 'Destiny\'s Child', 'Mary J. Blige'
    ],
    'latin': [
        'Shakira', 'Bad Bunny', 'J Balvin', 'Daddy Yankee', 'Maluma',
        'Enrique Iglesias', 'Ricky Martin', 'Luis Fonsi', 'Karol G', 'Ozuna',
        'Marc Anthony', 'Pitbull', 'Jennifer Lopez', 'Rosalia', 'Romeo Santos'
    ],
    'indie': [
        'Arctic Monkeys', 'The Strokes', 'Tame Impala', 'MGMT', 'Florence and the Machine',
        'Vampire Weekend', 'The Killers', 'Arcade Fire', 'Bon Iver', 'Lana Del Rey',
        'Foster the People', 'The 1975', 'Hozier', 'Alt-J', 'Phoenix'
    ]
};

/**
 * Search for artists by name
 */
export const searchArtist = async (artistName: string): Promise<AudioDBArtist[]> => {
    try {
        const response = await fetch(
            `${AUDIODB_BASE_URL}/${AUDIODB_API_KEY}/search.php?s=${encodeURIComponent(artistName)}`
        );
        const data = await response.json();
        return (data.artists || []) as AudioDBArtist[];
    } catch (error) {
        console.error('Error searching artist:', error);
        return [];
    }
};

/**
 * Get artist details by ID
 */
export const getArtistById = async (artistId: string): Promise<AudioDBArtist | null> => {
    try {
        const response = await fetch(
            `${AUDIODB_BASE_URL}/${AUDIODB_API_KEY}/artist.php?i=${artistId}`
        );
        const data = await response.json();
        return data.artists ? (data.artists[0] as AudioDBArtist) : null;
    } catch (error) {
        console.error('Error getting artist:', error);
        return null;
    }
};

/**
 * Get albums by artist ID
 */
export const getAlbumsByArtist = async (artistId: string): Promise<AudioDBAlbum[]> => {
    try {
        const response = await fetch(
            `${AUDIODB_BASE_URL}/${AUDIODB_API_KEY}/album.php?i=${artistId}`
        );
        const data = await response.json();
        return (data.album || []) as AudioDBAlbum[];
    } catch (error) {
        console.error('Error getting albums:', error);
        return [];
    }
};

/**
 * Get tracks by album ID
 */
export const getTracksByAlbum = async (albumId: string): Promise<AudioDBTrack[]> => {
    try {
        const response = await fetch(
            `${AUDIODB_BASE_URL}/${AUDIODB_API_KEY}/track.php?m=${albumId}`
        );
        const data = await response.json();
        return (data.track || []) as AudioDBTrack[];
    } catch (error) {
        console.error('Error getting tracks:', error);
        return [];
    }
};

/**
 * Get raw list of artist names for a genre
 */
export const getArtistNamesByGenre = (genre: string | null | undefined): string[] => {
    // Handle null, undefined, or empty string
    if (!genre || typeof genre !== 'string' || genre.trim() === '') {
        return genreArtists['pop'];
    }
    const genreKey = genre.toLowerCase();
    return genreArtists[genreKey] || genreArtists['pop'];
};

/**
 * Fetch details for a list of artist names
 */
export const getArtistsDetails = async (names: string[]): Promise<AudioDBArtist[]> => {
    const results: AudioDBArtist[] = [];
    for (const artistName of names) {
        const artistData = await searchArtist(artistName);
        if (artistData.length > 0) {
            results.push(artistData[0]);
        }
    }
    return results;
};

/**
 * Get random artists by genre (Legacy support)
 */
export const getArtistsByGenre = async (genre: Genre | string | null | undefined, limit: number = 10): Promise<AudioDBArtist[]> => {
    // Ensure genre is valid before processing
    if (!genre || typeof genre !== 'string' || genre.trim() === '') {
        genre = 'pop';
    }
    const artists = getArtistNamesByGenre(genre);
    
    // Get random subset
    const shuffled = [...artists].sort(() => 0.5 - Math.random());
    const selected = shuffled.slice(0, Math.min(limit, artists.length));

    return getArtistsDetails(selected);
};

export default {
    searchArtist,
    getArtistById,
    getAlbumsByArtist,
    getTracksByAlbum,
    getArtistsByGenre,
    getArtistNamesByGenre,
    getArtistsDetails
};

