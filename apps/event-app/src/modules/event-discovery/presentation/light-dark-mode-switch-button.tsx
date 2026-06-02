import { useState, useEffect } from 'react';
import { Moon, Sun } from 'lucide-react';

export const LightDarkModeSwitchButton = () => {
  const [isDark, setIsDark] = useState(
    () =>
      typeof localStorage !== 'undefined' &&
      localStorage.getItem('theme') === 'dark',
  );

  useEffect(() => {
    if (isDark) {
      document.documentElement.setAttribute('data-theme', 'dark');
    } else {
      document.documentElement.removeAttribute('data-theme');
    }
  }, [isDark]);

  const toggleTheme = () => {
    const next = !isDark;
    setIsDark(next);
    localStorage.setItem('theme', next ? 'dark' : 'light');
  };

  return (
    <button
      className="bg-surface border border-card-border-c rounded-full inline-flex justify-center items-center text-ink text-sm hover:bg-primary hover:text-on-primary transition-colors w-10 h-10"
      onClick={toggleTheme}
      aria-label={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
    >
      {isDark ? <Sun size={14} /> : <Moon size={14} />}
    </button>
  );
};
