'use client';

import { useEffect, useState } from 'react';
import { useThemeStore, Theme } from '@/stores/theme-store';

export function useTheme() {
  const { theme, setTheme } = useThemeStore();
  const [resolvedTheme, setResolvedTheme] = useState<'light' | 'dark'>('light');

  useEffect(() => {
    const updateTheme = () => {
      let newTheme: 'light' | 'dark';

      if (theme === 'system') {
        newTheme = window.matchMedia('(prefers-color-scheme: dark)').matches
          ? 'dark'
          : 'light';
      } else {
        newTheme = theme;
      }

      setResolvedTheme(newTheme);

      if (newTheme === 'dark') {
        document.documentElement.classList.add('dark');
      } else {
        document.documentElement.classList.remove('dark');
      }
    };

    updateTheme();

    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    mediaQuery.addEventListener('change', updateTheme);

    return () => mediaQuery.removeEventListener('change', updateTheme);
  }, [theme]);

  return {
    theme,
    resolvedTheme,
    setTheme,
    isDark: resolvedTheme === 'dark',
  };
}
