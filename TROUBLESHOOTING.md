# Troubleshooting Guide

## 404 Fehler beheben

### 1. Favicon 404 Fehler

**Problem**: `Failed to load resource: the server responded with a status of 404` für `/favicon.ico`

**Lösung**:
- Stelle sicher, dass `public/favicon.ico` existiert
- Der Pfad `/favicon.ico` wird automatisch von Vite aus dem `public/` Ordner bereitgestellt
- Bei GitHub Pages: Stelle sicher, dass der Base-URL korrekt gesetzt ist

### 2. Browser Extension Fehler

**Problem**: `Unchecked runtime.lastError: Could not establish connection`

**Lösung**:
- Dies ist ein Browser-Extension-Fehler (z.B. Vue DevTools, React DevTools, etc.)
- Nicht kritisch - kann ignoriert werden
- Falls störend: Extension deaktivieren oder aktualisieren

### 3. Base URL für GitHub Pages

Wenn Sie auf GitHub Pages deployen, müssen Sie möglicherweise die Base-URL setzen:

```bash
# In vite.config.ts
export default defineConfig({
  base: '/kolla_vue/', // Repository-Name
  // ...
})
```

Oder in `.env.production`:
```
VITE_BASE_URL=/kolla_vue/
```

### 4. Assets nicht gefunden

**Prüfen**:
- Alle CSS-Dateien in `src/assets/` sind vorhanden
- Alle Bilder/Assets sind im `public/` Ordner
- Import-Pfade sind korrekt (relativ oder mit `@/` Alias)

### 5. Dev-Server neu starten

Manchmal hilft ein Neustart:

```bash
# Stoppe den Server (Ctrl+C)
# Dann neu starten:
npm run dev
```

### 6. Browser-Cache leeren

- Hard Refresh: `Ctrl+Shift+R` (Windows) oder `Cmd+Shift+R` (Mac)
- Oder DevTools öffnen → Network Tab → "Disable cache" aktivieren

