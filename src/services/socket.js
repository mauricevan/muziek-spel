import io from 'socket.io-client';

// Socket.io client voor multiplayer functionaliteit
// In productie: gebruik huidige host (zelfde als waar frontend draait)
// In development: gebruik localhost:3001
const getSocketURL = () => {
    if (typeof window !== 'undefined') {
        // Browser omgeving
        if (window.location.hostname === 'localhost') {
            return 'http://localhost:3001';
        }
        // Productie: gebruik huidige origin (protocol + host)
        return window.location.origin;
    }
    // Fallback (zou niet moeten gebeuren in browser)
    return 'http://localhost:3001';
};

class SocketService {
    constructor() {
        this.socket = null;
        this.listeners = new Map();
    }

    connect() {
        if (this.socket?.connected) {
            return this.socket;
        }

        const SOCKET_URL = getSocketURL();
        console.log('🔌 Connecting to socket server:', SOCKET_URL);

        this.socket = io(SOCKET_URL, {
            transports: ['websocket', 'polling'],
            reconnection: true,
            reconnectionDelay: 1000,
            reconnectionAttempts: 5
        });

        this.socket.on('connect', () => {
            console.log('✅ Connected to game server:', this.socket.id);
        });

        this.socket.on('disconnect', () => {
            console.log('❌ Disconnected from game server');
        });

        this.socket.on('connect_error', (error) => {
            console.error('Connection error:', error);
        });

        return this.socket;
    }

    getSocket() {
        if (!this.socket) {
            return this.connect();
        }
        return this.socket;
    }

    disconnect() {
        if (this.socket) {
            this.socket.disconnect();
            this.socket = null;
        }
    }

    // Join game met username
    join(username) {
        return new Promise((resolve, reject) => {
            if (!this.socket) {
                reject(new Error('Socket niet verbonden'));
                return;
            }

            this.socket.emit('join', { username });

            this.socket.once('joinSuccess', (data) => {
                resolve(data);
            });

            this.socket.once('joinError', (error) => {
                reject(new Error(error.message));
            });
        });
    }

    // Update game settings (admin only)
    updateSettings(settings) {
        if (this.socket) {
            this.socket.emit('updateSettings', settings);
        }
    }

    // Start game (admin only)
    startGame() {
        if (this.socket) {
            this.socket.emit('startGame');
        }
    }

    // Submit guess
    submitGuess(guess, trackInfo) {
        if (this.socket) {
            this.socket.emit('submitGuess', { guess, trackInfo });
        }
    }

    // Next round (admin only)
    nextRound() {
        if (this.socket) {
            this.socket.emit('nextRound');
        }
    }

    // Stop game (admin only)
    stopGame() {
        if (this.socket) {
            this.socket.emit('stopGame');
        }
    }

    // Send chat message
    sendChatMessage(message) {
        if (this.socket) {
            this.socket.emit('chatMessage', { message });
        }
    }

    // Event listeners
    on(event, callback) {
        if (!this.socket) return;

        this.socket.on(event, callback);

        // Track listeners voor cleanup
        if (!this.listeners.has(event)) {
            this.listeners.set(event, []);
        }
        this.listeners.get(event).push(callback);
    }

    off(event, callback) {
        if (!this.socket) return;

        this.socket.off(event, callback);

        // Remove from tracked listeners
        if (this.listeners.has(event)) {
            const callbacks = this.listeners.get(event);
            const index = callbacks.indexOf(callback);
            if (index > -1) {
                callbacks.splice(index, 1);
            }
        }
    }

    // Remove alle listeners voor een event
    removeAllListeners(event) {
        if (!this.socket) return;

        if (event) {
            this.socket.off(event);
            this.listeners.delete(event);
        } else {
            this.socket.removeAllListeners();
            this.listeners.clear();
        }
    }
}

// Singleton instance
const socketService = new SocketService();

export default socketService;
