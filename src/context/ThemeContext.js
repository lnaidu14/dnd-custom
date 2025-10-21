import { createContext, useContext, useState, useEffect } from 'react';

export const ThemeContext = createContext({
  theme: 'dark',
  toggleTheme: () => {},
  colors: {},
  animations: {}
});

export function ThemeProvider({ children }) {
  const [theme, setTheme] = useState('dark');
  
  const colors = {
    primary: theme === 'dark' ? '#61dafb' : '#4a90e2',
    background: theme === 'dark' ? '#1a202c' : '#ffffff',
    surface: theme === 'dark' ? '#2d3748' : '#f7fafc',
    text: theme === 'dark' ? '#f7fafc' : '#2d3748',
    accent: theme === 'dark' ? '#9f7aea' : '#805ad5'
  };

  const animations = {
    fadeIn: 'animate-fadeIn',
    slideIn: 'animate-slideIn',
    bounce: 'animate-bounce',
    spin: 'animate-spin'
  };

  const toggleTheme = () => {
    const newTheme = theme === 'dark' ? 'light' : 'dark';
    setTheme(newTheme);
    localStorage.setItem('theme', newTheme);
    document.documentElement.setAttribute('data-theme', newTheme);
  };

  useEffect(() => {
    const savedTheme = localStorage.getItem('theme') || 'dark';
    setTheme(savedTheme);
    document.documentElement.setAttribute('data-theme', savedTheme);
  }, []);

  return (
    <ThemeContext.Provider value={{ theme, toggleTheme, colors, animations }}>
      {children}
    </ThemeContext.Provider>
  );
}

export const useTheme = () => useContext(ThemeContext);