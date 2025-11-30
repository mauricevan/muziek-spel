import io, { Socket } from 'socket.io-client';

interface GameSettings {
    [key: string]: any;
}

class SocketService {
    private socket: Socket | null = null;

    connect(): Socket {
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

    disconnect(): void {
        if (this.socket) {
            this.socket.disconnect();
            this.socket = null;
        }
    }

    // Join game with username
    join(username: string): void {
        if (this.socket) {
            this.socket.emit('join', username);
        }
    }

    // Send chat message
    sendMessage(message: string): void {
        if (this.socket) {
            this.socket.emit('sendMessage', message);
        }
    }

    // Update game settings (admin only)
    updateSettings(settings: GameSettings): void {
        if (this.socket) {
            this.socket.emit('updateSettings', settings);
        }
    }

    // Start game (admin only)
    startGame(): void {
        if (this.socket) {
            this.socket.emit('startGame');
        }
    }

    // Update score
    updateScore(scoreDelta: number): void {
        if (this.socket) {
            this.socket.emit('updateScore', scoreDelta);
        }
    }

    // Listen to events
    on(event: string, callback: (...args: any[]) => void): void {
        if (this.socket) {
            this.socket.on(event, callback);
        }
    }

    // Remove event listener
    off(event: string, callback?: (...args: any[]) => void): void {
        if (this.socket) {
            this.socket.off(event, callback);
        }
    }

    getSocket(): Socket | null {
        return this.socket;
    }
}

export default new SocketService();

