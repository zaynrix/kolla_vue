#!/usr/bin/env node

/**
 * Copy index.html to 404.html for GitHub Pages SPA routing
 * This allows direct navigation to routes like /kolla_vue/my-work-steps
 * GitHub Pages will serve 404.html when a route is not found,
 * and Vue Router will handle the routing client-side
 * 
 * This script ensures 404.html has the same content as index.html
 * with all the correct asset paths from the build
 */

import { readFileSync, writeFileSync, existsSync } from 'fs'
import { join } from 'path'

const distDir = join(process.cwd(), 'dist')
const indexHtmlPath = join(distDir, 'index.html')
const notFoundHtmlPath = join(distDir, '404.html')

if (!existsSync(indexHtmlPath)) {
  console.error('Error: index.html not found in dist directory')
  console.error('Make sure to run "npm run build" first')
  process.exit(1)
}

try {
  // Read the built index.html (has correct asset paths)
  const indexHtml = readFileSync(indexHtmlPath, 'utf-8')
  
  // Write it as 404.html
  // GitHub Pages will serve this when a route is not found
  // The Vue Router will then handle the routing client-side
  writeFileSync(notFoundHtmlPath, indexHtml, 'utf-8')
  
  console.log('✓ Copied index.html to 404.html for GitHub Pages SPA routing')
  console.log('  → GitHub Pages will serve 404.html for unknown routes')
  console.log('  → Vue Router will handle client-side routing')
} catch (error) {
  console.error('Error copying index.html to 404.html:', error)
  process.exit(1)
}

