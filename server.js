// Express backend proxy server voor Deezer API + Multiplayer Game Server
// Lost CORS problemen op door API calls server-side te doen
// Socket.io voor real-time multiplayer functionaliteit

const express = require('express');
const cors = require('cors');
const fetch = require('node-fetch');
const http = require('http');
const socketIO = require('socket.io');
const path = require('path');

const app = express();
const server = http.createServer(app);
const io = socketIO(server, {
    cors: {
        origin: "*",
        methods: ["GET", "POST"]
    }
});

const PORT = process.env.PORT || 3001;

// Enable CORS voor frontend
app.use(cors());
app.use(express.json());

// Serve static files from dist directory (production)
if (process.env.NODE_ENV === 'production') {
    app.use(express.static(path.join(__dirname, 'dist')));
}

const DEEZER_API_BASE = 'https://api.deezer.com';

// ============================================
// MULTIPLAYER GAME STATE MANAGEMENT
// ============================================

// In-memory storage voor game rooms
const gameRooms = new Map();
const playerUsernames = new Map(); // socketId -> username mapping
const playerScores = new Map(); // username -> total score (persistent)

/**
 * Proxy endpoint voor music track search
 * GET /api/music/search?q=artist+track
 * Note: Route hernoemd van /api/deezer naar /api/music om ad blocker problemen te voorkomen
 */
app.get('/api/music/search', async (req, res) => {
    try {
        const query = req.query.q;

        if (!query) {
            return res.status(400).json({ error: 'Query parameter "q" is required' });
        }

        const response = await fetch(
            `${DEEZER_API_BASE}/search?q=${encodeURIComponent(query)}&limit=1`
        );

        const data = await response.json();
        res.json(data);

    } catch (error) {
        console.error('Error fetching from Deezer:', error);
        res.status(500).json({ error: 'Failed to fetch from Deezer API' });
    }
});

/**
 * Proxy endpoint voor artist search
 * GET /api/music/artist/search?q=artist
 */
app.get('/api/music/artist/search', async (req, res) => {
    try {
        const query = req.query.q;

        if (!query) {
            return res.status(400).json({ error: 'Query parameter "q" is required' });
        }

        const response = await fetch(
            `${DEEZER_API_BASE}/search/artist?q=${encodeURIComponent(query)}&limit=1`
        );

        const data = await response.json();
        res.json(data);

    } catch (error) {
        console.error('Error fetching artist from Deezer:', error);
        res.status(500).json({ error: 'Failed to fetch artist from Deezer API' });
    }
});

/**
 * Proxy endpoint voor artist top tracks
 * GET /api/music/artist/:id/top
 */
app.get('/api/music/artist/:id/top', async (req, res) => {
    try {
        const artistId = req.params.id;

        const response = await fetch(
            `${DEEZER_API_BASE}/artist/${artistId}/top?limit=10`
        );

        const data = await response.json();
        res.json(data);

    } catch (error) {
        console.error('Error fetching top tracks from Deezer:', error);
        res.status(500).json({ error: 'Failed to fetch top tracks from Deezer API' });
    }
});

/**
 * Proxy endpoint voor multiple tracks (voor multiple choice)
 * GET /api/music/multiple?q=category&count=6
 */
app.get('/api/music/multiple', async (req, res) => {
    try {
        const query = req.query.q;
        const count = parseInt(req.query.count) || 6;

        if (!query) {
            return res.status(400).json({ error: 'Query parameter "q" is required' });
        }

        // Helper functie om tracks te fetchen en filteren
        const fetchAndFilterTracks = async (searchQuery, limit) => {
            const response = await fetch(
                `${DEEZER_API_BASE}/search?q=${encodeURIComponent(searchQuery)}&limit=${limit}`
            );
            const data = await response.json();

            if (!data.data || data.data.length === 0) {
                return [];
            }

            // Filter alleen tracks met preview en unieke tracks
            const uniqueTracks = [];
            const seenTitles = new Set();

            for (const track of data.data) {
                if (track.preview) {
                    const key = `${track.title}-${track.artist.name}`.toLowerCase();
                    if (!seenTitles.has(key)) {
                        seenTitles.add(key);
                        uniqueTracks.push(track);
                    }
                }
            }

            return uniqueTracks;
        };

        // Probeer eerst met de specifieke query, request meer tracks
        let uniqueTracks = await fetchAndFilterTracks(query, count * 5);

        // Als we niet genoeg tracks hebben, probeer fallback queries
        if (uniqueTracks.length < count) {
            console.log(`Not enough tracks for "${query}" (got ${uniqueTracks.length}), trying fallback...`);

            // Probeer verschillende fallback queries
            const fallbackQueries = [
                `${query} music`,
                `top ${query}`,
                `best ${query}`,
                'pop music', // Ultimate fallback naar populaire muziek
                'top tracks'
            ];

            for (const fallbackQuery of fallbackQueries) {
                if (uniqueTracks.length >= count) break;

                const fallbackTracks = await fetchAndFilterTracks(fallbackQuery, 50);

                // Voeg nieuwe unieke tracks toe
                const existingKeys = new Set(
                    uniqueTracks.map(t => `${t.title}-${t.artist.name}`.toLowerCase())
                );

                for (const track of fallbackTracks) {
                    if (uniqueTracks.length >= count) break;

                    const key = `${track.title}-${track.artist.name}`.toLowerCase();
                    if (!existingKeys.has(key)) {
                        existingKeys.add(key);
                        uniqueTracks.push(track);
                    }
                }
            }
        }

        // Limiteer tot het gevraagde aantal
        const finalTracks = uniqueTracks.slice(0, count);

        console.log(`Returning ${finalTracks.length} tracks for query "${query}"`);
        res.json({ data: finalTracks });

    } catch (error) {
        console.error('Error fetching multiple tracks from Deezer:', error);
        res.status(500).json({ error: 'Failed to fetch multiple tracks from Deezer API' });
    }
});

/**
 * Health check endpoint
 */
app.get('/health', (req, res) => {
    res.json({ status: 'OK', message: 'Deezer proxy server is running' });
});

/**
 * Get leaderboard endpoint
 */
app.get('/api/leaderboard', (req, res) => {
    const leaderboard = Array.from(playerScores.entries())
        .map(([username, score]) => ({ username, score }))
        .sort((a, b) => b.score - a.score)
        .slice(0, 20);
    res.json(leaderboard);
});

/**
 * Catch-all route voor React Router (SPA)
 * Moet LAATSTE zijn na alle API routes
 * Express v5 requires /(.*) instead of *
 */
if (process.env.NODE_ENV === 'production') {
    app.get(/^\/(?!api|health).*/, (req, res) => {
        res.sendFile(path.join(__dirname, 'dist', 'index.html'));
    });
}

// ============================================
// SOCKET.IO MULTIPLAYER LOGIC
// ============================================

io.on('connection', (socket) => {
    console.log(`🔌 New connection: ${socket.id}`);

    /**
     * Get room status (voor bezoekers die willen checken of er een game is)
     */
    socket.on('getRoomStatus', () => {
        const room = gameRooms.get('main-room');

        if (!room || room.players.size === 0) {
            socket.emit('roomStatus', {
                hasActiveRoom: false,
                playerCount: 0,
                gameState: null
            });
        } else {
            socket.emit('roomStatus', {
                hasActiveRoom: true,
                playerCount: room.players.size,
                gameState: room.gameState,
                maxPlayers: room.settings.maxPlayers
            });
        }
    });

    /**
     * Player joins met username
     */
    socket.on('join', ({ username }) => {
        // Check of username al in gebruik is (in deze sessie)
        const existingUsernames = Array.from(playerUsernames.values());
        if (existingUsernames.includes(username)) {
            socket.emit('joinError', { message: 'Username al in gebruik!' });
            return;
        }

        playerUsernames.set(socket.id, username);

        // Initialiseer score als deze nog niet bestaat
        if (!playerScores.has(username)) {
            playerScores.set(username, 0);
        }

        const totalScore = playerScores.get(username);

        // Check of er al een game room is, anders maak nieuwe aan
        let room = gameRooms.get('main-room');
        if (!room) {
            // Eerste speler wordt admin
            room = {
                id: 'main-room',
                admin: socket.id,
                players: new Map(),
                gameState: 'lobby', // lobby, playing, finished
                settings: {
                    category: 'pop',
                    maxPlayers: 10,
                    guessesPerClip: 3,
                    winScore: 10,
                    clipDuration: 20
                },
                currentRound: null,
                scores: new Map()
            };
            gameRooms.set('main-room', room);
            console.log(`👑 ${username} is admin van nieuwe room`);
        }

        // Voeg speler toe aan room
        room.players.set(socket.id, {
            id: socket.id,
            username,
            totalScore,
            gameScore: 0,
            isAdmin: socket.id === room.admin
        });

        room.scores.set(username, 0);
        socket.join('main-room');

        // Stuur bevestiging naar speler
        socket.emit('joinSuccess', {
            username,
            isAdmin: socket.id === room.admin,
            totalScore,
            roomId: 'main-room'
        });

        // Update alle spelers
        broadcastRoomUpdate(room);
    });

    /**
     * Admin update game settings
     */
    socket.on('updateSettings', (settings) => {
        const room = gameRooms.get('main-room');
        if (!room || room.admin !== socket.id) {
            socket.emit('error', { message: 'Alleen admin kan settings aanpassen' });
            return;
        }

        room.settings = { ...room.settings, ...settings };
        broadcastRoomUpdate(room);
    });

    /**
     * Admin start game
     */
    socket.on('startGame', () => {
        const room = gameRooms.get('main-room');
        if (!room || room.admin !== socket.id) {
            socket.emit('error', { message: 'Alleen admin kan game starten' });
            return;
        }

        if (room.gameState !== 'lobby') {
            socket.emit('error', { message: 'Game is al bezig' });
            return;
        }

        // Reset scores
        room.players.forEach((player, id) => {
            player.gameScore = 0;
            room.scores.set(player.username, 0);
        });

        room.gameState = 'playing';
        room.currentRound = {
            roundNumber: 1,
            startTime: Date.now(),
            guesses: new Map() // socketId -> guess
        };

        io.to('main-room').emit('gameStarted', {
            settings: room.settings,
            round: room.currentRound.roundNumber
        });

        broadcastRoomUpdate(room);
    });

    /**
     * Player submit guess
     */
    socket.on('submitGuess', ({ guess, trackInfo }) => {
        const room = gameRooms.get('main-room');
        if (!room || !room.currentRound) return;

        const player = room.players.get(socket.id);
        if (!player) return;

        // Check of speler al geraden heeft deze ronde
        if (room.currentRound.guesses.has(socket.id)) {
            return;
        }

        const timeTaken = Date.now() - room.currentRound.startTime;
        const isCorrect = checkGuess(guess, trackInfo);

        room.currentRound.guesses.set(socket.id, {
            guess,
            isCorrect,
            timeTaken,
            timestamp: Date.now()
        });

        if (isCorrect) {
            // Bereken punten (sneller = meer punten)
            const points = calculatePoints(timeTaken, room.currentRound.guesses.size);
            player.gameScore += points;
            room.scores.set(player.username, player.gameScore);

            // Broadcast correct guess
            io.to('main-room').emit('correctGuess', {
                username: player.username,
                points,
                totalScore: player.gameScore
            });

            // Check win conditie
            if (player.gameScore >= room.settings.winScore) {
                endGame(room, player.username);
                return;
            }
        }

        broadcastRoomUpdate(room);
    });

    /**
     * Admin next round
     */
    socket.on('nextRound', () => {
        const room = gameRooms.get('main-room');
        if (!room || room.admin !== socket.id) return;

        if (room.gameState !== 'playing') return;

        room.currentRound = {
            roundNumber: room.currentRound.roundNumber + 1,
            startTime: Date.now(),
            guesses: new Map()
        };

        io.to('main-room').emit('newRound', {
            round: room.currentRound.roundNumber
        });

        broadcastRoomUpdate(room);
    });

    /**
     * Admin stop game
     */
    socket.on('stopGame', () => {
        const room = gameRooms.get('main-room');
        if (!room || room.admin !== socket.id) return;

        endGame(room, null);
    });

    /**
     * Chat bericht
     */
    socket.on('chatMessage', ({ message }) => {
        const username = playerUsernames.get(socket.id);
        if (!username) return;

        io.to('main-room').emit('chatMessage', {
            username,
            message,
            timestamp: Date.now()
        });
    });

    /**
     * Disconnect
     */
    socket.on('disconnect', () => {
        console.log(`🔌 Disconnect: ${socket.id}`);

        const username = playerUsernames.get(socket.id);
        const room = gameRooms.get('main-room');

        if (room) {
            room.players.delete(socket.id);

            // Als admin disconnect, maak nieuwe admin
            if (room.admin === socket.id && room.players.size > 0) {
                const newAdmin = Array.from(room.players.keys())[0];
                room.admin = newAdmin;
                room.players.get(newAdmin).isAdmin = true;

                io.to('main-room').emit('newAdmin', {
                    username: room.players.get(newAdmin).username
                });
            }

            // Verwijder room als er geen spelers meer zijn
            if (room.players.size === 0) {
                gameRooms.delete('main-room');
                console.log('🗑️  Room verwijderd (geen spelers)');

                // Broadcast dat room niet meer actief is
                io.emit('roomStatusChanged', {
                    hasActiveRoom: false,
                    playerCount: 0,
                    gameState: null
                });
            } else {
                broadcastRoomUpdate(room);
            }
        }

        playerUsernames.delete(socket.id);
    });
});

// ============================================
// HELPER FUNCTIONS
// ============================================

function broadcastRoomUpdate(room) {
    const players = Array.from(room.players.values()).map(p => ({
        username: p.username,
        gameScore: p.gameScore,
        totalScore: p.totalScore,
        isAdmin: p.isAdmin
    }));

    io.to('main-room').emit('roomUpdate', {
        gameState: room.gameState,
        settings: room.settings,
        players,
        currentRound: room.currentRound ? {
            roundNumber: room.currentRound.roundNumber,
            guessCount: room.currentRound.guesses.size
        } : null
    });

    // Broadcast room status naar ALLE clients (ook niet-gejoinde)
    io.emit('roomStatusChanged', {
        hasActiveRoom: true,
        playerCount: room.players.size,
        gameState: room.gameState,
        maxPlayers: room.settings.maxPlayers
    });
}

function checkGuess(guess, trackInfo) {
    if (!guess || !trackInfo) return false;

    const normalizedGuess = guess.toLowerCase().trim();
    const title = trackInfo.title?.toLowerCase() || '';
    const artist = trackInfo.artist?.toLowerCase() || '';

    // Check of guess title of artist bevat
    return title.includes(normalizedGuess) ||
           artist.includes(normalizedGuess) ||
           normalizedGuess.includes(title) ||
           normalizedGuess.includes(artist);
}

function calculatePoints(timeTaken, position) {
    // Base punten: 100
    // -10 per seconde
    // Bonus voor positie: eerste = +50, tweede = +25, derde = +10

    const basePoints = 100;
    const timePenalty = Math.floor(timeTaken / 1000) * 10;
    const positionBonus = position === 1 ? 50 : position === 2 ? 25 : position === 3 ? 10 : 0;

    return Math.max(10, basePoints - timePenalty + positionBonus);
}

function endGame(room, winner) {
    room.gameState = 'finished';

    // Update totale scores
    room.players.forEach(player => {
        const currentTotal = playerScores.get(player.username) || 0;
        playerScores.set(player.username, currentTotal + player.gameScore);
    });

    const finalScores = Array.from(room.players.values())
        .map(p => ({
            username: p.username,
            gameScore: p.gameScore,
            totalScore: playerScores.get(p.username)
        }))
        .sort((a, b) => b.gameScore - a.gameScore);

    io.to('main-room').emit('gameEnded', {
        winner,
        scores: finalScores
    });

    // Reset room na 10 seconden
    setTimeout(() => {
        room.gameState = 'lobby';
        room.currentRound = null;
        room.players.forEach(p => p.gameScore = 0);
        room.scores.clear();
        broadcastRoomUpdate(room);
    }, 10000);
}

// ============================================
// START SERVER
// ============================================

const HOST = process.env.HOST || '0.0.0.0';

server.listen(PORT, HOST, () => {
    console.log(`🎵 Muziek Raad Spel Server running on ${HOST}:${PORT}`);
    console.log(`📡 Deezer API proxy ready`);
    console.log(`🎮 Multiplayer socket ready`);
    console.log(`🏆 Leaderboard ready`);
    console.log(`✅ Server is ready to accept connections`);
});
