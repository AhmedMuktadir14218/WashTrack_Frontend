import { useState, useEffect } from 'react';

export const useThemeMode = () => {
  const [isDarkMode, setIsDarkMode] = useState(() => {
    const saved = localStorage.getItem('wrd-theme');
    return saved ? saved === 'dark' : true; // Default to dark mode
  });

  useEffect(() => {
    const root = document.documentElement;
    if (isDarkMode) {
      root.classList.add('dark');
      localStorage.setItem('wrd-theme', 'dark');
    } else {
      root.classList.remove('dark');
      localStorage.setItem('wrd-theme', 'light');
    }
  }, [isDarkMode]);

  const toggleTheme = () => setIsDarkMode(!isDarkMode);

  return { isDarkMode, toggleTheme };
};