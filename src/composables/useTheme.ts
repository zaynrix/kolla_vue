import { ref } from 'vue'
import { useThemePrototype } from './useThemePrototype'

type Theme = 'light' | 'dark'

const theme = ref<Theme>('light')

// Load theme from localStorage or system preference
const loadTheme = () => {
  if (typeof window === 'undefined') return
  
  const saved = localStorage.getItem('theme') as Theme | null
  let selectedTheme: Theme = 'light'
  
  if (saved && (saved === 'light' || saved === 'dark')) {
    selectedTheme = saved
    theme.value = saved
  } else {
    // Check system preference
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches
    selectedTheme = prefersDark ? 'dark' : 'light'
    theme.value = selectedTheme
  }
  
  // Apply Ocean Blue theme
  const { prototypes, setPrototype } = useThemePrototype()
  const oceanBlueTheme = prototypes.value.find(p => p.id === `${selectedTheme}-blue`)
  if (oceanBlueTheme) {
    setPrototype(oceanBlueTheme)
  } else {
    applyTheme(selectedTheme)
  }
}

// Apply theme to document
const applyTheme = (newTheme: Theme) => {
  if (typeof document === 'undefined') return
  
  const root = document.documentElement
  root.setAttribute('data-theme', newTheme)
  root.setAttribute('data-theme-color', 'blue')
  localStorage.setItem('theme', newTheme)
}

// Watch for system theme changes
if (typeof window !== 'undefined') {
  const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)')
  const handleChange = (e: MediaQueryListEvent) => {
    // Only auto-switch if user hasn't manually set a preference
    if (!localStorage.getItem('theme')) {
      const newTheme = e.matches ? 'dark' : 'light'
      theme.value = newTheme
      
      // Apply Ocean Blue theme
      const { prototypes, setPrototype } = useThemePrototype()
      const oceanBlueTheme = prototypes.value.find(p => p.id === `${newTheme}-blue`)
      if (oceanBlueTheme) {
        setPrototype(oceanBlueTheme)
      } else {
        applyTheme(newTheme)
      }
    }
  }
  mediaQuery.addEventListener('change', handleChange)
}

// Initialize theme on module load
if (typeof window !== 'undefined') {
  loadTheme()
}

export function useTheme() {
  // Toggle between light and dark (Ocean Blue)
  const toggleTheme = () => {
    const newTheme = theme.value === 'light' ? 'dark' : 'light'
    theme.value = newTheme
    
    // Apply Ocean Blue theme
    const { prototypes, setPrototype } = useThemePrototype()
    const oceanBlueTheme = prototypes.value.find(p => p.id === `${newTheme}-blue`)
    if (oceanBlueTheme) {
      setPrototype(oceanBlueTheme)
    } else {
      applyTheme(newTheme)
    }
  }

  // Set specific theme (Ocean Blue)
  const setTheme = (newTheme: Theme) => {
    theme.value = newTheme
    
    // Apply Ocean Blue theme
    const { prototypes, setPrototype } = useThemePrototype()
    const oceanBlueTheme = prototypes.value.find(p => p.id === `${newTheme}-blue`)
    if (oceanBlueTheme) {
      setPrototype(oceanBlueTheme)
    } else {
      applyTheme(newTheme)
    }
  }

  return {
    theme,
    toggleTheme,
    setTheme,
    loadTheme,
    isDark: () => theme.value === 'dark',
    isLight: () => theme.value === 'light'
  }
}

