// Express backend proxy server voor Deezer API
// Lost CORS problemen op door API calls server-side te doen

const express = require('express');
const cors = require('cors');
const fetch = require('node-fetch');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3001;

// Enable CORS voor frontend
app.use(cors());
app.use(express.json());

// Serve static files from dist folder
app.use(express.static(path.join(__dirname, 'dist')));

const DEEZER_API_BASE = 'https://api.deezer.com';

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

app.listen(PORT, () => {
    console.log(`🎵 Deezer proxy server running on http://localhost:${PORT}`);
    console.log(`📡 Frontend should connect to: http://localhost:${PORT}/api/deezer`);
});
