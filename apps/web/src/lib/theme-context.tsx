'use client';

import { createContext, useContext, useEffect, useState } from 'react';

type Theme = 'emerald' | 'ocean' | 'sunset' | 'royal';
type Mode = 'light' | 'dark';

interface ThemeContextType {
  theme: Theme;
  mode: Mode;
  setTheme: (theme: Theme) => void;
  setMode: (mode: Mode) => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [theme, setThemeState] = useState<Theme>('emerald');
  const [mode, setModeState] = useState<Mode>('light');
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    // Load from local storage
    const savedTheme = localStorage.getItem('wfgts-theme') as Theme;
    const savedMode = localStorage.getItem('wfgts-mode') as Mode;
    if (savedTheme) setThemeState(savedTheme);
    if (savedMode) setModeState(savedMode);
    
    setMounted(true);
  }, []);

  const setTheme = (newTheme: Theme) => {
    setThemeState(newTheme);
    localStorage.setItem('wfgts-theme', newTheme);
  };

  const setMode = (newMode: Mode) => {
    setModeState(newMode);
    localStorage.setItem('wfgts-mode', newMode);
  };

  useEffect(() => {
    if (!mounted) return;
    
    const root = document.documentElement;
    
    // Remove old theme classes
    root.classList.remove('theme-ocean', 'theme-sunset', 'theme-royal');
    
    // Add new theme class
    if (theme !== 'emerald') {
      root.classList.add(`theme-${theme}`);
    }

    // Handle dark mode
    if (mode === 'dark') {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }
  }, [theme, mode, mounted]);

  // Prevent hydration mismatch by not rendering until mounted
  if (!mounted) {
    return <div style={{ visibility: 'hidden' }}>{children}</div>;
  }

  return (
    <ThemeContext.Provider value={{ theme, mode, setTheme, setMode }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
}
