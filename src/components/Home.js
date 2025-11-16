import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { getArtistsByGenre, getAlbumsByArtist, getTracksByAlbum } from "../services/audiodb";
import { getTrackPreviews } from "../services/deezer";
import LoadingSpinner from "./shared/LoadingSpinner";
import { PREVIEW_DURATIONS } from "../constants/playlists";
import toast from 'react-hot-toast';
import {
    FaMusic, FaGuitar, FaDrum, FaCompactDisc,
    FaBroadcastTower, FaMicrophone, FaHeadphones,
    FaRecordVinyl, FaMoon, FaSun, FaUsers
} from 'react-icons/fa';
import socketService from '../services/socket';

const GENRE_ICONS = {
    "pop": FaMusic,
    "rock": FaGuitar,
    "hip-hop": FaMicrophone,
    "electronic": FaBroadcastTower,
    "jazz": FaMusic,
    "classical": FaCompactDisc,
    "country": FaRecordVinyl,
    "r-n-b": FaCompactDisc,
    "latin": FaDrum,
    "indie": FaHeadphones
};

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
    const [previewDuration, setPreviewDuration] = useState(
        Number(localStorage.getItem("previewDuration")) || 30
    );
    const [darkMode, setDarkMode] = useState(
        localStorage.getItem("darkMode") === "true"
    );
    const [numSongs, setNumSongs] = useState(
        Number(localStorage.getItem("qtySongs")) || 1
    );
    const [numArtists, setNumArtists] = useState(
        Number(localStorage.getItem("qtyArtists")) || 2
    );
    const [roomStatus, setRoomStatus] = useState({
        hasActiveRoom: false,
        playerCount: 0,
        gameState: null
    });

    useEffect(() => {
        setArtists();
        setSongs();
        setCorrectGuess();
        setRedirectFlag(false);

        // Apply dark mode
        if (darkMode) {
            document.documentElement.classList.add('dark');
        } else {
            document.documentElement.classList.remove('dark');
        }
    }, [darkMode]);

    // Monitor multiplayer room status
    useEffect(() => {
        const socket = socketService.getSocket();

        // Request initial status
        socket.emit('getRoomStatus');

        // Listen for status updates
        const handleRoomStatus = (status) => {
            setRoomStatus(status);
        };

        const handleRoomStatusChanged = (status) => {
            setRoomStatus(status);
        };

        socket.on('roomStatus', handleRoomStatus);
        socket.on('roomStatusChanged', handleRoomStatusChanged);

        return () => {
            socket.off('roomStatus', handleRoomStatus);
            socket.off('roomStatusChanged', handleRoomStatusChanged);
        };
    }, []);

    const toggleDarkMode = () => {
        const newMode = !darkMode;
        setDarkMode(newMode);
        localStorage.setItem("darkMode", newMode);
    };

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
            toast.error("Er is een fout opgetreden bij het ophalen van tracks");
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
                toast.error('Geen artiesten gevonden voor dit genre. Probeer een ander genre!');
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
            toast.error('Er is een fout opgetreden bij het ophalen van artiesten. Probeer het opnieuw!');
            setLoading(false);
            return null;
        }
    };

    const saveConfig = () => {
        localStorage.setItem("selectedGenre", selectedGenre);
        localStorage.setItem("qtyArtists", numArtists);
        localStorage.setItem("qtySongs", numSongs);
        localStorage.setItem("previewDuration", previewDuration);
    };

    const handlePlay = async () => {
        if (!selectedGenre) {
            toast.error('Selecteer eerst een genre!');
            return;
        }

        saveConfig();
        setConfig({
            ...config,
            selectedGenre: selectedGenre,
            qtySongs: numSongs,
            qtyArtists: numArtists,
            previewDuration: previewDuration
        });

        const loadingToast = toast.loading('Muziek wordt geladen...');
        const artistsData = await getArtists();
        toast.dismiss(loadingToast);

        if (artistsData) {
            getSongs(artistsData);
        }
    };

    const GenreIcon = GENRE_ICONS[selectedGenre] || FaMusic;

    return (
        <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 dark:from-gray-900 dark:via-purple-900 dark:to-blue-900 p-4 sm:p-8 animate-fade-in">
            <div className="max-w-6xl mx-auto">
                {/* Header met Dark Mode Toggle */}
                <div className="flex justify-between items-center mb-8">
                    <div className="flex-1" />
                    <button
                        onClick={toggleDarkMode}
                        className="p-3 rounded-full bg-white dark:bg-gray-800 shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-110"
                        aria-label="Toggle dark mode"
                    >
                        {darkMode ? (
                            <FaSun className="text-yellow-400 text-xl" />
                        ) : (
                            <FaMoon className="text-gray-700 text-xl" />
                        )}
                    </button>
                </div>

                {/* Title Section */}
                <div className="text-center mb-12 animate-slide-down">
                    <h1 className="text-5xl sm:text-6xl font-bold mb-4">
                        <span className="text-gradient">Muziek Raad Spelletje</span> 🎵
                    </h1>
                    <p className="text-xl text-gray-700 dark:text-gray-300 mb-2">
                        Kies je genre, configureer het spel en raad de artiest!
                    </p>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                        Powered by TheAudioDB & Deezer - Geen login vereist!
                    </p>
                </div>

                {/* Genre Selection - Cards */}
                <div className="mb-12 animate-slide-up">
                    <h2 className="text-2xl font-bold mb-6 text-center dark:text-white">
                        Selecteer een Genre
                    </h2>
                    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
                        {genres.map((genre) => {
                            const Icon = GENRE_ICONS[genre] || FaMusic;
                            const isSelected = selectedGenre === genre;
                            return (
                                <button
                                    key={genre}
                                    onClick={() => {
                                        setSelectedGenre(genre);
                                        setConfig({ ...config, selectedGenre: genre });
                                    }}
                                    className={`genre-card ${isSelected ? 'genre-card-selected' : ''} focus-visible-ring`}
                                    aria-label={`Select ${genre} genre`}
                                    aria-pressed={isSelected}
                                >
                                    <div className="flex flex-col items-center gap-3">
                                        <Icon className={`text-4xl ${isSelected ? 'text-blue-500' : 'text-gray-600 dark:text-gray-400'}`} />
                                        <span className={`font-semibold capitalize ${isSelected ? 'text-blue-600 dark:text-blue-400' : 'text-gray-700 dark:text-gray-300'}`}>
                                            {genre}
                                        </span>
                                    </div>
                                </button>
                            );
                        })}
                    </div>
                </div>

                {/* Settings Grid */}
                <div className="grid md:grid-cols-2 gap-6 mb-8">
                    {/* Preview Duration */}
                    <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-6 animate-scale-in">
                        <label className="block text-lg font-semibold mb-4 dark:text-white">
                            Preview Duur: {previewDuration}s
                        </label>
                        <div className="flex items-center gap-4">
                            <span className="text-sm text-gray-600 dark:text-gray-400">10s</span>
                            <input
                                type="range"
                                min="10"
                                max="30"
                                step="5"
                                value={previewDuration}
                                onChange={(e) => setPreviewDuration(Number(e.target.value))}
                                className="flex-1 h-3 bg-gray-200 dark:bg-gray-700 rounded-lg appearance-none cursor-pointer accent-blue-500"
                                aria-label="Preview duration slider"
                            />
                            <span className="text-sm text-gray-600 dark:text-gray-400">30s</span>
                        </div>
                        <div className="flex gap-2 mt-4">
                            {PREVIEW_DURATIONS.map(duration => (
                                <button
                                    key={duration}
                                    onClick={() => setPreviewDuration(duration)}
                                    className={`px-3 py-1 rounded-lg text-sm font-medium transition-all ${
                                        previewDuration === duration
                                            ? 'bg-blue-500 text-white'
                                            : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-600'
                                    }`}
                                >
                                    {duration}s
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Number of Songs */}
                    <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-6 animate-scale-in">
                        <label className="block text-lg font-semibold mb-4 dark:text-white">
                            Aantal Songs: {numSongs}
                        </label>
                        <div className="flex items-center gap-4">
                            <span className="text-sm text-gray-600 dark:text-gray-400">1</span>
                            <input
                                type="range"
                                min="1"
                                max="5"
                                value={numSongs}
                                onChange={(e) => {
                                    const value = Number(e.target.value);
                                    setNumSongs(value);
                                    setConfig({ ...config, qtySongs: value });
                                }}
                                className="flex-1 h-3 bg-gray-200 dark:bg-gray-700 rounded-lg appearance-none cursor-pointer accent-blue-500"
                                aria-label="Number of songs slider"
                            />
                            <span className="text-sm text-gray-600 dark:text-gray-400">5</span>
                        </div>
                        <div className="flex gap-2 mt-4">
                            {[1, 2, 3, 4, 5].map(num => (
                                <button
                                    key={num}
                                    onClick={() => {
                                        setNumSongs(num);
                                        setConfig({ ...config, qtySongs: num });
                                    }}
                                    className={`px-3 py-1 rounded-lg text-sm font-medium transition-all ${
                                        numSongs === num
                                            ? 'bg-blue-500 text-white'
                                            : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-600'
                                    }`}
                                >
                                    {num}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Number of Artists */}
                    <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-6 animate-scale-in md:col-span-2">
                        <label className="block text-lg font-semibold mb-4 dark:text-white">
                            Aantal Keuzes (Artists): {numArtists}
                        </label>
                        <div className="flex items-center gap-4">
                            <span className="text-sm text-gray-600 dark:text-gray-400">2</span>
                            <input
                                type="range"
                                min="2"
                                max="6"
                                value={numArtists}
                                onChange={(e) => {
                                    const value = Number(e.target.value);
                                    setNumArtists(value);
                                    setConfig({ ...config, qtyArtists: value });
                                }}
                                className="flex-1 h-3 bg-gray-200 dark:bg-gray-700 rounded-lg appearance-none cursor-pointer accent-blue-500"
                                aria-label="Number of artists slider"
                            />
                            <span className="text-sm text-gray-600 dark:text-gray-400">6</span>
                        </div>
                        <div className="flex gap-2 mt-4 flex-wrap justify-center">
                            {[2, 3, 4, 5, 6].map(num => (
                                <button
                                    key={num}
                                    onClick={() => {
                                        setNumArtists(num);
                                        setConfig({ ...config, qtyArtists: num });
                                    }}
                                    className={`px-4 py-2 rounded-lg font-medium transition-all ${
                                        numArtists === num
                                            ? 'bg-blue-500 text-white'
                                            : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-600'
                                    }`}
                                >
                                    {num}
                                </button>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Play Button */}
                <div className="flex justify-center mb-8">
                    <Link to="/guess" onClick={() => handlePlay()}>
                        <button
                            disabled={!selectedGenre || loading}
                            className="btn-primary text-xl px-12 py-4 focus-visible-ring"
                            aria-label="Start playing the game"
                        >
                            {loading ? "Laden..." : "Speel! 🎮"}
                        </button>
                    </Link>
                </div>

                {/* Multiplayer Section */}
                <div className="bg-gradient-to-r from-purple-500 to-blue-600 rounded-3xl shadow-2xl p-8 text-white animate-scale-in relative overflow-hidden">
                    {/* Live Status Indicator */}
                    {roomStatus.hasActiveRoom && (
                        <div className="absolute top-4 right-4 flex items-center gap-2 bg-white/20 backdrop-blur-sm px-4 py-2 rounded-full animate-pulse">
                            <div className="w-2 h-2 bg-green-400 rounded-full animate-ping"></div>
                            <div className="w-2 h-2 bg-green-400 rounded-full absolute"></div>
                            <FaUsers className="text-white ml-2" />
                            <span className="text-sm font-semibold">
                                {roomStatus.playerCount} {roomStatus.playerCount === 1 ? 'speler' : 'spelers'} online
                            </span>
                        </div>
                    )}

                    <div className="text-center">
                        <h3 className="text-3xl font-bold mb-3">🎮 Multiplayer Mode</h3>
                        <p className="text-lg mb-6 opacity-90">
                            Speel met vrienden! Real-time muziek raden met live scoreboard.
                        </p>

                        {/* Status bericht */}
                        {roomStatus.hasActiveRoom && (
                            <div className="mb-4 bg-white/20 backdrop-blur-sm rounded-lg p-3 animate-bounce">
                                <p className="text-sm font-semibold">
                                    {roomStatus.gameState === 'playing' ? '🎮 Er is een game bezig!' : '👥 Spelers in de lobby!'}
                                </p>
                                <p className="text-xs opacity-90 mt-1">
                                    Klik op de knop om mee te doen!
                                </p>
                            </div>
                        )}

                        <Link to="/multiplayer">
                            <button
                                className="bg-white text-purple-600 font-bold py-3 px-8 rounded-lg shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105 focus-visible-ring"
                                aria-label="Go to multiplayer mode"
                            >
                                {roomStatus.hasActiveRoom ? 'Join Game 🎵' : 'Multiplayer Starten 🎵'}
                            </button>
                        </Link>
                    </div>
                </div>

                {/* Info Section */}
                <div className="mt-8 bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-6">
                    <h3 className="text-xl font-bold mb-4 dark:text-white">ℹ️ Hoe te spelen</h3>
                    <ul className="space-y-2 text-gray-700 dark:text-gray-300">
                        <li>🎵 Selecteer je favoriete genre</li>
                        <li>⚙️ Configureer het aantal songs en keuzes</li>
                        <li>🎧 Luister naar de preview(s)</li>
                        <li>🎯 Raad de juiste artiest zo snel mogelijk!</li>
                        <li>⚡ Sneller = meer punten en hogere streak bonus</li>
                    </ul>
                </div>
            </div>
        </div>
    );
};

export default Home;
