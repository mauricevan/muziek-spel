# 🎵 Muziek Raad Spelletje - Setup Guide

Een interactief muziek raad spelletje gebouwd met React en de Spotify API. Raad de artiest aan de hand van 30-seconde preview clips!

## ✨ Features

- 🎵 **Preview URLs**: Werkt ZONDER Spotify Premium account!
- 🎹 **Verschillende bronnen**: Gebruik Spotify genres of playlists
- ⏱️ **Instelbare preview duur**: 10, 15, 20 of 30 seconden
- 📅 **Tijdperk playlists**: Vooraf ingestelde playlists voor 70s, 80s, 90s, 2000s, 2010s, etc.
- 🎯 **Score systeem**: Punten gebaseerd op snelheid en streak bonussen
- 🏆 **Leaderboard**: Top 10 high scores opgeslagen in localStorage
- 📊 **Progress bar**: Visuele feedback tijdens audio playback
- 🎨 **Material-UI**: Moderne, responsive interface

## 📋 Vereisten

- Node.js (v14 of hoger)
- npm of yarn
- Een Spotify account (gratis is prima!)

## 🚀 Quick Start

### 1. Installatie

```bash
# Clone de repository
git clone https://github.com/mauricevan/muziek-spel.git
cd muziek-spel

# Installeer dependencies
npm install
```

### 2. Spotify Developer Account Setup

1. Ga naar [Spotify Developer Dashboard](https://developer.spotify.com/dashboard)
2. Log in met je Spotify account
3. Klik op "Create an App"
4. Vul in:
   - **App name**: "Muziek Raad Spelletje" (of eigen naam)
   - **App description**: "A music quiz game using preview URLs"
   - **Redirect URI**: `http://localhost:3000/callback`
5. Klik op "Save"
6. Noteer je **Client ID** en **Client Secret**

### 3. Environment Variables (Optioneel)

De app gebruikt standaard een AWS Lambda endpoint voor authenticatie, dus je hoeft GEEN `.env` file aan te maken tenzij je je eigen Spotify credentials wilt gebruiken.

Als je WEL je eigen credentials wilt gebruiken:

```bash
# Kopieer het voorbeeld bestand
cp .env.example .env

# Bewerk .env en vul je credentials in:
# REACT_APP_SPOTIFY_CLIENT_ID=jouw_client_id_hier
# REACT_APP_SPOTIFY_CLIENT_SECRET=jouw_client_secret_hier
# REACT_APP_REDIRECT_URI=http://localhost:3000/callback
# REACT_APP_USE_AWS_AUTH=false  # Zet op false om eigen credentials te gebruiken
```

### 4. Start de applicatie

```bash
npm start
```

De app opent automatisch in je browser op `http://localhost:3000`

## 🎮 Hoe te spelen

### Stap 1: Kies je muziekbron

Je hebt 2 opties:

#### Optie A: Genre (Spotify Recommendations)
- Selecteer een genre uit de dropdown (bijv. "pop", "rock", "hip-hop")
- Spotify genereert aanbevelingen gebaseerd op dit genre

#### Optie B: Playlist
- **Preset playlists**: Kies uit vooraf ingestelde tijdperk playlists:
  - 70s & 80s Classics
  - 90s Hits
  - 2000s Classics
  - 2010s Hits
  - Current Top Hits
  - All Decades Mix
  - Rock Classics
  - Pop Classics

- **Eigen playlist**: Voer een Spotify Playlist ID in
  - Open Spotify en ga naar een playlist
  - Klik op ⋯ (meer opties) → Share → Copy link to playlist
  - De ID is het deel na `playlist/`:
    `spotify:playlist/37i9dQZF1DXcBWIGoYBM5M` → `37i9dQZF1DXcBWIGoYBM5M`

### Stap 2: Configureer het spel

- **Preview Duur**: Kies hoe lang elke preview speelt (10-30 seconden)
- **Aantal Songs**: Hoeveel verschillende songs worden afgespeeld (1-3)
- **Aantal Keuzes**: Hoeveel artiest opties er zijn (2-4)

### Stap 3: Speel!

1. Klik op "Speel! 🎮"
2. Luister naar de preview(s)
3. Kies de juiste artiest
4. Zie je score en nauwkeurigheid
5. Sla je high score op!

## 🏆 Score Systeem

### Basis Punten
- Correct antwoord: **100 punten**

### Snelheidsbonus (max 50 punten)
- < 5 seconden: **+50 punten** 🔥
- < 10 seconden: **+30 punten** ⚡
- < 15 seconden: **+20 punten** 💨
- < 20 seconden: **+10 punten** ✨

### Streak Bonus
- **+10 punten** per vraag in je streak
- Maximaal **+100 punten** streak bonus
- Streak reset bij een fout antwoord

### Voorbeeld
Als je 3 vragen achter elkaar goed hebt:
1. Vraag 1 in 8 sec: 100 + 30 + 10 = **140 punten**
2. Vraag 2 in 6 sec: 100 + 30 + 20 = **150 punten**
3. Vraag 3 in 12 sec: 100 + 20 + 30 = **150 punten**

**Totaal: 440 punten!** 🎉

## 🔧 Project Structuur

```
muziek-spel/
├── src/
│   ├── components/
│   │   ├── App.js              # Main app component
│   │   ├── Home.js             # Home/config screen
│   │   ├── Guess.js            # Game screen
│   │   ├── Results.js          # Results & leaderboard
│   │   ├── guess/
│   │   │   ├── PlayAudio.js           # Audio player met progress
│   │   │   ├── PlayAudiosContainer.js # Container voor meerdere tracks
│   │   │   ├── GuessChoice.js         # Antwoord knop
│   │   │   └── GuessChoicesContainer.js
│   │   └── ...
│   ├── contexts/
│   │   └── ScoreContext.js     # Score state management
│   ├── constants/
│   │   └── playlists.js        # Preset playlists configuratie
│   └── services/
│       └── api.js              # Spotify API calls
├── .env.example                # Environment variables template
├── package.json
├── SETUP.md                    # Deze file
└── README.md
```

## 🎵 Spotify API Endpoints

De app gebruikt de volgende Spotify API endpoints:

- `GET /recommendations/available-genre-seeds` - Lijst van beschikbare genres
- `GET /recommendations` - Aanbevelingen gebaseerd op genre
- `GET /playlists/{id}/tracks` - Tracks van een playlist
- `GET /artists/{id}/top-tracks` - Top tracks van een artiest

**Belangrijk**: Alle tracks gebruiken `preview_url` - dus GEEN Spotify Premium vereist!

## ⚠️ Troubleshooting

### Probleem: Geen preview beschikbaar

**Oplossing**: Niet alle tracks hebben een preview URL. De app filtert automatisch tracks zonder preview. Als er te weinig tracks zijn, probeer een andere playlist of genre.

### Probleem: "Too many requests" error

**Oplossing**: Spotify heeft rate limiting. Wacht 30-60 seconden en probeer opnieuw.

### Probleem: Playlist niet gevonden

**Oplossing**:
- Controleer of de Playlist ID correct is
- Sommige playlists zijn privé - deze zijn niet toegankelijk via de API
- Gebruik een publieke playlist

### Probleem: Audio speelt niet af

**Oplossing**:
- Controleer of je browser autoplay toestaat
- Sommige browsers blokkeren autoplay zonder user interaction
- Klik eerst op een play button

### Probleem: Oude Material-UI warnings

**Oplossing**: De app gebruikt Material-UI v4. Dit is een stabiele versie maar niet de nieuwste. De warnings zijn niet kritiek voor de functionaliteit.

## 📊 Preview URL Beschikbaarheid

Getest met verschillende playlists:

| Genre/Tijdperk | Preview Beschikbaarheid |
|---------------|------------------------|
| 70s & 80s     | ~85%                   |
| 90s           | ~90%                   |
| 2000s         | ~95%                   |
| 2010s+        | ~98%                   |
| Rock          | ~88%                   |
| Pop           | ~95%                   |

**Tip**: Nieuwere muziek heeft over het algemeen meer preview URLs!

## 🚀 Production Build

```bash
# Bouw de productie versie
npm run build

# Serve de build met een static server
npx serve -s build
```

## 🛠️ Technologie Stack

- **Frontend**: React 16.14
- **UI Framework**: Material-UI v4
- **Audio Library**: Howler.js 2.2.4
- **Routing**: React Router v5
- **API**: Spotify Web API
- **State Management**: React Context API
- **Build Tool**: Webpack 5
- **Styling**: Styled Components + Material-UI

## 📝 Features Roadmap

Mogelijke toekomstige features:

- [ ] Multiplayer mode
- [ ] Hints systeem (eerste letter, release jaar, album cover)
- [ ] Moeilijkheidsgraden (type antwoord in plaats van multiple choice)
- [ ] Statistieken pagina (favorite genres, gemiddelde reactietijd)
- [ ] Social sharing (deel je score op Twitter/Facebook)
- [ ] Muziek visualizer tijdens playback
- [ ] Custom playlists maken en opslaan
- [ ] Daily challenge mode

## 🤝 Contributing

Pull requests zijn welkom! Voor grote veranderingen, open eerst een issue om te bespreken wat je wilt veranderen.

## 📄 Licentie

ISC

## 👨‍💻 Credits

Gebouwd op basis van [spotify-guessing-game](https://github.com/d5732/spotify-guessing-game) door Will Marttala

Uitgebreid met features door Maurice van de Rijdt

## 📞 Support

Bij vragen of problemen:
1. Check deze SETUP.md
2. Check de GitHub Issues
3. Open een nieuwe issue met een gedetailleerde beschrijving

---

**Veel plezier met het spel! 🎉🎵**
