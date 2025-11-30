import io from 'socket.io-client';

class SocketService {
    constructor() {
        this.socket = null;
        this.listeners = {};
    }

    connect() {
        if (!this.socket) {
            // Use current origin for socket connection (works in both dev and production)
            const socketUrl = window.location.origin;
            this.socket = io(socketUrl, {
                transports: ['websocket', 'polling']
            });

            this.socket.on('connect', () => {
                console.log('✅ Connected to multiplayer server');
            });

            this.socket.on('disconnect', () => {
                console.log('❌ Disconnected from multiplayer server');
            });
        }
        return this.socket;
    }

    disconnect() {
        if (this.socket) {
            this.socket.disconnect();
            this.socket = null;
        }
    }

    // Join game with username
    join(username) {
        if (this.socket) {
            this.socket.emit('join', username);
        }
    }

    // Send chat message
    sendMessage(message) {
        if (this.socket) {
            this.socket.emit('sendMessage', message);
        }
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

    // Update score
    updateScore(scoreDelta) {
        if (this.socket) {
            this.socket.emit('updateScore', scoreDelta);
        }
    }

    // Listen to events
    on(event, callback) {
        if (this.socket) {
            this.socket.on(event, callback);
        }
    }

    // Remove event listener
    off(event, callback) {
        if (this.socket) {
            this.socket.off(event, callback);
        }
    }

    getSocket() {
        return this.socket;
    }
}

export default new SocketService();
