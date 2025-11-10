import { useState, useEffect, useCallback } from 'react';
import { storage } from '../../../shared/lib/storage';

type Theme = 'light' | 'dark';

const THEME_KEY = 'theme';

export function useTheme() {
  const [theme, setTheme] = useState<Theme>(() => {
    try {
      const storedTheme = storage.getString(THEME_KEY);
      return (storedTheme as Theme) || 'dark';
    } catch {
      return 'dark';
    }
  });

  useEffect(() => {
    const root = window.document.documentElement;
    if (theme === 'dark') {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }
    try {
      storage.setString(THEME_KEY, theme);
    } catch (e) {
      console.error('Could not save theme to localStorage', e);
    }
  }, [theme]);

  const toggleTheme = useCallback(() => {
    setTheme((prevTheme) => (prevTheme === 'light' ? 'dark' : 'light'));
  }, []);

  return { theme, toggleTheme };
}

