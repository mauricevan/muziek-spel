// Spotify Web API Service for getting track previews
// Uses Web API without authentication for track search (limited but works for previews)

import type { SpotifyTrack, AudioDBTrack } from '../types/api.types';

interface TrackWithPreview extends AudioDBTrack {
  preview_url: string | null;
}

/**
 * Search for a track using Spotify Embed/oEmbed API (no auth required!)
 * Falls back to using track name to construct a Spotify URI
 */
export const searchTrack = async (trackName: string, artistName: string): Promise<SpotifyTrack | null> => {
    try {
        // Use Spotify's open search via their embed API
        // This is a workaround since Client Credentials needs backend
        const query = encodeURIComponent(`${trackName} ${artistName}`);

        // Try using Spotify's public API endpoint (may have CORS)
        const response = await fetch(
            `https://api.spotify.com/v1/search?q=${query}&type=track&limit=1&market=NL`,
            {
                headers: {
                    'Accept': 'application/json'
                }
            }
        );

        if (!response.ok) {
            console.log('Spotify API requires auth, track will not have preview');
            return null;
        }

        const data = await response.json();

        if (data.tracks && data.tracks.items && data.tracks.items.length > 0) {
            return data.tracks.items[0] as SpotifyTrack;
        }

        return null;
    } catch (error) {
        console.error('Error searching track on Spotify:', error);
        return null;
    }
};

/**
 * Get track preview URL from Spotify
 */
export const getTrackPreview = async (trackName: string, artistName: string): Promise<string | null> => {
    try {
        const track = await searchTrack(trackName, artistName);

        if (track && track.preview_url) {
            return track.preview_url;
        }

        return null;
    } catch (error) {
        console.error('Error getting track preview:', error);
        return null;
    }
};

/**
 * Get preview URLs for multiple tracks
 */
export const getTrackPreviews = async (tracks: AudioDBTrack[]): Promise<TrackWithPreview[]> => {
    const previews = await Promise.all(
        tracks.map(async (track): Promise<TrackWithPreview> => {
            const previewUrl = await getTrackPreview(track.strTrack, track.strArtist);
            return {
                ...track,
                preview_url: previewUrl
            };
        })
    );

    return previews;
};

export default {
    searchTrack,
    getTrackPreview,
    getTrackPreviews
};

