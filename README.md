# 🎵 Muziek Raad Spelletje - Multiplayer Edition

Een interactief muziek quiz spelletje waar je artiesten moet raden aan de hand van muziek previews. Nu met **real-time multiplayer** functionaliteit!

## ✨ Highlights

### Single Player
- 🎵 **Geen Premium nodig!** Gebruikt Deezer en Spotify preview URLs
- 📅 **Tijdperk playlists**: Speel muziek uit de 70s, 80s, 90s, 2000s, 2010s of alle decennia
- 🎯 **Score systeem**: Verdien punten op basis van snelheid en streaks
- 🏆 **Leaderboard**: Concurreer voor de hoogste score
- 🎨 **Moderne UI**: Gebouwd met React en Material-UI
- 📊 **Progress tracking**: Visuele feedback tijdens playback

### 🎮 Multiplayer (NIEUW!)
- 🔴 **Real-time gameplay**: Socket.io voor instant updates
- 👑 **Admin systeem**: Eerste speler wordt automatisch admin
- 📊 **Live scoreboard**: Real-time score tracking
- 💬 **Chat functionaliteit**: Communiceer met andere spelers
- 🎚️ **Custom settings**: Admin kan genre, punten en meer instellen
- 🌐 **Web-based**: Geen downloads, speel direct in de browser
- 👥 **2-20 spelers**: Speel met vrienden!

## 🚀 Quick Start

```bash
# Installeer dependencies
npm install

# Kopieer environment variabelen
cp .env.example .env

# Start backend server (port 3001)
npm run server

# In een andere terminal: Start frontend (port 8080)
npm start

# OF start beide tegelijk
npm run dev
```

Open in je browser:
- **Frontend**: [http://localhost:8080](http://localhost:8080)
- **Multiplayer**: [http://localhost:8080/multiplayer](http://localhost:8080/multiplayer)
- **Backend API**: [http://localhost:3001](http://localhost:3001)

## 📖 Uitgebreide Documentatie

Zie [SETUP.md](./SETUP.md) voor:
- Gedetailleerde installatie instructies
- Spotify Developer Account setup
- Hoe te spelen
- Score systeem uitleg
- Troubleshooting tips
- Project structuur

## 🎮 Hoe te spelen

### Single Player Mode
1. **Kies een muziekbron**: Genre of playlist (tijdperk/eigen keuze)
2. **Configureer**: Preview duur, aantal songs, aantal keuzes
3. **Luister & Raad**: Klik op de juiste artiest
4. **Score**: Verdien punten op basis van snelheid!

### 🎮 Multiplayer Mode (NIEUW!)
1. Klik op **"Multiplayer 🎵"** op de homepage
2. **Voer username in**: Kies een unieke naam
3. **Als eerste speler** (Admin 👑):
   - Configureer game settings (genre, max spelers, win score, clip duur)
   - Wacht tot minimaal 2 spelers hebben gejoined
   - Klik **"Start Game"** om te beginnen
4. **Als andere speler**:
   - Join de lobby en wacht op admin om te starten
5. **Tijdens het spel**:
   - 🎵 Luister naar het muziekfragment
   - ⌨️ Type je guess (artiest of titel)
   - ⚡ Sneller raden = meer punten!
   - 💬 Chat met andere spelers
6. **Winnen**: Eerste bij de win score wint! 🏆

### 🏅 Punten Systeem (Multiplayer)
- **Base punten**: 100 per correcte guess
- **Tijd penalty**: -10 punten per seconde
- **Positie bonus**:
  - 🥇 1e plaats: +50 punten
  - 🥈 2e plaats: +25 punten
  - 🥉 3e plaats: +10 punten
- **Minimum**: 10 punten per correcte guess

## 🛠️ Technologie

### Frontend
- **React 16** + Hooks
- **Tailwind CSS 3.3** (Multiplayer UI)
- **Material-UI v4** (Single player UI)
- **Socket.io Client 4.6** (Real-time communicatie)
- **Howler.js 2.2** (Audio playback)
- **React Router 5** (Routing)
- **Webpack 5** (Bundler)

### Backend
- **Node.js** + **Express 5**
- **Socket.io 4.6** (Real-time server)
- **In-memory storage** (Game state & scores)
- **CORS** support

### APIs
- **Deezer API** (Muziek previews via backend proxy)
- **TheAudioDB** (Artist informatie)
- **Spotify API** (Optioneel)

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

## 🌐 Deployment

### Render.com Deploy (Gratis!)

Zie [DEPLOY.md](./DEPLOY.md) voor gedetailleerde instructies.

**Quick steps:**
1. Push naar GitHub
2. Maak Web Service op Render.com
3. Configureer build/start commands
4. Voeg environment variabelen toe
5. Deploy! 🚀

De app draait volledig op de free tier van Render.com!

## 🐛 Troubleshooting

### Socket.io verbindt niet
- Check of backend server draait op port 3001
- Controleer SOCKET_URL environment variabele
- Check browser console voor errors

### Geen audio
- Sommige tracks hebben geen preview
- Probeer een ander genre
- Check browser console

### Build errors
```bash
rm -rf node_modules dist
npm install
npm run build
```

## 📝 Scripts

```bash
npm start          # Start webpack dev server (port 8080)
npm run build      # Production build
npm run server     # Start Express backend (port 3001)
npm run dev        # Start beide server en frontend
```

## 📄 Licentie

ISC