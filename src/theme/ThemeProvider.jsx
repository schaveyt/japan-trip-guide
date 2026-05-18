import { useState, useEffect } from 'react'
import { ThemeContext } from './ThemeContext'

function getStoredTheme() {
  try {
    return localStorage.getItem('theme') || 'system'
  } catch {
    return 'system'
  }
}

function getResolved(theme) {
  if (theme !== 'system') return theme
  return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'
}

const THEME_COLORS = { light: '#F8F7F4', dark: '#16161A' }

export function ThemeProvider({ children }) {
  const [theme, setThemeState] = useState(getStoredTheme)
  const [resolvedTheme, setResolvedTheme] = useState(() => getResolved(getStoredTheme()))

  function setTheme(next) {
    localStorage.setItem('theme', next)
    setThemeState(next)
  }

  useEffect(() => {
    const mq = window.matchMedia('(prefers-color-scheme: dark)')

    function apply(t) {
      const resolved = t !== 'system' ? t : (mq.matches ? 'dark' : 'light')
      setResolvedTheme(resolved)
      document.documentElement.dataset.theme = resolved

      // When user manually overrides system, inject a no-media theme-color tag that
      // takes precedence over the media-query tags in index.html
      const id = 'theme-color-override'
      let tag = document.getElementById(id)
      if (t === 'system') {
        tag?.remove()
      } else {
        if (!tag) {
          tag = document.createElement('meta')
          tag.setAttribute('name', 'theme-color')
          tag.id = id
          document.head.appendChild(tag)
        }
        tag.setAttribute('content', THEME_COLORS[resolved])
      }
    }

    apply(theme)

    function onMqChange() {
      if (theme === 'system') apply('system')
    }

    mq.addEventListener('change', onMqChange)
    return () => mq.removeEventListener('change', onMqChange)
  }, [theme])

  return (
    <ThemeContext.Provider value={{ theme, resolvedTheme, setTheme }}>
      {children}
    </ThemeContext.Provider>
  )
}
