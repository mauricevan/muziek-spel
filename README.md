# 🎵 Muziek Raad Spelletje

Een interactief muziek quiz spelletje waar je artiesten moet raden aan de hand van 30-seconde Spotify preview clips!

## ✨ Highlights

- 🎵 **Geen Spotify Premium nodig!** Gebruikt alleen preview URLs
- 📅 **Tijdperk playlists**: Speel muziek uit de 70s, 80s, 90s, 2000s, 2010s of alle decennia
- 🎯 **Score systeem**: Verdien punten op basis van snelheid en streaks
- 🏆 **Leaderboard**: Concurreer voor de hoogste score
- 🎨 **Moderne UI**: Gebouwd met React en Material-UI
- 📊 **Progress tracking**: Visuele feedback tijdens playback

## 🚀 Quick Start

```bash
# Installeer dependencies
npm install

# Start de app
npm start
```

Open [http://localhost:3000](http://localhost:3000) in je browser.

## 📖 Uitgebreide Documentatie

Zie [SETUP.md](./SETUP.md) voor:
- Gedetailleerde installatie instructies
- Spotify Developer Account setup
- Hoe te spelen
- Score systeem uitleg
- Troubleshooting tips
- Project structuur

## 🎮 Hoe te spelen

1. **Kies een muziekbron**: Genre of playlist (tijdperk/eigen keuze)
2. **Configureer**: Preview duur, aantal songs, aantal keuzes
3. **Luister & Raad**: Klik op de juiste artiest
4. **Score**: Verdien punten op basis van snelheid!

## 🛠️ Technologie

- **React 16** + Hooks
- **TypeScript** - Type safety and better developer experience
- **Material-UI v4** - Component library
- **Howler.js** - Audio playback
- **Spotify Web API** - Music data
- **React Context** - State management
- **Vitest** - Unit and integration testing
- **Playwright** - E2E testing
- **Webpack** - Build tool

## 📁 Project Structure

This project follows a **feature-based architecture** pattern:

```
src/
├── features/           # Feature modules (business logic)
│   ├── game/          # Game logic
│   ├── audio/         # Audio services
│   ├── auth/          # Authentication
│   └── multiplayer/  # Multiplayer
├── components/         # UI components
│   ├── common/        # Shared components
│   └── game/          # Game-specific components
├── pages/              # Page components (orchestration)
├── contexts/           # React contexts
├── hooks/              # Global hooks
├── utils/              # Utilities
└── types/              # TypeScript types
```

See [Architecture Documentation](./docs/02-architecture/README.md) for more details.

## 🧪 Testing

### Run Tests

```bash
# Unit tests
npm test

# Watch mode
npm run test:watch

# Coverage report
npm run test:coverage

# E2E tests
npm run test:e2e
```

## 📚 Documentation

- [Getting Started](./docs/01-getting-started/README.md)
- [Architecture](./docs/02-architecture/README.md)
- [Setup Guide](./SETUP.md)

## 📝 Credits

Gebouwd op basis van [d5732/spotify-guessing-game](https://github.com/d5732/spotify-guessing-game)

Uitgebreid met features zoals:
- Playlist support
- Score systeem met streaks
- Leaderboard
- Instelbare preview duur
- Tijdperk playlists
- Progress bars
- Error handling

## 📄 Licentie

ISC