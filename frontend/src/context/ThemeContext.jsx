import { createContext, useState, useEffect } from 'react';

export const ThemeContext = createContext();

const THEMES = [
  { id: 'light', label: 'Light', mode: 'light' },
  { id: 'dark', label: 'Dark', mode: 'dark' },
  { id: 'slate', label: 'Slate', mode: 'light' },
];

const normalizeTheme = (value) => THEMES.some(theme => theme.id === value) ? value : 'light';

export const ThemeProvider = ({ children }) => {
  const [theme, setTheme] = useState(() => {
    if (typeof window !== 'undefined') {
      const stored = localStorage.getItem('theme');
      if (stored) return normalizeTheme(stored);
      if (window.matchMedia('(prefers-color-scheme: dark)').matches) return 'dark';
    }
    return 'light';
  });

  useEffect(() => {
    const root = window.document.documentElement;
    const activeTheme = THEMES.find(item => item.id === theme) || THEMES[0];

    root.dataset.theme = activeTheme.id;
    if (activeTheme.mode === 'dark') {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }
    localStorage.setItem('theme', activeTheme.id);
  }, [theme]);

  const toggleTheme = () => {
    setTheme(prev => {
      const currentIndex = THEMES.findIndex(item => item.id === prev);
      return THEMES[(currentIndex + 1) % THEMES.length].id;
    });
  };

  return (
    <ThemeContext.Provider value={{ theme, setTheme, toggleTheme, themes: THEMES }}>
      {children}
    </ThemeContext.Provider>
  );
};
