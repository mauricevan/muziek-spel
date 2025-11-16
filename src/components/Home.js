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
import fetchFromSpotify, { request } from "../services/api";
import ConfigChoicesContainer from "./home/ConfigChoicesContainer";
import LoadingSpinner from "./shared/LoadingSpinner";
import { PRESET_PLAYLISTS, PREVIEW_DURATIONS } from "../constants/playlists";

const AUTH_ENDPOINT =
    "https://nuod0t2zoe.execute-api.us-east-2.amazonaws.com/FT-Classroom/spotify-auth-token";
const TOKEN_KEY = "whos-who-access-token";

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
    const [genres, setGenres] = useState([]);
    const [selectedGenre, setSelectedGenre] = useState(
        localStorage.getItem("selectedGenre") ?? ""
    );
    const [authLoading, setAuthLoading] = useState(false);
    const [genresLoading, setGenresLoading] = useState(false);
    const [token, setToken] = useState("");
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

    const loadGenres = async (token) => {
        setGenresLoading(true);
        const response = await fetchFromSpotify({
            token,
            endpoint: "recommendations/available-genre-seeds",
        });
        console.log("Loaded genres:", response);
        setGenres(response.genres);
        setGenresLoading(false);
    };

    useEffect(() => {
        setArtists(), setSongs(), setCorrectGuess();
        setRedirectFlag(false);
        setAuthLoading(true);

        const storedTokenString = localStorage.getItem(TOKEN_KEY);
        if (storedTokenString) {
            const storedToken = JSON.parse(storedTokenString);
            if (storedToken.expiration > Date.now()) {
                console.log("Token found in localstorage");
                setAuthLoading(false);
                setToken(storedToken.value);
                loadGenres(storedToken.value);
                return;
            }
        }
        console.log("Sending request to AWS endpoint");
        request(AUTH_ENDPOINT).then(({ access_token, expires_in }) => {
            const newToken = {
                value: access_token,
                expiration: Date.now() + (expires_in - 20) * 1000,
            };
            localStorage.setItem(TOKEN_KEY, JSON.stringify(newToken));
            console.log(newToken.value);
            setAuthLoading(false);
            setToken(newToken.value);
            loadGenres(newToken.value);
        });
    }, []);

    if (authLoading || genresLoading) {
        return <LoadingSpinner />;
    }

    const getSongs = async ({ _artists, _correctIdx }) => {
        let _tracks;
        let response;
        response = await fetchFromSpotify({
            token,
            endpoint: `artists/${_artists[_correctIdx].id}/top-tracks?market=US`,
        });
        _tracks = response.tracks.filter((x) => x.preview_url !== null);
        _tracks = _tracks.slice(0, config.qtySongs);
        if (_tracks.length < config.qtySongs) {
            const _correctIdx = Math.floor(Math.random() * config.qtyArtists);
            setCorrectGuess(_artists[_correctIdx].name);
            getSongs({_artists, _correctIdx})
        }
        setSongs(_tracks);
    };

    const getTracksFromPlaylist = async (playlistId) => {
        try {
            const response = await fetchFromSpotify({
                token,
                endpoint: `playlists/${playlistId}/tracks`,
            });

            if (!response.items || response.items.length === 0) {
                alert('No tracks found in this playlist');
                return null;
            }

            let _tracks = response.items
                .map(item => item.track)
                .filter(track => track && track.preview_url !== null);

            if (_tracks.length === 0) {
                alert('No tracks with preview URLs found in this playlist');
                return null;
            }

            return _tracks;
        } catch (error) {
            console.error('Error fetching playlist:', error);
            if (error.response && error.response.status === 404) {
                alert('Playlist not found. Please check the ID and try again.');
            } else if (error.response && error.response.status === 429) {
                alert('Too many requests. Please wait a moment and try again.');
            } else {
                alert('Error loading playlist. Please try again.');
            }
            return null;
        }
    };

    const getArtists = async () => {
        let _tracks = [];
        let response;

        if (sourceMode === 'playlist') {
            const playlistId = selectedPlaylist || customPlaylistId;
            if (!playlistId) {
                alert('Please select or enter a playlist ID');
                return null;
            }
            _tracks = await getTracksFromPlaylist(playlistId);
            if (!_tracks) return null;

            // Shuffle and get unique artists
            _tracks = _tracks.sort(() => Math.random() - 0.5);
        } else {
            // Original genre-based approach
            while (_tracks.length < config.qtyArtists) {
                response = await fetchFromSpotify({
                    token,
                    endpoint: `recommendations?limit=${
                        config.qtyArtists * 3
                    }&market=US&seed_genres=${config.selectedGenre}`,
                });
                _tracks = response.tracks.filter((x) => x.preview_url !== null);
            }
        }

        console.log("getArtists tracks:", _tracks);
        const _artists = [];
        for (const x of _tracks.slice(0, config.qtyArtists)) {
            _artists.push({
                name: x.artists[0].name,
                id: x.artists[0].id,
            });
        }
        setArtists(_artists);
        const _correctIdx = Math.floor(Math.random() * config.qtyArtists);
        setCorrectGuess(_artists[_correctIdx].name);
        return { _artists, _correctIdx };
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
                Kies je muziekbron, configureer het spel en raad de artiest!
            </p>

            {/* Music Source Selection */}
            <FormControl component="fieldset" style={{ margin: "1rem 0" }}>
                <FormLabel component="legend">Muziekbron</FormLabel>
                <RadioGroup
                    value={sourceMode}
                    onChange={(e) => setSourceMode(e.target.value)}
                >
                    <FormControlLabel
                        value="genre"
                        control={<Radio color="primary" />}
                        label="Genre (Spotify Recommendations)"
                    />
                    <FormControlLabel
                        value="playlist"
                        control={<Radio color="primary" />}
                        label="Playlist (Tijdperk/Eigen keuze)"
                    />
                </RadioGroup>
            </FormControl>

            {/* Genre Selection */}
            {sourceMode === "genre" && (
                <FormControl variant="outlined" className={classes.formControl} fullWidth>
                    <InputLabel id="genre-select-label">Genre</InputLabel>
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
                        label="Genre"
                    >
                        <MenuItem value="">
                            <em>Selecteer een genre</em>
                        </MenuItem>
                        {genres.map((genre) => (
                            <MenuItem key={genre} value={genre}>
                                {genre}
                            </MenuItem>
                        ))}
                    </Select>
                </FormControl>
            )}

            {/* Playlist Selection */}
            {sourceMode === "playlist" && (
                <>
                    <FormControl variant="outlined" className={classes.formControl} fullWidth>
                        <InputLabel id="playlist-select-label">
                            Preset Playlists (Tijdperken)
                        </InputLabel>
                        <Select
                            labelId="playlist-select-label"
                            value={selectedPlaylist}
                            onChange={(event) => {
                                setSelectedPlaylist(event.target.value);
                                setCustomPlaylistId(""); // Clear custom ID when preset selected
                            }}
                            label="Preset Playlists (Tijdperken)"
                        >
                            <MenuItem value="">
                                <em>Selecteer een tijdperk</em>
                            </MenuItem>
                            {Object.entries(PRESET_PLAYLISTS).map(([key, playlist]) => (
                                <MenuItem key={key} value={playlist.id}>
                                    {playlist.name} - {playlist.description}
                                </MenuItem>
                            ))}
                        </Select>
                    </FormControl>

                    <Box style={{ margin: "1rem 0", textAlign: "center" }}>
                        <em>- OF -</em>
                    </Box>

                    <TextField
                        fullWidth
                        variant="outlined"
                        label="Eigen Playlist ID"
                        placeholder="Bijv: 37i9dQZF1DXcBWIGoYBM5M"
                        value={customPlaylistId}
                        onChange={(e) => {
                            setCustomPlaylistId(e.target.value);
                            setSelectedPlaylist(""); // Clear preset when custom entered
                        }}
                        helperText="Vind de Playlist ID in de Spotify URL"
                    />
                </>
            )}

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
                    disabled={
                        (sourceMode === "genre" && selectedGenre === "") ||
                        (sourceMode === "playlist" && !selectedPlaylist && !customPlaylistId)
                    }
                    variant="contained"
                    color="primary"
                    style={{
                        marginLeft: "auto",
                        marginRight: "auto",
                        marginTop: "4rem",
                        width: "10rem",
                    }}
                >
                    Speel! 🎮
                </Button>
            </Box>
        </div>
    );
};

export default Home;
