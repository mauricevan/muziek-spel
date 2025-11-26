import { useState, useCallback } from 'react';
import { getArtistsByGenre, getAlbumsByArtist, getTracksByAlbum } from "../services/audiodb";
import { getTrackPreviews } from "../services/deezer";

export const useGameLogic = () => {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    const getArtists = useCallback(async (genre, qtyArtists) => {
        try {
            setLoading(true);
            setError(null);
            console.log("Getting artists for genre:", genre);

            const artistsData = await getArtistsByGenre(genre, qtyArtists);

            if (!artistsData || artistsData.length === 0) {
                throw new Error('Geen artiesten gevonden voor dit genre.');
            }

            const _artists = artistsData.map(artist => ({
                name: artist.strArtist,
                id: artist.idArtist,
                thumb: artist.strArtistThumb,
                genre: artist.strGenre
            }));

            const _correctIdx = Math.floor(Math.random() * _artists.length);
            
            setLoading(false);
            return { _artists, _correctIdx };
        } catch (err) {
            console.error("Error getting artists:", err);
            setError(err.message);
            setLoading(false);
            return null;
        }
    }, []);

    const getSongs = useCallback(async (artists, correctIdx, qtySongs) => {
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
                strArtist: artists[correctIdx].name
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
