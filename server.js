// Express backend proxy server voor Deezer API
// Lost CORS problemen op door API calls server-side te doen

const express = require('express');
const cors = require('cors');
const fetch = require('node-fetch');
const path = require('path');
const http = require('http');
const { Server } = require('socket.io');

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
    cors: {
        origin: "*",
        methods: ["GET", "POST"]
    }
});

const PORT = process.env.PORT || 3001;

// Enable CORS voor frontend
app.use(cors());
app.use(express.json());

// Serve static files from dist folder
app.use(express.static(path.join(__dirname, 'dist')));

const DEEZER_API_BASE = 'https://api.deezer.com';

// --- Multiplayer Game State ---
let users = {}; // { socketId: { id, username, score, isAdmin, avatar } }
let gameState = {
    isPlaying: false,
    settings: {
        selectedGenre: 'pop',
        qtySongs: 1,
        qtyArtists: 2,
        previewDuration: 30
    },
    currentRound: 0,
    totalRounds: 5,
    scores: {} // { username: score }
};
let chatHistory = [];

io.on('connection', (socket) => {
    console.log('A user connected:', socket.id);

    // Handle user login/join
    socket.on('join', (username) => {
        const isFirstUser = Object.keys(users).length === 0;
        
        // Check if user already exists (reconnect logic could be added here, but for now simple)
        // For persistence requested: "system remembers his name and he can login with this name again"
        // We will trust the client to send the same username.
        
        let existingScore = 0;
        // Check if this username has a score from before (simple in-memory persistence)
        if (gameState.scores[username]) {
            existingScore = gameState.scores[username];
        } else {
            gameState.scores[username] = 0;
        }

        users[socket.id] = {
            id: socket.id,
            username: username,
            score: existingScore,
            isAdmin: isFirstUser,
            avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${username}` // Generate a fun avatar
        };

        // Send current state to the new user
        socket.emit('gameState', {
            users: Object.values(users),
            chatHistory,
            settings: gameState.settings,
            isPlaying: gameState.isPlaying
        });

        // Broadcast new user to everyone else
        io.emit('userJoined', users[socket.id]);
        
        // System message
        const sysMsg = { sender: 'System', text: `${username} has joined the party!`, timestamp: new Date() };
        chatHistory.push(sysMsg);
        io.emit('chatMessage', sysMsg);
    });

    // Handle Chat
    socket.on('sendMessage', (message) => {
        const user = users[socket.id];
        if (user) {
            const msgObj = {
                sender: user.username,
                text: message,
                timestamp: new Date(),
                avatar: user.avatar
            };
            chatHistory.push(msgObj);
            // Keep chat history limited
            if (chatHistory.length > 50) chatHistory.shift();
            io.emit('chatMessage', msgObj);
        }
    });

    // Handle Settings Update (Admin only)
    socket.on('updateSettings', (newSettings) => {
        const user = users[socket.id];
        if (user && user.isAdmin) {
            gameState.settings = { ...gameState.settings, ...newSettings };
            io.emit('settingsUpdated', gameState.settings);
            
            // System message
            const sysMsg = { sender: 'System', text: `Game settings updated by Admin.`, timestamp: new Date() };
            io.emit('chatMessage', sysMsg);
        }
    });

    // Handle Start Game (Admin only)
    socket.on('startGame', () => {
        const user = users[socket.id];
        if (user && user.isAdmin) {
            gameState.isPlaying = true;
            gameState.currentRound = 1;
            // Reset session scores for a new game? Or keep cumulative?
            // "system remembers the score" - implies cumulative or persistent.
            // Let's keep them cumulative but maybe track round score separately if needed.
            // For now, we just broadcast start.
            io.emit('gameStarted', gameState);
        }
    });
    
    // Handle Score Update
    socket.on('updateScore', (scoreDelta) => {
        const user = users[socket.id];
        if (user) {
            user.score += scoreDelta;
            gameState.scores[user.username] = user.score; // Persist by username
            io.emit('scoreUpdated', { userId: socket.id, newScore: user.score });
        }
    });

    // Handle Disconnect
    socket.on('disconnect', () => {
        const user = users[socket.id];
        if (user) {
            console.log('User disconnected:', user.username);
            
            // If admin leaves, assign new admin
            if (user.isAdmin) {
                const remainingIds = Object.keys(users).filter(id => id !== socket.id);
                if (remainingIds.length > 0) {
                    users[remainingIds[0]].isAdmin = true;
                    io.to(remainingIds[0]).emit('youAreAdmin');
                    io.emit('adminChanged', users[remainingIds[0]]);
                }
            }

            const sysMsg = { sender: 'System', text: `${user.username} left the game.`, timestamp: new Date() };
            io.emit('chatMessage', sysMsg);
            
            delete users[socket.id];
            io.emit('userLeft', socket.id);
        }
    });
});

// --- Existing Deezer Proxy Routes ---

/**
 * Proxy endpoint voor Deezer track search
 * GET /api/deezer/search?q=artist+track
 */
app.get('/api/deezer/search', async (req, res) => {
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
 * GET /api/deezer/artist/search?q=artist
 */
app.get('/api/deezer/artist/search', async (req, res) => {
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
 * GET /api/deezer/artist/:id/top
 */
app.get('/api/deezer/artist/:id/top', async (req, res) => {
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
 * Health check endpoint
 */
app.get('/health', (req, res) => {
    res.json({ status: 'OK', message: 'Deezer proxy server is running' });
});

// Catch-all handler: send back React's index.html file for client-side routing
app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, 'dist', 'index.html'));
});

server.listen(PORT, () => {
    console.log(`🎵 Deezer proxy server + Socket.io running on http://localhost:${PORT}`);
    console.log(`📡 Frontend should connect to: http://localhost:${PORT}`);
});
