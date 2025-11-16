import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import socketService from '../services/socket';
import MultiplayerGame from './MultiplayerGame';
import { FaArrowLeft, FaMusic } from 'react-icons/fa';
import toast, { Toaster } from 'react-hot-toast';
import '../styles/tailwind.css';

const MUSIC_FACTS = [
    "🎵 Muziek kan je humeur verbeteren en stress verminderen!",
    "🎸 De gitaar is het meest gespeelde instrument ter wereld",
    "🎹 Mozart schreef zijn eerste symfonie toen hij 8 jaar oud was",
    "🎤 De langste opgenomen rocksong is 76 minuten lang",
    "🎧 Mensen die muziek luisteren zijn gelukkiger",
    "🎼 Beethoven was volledig doof toen hij zijn 9e symfonie schreef",
    "🎺 Jazz werd geboren in New Orleans rond 1900",
    "🥁 De drummer van The Beatles, Ringo Starr, is linkshandig",
    "🎻 Een viool heeft meer dan 70 verschillende onderdelen",
    "🎸 De duurste gitaar ooit verkocht kostte $2,7 miljoen"
];

const MultiplayerLobby = () => {
    const [username, setUsername] = useState('');
    const [joined, setJoined] = useState(false);
    const [isAdmin, setIsAdmin] = useState(false);
    const [players, setPlayers] = useState([]);
    const [gameState, setGameState] = useState('lobby');
    const [settings, setSettings] = useState({
        category: 'pop',
        maxPlayers: 10,
        guessesPerClip: 3,
        winScore: 10,
        clipDuration: 20
    });
    const [error, setError] = useState('');
    const [totalScore, setTotalScore] = useState(0);
    const [currentFact, setCurrentFact] = useState(0);

    useEffect(() => {
        // Check localStorage voor saved username
        const savedUsername = localStorage.getItem('musicGameUsername');
        if (savedUsername) {
            setUsername(savedUsername);
        }

        // Connect socket
        socketService.connect();

        // Event listeners
        socketService.on('roomUpdate', handleRoomUpdate);
        socketService.on('gameStarted', handleGameStarted);
        socketService.on('newAdmin', handleNewAdmin);
        socketService.on('error', handleError);

        // Rotate music facts every 5 seconds
        const factInterval = setInterval(() => {
            setCurrentFact(prev => (prev + 1) % MUSIC_FACTS.length);
        }, 5000);

        return () => {
            socketService.removeAllListeners('roomUpdate');
            socketService.removeAllListeners('gameStarted');
            socketService.removeAllListeners('newAdmin');
            socketService.removeAllListeners('error');
            clearInterval(factInterval);
        };
    }, []);

    const handleRoomUpdate = (data) => {
        setPlayers(data.players);
        setGameState(data.gameState);
        setSettings(data.settings);
    };

    const handleGameStarted = (data) => {
        setGameState('playing');
    };

    const handleNewAdmin = (data) => {
        if (data.username === username) {
            setIsAdmin(true);
            toast.success(`Je bent nu de admin! 👑`);
        }
    };

    const handleError = (data) => {
        setError(data.message);
        setTimeout(() => setError(''), 3000);
    };

    const handleJoin = async () => {
        if (!username.trim()) {
            setError('Vul een username in!');
            return;
        }

        try {
            const response = await socketService.join(username.trim());
            setJoined(true);
            setIsAdmin(response.isAdmin);
            setTotalScore(response.totalScore);
            localStorage.setItem('musicGameUsername', username.trim());

            if (response.isAdmin) {
                toast.success('🎉 Je bent de eerste speler en automatisch admin!');
            }
        } catch (err) {
            setError(err.message);
        }
    };

    const handleSettingChange = (key, value) => {
        const newSettings = { ...settings, [key]: value };
        setSettings(newSettings);
        socketService.updateSettings(newSettings);
    };

    const handleStartGame = () => {
        if (players.length < 2) {
            setError('Er moeten minimaal 2 spelers zijn om te starten!');
            return;
        }
        socketService.startGame();
    };

    // Als game bezig is, toon game component
    if (gameState === 'playing' || gameState === 'finished') {
        return (
            <MultiplayerGame
                username={username}
                isAdmin={isAdmin}
                settings={settings}
                gameState={gameState}
            />
        );
    }

    // Login scherm
    if (!joined) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-purple-600 via-blue-600 to-indigo-700 flex items-center justify-center p-4">
                <Toaster position="top-center" />
                {/* Back Button */}
                <Link
                    to="/"
                    className="absolute top-4 left-4 inline-flex items-center gap-2 px-4 py-2 bg-white/90 text-gray-700 rounded-lg shadow-md hover:shadow-xl transition-all duration-300 hover:scale-105 focus-visible-ring"
                    aria-label="Terug naar home"
                >
                    <FaArrowLeft />
                    <span className="font-semibold">Home</span>
                </Link>

                <div className="bg-white rounded-2xl shadow-2xl p-8 max-w-md w-full">
                    <div className="text-center mb-8">
                        <h1 className="text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-purple-600 to-blue-600 mb-2">
                            🎵 Muziek Raad Spel
                        </h1>
                        <p className="text-gray-600">Multiplayer Music Guessing Game</p>
                    </div>

                    {error && (
                        <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 mb-4 rounded">
                            {error}
                        </div>
                    )}

                    <div className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Kies je username
                            </label>
                            <input
                                type="text"
                                value={username}
                                onChange={(e) => setUsername(e.target.value)}
                                onKeyPress={(e) => e.key === 'Enter' && handleJoin()}
                                placeholder="Bijv. MusicLover123"
                                className="input-field"
                                autoFocus
                            />
                        </div>

                        <button
                            onClick={handleJoin}
                            className="btn-primary w-full"
                        >
                            Join Game 🎮
                        </button>
                    </div>

                    <div className="mt-6 text-center text-sm text-gray-500">
                        <p>👑 Eerste speler wordt automatisch admin</p>
                        <p className="mt-1">🎯 Raad de muziek zo snel mogelijk!</p>
                    </div>
                </div>
            </div>
        );
    }

    // Lobby scherm
    return (
        <div className="min-h-screen bg-gradient-to-br from-purple-600 via-blue-600 to-indigo-700 p-4">
            <Toaster position="top-center" />

            {/* Back Button */}
            <Link
                to="/"
                className="inline-flex items-center gap-2 px-4 py-2 bg-white/90 text-gray-700 rounded-lg shadow-md hover:shadow-xl transition-all duration-300 hover:scale-105 focus-visible-ring mb-6"
                aria-label="Terug naar home"
            >
                <FaArrowLeft />
                <span className="font-semibold">Terug naar Home</span>
            </Link>

            <div className="max-w-6xl mx-auto">
                {/* Header */}
                <div className="bg-white rounded-2xl shadow-2xl p-6 mb-6">
                    <div className="flex items-center justify-between">
                        <div>
                            <h1 className="text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-purple-600 to-blue-600">
                                🎵 Game Lobby
                            </h1>
                            <p className="text-gray-600 mt-1">
                                Welkom, <span className="font-semibold">{username}</span>
                                {isAdmin && <span className="ml-2 text-yellow-600">👑 Admin</span>}
                            </p>
                        </div>
                        <div className="text-right">
                            <p className="text-sm text-gray-500">Totale Score</p>
                            <p className="text-2xl font-bold text-purple-600">{totalScore}</p>
                        </div>
                    </div>
                </div>

                {error && (
                    <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 mb-4 rounded-lg">
                        {error}
                    </div>
                )}

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* Spelers lijst */}
                    <div className="lg:col-span-2">
                        <div className="bg-white rounded-2xl shadow-xl p-6">
                            <h2 className="text-2xl font-bold mb-4 flex items-center">
                                👥 Spelers ({players.length}/{settings.maxPlayers})
                            </h2>

                            <div className="space-y-3">
                                {players.map((player, index) => (
                                    <div
                                        key={index}
                                        className="flex items-center justify-between p-4 bg-gradient-to-r from-purple-50 to-blue-50 rounded-lg card-hover"
                                    >
                                        <div className="flex items-center space-x-3">
                                            <div className="w-10 h-10 bg-gradient-to-r from-purple-500 to-blue-500 rounded-full flex items-center justify-center text-white font-bold">
                                                {player.username.charAt(0).toUpperCase()}
                                            </div>
                                            <div>
                                                <p className="font-semibold text-gray-800">
                                                    {player.username}
                                                    {player.isAdmin && <span className="ml-2">👑</span>}
                                                </p>
                                                <p className="text-sm text-gray-500">
                                                    Totaal: {player.totalScore} punten
                                                </p>
                                            </div>
                                        </div>
                                    </div>
                                ))}

                                {players.length === 0 && (
                                    <div className="text-center py-8">
                                        <FaMusic className="text-4xl text-gray-400 mx-auto mb-4 animate-pulse" />
                                        <p className="text-gray-400 mb-4">Wachten op spelers...</p>
                                        <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-4 transition-all duration-500 animate-fade-in">
                                            <p className="text-sm text-gray-700 dark:text-gray-300 font-medium">
                                                💡 Wist je dat...
                                            </p>
                                            <p className="text-gray-600 dark:text-gray-400 mt-2">
                                                {MUSIC_FACTS[currentFact]}
                                            </p>
                                        </div>
                                    </div>
                                )}
                            </div>

                            {players.length < 2 && (
                                <div className="mt-4 p-4 bg-yellow-50 border-l-4 border-yellow-400 rounded">
                                    <p className="text-yellow-700">
                                        ⏳ Minimaal 2 spelers nodig om te starten
                                    </p>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Settings (Admin only) */}
                    <div>
                        <div className="bg-white rounded-2xl shadow-xl p-6">
                            <h2 className="text-2xl font-bold mb-4">⚙️ Settings</h2>

                            {isAdmin ? (
                                <div className="space-y-4">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                            Categorie
                                        </label>
                                        <select
                                            value={settings.category}
                                            onChange={(e) => handleSettingChange('category', e.target.value)}
                                            className="input-field"
                                        >
                                            <option value="pop">Pop</option>
                                            <option value="rock">Rock</option>
                                            <option value="hip-hop">Hip-Hop</option>
                                            <option value="electronic">Electronic</option>
                                            <option value="jazz">Jazz</option>
                                            <option value="classical">Classical</option>
                                        </select>
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                            Max Spelers: {settings.maxPlayers}
                                        </label>
                                        <input
                                            type="range"
                                            min="2"
                                            max="20"
                                            value={settings.maxPlayers}
                                            onChange={(e) => handleSettingChange('maxPlayers', parseInt(e.target.value))}
                                            className="w-full"
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                            Win Score: {settings.winScore}
                                        </label>
                                        <input
                                            type="range"
                                            min="5"
                                            max="50"
                                            step="5"
                                            value={settings.winScore}
                                            onChange={(e) => handleSettingChange('winScore', parseInt(e.target.value))}
                                            className="w-full"
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                            Clip Duur: {settings.clipDuration}s
                                        </label>
                                        <input
                                            type="range"
                                            min="10"
                                            max="30"
                                            step="5"
                                            value={settings.clipDuration}
                                            onChange={(e) => handleSettingChange('clipDuration', parseInt(e.target.value))}
                                            className="w-full"
                                        />
                                    </div>

                                    <button
                                        onClick={handleStartGame}
                                        disabled={players.length < 2}
                                        className={`w-full py-4 rounded-lg font-bold text-white transition-all duration-300 ${
                                            players.length >= 2
                                                ? 'bg-gradient-to-r from-green-500 to-emerald-600 hover:shadow-xl hover:scale-105'
                                                : 'bg-gray-300 cursor-not-allowed'
                                        }`}
                                    >
                                        🚀 Start Game
                                    </button>
                                </div>
                            ) : (
                                <div className="space-y-3 text-gray-600">
                                    <p><strong>Categorie:</strong> {settings.category}</p>
                                    <p><strong>Max Spelers:</strong> {settings.maxPlayers}</p>
                                    <p><strong>Win Score:</strong> {settings.winScore}</p>
                                    <p><strong>Clip Duur:</strong> {settings.clipDuration}s</p>
                                    <div className="mt-4 p-3 bg-blue-50 rounded-lg text-sm">
                                        ⏳ Wachten op admin om te starten...
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* Instructies */}
                        <div className="mt-6 bg-white rounded-2xl shadow-xl p-6">
                            <h3 className="font-bold mb-3">📖 Hoe te spelen</h3>
                            <ul className="text-sm text-gray-600 space-y-2">
                                <li>🎵 Luister naar het muziekfragment</li>
                                <li>⌨️ Type de artiest of titel</li>
                                <li>⚡ Sneller raden = meer punten!</li>
                                <li>🏆 Eerste bij {settings.winScore} punten wint</li>
                            </ul>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default MultiplayerLobby;
