'use client';

import Link from 'next/link';
import { useAuth } from '@/hooks';
import { Button } from '@/components/ui';
import { Menu, X, FileText, Sun, Moon, Monitor } from 'lucide-react';
import { useState } from 'react';
import { useTheme } from '@/hooks/useTheme';

export function Header() {
  const { user, logout, isAuthenticated } = useAuth();
  const { theme, setTheme } = useTheme();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [isRotating, setIsRotating] = useState(false);

  const themeIcon = {
    light: <Sun className="h-5 w-5" />,
    dark: <Moon className="h-5 w-5" />,
    system: <Monitor className="h-5 w-5" />,
  };

  const cycleTheme = () => {
    setIsRotating(true);
    const themes: ('light' | 'dark' | 'system')[] = ['light', 'dark', 'system'];
    const currentIndex = themes.indexOf(theme);
    const nextIndex = (currentIndex + 1) % themes.length;
    setTheme(themes[nextIndex]);
    setTimeout(() => setIsRotating(false), 300);
  };

  return (
    <header className="sticky top-0 z-40 w-full border-b border-gray-200 bg-white/95 backdrop-blur supports-[backdrop-filter]:bg-white/60 dark:border-slate-700 dark:bg-slate-900/95 transition-colors duration-300">
      <nav className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        <Link href="/" className="flex items-center gap-2 group">
          <FileText className="h-8 w-8 text-primary-600 transition-transform duration-300 group-hover:scale-110 group-hover:rotate-6" />
          <span className="text-xl font-bold text-gray-900 dark:text-white transition-colors duration-200">SignaSure</span>
        </Link>

        {/* Desktop navigation */}
        <div className="hidden md:flex md:items-center md:gap-4">
          <button
            onClick={cycleTheme}
            className={`rounded-lg p-2 text-gray-600 hover:bg-gray-100 dark:text-slate-300 dark:hover:bg-slate-800 transition-all duration-200 hover:scale-110 active:scale-95 ${isRotating ? 'rotate-180' : ''}`}
            title={`Theme: ${theme}`}
            style={{ transition: 'transform 0.3s ease, background-color 0.2s ease' }}
          >
            {themeIcon[theme]}
          </button>

          {isAuthenticated ? (
            <>
              <Link href="/dashboard">
                <Button variant="ghost" className="transition-all duration-200 hover:scale-105">Dashboard</Button>
              </Link>
              <div className="flex items-center gap-3">
                {user?.photoURL && (
                  <img
                    src={user.photoURL}
                    alt={user.displayName || 'User'}
                    className="h-8 w-8 rounded-full ring-2 ring-transparent transition-all duration-200 hover:ring-primary-500 hover:scale-110"
                  />
                )}
                <Button variant="outline" onClick={logout} className="transition-all duration-200 hover:scale-105">
                  Sign Out
                </Button>
              </div>
            </>
          ) : (
            <Link href="/login">
              <Button className="transition-all duration-200 hover:scale-105">Sign In</Button>
            </Link>
          )}
        </div>

        {/* Mobile menu button */}
        <button
          className="md:hidden rounded-lg p-2 text-gray-600 hover:bg-gray-100 dark:text-slate-300 dark:hover:bg-slate-800 transition-all duration-200 active:scale-95"
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
        >
          <div className={`transition-transform duration-300 ${mobileMenuOpen ? 'rotate-90' : ''}`}>
            {mobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </div>
        </button>
      </nav>

      {/* Mobile menu */}
      <div
        className={`md:hidden border-t border-gray-200 bg-white dark:border-slate-700 dark:bg-slate-900 overflow-hidden transition-all duration-300 ease-out ${
          mobileMenuOpen ? 'max-h-96 opacity-100' : 'max-h-0 opacity-0'
        }`}
      >
        <div className="px-4 py-4">
          <div className="flex flex-col gap-3">
            <button
              onClick={cycleTheme}
              className="flex items-center gap-2 rounded-lg px-3 py-2 text-gray-600 hover:bg-gray-100 dark:text-slate-300 dark:hover:bg-slate-800 transition-all duration-200"
            >
              <span className={`transition-transform duration-300 ${isRotating ? 'rotate-180' : ''}`}>
                {themeIcon[theme]}
              </span>
              <span>Theme: {theme}</span>
            </button>

            {isAuthenticated ? (
              <>
                <Link
                  href="/dashboard"
                  className="rounded-lg px-3 py-2 text-gray-600 hover:bg-gray-100 dark:text-slate-300 dark:hover:bg-slate-800 transition-all duration-200"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  Dashboard
                </Link>
                <Button variant="outline" onClick={logout}>
                  Sign Out
                </Button>
              </>
            ) : (
              <Link href="/login" onClick={() => setMobileMenuOpen(false)}>
                <Button className="w-full">Sign In</Button>
              </Link>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}
