import React, { useEffect, useState } from "react";

import Button from "@material-ui/core/Button";
import Box from "@material-ui/core/Box";
import { makeStyles } from "@material-ui/core/styles";
import FormControl from "@material-ui/core/FormControl";
import InputLabel from "@material-ui/core/InputLabel";
import MenuItem from "@material-ui/core/MenuItem";
import Select from "@material-ui/core/Select";
import TextField from "@material-ui/core/TextField";
import Radio from "@material-ui/core/Radio";
import RadioGroup from "@material-ui/core/RadioGroup";
import FormControlLabel from "@material-ui/core/FormControlLabel";
import FormLabel from "@material-ui/core/FormLabel";

import { Link } from "react-router-dom";
import { getArtistsByGenre, getAlbumsByArtist, getTracksByAlbum } from "../services/audiodb";
import { getTrackPreviews } from "../services/deezer";
import ConfigChoicesContainer from "./home/ConfigChoicesContainer";
import LoadingSpinner from "./shared/LoadingSpinner";
import { PRESET_PLAYLISTS, PREVIEW_DURATIONS } from "../constants/playlists";

const useStyles = makeStyles((theme) => ({
    formControl: {
        margin: theme.spacing(1),
        minWidth: 120,
    },
    selectEmpty: {
        marginTop: theme.spacing(2),
    },
}));

const Home = ({
    config,
    setConfig,
    setArtists,
    setSongs,
    setCorrectGuess,
    setRedirectFlag,
}) => {
    const [genres] = useState(["pop", "rock", "hip-hop", "electronic", "jazz", "classical", "country", "r-n-b", "latin", "indie"]);
    const [selectedGenre, setSelectedGenre] = useState(
        localStorage.getItem("selectedGenre") ?? "pop"
    );
    const [loading, setLoading] = useState(false);
    const [sourceMode, setSourceMode] = useState(
        localStorage.getItem("sourceMode") ?? "genre"
    );
    const [selectedPlaylist, setSelectedPlaylist] = useState(
        localStorage.getItem("selectedPlaylist") ?? ""
    );
    const [customPlaylistId, setCustomPlaylistId] = useState(
        localStorage.getItem("customPlaylistId") ?? ""
    );
    const [previewDuration, setPreviewDuration] = useState(
        Number(localStorage.getItem("previewDuration")) || 30
    );

    const classes = useStyles();

    useEffect(() => {
        setArtists();
        setSongs();
        setCorrectGuess();
        setRedirectFlag(false);
    }, []);

    if (loading) {
        return <LoadingSpinner />;
    }

    const getSongs = async ({ _artists, _correctIdx }) => {
        try {
            console.log("Getting songs for artist:", _artists[_correctIdx]);

            // Get albums for the correct artist
            const albums = await getAlbumsByArtist(_artists[_correctIdx].id);

            if (!albums || albums.length === 0) {
                console.log("No albums found, using artist info instead");
                // If no albums, create a dummy track using artist info
                setSongs([{
                    idTrack: _artists[_correctIdx].id,
                    strTrack: _artists[_correctIdx].name + " - Popular Track",
                    strArtist: _artists[_correctIdx].name,
                    strAlbumThumb: _artists[_correctIdx].thumb
                }]);
                return;
            }

            // Get tracks from first album
            const firstAlbum = albums[0];
            const tracks = await getTracksByAlbum(firstAlbum.idAlbum);

            if (!tracks || tracks.length === 0) {
                // Use album info if no tracks
                setSongs([{
                    idTrack: firstAlbum.idAlbum,
                    strTrack: firstAlbum.strAlbum,
                    strArtist: _artists[_correctIdx].name,
                    strAlbumThumb: firstAlbum.strAlbumThumb
                }]);
                return;
            }

            // Limit to configured number of songs
            const selectedTracks = tracks.slice(0, config.qtySongs);

            // Get Deezer preview URLs via backend proxy
            console.log("Fetching Deezer previews for tracks...");
            const tracksWithPreviews = await getTrackPreviews(selectedTracks);
            console.log("Tracks with previews:", tracksWithPreviews);

            setSongs(tracksWithPreviews);

        } catch (error) {
            console.error("Error getting songs:", error);
            // Create fallback song
            setSongs([{
                idTrack: _artists[_correctIdx].id,
                strTrack: "Unknown Track",
                strArtist: _artists[_correctIdx].name
            }]);
        }
    };

    const getArtists = async () => {
        try {
            setLoading(true);
            console.log("Getting artists for genre:", config.selectedGenre);

            // Get artists from TheAudioDB based on genre
            const artistsData = await getArtistsByGenre(config.selectedGenre, config.qtyArtists);

            if (!artistsData || artistsData.length === 0) {
                alert('Geen artiesten gevonden voor dit genre. Probeer een ander genre!');
                setLoading(false);
                return null;
            }

            console.log("Got artists:", artistsData);

            const _artists = artistsData.map(artist => ({
                name: artist.strArtist,
                id: artist.idArtist,
                thumb: artist.strArtistThumb,
                genre: artist.strGenre
            }));

            setArtists(_artists);
            const _correctIdx = Math.floor(Math.random() * _artists.length);
            setCorrectGuess(_artists[_correctIdx].name);

            setLoading(false);
            return { _artists, _correctIdx };
        } catch (error) {
            console.error("Error getting artists:", error);
            alert('Er is een fout opgetreden bij het ophalen van artiesten. Probeer het opnieuw!');
            setLoading(false);
            return null;
        }
    };

    const saveConfig = () => {
        localStorage.setItem("selectedGenre", selectedGenre);
        localStorage.setItem("qtyArtists", config.qtyArtists);
        localStorage.setItem("qtySongs", config.qtySongs);
        localStorage.setItem("sourceMode", sourceMode);
        localStorage.setItem("selectedPlaylist", selectedPlaylist);
        localStorage.setItem("customPlaylistId", customPlaylistId);
        localStorage.setItem("previewDuration", previewDuration);
    };

    const handlePlay = async () => {
        saveConfig();
        setConfig({
            ...config,
            previewDuration: previewDuration
        });
        const artistsData = await getArtists();
        if (artistsData) {
            getSongs(artistsData);
        }
    };

    return (
        <div>
            <h1 style={{ textAlign: "center" }}>Muziek Raad Spelletje 🎵</h1>
            <p style={{ textAlign: "center" }}>
                Kies je genre, configureer het spel en raad de artiest!
            </p>
            <p style={{ textAlign: "center", fontSize: "0.9rem", color: "#666", marginTop: "0.5rem" }}>
                Powered by TheAudioDB & Deezer - Geen login vereist!
            </p>

            {/* Genre Selection */}
            <FormControl variant="outlined" className={classes.formControl} fullWidth>
                <InputLabel id="genre-select-label">Selecteer een Genre</InputLabel>
                <Select
                    labelId="genre-select-label"
                    value={selectedGenre}
                    onChange={(event) => {
                        setSelectedGenre(event.target.value);
                        setConfig({
                            ...config,
                            selectedGenre: event.target.value,
                        });
                    }}
                    label="Selecteer een Genre"
                >
                    {genres.map((genre) => (
                        <MenuItem key={genre} value={genre}>
                            {genre.charAt(0).toUpperCase() + genre.slice(1)}
                        </MenuItem>
                    ))}
                </Select>
            </FormControl>

            {/* Preview Duration */}
            <FormControl variant="outlined" className={classes.formControl} fullWidth>
                <InputLabel id="duration-select-label">Preview Duur (seconden)</InputLabel>
                <Select
                    labelId="duration-select-label"
                    value={previewDuration}
                    onChange={(event) => setPreviewDuration(event.target.value)}
                    label="Preview Duur (seconden)"
                >
                    {PREVIEW_DURATIONS.map((duration) => (
                        <MenuItem key={duration} value={duration}>
                            {duration} seconden
                        </MenuItem>
                    ))}
                </Select>
            </FormControl>

            <h3>Aantal Songs</h3>
            <ConfigChoicesContainer
                min={1}
                config={config}
                setConfig={setConfig}
                type="songs"
            />
            <h3>Aantal Keuzes (Artists)</h3>
            <ConfigChoicesContainer
                min={2}
                config={config}
                setConfig={setConfig}
                type="artists"
            />

            <Box display="flex" justifyContent="center" alignItems="center">
                <Button
                    component={Link}
                    to="/guess"
                    onClick={() => handlePlay()}
                    disabled={!selectedGenre || loading}
                    variant="contained"
                    color="primary"
                    style={{
                        marginLeft: "auto",
                        marginRight: "auto",
                        marginTop: "4rem",
                        width: "10rem",
                    }}
                >
                    {loading ? "Laden..." : "Speel! 🎮"}
                </Button>
            </Box>

            {/* Multiplayer Mode */}
            <Box display="flex" justifyContent="center" alignItems="center" marginTop="2rem">
                <div style={{ textAlign: "center", width: "100%" }}>
                    <div style={{
                        padding: "1rem",
                        backgroundColor: "#f3f4f6",
                        borderRadius: "8px",
                        marginBottom: "1rem"
                    }}>
                        <h3 style={{ margin: "0 0 0.5rem 0" }}>🎮 Multiplayer Mode</h3>
                        <p style={{ margin: 0, fontSize: "0.9rem", color: "#666" }}>
                            Speel met vrienden! Real-time muziek raden met live scoreboard.
                        </p>
                    </div>
                    <Button
                        component={Link}
                        to="/multiplayer"
                        variant="contained"
                        style={{
                            backgroundColor: "#8b5cf6",
                            color: "white",
                            width: "10rem",
                            fontWeight: "bold"
                        }}
                    >
                        Multiplayer 🎵
                    </Button>
                </div>
            </Box>
        </div>
    );
};

export default Home;
