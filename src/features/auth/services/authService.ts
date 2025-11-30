// Spotify OAuth Authentication Service
// Uses Implicit Grant Flow (client-side only, no backend needed)

const CLIENT_ID = process.env.REACT_APP_SPOTIFY_CLIENT_ID;
const REDIRECT_URI = process.env.REACT_APP_REDIRECT_URI || 'http://localhost:8080/callback';
const AUTH_ENDPOINT = 'https://accounts.spotify.com/authorize';
const TOKEN_KEY = 'whos-who-access-token';

interface Token {
    value: string;
    expiration: number;
}

interface AuthHash {
    access_token?: string;
    expires_in?: string;
    state?: string;
    [key: string]: string | undefined;
}

// Required scopes for the app
const SCOPES = [
    'user-read-private',
    'user-read-email'
];

/**
 * Generate random string for state parameter
 */
const generateRandomString = (length: number): string => {
    let text = '';
    const possible = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    for (let i = 0; i < length; i++) {
        text += possible.charAt(Math.floor(Math.random() * possible.length));
    }
    return text;
};

/**
 * Redirect to Spotify authorization page
 */
export const redirectToSpotifyAuth = (): void => {
    const state = generateRandomString(16);
    localStorage.setItem('spotify_auth_state', state);

    const authUrl = `${AUTH_ENDPOINT}?client_id=${CLIENT_ID}&redirect_uri=${encodeURIComponent(REDIRECT_URI)}&scope=${encodeURIComponent(SCOPES.join(' '))}&response_type=token&state=${state}`;

    console.log('Redirecting to:', authUrl);
    window.location.href = authUrl;
};

/**
 * Get access token from URL hash (after redirect from Spotify)
 */
export const getTokenFromUrl = (): Token | null => {
    const hash: AuthHash = window.location.hash
        .substring(1)
        .split('&')
        .reduce((initial: AuthHash, item: string) => {
            const parts = item.split('=');
            initial[parts[0]] = decodeURIComponent(parts[1]);
            return initial;
        }, {});

    window.location.hash = '';

    const savedState = localStorage.getItem('spotify_auth_state');

    if (hash.state !== savedState) {
        console.error('State mismatch - possible CSRF attack');
        return null;
    }

    localStorage.removeItem('spotify_auth_state');

    if (hash.access_token && hash.expires_in) {
        const token: Token = {
            value: hash.access_token,
            expiration: Date.now() + parseInt(hash.expires_in) * 1000
        };
        localStorage.setItem(TOKEN_KEY, JSON.stringify(token));
        return token;
    }

    return null;
};

/**
 * Get stored token from localStorage
 */
export const getStoredToken = (): Token | null => {
    const storedTokenString = localStorage.getItem(TOKEN_KEY);
    if (storedTokenString) {
        const storedToken: Token = JSON.parse(storedTokenString);
        if (storedToken.expiration > Date.now()) {
            return storedToken;
        } else {
            // Token expired
            localStorage.removeItem(TOKEN_KEY);
        }
    }
    return null;
};

/**
 * Clear stored token
 */
export const clearToken = (): void => {
    localStorage.removeItem(TOKEN_KEY);
};

/**
 * Check if user is authenticated
 */
export const isAuthenticated = (): boolean => {
    return getStoredToken() !== null;
};

