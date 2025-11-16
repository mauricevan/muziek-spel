// TheAudioDB API Service
const AUDIODB_BASE_URL = 'https://www.theaudiodb.com/api/v1/json';
const AUDIODB_API_KEY = '523532'; // Free API key (you can use '2' or get premium key)

/**
 * Search for artists by name
 */
export const searchArtist = async (artistName) => {
    try {
        const response = await fetch(
            `${AUDIODB_BASE_URL}/${AUDIODB_API_KEY}/search.php?s=${encodeURIComponent(artistName)}`
        );
        const data = await response.json();
        return data.artists || [];
    } catch (error) {
        console.error('Error searching artist:', error);
        return [];
    }
};

/**
 * Get artist details by ID
 */
export const getArtistById = async (artistId) => {
    try {
        const response = await fetch(
            `${AUDIODB_BASE_URL}/${AUDIODB_API_KEY}/artist.php?i=${artistId}`
        );
        const data = await response.json();
        return data.artists ? data.artists[0] : null;
    } catch (error) {
        console.error('Error getting artist:', error);
        return null;
    }
};

/**
 * Get albums by artist ID
 */
export const getAlbumsByArtist = async (artistId) => {
    try {
        const response = await fetch(
            `${AUDIODB_BASE_URL}/${AUDIODB_API_KEY}/album.php?i=${artistId}`
        );
        const data = await response.json();
        return data.album || [];
    } catch (error) {
        console.error('Error getting albums:', error);
        return [];
    }
};

/**
 * Get tracks by album ID
 */
export const getTracksByAlbum = async (albumId) => {
    try {
        const response = await fetch(
            `${AUDIODB_BASE_URL}/${AUDIODB_API_KEY}/track.php?m=${albumId}`
        );
        const data = await response.json();
        return data.track || [];
    } catch (error) {
        console.error('Error getting tracks:', error);
        return [];
    }
};

/**
 * Get random artists by genre
 */
export const getArtistsByGenre = async (genre, limit = 10) => {
    // TheAudioDB doesn't have a direct "get by genre" endpoint
    // We'll search for popular artists in that genre
    const genreArtists = {
        'pop': ['Taylor Swift', 'Ed Sheeran', 'Ariana Grande', 'The Weeknd', 'Dua Lipa'],
        'rock': ['Coldplay', 'Imagine Dragons', 'Queen', 'The Beatles', 'Foo Fighters'],
        'hip-hop': ['Drake', 'Kendrick Lamar', 'Eminem', 'Kanye West', 'Jay-Z'],
        'electronic': ['Daft Punk', 'Calvin Harris', 'Deadmau5', 'Skrillex', 'Avicii'],
        'jazz': ['Miles Davis', 'John Coltrane', 'Ella Fitzgerald', 'Louis Armstrong', 'Billie Holiday'],
        'classical': ['Mozart', 'Beethoven', 'Bach', 'Vivaldi', 'Chopin'],
        'country': ['Taylor Swift', 'Johnny Cash', 'Dolly Parton', 'Kenny Rogers', 'Garth Brooks'],
        'r-n-b': ['Beyonce', 'Usher', 'Alicia Keys', 'John Legend', 'Bruno Mars'],
        'latin': ['Shakira', 'Bad Bunny', 'J Balvin', 'Daddy Yankee', 'Maluma'],
        'indie': ['Arctic Monkeys', 'The Strokes', 'Tame Impala', 'MGMT', 'Florence and the Machine']
    };

    // Handle null/undefined genre with safe navigation and default to 'pop'
    const normalizedGenre = genre?.toLowerCase() || 'pop';
    const artists = genreArtists[normalizedGenre] || genreArtists['pop'];
    const results = [];

    // Get random subset
    const shuffled = artists.sort(() => 0.5 - Math.random());
    const selected = shuffled.slice(0, Math.min(limit, artists.length));

    // Fetch artist data
    for (const artistName of selected) {
        const artistData = await searchArtist(artistName);
        if (artistData.length > 0) {
            results.push(artistData[0]);
        }
    }

    return results;
};

export default {
    searchArtist,
    getArtistById,
    getAlbumsByArtist,
    getTracksByAlbum,
    getArtistsByGenre
};
