// YouTube API Service for getting track audio
// Uses YouTube Data API v3 - requires API key but no OAuth!

const YOUTUBE_API_KEY = 'AIzaSyDummyKeyPleaseReplace'; // User needs to get this from Google Console
const YOUTUBE_API_BASE = 'https://www.googleapis.com/youtube/v3';

interface YouTubeVideo {
    id: string;
    title: string;
    youtubeUrl: string;
}

/**
 * Search for a track on YouTube
 */
export const searchTrack = async (trackName: string, artistName: string): Promise<YouTubeVideo | null> => {
    try {
        const query = encodeURIComponent(`${artistName} ${trackName} audio`);
        const url = `${YOUTUBE_API_BASE}/search?part=snippet&q=${query}&type=video&maxResults=1&key=${YOUTUBE_API_KEY}`;

        const response = await fetch(url);
        const data = await response.json();

        if (data.items && data.items.length > 0) {
            const video = data.items[0];
            return {
                id: video.id.videoId,
                title: video.snippet.title,
                // YouTube doesn't provide direct audio URLs
                // We'd need to use youtube-dl or similar
                youtubeUrl: `https://www.youtube.com/watch?v=${video.id.videoId}`
            };
        }

        return null;
    } catch (error) {
        console.error('Error searching YouTube:', error);
        return null;
    }
};

export default {
    searchTrack
};

