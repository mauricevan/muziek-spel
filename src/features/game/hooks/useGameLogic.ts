import { useState, useCallback } from 'react';
import { getAlbumsByArtist, getTracksByAlbum, getArtistNamesByGenre, getArtistsDetails } from "../../audio/services/audiodbService";
import { getTrackPreviews } from "../../audio/services/deezerService";
import type { Artist, Track, UseGameLogicReturn, GameArtistsResult } from '../types/game.types';

export const useGameLogic = (): UseGameLogicReturn => {
    const [loading, setLoading] = useState<boolean>(false);
    const [error, setError] = useState<string | null>(null);

    const getArtists = useCallback(async (genre: string | null | undefined, qtyArtists: number, usedArtistNames: string[] = []): Promise<GameArtistsResult | null> => {
        try {
            setLoading(true);
            setError(null);
            
            // Validate genre before processing
            if (!genre || typeof genre !== 'string' || genre.trim() === '') {
                console.warn("Invalid genre provided, defaulting to 'pop'");
                genre = 'pop';
            }
            
            console.log("Getting artists for genre:", genre);

            // 1. Get all potential artist names for the genre
            const allArtistNames = getArtistNamesByGenre(genre);
            
            if (!allArtistNames || allArtistNames.length === 0) {
                throw new Error('Geen artiesten gevonden voor dit genre.');
            }

            // 2. Filter out used artists to find potential correct answers
            let availableCorrectArtists = allArtistNames.filter(name => !usedArtistNames.includes(name));

            // If we've used all artists, reset the pool (allow re-using)
            if (availableCorrectArtists.length === 0) {
                console.log("All artists used, resetting pool");
                availableCorrectArtists = [...allArtistNames];
            }

            // 3. Pick ONE correct artist
            const correctArtistName = availableCorrectArtists[Math.floor(Math.random() * availableCorrectArtists.length)];

            // 4. Pick (qtyArtists - 1) distractors
            // Distractors can be any artist except the correct one
            const potentialDistractors = allArtistNames.filter(name => name !== correctArtistName);
            
            // Shuffle distractors and pick needed amount
            const shuffledDistractors = [...potentialDistractors].sort(() => 0.5 - Math.random());
            const selectedDistractors = shuffledDistractors.slice(0, qtyArtists - 1);

            // 5. Combine and shuffle final list
            const finalNames = [correctArtistName, ...selectedDistractors].sort(() => 0.5 - Math.random());

            // 6. Fetch details for these artists
            const artistsData = await getArtistsDetails(finalNames);

            if (!artistsData || artistsData.length === 0) {
                 throw new Error('Kon artiest details niet ophalen.');
            }

            const _artists: Artist[] = artistsData.map(artist => ({
                name: artist.strArtist,
                id: artist.idArtist,
                thumb: artist.strArtistThumb,
                genre: artist.strGenre
            }));

            // Find the index of the correct artist in the shuffled list
            const _correctIdx = _artists.findIndex(a => a.name === correctArtistName);
            
            // Fallback if something went wrong and correct artist wasn't found (e.g. API failure for that specific artist)
            if (_correctIdx === -1) {
                 // Just pick a random one as correct if the intended one failed to load
                 const newCorrectIdx = Math.floor(Math.random() * _artists.length);
                 setLoading(false);
                 return { _artists, _correctIdx: newCorrectIdx };
            }

            setLoading(false);
            return { _artists, _correctIdx };
        } catch (err) {
            console.error("Error getting artists:", err);
            const errorMessage = err instanceof Error ? err.message : 'Unknown error occurred';
            setError(errorMessage);
            setLoading(false);
            return null;
        }
    }, []);

    const getSongs = useCallback(async (artists: Artist[], correctIdx: number, qtySongs: number): Promise<Track[]> => {
        try {
            setLoading(true);
            const correctArtist = artists[correctIdx];
            console.log("Getting songs for artist:", correctArtist);

            const albums = await getAlbumsByArtist(correctArtist.id);

            if (!albums || albums.length === 0) {
                console.log("No albums found, using artist info instead");
                setLoading(false);
                return [{
                    idTrack: correctArtist.id,
                    strTrack: correctArtist.name + " - Popular Track",
                    strArtist: correctArtist.name,
                    strAlbumThumb: correctArtist.thumb
                }];
            }

            const firstAlbum = albums[0];
            const tracks = await getTracksByAlbum(firstAlbum.idAlbum);

            if (!tracks || tracks.length === 0) {
                setLoading(false);
                return [{
                    idTrack: firstAlbum.idAlbum,
                    strTrack: firstAlbum.strAlbum,
                    strArtist: correctArtist.name,
                    strAlbumThumb: firstAlbum.strAlbumThumb
                }];
            }

            const selectedTracks = tracks.slice(0, qtySongs);
            const tracksWithPreviews = await getTrackPreviews(selectedTracks);
            
            setLoading(false);
            return tracksWithPreviews;

        } catch (err) {
            console.error("Error getting songs:", err);
            // Fallback
            setLoading(false);
            return [{
                idTrack: artists[correctIdx].id,
                strTrack: "Unknown Track",
                strArtist: artists[correctIdx].name,
                strAlbumThumb: null
            }];
        }
    }, []);

    return {
        getArtists,
        getSongs,
        loading,
        error
    };
};

