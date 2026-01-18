'use client';

import { useAuth } from '@/hooks';
import { useTheme } from '@/hooks';
import { useRateLimit } from '@/hooks';
import { useToast } from '@/components/ui/toast';
import { Button, Card, CardHeader, CardTitle, CardContent, CardDescription } from '@/components/ui';
import { Select } from '@/components/ui';
import { Sun, Moon, Monitor, LogOut, User, Clock } from 'lucide-react';

export default function SettingsPage() {
  const { user, logout } = useAuth();
  const { theme, setTheme } = useTheme();
  const { stats } = useRateLimit();
  const { success } = useToast();

  const handleSignOut = async () => {
    await logout();
    success('Signed out successfully');
  };

  return (
    <div className="space-y-6">
      <div className="animate-fade-in-down">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Settings</h1>
        <p className="mt-1 text-gray-600 dark:text-slate-400">
          Manage your account and preferences
        </p>
      </div>

      {/* Account Section */}
      <Card className="opacity-0 animate-fade-in-up" style={{ animationDelay: '0.1s', animationFillMode: 'forwards' }}>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <User className="h-5 w-5" />
            Account
          </CardTitle>
          <CardDescription>Your account information</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center gap-4">
            {user?.photoURL && (
              <img
                src={user.photoURL}
                alt={user.displayName || 'User'}
                className="h-16 w-16 rounded-full ring-2 ring-transparent transition-all duration-300 hover:ring-primary-500 hover:scale-110"
              />
            )}
            <div>
              <p className="text-lg font-medium text-gray-900 dark:text-white">
                {user?.displayName}
              </p>
              <p className="text-sm text-gray-500 dark:text-slate-400">{user?.email}</p>
            </div>
          </div>

          <Button variant="destructive" onClick={handleSignOut} className="gap-2">
            <LogOut className="h-4 w-4" />
            Sign Out
          </Button>
        </CardContent>
      </Card>

      {/* Theme Section */}
      <Card className="opacity-0 animate-fade-in-up" style={{ animationDelay: '0.2s', animationFillMode: 'forwards' }}>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <span className="transition-transform duration-300">
              {theme === 'light' && <Sun className="h-5 w-5" />}
              {theme === 'dark' && <Moon className="h-5 w-5" />}
              {theme === 'system' && <Monitor className="h-5 w-5" />}
            </span>
            Appearance
          </CardTitle>
          <CardDescription>Customize how SignaSure looks</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-4">
            <label className="text-sm font-medium text-gray-700 dark:text-slate-300">
              Theme
            </label>
            <Select
              value={theme}
              onChange={(e) => setTheme(e.target.value as 'light' | 'dark' | 'system')}
              className="w-40 transition-all duration-200 focus:scale-[1.02]"
            >
              <option value="light">Light</option>
              <option value="dark">Dark</option>
              <option value="system">System</option>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Usage Stats Section */}
      <Card className="opacity-0 animate-fade-in-up" style={{ animationDelay: '0.3s', animationFillMode: 'forwards' }}>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Clock className="h-5 w-5" />
            Usage
          </CardTitle>
          <CardDescription>Your analysis usage this period</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-6 sm:grid-cols-2">
            <div className="group">
              <p className="text-sm font-medium text-gray-500 dark:text-slate-400">
                This Hour
              </p>
              <div className="mt-2">
                <div className="flex items-baseline gap-2">
                  <span className="text-3xl font-bold text-gray-900 dark:text-white transition-transform duration-200 group-hover:scale-110">
                    {stats.usedThisHour}
                  </span>
                  <span className="text-gray-500 dark:text-slate-400">
                    / {stats.maxPerHour} used
                  </span>
                </div>
                <div className="mt-2 h-2 w-full rounded-full bg-gray-200 dark:bg-slate-700 overflow-hidden">
                  <div
                    className="h-2 rounded-full bg-primary-600 transition-all duration-500 ease-out"
                    style={{
                      width: `${(stats.usedThisHour / stats.maxPerHour) * 100}%`,
                    }}
                  />
                </div>
                <p className="mt-1 text-sm text-gray-500 dark:text-slate-400">
                  {stats.remainingThisHour} remaining
                </p>
              </div>
            </div>

            <div className="group">
              <p className="text-sm font-medium text-gray-500 dark:text-slate-400">
                Today
              </p>
              <div className="mt-2">
                <div className="flex items-baseline gap-2">
                  <span className="text-3xl font-bold text-gray-900 dark:text-white transition-transform duration-200 group-hover:scale-110">
                    {stats.usedToday}
                  </span>
                  <span className="text-gray-500 dark:text-slate-400">
                    / {stats.maxPerDay} used
                  </span>
                </div>
                <div className="mt-2 h-2 w-full rounded-full bg-gray-200 dark:bg-slate-700 overflow-hidden">
                  <div
                    className="h-2 rounded-full bg-primary-600 transition-all duration-500 ease-out"
                    style={{
                      width: `${(stats.usedToday / stats.maxPerDay) * 100}%`,
                    }}
                  />
                </div>
                <p className="mt-1 text-sm text-gray-500 dark:text-slate-400">
                  {stats.remainingToday} remaining
                </p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* About Section */}
      <Card className="opacity-0 animate-fade-in-up" style={{ animationDelay: '0.4s', animationFillMode: 'forwards' }}>
        <CardHeader>
          <CardTitle>About SignaSure</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2 text-sm text-gray-600 dark:text-slate-400">
          <p>
            SignaSure is an AI-powered legal document analyzer that helps you understand
            contracts, leases, and other legal documents before you sign.
          </p>
          <p className="font-semibold text-amber-600 dark:text-amber-400">
            Disclaimer: This tool provides informational analysis only and is not a
            substitute for professional legal advice. Always consult with a qualified
            attorney for legal matters.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
