# Manuelles GitHub Pages Deployment

## Problem
Das Personal Access Token hat nicht die Berechtigung, Workflow-Dateien zu pushen.

## Lösung: Manuelles Deployment

### Option 1: GitHub Actions Workflow manuell erstellen

1. Gehe zu: `https://github.com/zaynrix/kolla_vue`
2. Klicke auf **"Add file"** → **"Create new file"**
3. Pfad: `.github/workflows/deploy.yml`
4. Kopiere den Inhalt aus `deploy.yml.bak` (falls vorhanden) oder verwende:

```yaml
name: Deploy to GitHub Pages

on:
  push:
    branches:
      - main

permissions:
  contents: read
  pages: write
  id-token: write

concurrency:
  group: "pages"
  cancel-in-progress: false

jobs:
  build:
    runs-on: ubuntu-latest
    steps:
      - name: Checkout
        uses: actions/checkout@v4

      - name: Setup Node
        uses: actions/setup-node@v4
        with:
          node-version: '20'
          cache: 'npm'

      - name: Install dependencies
        run: npm ci

      - name: Build
        run: npm run build
        env:
          NODE_ENV: production

      - name: Setup Pages
        uses: actions/configure-pages@v4

      - name: Upload artifact
        uses: actions/upload-pages-artifact@v3
        with:
          path: './dist'

  deploy:
    environment:
      name: github-pages
      url: ${{ steps.deployment.outputs.page_url }}
    runs-on: ubuntu-latest
    needs: build
    steps:
      - name: Deploy to GitHub Pages
        id: deployment
        uses: actions/deploy-pages@v4
```

5. Klicke auf **"Commit new file"**

### Option 2: Manuelles Deployment über GitHub UI

1. Gehe zu: `https://github.com/zaynrix/kolla_vue/settings/pages`
2. Unter "Source": Wähle **"Deploy from a branch"**
3. Branch: `main`
4. Folder: `/dist`
5. Klicke auf **"Save"**

**WICHTIG**: Für Option 2 musst du den `dist/` Ordner committen:

```bash
# Build erstellen
npm run build

# dist/ Ordner committen
git add dist/
git commit -m "chore: Add dist folder for GitHub Pages"
git push origin main
```

### Option 3: Personal Access Token aktualisieren

1. Gehe zu: `https://github.com/settings/tokens`
2. Erstelle ein neues Token mit **`workflow`** Scope
3. Verwende das neue Token für Git-Operationen

## Empfohlene Lösung

**Option 1** (GitHub Actions) ist am besten, da es automatisches Deployment ermöglicht.

Nach dem Erstellen des Workflows:
- Jeder Push zu `main` löst automatisch ein Deployment aus
- Die App wird unter `https://zaynrix.github.io/kolla_vue/` verfügbar sein

