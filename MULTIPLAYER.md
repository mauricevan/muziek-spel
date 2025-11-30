# 🎵 Muziek Spel - Multiplayer Features

## Overview
The Music Guessing Game now supports **real-time multiplayer** functionality! Play with friends, chat, compete on scores, and have fun together.

## New Features

### 🎮 Multiplayer Mode
- **Real-time gameplay**: Multiple players can join the same game session
- **Live score tracking**: See everyone's scores update in real-time
- **Persistent usernames**: Your username and score are remembered
- **Auto-generated avatars**: Each player gets a unique avatar based on their username

### 👑 Admin System
- **First player is admin**: The first user to join becomes the game admin
- **Admin controls**: Only the admin can:
  - Change game settings (genre, number of songs, difficulty, preview duration)
  - Start the game
- **Admin transfer**: If the admin leaves, the next player automatically becomes admin

### 💬 Real-time Chat
- **Live messaging**: Chat with other players in the lobby
- **System notifications**: Get notified when players join/leave or settings change
- **Chat history**: See previous messages when you join
- **Avatars in chat**: Each message shows the sender's avatar

### 🎯 Game Settings (Admin Only)
- **Genre selection**: Choose from 10 music genres
- **Number of songs**: 1-10 songs per round
- **Difficulty**: 2-6 artist options to choose from
- **Preview duration**: 10-60 seconds of song preview

## How to Play Multiplayer

### 1. Join the Game
1. Click **"JOIN MULTIPLAYER"** on the home screen
2. Enter your username (2-20 characters)
3. Your username and score will be saved for future sessions

### 2. Lobby
- Wait in the lobby for other players to join
- Chat with other players
- If you're the admin (👑), configure game settings
- Admin clicks **"START GAME"** when ready

### 3. Play Together
- All players see the same songs
- Guess the artist as fast as you can
- Your score updates in real-time for everyone to see
- Compete to get the highest score!

### 4. Persistent Scores
- Your score is saved by username
- Even if you disconnect and rejoin, your score persists
- Cumulative scoring across multiple game sessions

## Technical Details

### Backend (Socket.io)
- Real-time WebSocket communication
- In-memory game state management
- User session handling
- Score persistence by username

### Frontend Components
- **Login.js**: Username entry with avatar preview
- **Lobby.js**: Multiplayer lobby with players list, settings, and chat
- **Chat.js**: Real-time chat component
- **socketService.js**: WebSocket service for client-server communication

### Socket Events
**Client → Server:**
- `join`: Join game with username
- `sendMessage`: Send chat message
- `updateSettings`: Update game settings (admin only)
- `startGame`: Start the game (admin only)
- `updateScore`: Update player score

**Server → Client:**
- `gameState`: Initial game state on join
- `userJoined`: New player joined
- `userLeft`: Player disconnected
- `chatMessage`: New chat message
- `settingsUpdated`: Game settings changed
- `gameStarted`: Game has started
- `scoreUpdated`: Player score updated
- `youAreAdmin`: You are now the admin
- `adminChanged`: New admin assigned

## Security Note
⚠️ This is a **test environment** - no authentication or security measures are implemented. Perfect for local/private games with friends!

## Future Enhancements
- [ ] Game rooms/lobbies (multiple concurrent games)
- [ ] Leaderboards
- [ ] Player profiles
- [ ] Game history
- [ ] Voice chat
- [ ] Custom playlists
- [ ] Tournament mode

## Enjoy! 🎉
Have fun playing with your friends and may the best music guesser win! 🏆
