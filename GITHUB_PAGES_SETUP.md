# GitHub Pages Deployment Setup

## Problem behoben ✅

Der Fehler `GET https://zaynrix.github.io/src/main.ts net::ERR_ABORTED 404` wurde behoben durch:

1. **Base URL in `vite.config.ts` gesetzt**: `/kolla_vue/`
2. **GitHub Actions Workflow erstellt**: Automatisches Deployment bei Push

## Setup-Schritte

### 1. GitHub Pages aktivieren

1. Gehe zu: `https://github.com/zaynrix/kolla_vue/settings/pages`
2. Unter "Source": Wähle **"GitHub Actions"**
3. Speichern

### 2. Build und Deploy

```bash
# Lokal testen (mit Base URL):
npm run build
npm run preview

# Commit und Push:
git add .
git commit -m "fix: Configure GitHub Pages base URL"
git push origin main
```

### 3. Automatisches Deployment

Nach dem Push wird automatisch:
- Die App gebaut (`npm run build`)
- Auf GitHub Pages deployed
- Verfügbar unter: `https://zaynrix.github.io/kolla_vue/`

## Wichtige Hinweise

### Base URL

- **Production**: `/kolla_vue/` (für GitHub Pages)
- **Development**: `/` (für lokale Entwicklung)

Die Base URL wird automatisch basierend auf `NODE_ENV` gesetzt.

### Lokale Entwicklung

Für lokale Entwicklung bleibt alles gleich:
```bash
npm run dev
# Läuft auf http://localhost:5173/
```

### Production Build testen

```bash
npm run build
npm run preview
# Läuft auf http://localhost:4173/kolla_vue/
```

## Troubleshooting

### 404 Fehler nach Deployment

1. Prüfe, ob GitHub Pages aktiviert ist
2. Prüfe, ob der Workflow erfolgreich war (Actions Tab)
3. Warte 1-2 Minuten nach dem Deployment
4. Hard Refresh: `Ctrl+Shift+R` oder `Cmd+Shift+R`

### Assets nicht gefunden

- Stelle sicher, dass `base: '/kolla_vue/'` in `vite.config.ts` gesetzt ist
- Prüfe, ob alle Assets im `dist/` Ordner vorhanden sind

### Router funktioniert nicht

- Der Router verwendet bereits `import.meta.env.BASE_URL`
- Sollte automatisch funktionieren

## Repository-URL

Nach erfolgreichem Deployment:
- **Live URL**: `https://zaynrix.github.io/kolla_vue/`
- **Repository**: `https://github.com/zaynrix/kolla_vue`

