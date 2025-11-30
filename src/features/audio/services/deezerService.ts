// Deezer API Service for getting track previews
// Uses backend proxy to avoid CORS issues

import type { DeezerTrack, DeezerArtist, AudioDBTrack } from '../../../types/api.types';

// Use relative URL to work in both development and production
const PROXY_BASE = '/api/deezer';

interface TrackWithPreview extends AudioDBTrack {
  preview_url: string | null;
}

/**
 * Search for a track on Deezer via backend proxy
 */
export const searchTrack = async (trackName: string, artistName: string): Promise<DeezerTrack | null> => {
    try {
        const query = `${artistName} ${trackName}`;
        const response = await fetch(
            `${PROXY_BASE}/search?q=${encodeURIComponent(query)}`
        );

        const data = await response.json();

        if (data.data && data.data.length > 0) {
            return data.data[0] as DeezerTrack;
        }

        return null;
    } catch (error) {
        console.error('Error searching track on Deezer:', error);
        return null;
    }
};

/**
 * Search for artist on Deezer via backend proxy
 */
export const searchArtist = async (artistName: string): Promise<DeezerArtist | null> => {
    try {
        const response = await fetch(
            `${PROXY_BASE}/artist/search?q=${encodeURIComponent(artistName)}`
        );

        const data = await response.json();

        if (data.data && data.data.length > 0) {
            return data.data[0] as DeezerArtist;
        }

        return null;
    } catch (error) {
        console.error('Error searching artist on Deezer:', error);
        return null;
    }
};

/**
 * Get top tracks for an artist via backend proxy
 */
export const getArtistTopTracks = async (artistId: number): Promise<DeezerTrack[]> => {
    try {
        const response = await fetch(
            `${PROXY_BASE}/artist/${artistId}/top`
        );

        const data = await response.json();

        if (data.data && data.data.length > 0) {
            return data.data as DeezerTrack[];
        }

        return [];
    } catch (error) {
        console.error('Error getting artist top tracks:', error);
        return [];
    }
};

/**
 * Get track preview URL from Deezer
 */
export const getTrackPreview = async (trackName: string, artistName: string): Promise<string | null> => {
    try {
        const track = await searchTrack(trackName, artistName);

        if (track && track.preview) {
            return track.preview;
        }

        return null;
    } catch (error) {
        console.error('Error getting track preview:', error);
        return null;
    }
};

/**
 * Get preview URLs for multiple tracks
 * This is the main function used by Home.js
 */
export const getTrackPreviews = async (tracks: AudioDBTrack[]): Promise<TrackWithPreview[]> => {
    console.log('Getting Deezer previews for tracks:', tracks);

    const previews = await Promise.all(
        tracks.map(async (track): Promise<TrackWithPreview> => {
            try {
                const previewUrl = await getTrackPreview(track.strTrack, track.strArtist);

                if (previewUrl) {
                    console.log(`Found preview for ${track.strTrack}:`, previewUrl);
                } else {
                    console.log(`No preview found for ${track.strTrack}`);
                }

                return {
                    ...track,
                    preview_url: previewUrl
                };
            } catch (error) {
                console.error(`Error getting preview for ${track.strTrack}:`, error);
                return {
                    ...track,
                    preview_url: null
                };
            }
        })
    );

    return previews;
};

export default {
    searchTrack,
    searchArtist,
    getArtistTopTracks,
    getTrackPreview,
    getTrackPreviews
};

