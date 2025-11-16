# 🚀 Deployment Guide voor Render.com

## Snelle Deploy naar Render.com

### Stap 1: Dependencies Installeren
```bash
npm install
```

### Stap 2: Build maken
```bash
npm run build
```

### Stap 3: Deploy naar Render.com

1. **Maak een Render.com account** op https://render.com

2. **Nieuwe Web Service aanmaken:**
   - Klik op "New +" → "Web Service"
   - Verbind je GitHub repository
   - Selecteer deze repository

3. **Configureer de service:**
   - **Name:** `muziek-raad-spel` (of een andere naam)
   - **Environment:** `Node`
   - **Build Command:** `npm install && npm run build`
   - **Start Command:** `npm run server`
   - **Plan:** Free (of betaald voor betere performance)

4. **Environment Variabelen instellen:**
   - Ga naar "Environment" tab
   - Voeg toe:
     ```
     PORT=3001
     NODE_ENV=production
     SOCKET_URL=https://jouw-app-naam.onrender.com
     ```
   - **Vervang** `jouw-app-naam` met de daadwerkelijke URL die Render.com je geeft

5. **Deploy:**
   - Klik op "Create Web Service"
   - Render.com zal automatisch deployen
   - Wacht tot de deploy succesvol is

6. **Toegang tot de app:**
   - Na deploy krijg je een URL zoals: `https://muziek-raad-spel.onrender.com`
   - Open deze URL in je browser
   - Klik op "Multiplayer 🎵" om het spel te starten!

### Automatische Deploys

Render.com maakt automatisch nieuwe deploys aan bij elke push naar de main branch.

## Lokaal Testen

### Development Mode
```bash
# Terminal 1: Start de server
npm run server

# Terminal 2: Start de frontend
npm start
```

Of gebruik het combined commando:
```bash
npm run dev
```

De app draait op:
- **Frontend:** http://localhost:8080
- **Backend:** http://localhost:3001

## Features

✅ **Multiplayer Real-time Gameplay**
- Socket.io voor live updates
- Admin/player rollen
- Real-time scoreboard
- Chat functionaliteit

✅ **Game Modes**
- Single Player (bestaande functionaliteit)
- Multiplayer met vrienden

✅ **Muziek Integratie**
- Deezer API voor muziek previews
- TheAudioDB voor artist info
- Spotify support (optioneel)

✅ **Moderne UI**
- Tailwind CSS styling
- Responsive design
- Smooth animations

## Troubleshooting

### Socket.io verbindingsproblemen
Als je problemen hebt met socket verbindingen in production:
1. Check of de SOCKET_URL environment variabele correct is
2. Zorg dat de URL begint met `https://` (niet `http://`)
3. Controleer de browser console voor errors

### Build errors
Als de build faalt:
```bash
# Clear node_modules en herinstalleer
rm -rf node_modules
npm install
npm run build
```

### Port conflicts lokaal
Als port 3001 al in gebruik is:
```bash
# Stop processen op port 3001
lsof -ti:3001 | xargs kill -9

# Of gebruik een andere port
PORT=3002 npm run server
```

## Support

Voor vragen of problemen, maak een issue aan in de GitHub repository.

---

**Veel plezier met het spel! 🎵🎮**
