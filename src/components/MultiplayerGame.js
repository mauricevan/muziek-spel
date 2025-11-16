import React, { useState, useEffect, useRef } from 'react';
import socketService from '../services/socket';
import { Howl } from 'howler';
import { searchTrack } from '../services/deezer';
import '../styles/tailwind.css';

const MultiplayerGame = ({ username, isAdmin, settings, gameState: initialGameState }) => {
    const [players, setPlayers] = useState([]);
    const [currentTrack, setCurrentTrack] = useState(null);
    const [guess, setGuess] = useState('');
    const [chatMessages, setChatMessages] = useState([]);
    const [chatInput, setChatInput] = useState('');
    const [round, setRound] = useState(1);
    const [isPlaying, setIsPlaying] = useState(false);
    const [timeLeft, setTimeLeft] = useState(settings.clipDuration);
    const [hasGuessed, setHasGuessed] = useState(false);
    const [notification, setNotification] = useState('');
    const [gameState, setGameState] = useState(initialGameState);
    const [winner, setWinner] = useState(null);

    const audioRef = useRef(null);
    const chatEndRef = useRef(null);
    const timerRef = useRef(null);

    useEffect(() => {
        // Socket listeners
        socketService.on('roomUpdate', handleRoomUpdate);
        socketService.on('newRound', handleNewRound);
        socketService.on('correctGuess', handleCorrectGuess);
        socketService.on('chatMessage', handleChatMessage);
        socketService.on('gameEnded', handleGameEnded);

        // Load eerste track
        loadRandomTrack();

        return () => {
            socketService.removeAllListeners('roomUpdate');
            socketService.removeAllListeners('newRound');
            socketService.removeAllListeners('correctGuess');
            socketService.removeAllListeners('chatMessage');
            socketService.removeAllListeners('gameEnded');

            if (audioRef.current) {
                audioRef.current.stop();
            }
            if (timerRef.current) {
                clearInterval(timerRef.current);
            }
        };
    }, []);

    useEffect(() => {
        // Auto-scroll chat
        chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [chatMessages]);

    const handleRoomUpdate = (data) => {
        setPlayers(data.players);
    };

    const handleNewRound = (data) => {
        setRound(data.round);
        setHasGuessed(false);
        setGuess('');
        loadRandomTrack();
        showNotification(`🎵 Ronde ${data.round}!`);
    };

    const handleCorrectGuess = (data) => {
        showNotification(`🎉 ${data.username} raadde correct! +${data.points} punten`);
    };

    const handleChatMessage = (data) => {
        setChatMessages(prev => [...prev, data]);
    };

    const handleGameEnded = (data) => {
        setGameState('finished');
        setWinner(data.winner);

        if (audioRef.current) {
            audioRef.current.stop();
        }
        if (timerRef.current) {
            clearInterval(timerRef.current);
        }

        if (data.winner === username) {
            showNotification('🏆 JE HEBT GEWONNEN! 🏆');
        } else {
            showNotification(`Game afgelopen! Winner: ${data.winner || 'Niemand'}`);
        }
    };

    const loadRandomTrack = async () => {
        try {
            console.log('Loading track for category:', settings.category);

            // Gebruik de deezer service om een track te zoeken
            const track = await searchTrack(settings.category, '');

            if (track && track.preview) {
                console.log('Track loaded:', track.title, 'by', track.artist?.name);

                setCurrentTrack({
                    title: track.title,
                    artist: track.artist?.name || 'Unknown',
                    preview: track.preview,
                    cover: track.album?.cover_medium
                });

                // Start audio
                playAudio(track.preview);
            } else {
                console.error('No track found or no preview available');
                showNotification('❌ Geen track met preview gevonden');
            }
        } catch (error) {
            console.error('Error loading track:', error);
            showNotification('❌ Error bij laden van track');
        }
    };

    const playAudio = (url) => {
        if (audioRef.current) {
            audioRef.current.stop();
        }

        audioRef.current = new Howl({
            src: [url],
            html5: true,
            volume: 0.7,
            onplay: () => {
                setIsPlaying(true);
                startTimer();
            },
            onend: () => {
                setIsPlaying(false);
                if (timerRef.current) {
                    clearInterval(timerRef.current);
                }
            }
        });

        audioRef.current.play();
    };

    const startTimer = () => {
        setTimeLeft(settings.clipDuration);

        timerRef.current = setInterval(() => {
            setTimeLeft(prev => {
                if (prev <= 1) {
                    if (timerRef.current) {
                        clearInterval(timerRef.current);
                    }
                    return 0;
                }
                return prev - 1;
            });
        }, 1000);
    };

    const handleSubmitGuess = () => {
        if (!guess.trim() || hasGuessed) return;

        socketService.submitGuess(guess.trim(), currentTrack);
        setHasGuessed(true);
        showNotification('Guess ingediend! ⏳');
    };

    const handleSendChat = () => {
        if (!chatInput.trim()) return;

        socketService.sendChatMessage(chatInput.trim());
        setChatInput('');
    };

    const handleNextRound = () => {
        socketService.nextRound();
    };

    const handleStopGame = () => {
        if (confirm('Weet je zeker dat je de game wilt stoppen?')) {
            socketService.stopGame();
        }
    };

    const showNotification = (message) => {
        setNotification(message);
        setTimeout(() => setNotification(''), 3000);
    };

    const toggleAudio = () => {
        if (!audioRef.current) return;

        if (isPlaying) {
            audioRef.current.pause();
            setIsPlaying(false);
        } else {
            audioRef.current.play();
            setIsPlaying(true);
        }
    };

    // Game finished screen
    if (gameState === 'finished') {
        const sortedPlayers = [...players].sort((a, b) => b.gameScore - a.gameScore);

        return (
            <div className="min-h-screen bg-gradient-to-br from-purple-600 via-blue-600 to-indigo-700 flex items-center justify-center p-4">
                <div className="bg-white rounded-2xl shadow-2xl p-8 max-w-2xl w-full">
                    <div className="text-center mb-8">
                        <h1 className="text-5xl font-bold mb-4">
                            {winner === username ? '🏆 GEWONNEN! 🏆' : '🎮 Game Over'}
                        </h1>
                        {winner && (
                            <p className="text-2xl text-purple-600 font-semibold">
                                Winner: {winner}
                            </p>
                        )}
                    </div>

                    <div className="space-y-4 mb-8">
                        <h2 className="text-2xl font-bold mb-4">📊 Eindscores</h2>
                        {sortedPlayers.map((player, index) => (
                            <div
                                key={index}
                                className={`flex items-center justify-between p-4 rounded-lg ${
                                    index === 0
                                        ? 'bg-gradient-to-r from-yellow-400 to-yellow-500'
                                        : index === 1
                                        ? 'bg-gradient-to-r from-gray-300 to-gray-400'
                                        : index === 2
                                        ? 'bg-gradient-to-r from-orange-400 to-orange-500'
                                        : 'bg-gray-100'
                                }`}
                            >
                                <div className="flex items-center space-x-3">
                                    <span className="text-2xl font-bold">#{index + 1}</span>
                                    <span className="font-semibold">{player.username}</span>
                                </div>
                                <div className="text-right">
                                    <p className="font-bold text-xl">{player.gameScore} pts</p>
                                    <p className="text-sm">Totaal: {player.totalScore}</p>
                                </div>
                            </div>
                        ))}
                    </div>

                    <div className="text-center text-gray-600">
                        <p>Terugkeren naar lobby in 10 seconden...</p>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-purple-600 via-blue-600 to-indigo-700 p-4">
            <div className="max-w-7xl mx-auto">
                {/* Notification */}
                {notification && (
                    <div className="fixed top-4 left-1/2 transform -translate-x-1/2 z-50 animate-bounce">
                        <div className="bg-white shadow-2xl rounded-lg px-6 py-4 font-bold text-lg">
                            {notification}
                        </div>
                    </div>
                )}

                {/* Header */}
                <div className="bg-white rounded-2xl shadow-2xl p-6 mb-6">
                    <div className="flex items-center justify-between">
                        <div>
                            <h1 className="text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-purple-600 to-blue-600">
                                🎵 Ronde {round}
                            </h1>
                            <p className="text-gray-600">Categorie: {settings.category}</p>
                        </div>
                        <div className="text-center">
                            <div className="text-4xl font-bold text-purple-600">{timeLeft}s</div>
                            <p className="text-sm text-gray-500">Tijd over</p>
                        </div>
                        {isAdmin && (
                            <div className="flex gap-2">
                                <button onClick={handleNextRound} className="btn-secondary">
                                    ⏭️ Volgende
                                </button>
                                <button onClick={handleStopGame} className="btn-secondary bg-red-100 hover:bg-red-200">
                                    ⏹️ Stop
                                </button>
                            </div>
                        )}
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* Main Game Area */}
                    <div className="lg:col-span-2 space-y-6">
                        {/* Track Player */}
                        <div className="bg-white rounded-2xl shadow-xl p-8">
                            {currentTrack && (
                                <div className="text-center">
                                    <div className="mb-6">
                                        <img
                                            src={currentTrack.cover || 'https://via.placeholder.com/200'}
                                            alt="Album cover"
                                            className="w-48 h-48 mx-auto rounded-lg shadow-lg animate-pulse-slow"
                                        />
                                    </div>

                                    <button
                                        onClick={toggleAudio}
                                        className="btn-primary mb-4"
                                    >
                                        {isPlaying ? '⏸️ Pause' : '▶️ Play'}
                                    </button>

                                    <div className="w-full bg-gray-200 rounded-full h-2 mb-4">
                                        <div
                                            className="bg-gradient-to-r from-purple-500 to-blue-500 h-2 rounded-full transition-all duration-1000"
                                            style={{ width: `${(timeLeft / settings.clipDuration) * 100}%` }}
                                        />
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* Guess Input */}
                        <div className="bg-white rounded-2xl shadow-xl p-6">
                            <h2 className="text-xl font-bold mb-4">🎯 Jouw Guess</h2>
                            <div className="flex gap-2">
                                <input
                                    type="text"
                                    value={guess}
                                    onChange={(e) => setGuess(e.target.value)}
                                    onKeyPress={(e) => e.key === 'Enter' && handleSubmitGuess()}
                                    placeholder="Type artiest of titel..."
                                    disabled={hasGuessed}
                                    className="input-field flex-1"
                                />
                                <button
                                    onClick={handleSubmitGuess}
                                    disabled={hasGuessed || !guess.trim()}
                                    className={`px-6 py-3 rounded-lg font-bold transition-all ${
                                        hasGuessed || !guess.trim()
                                            ? 'bg-gray-300 cursor-not-allowed'
                                            : 'bg-gradient-to-r from-green-500 to-emerald-600 text-white hover:shadow-xl'
                                    }`}
                                >
                                    Submit
                                </button>
                            </div>
                            {hasGuessed && (
                                <p className="mt-2 text-green-600 font-semibold">✅ Guess ingediend!</p>
                            )}
                        </div>

                        {/* Chat */}
                        <div className="bg-white rounded-2xl shadow-xl p-6">
                            <h2 className="text-xl font-bold mb-4">💬 Chat</h2>
                            <div className="h-48 overflow-y-auto bg-gray-50 rounded-lg p-4 mb-4">
                                {chatMessages.map((msg, index) => (
                                    <div key={index} className="mb-2">
                                        <span className="font-semibold text-purple-600">{msg.username}:</span>
                                        <span className="ml-2 text-gray-700">{msg.message}</span>
                                    </div>
                                ))}
                                <div ref={chatEndRef} />
                            </div>
                            <div className="flex gap-2">
                                <input
                                    type="text"
                                    value={chatInput}
                                    onChange={(e) => setChatInput(e.target.value)}
                                    onKeyPress={(e) => e.key === 'Enter' && handleSendChat()}
                                    placeholder="Type bericht..."
                                    className="input-field flex-1"
                                />
                                <button onClick={handleSendChat} className="btn-secondary">
                                    Send
                                </button>
                            </div>
                        </div>
                    </div>

                    {/* Scoreboard */}
                    <div>
                        <div className="bg-white rounded-2xl shadow-xl p-6">
                            <h2 className="text-2xl font-bold mb-4">🏆 Scoreboard</h2>
                            <div className="space-y-3">
                                {[...players]
                                    .sort((a, b) => b.gameScore - a.gameScore)
                                    .map((player, index) => (
                                        <div
                                            key={index}
                                            className={`p-4 rounded-lg ${
                                                player.username === username
                                                    ? 'bg-gradient-to-r from-purple-100 to-blue-100 border-2 border-purple-500'
                                                    : 'bg-gray-50'
                                            }`}
                                        >
                                            <div className="flex items-center justify-between">
                                                <div>
                                                    <p className="font-semibold">
                                                        {index === 0 && '🥇 '}
                                                        {index === 1 && '🥈 '}
                                                        {index === 2 && '🥉 '}
                                                        {player.username}
                                                    </p>
                                                    <p className="text-sm text-gray-500">
                                                        Total: {player.totalScore}
                                                    </p>
                                                </div>
                                                <div className="text-right">
                                                    <p className="text-2xl font-bold text-purple-600">
                                                        {player.gameScore}
                                                    </p>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                            </div>

                            <div className="mt-6 p-4 bg-gradient-to-r from-purple-50 to-blue-50 rounded-lg">
                                <p className="text-sm text-center font-semibold">
                                    🎯 Eerste bij {settings.winScore} punten wint!
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default MultiplayerGame;
