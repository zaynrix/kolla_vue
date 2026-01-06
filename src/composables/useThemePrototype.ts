import { ref, computed } from 'vue'

export type ThemeVariant = 'light' | 'dark'
export type ThemeColor = 'blue' | 'purple' | 'green' | 'orange' | 'red' | 'pink' | 'teal' | 'indigo'

export interface ThemePrototype {
  id: string
  name: string
  variant: ThemeVariant
  color: ThemeColor
  primary: string
  primaryDark: string
  primaryLight: string
  gradient: string
  preview: {
    bg: string
    surface: string
    text: string
  }
}

const themePrototypes: ThemePrototype[] = [
  // Professional Blue - Light (Corporate/Professional)
  {
    id: 'light-blue',
    name: 'Professional',
    variant: 'light',
    color: 'blue',
    primary: '#1e3a8a', // Deep professional blue
    primaryDark: '#1e40af', // Darker blue for contrast
    primaryLight: '#3b82f6', // Lighter blue for accents
    gradient: 'linear-gradient(135deg, #1e40af 0%, #1e3a8a 50%, #1e2a5e 100%)', // Professional gradient
    preview: { bg: '#ffffff', surface: '#f8fafc', text: '#1e293b' }
  },
  // Ocean Blue - Dark
  {
    id: 'dark-blue',
    name: 'Ocean Blue',
    variant: 'dark',
    color: 'blue',
    primary: '#60a5fa',
    primaryDark: '#3b82f6',
    primaryLight: '#93c5fd',
    gradient: 'linear-gradient(135deg, #93c5fd 0%, #60a5fa 50%, #3b82f6 100%)',
    preview: { bg: '#0f172a', surface: '#1e293b', text: '#f1f5f9' }
  }
]

const currentPrototype = ref<ThemePrototype>(themePrototypes[0])

export function useThemePrototype() {
  const prototypes = computed(() => themePrototypes)
  
  const lightThemes = computed(() => 
    themePrototypes.filter(t => t.variant === 'light')
  )
  
  const darkThemes = computed(() => 
    themePrototypes.filter(t => t.variant === 'dark')
  )

  const setPrototype = (prototype: ThemePrototype) => {
    currentPrototype.value = prototype
    applyPrototype(prototype)
  }

  const applyPrototype = (prototype: ThemePrototype) => {
    if (typeof document === 'undefined') return
    
    const root = document.documentElement
    
    // Set theme variant
    root.setAttribute('data-theme', prototype.variant)
    
    // Apply color scheme
    root.setAttribute('data-theme-color', prototype.color)
    
    // Apply custom CSS variables
    root.style.setProperty('--color-primary', prototype.primary)
    root.style.setProperty('--color-primary-dark', prototype.primaryDark)
    root.style.setProperty('--color-primary-light', prototype.primaryLight)
    root.style.setProperty('--color-primary-gradient', prototype.gradient)
    
    // Save to localStorage
    localStorage.setItem('theme', prototype.variant)
    localStorage.setItem('theme-prototype', prototype.id)
  }

  const loadPrototype = () => {
    if (typeof window === 'undefined') return
    
    const savedId = localStorage.getItem('theme-prototype')
    if (savedId) {
      const saved = themePrototypes.find(p => p.id === savedId)
      if (saved) {
        currentPrototype.value = saved
        applyPrototype(saved)
        return
      }
    }
    
    // Fallback to default
    applyPrototype(themePrototypes[0])
  }

  return {
    prototypes,
    lightThemes,
    darkThemes,
    currentPrototype,
    setPrototype,
    loadPrototype
  }
}

