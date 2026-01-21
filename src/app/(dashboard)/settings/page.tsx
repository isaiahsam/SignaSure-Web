'use client';

import { useAuth } from '@/hooks/useAuth';
import { useTheme } from '@/hooks/useTheme';
import { useRateLimit } from '@/hooks/useRateLimit';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import {
  User,
  Palette,
  Sun,
  Moon,
  Monitor,
  Zap,
  LogOut,
  Mail,
  Calendar,
} from 'lucide-react';

export default function SettingsPage() {
  const { user, signOut } = useAuth();
  const { theme, setTheme, resolvedTheme } = useTheme();
  const { currentCount, remainingAnalyses, dailyLimit } = useRateLimit();

  const themeOptions = [
    { value: 'light', label: 'Light', icon: Sun },
    { value: 'dark', label: 'Dark', icon: Moon },
    { value: 'system', label: 'System', icon: Monitor },
  ] as const;

  const handleSignOut = async () => {
    if (confirm('Are you sure you want to sign out?')) {
      await signOut();
    }
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl md:text-3xl font-bold text-slate-900 dark:text-slate-100">
          Settings
        </h1>
        <p className="text-slate-600 dark:text-slate-400 mt-1">
          Manage your account and preferences
        </p>
      </div>

      {/* Account Info */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <User className="h-5 w-5 text-slate-500" />
            Account
          </CardTitle>
          <CardDescription>Your account information</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center gap-4">
            {user?.photoURL ? (
              <img
                src={user.photoURL}
                alt={user.displayName || 'User'}
                className="h-16 w-16 rounded-full"
              />
            ) : (
              <div className="h-16 w-16 rounded-full bg-primary-100 dark:bg-primary-900 flex items-center justify-center">
                <User className="h-8 w-8 text-primary-600" />
              </div>
            )}
            <div>
              <p className="text-lg font-medium text-slate-900 dark:text-slate-100">
                {user?.displayName || 'User'}
              </p>
              <div className="flex items-center gap-2 text-sm text-slate-500 dark:text-slate-400">
                <Mail className="h-4 w-4" />
                {user?.email}
              </div>
            </div>
          </div>

          {user?.metadata?.creationTime && (
            <div className="flex items-center gap-2 text-sm text-slate-500 dark:text-slate-400 pt-2 border-t border-slate-200 dark:border-slate-700">
              <Calendar className="h-4 w-4" />
              Member since{' '}
              {new Date(user.metadata.creationTime).toLocaleDateString('en-US', {
                month: 'long',
                year: 'numeric',
              })}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Usage Stats */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Zap className="h-5 w-5 text-yellow-500" />
            Usage
          </CardTitle>
          <CardDescription>Your daily analysis usage</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-slate-600 dark:text-slate-400">
                Analyses used today
              </span>
              <span className="font-medium text-slate-900 dark:text-slate-100">
                {currentCount} / {dailyLimit}
              </span>
            </div>

            <div className="w-full h-3 bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden">
              <div
                className={cn(
                  'h-full transition-all duration-300',
                  currentCount < dailyLimit * 0.5
                    ? 'bg-green-500'
                    : currentCount < dailyLimit * 0.8
                    ? 'bg-yellow-500'
                    : 'bg-red-500'
                )}
                style={{ width: `${(currentCount / dailyLimit) * 100}%` }}
              />
            </div>

            <p className="text-sm text-slate-500 dark:text-slate-400">
              {remainingAnalyses > 0
                ? `You have ${remainingAnalyses} analysis${remainingAnalyses !== 1 ? 'es' : ''} remaining today.`
                : 'You have reached your daily limit. It will reset at midnight.'}
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Theme Settings */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Palette className="h-5 w-5 text-purple-500" />
            Appearance
          </CardTitle>
          <CardDescription>Customize how SignaSure looks</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-3 gap-3">
            {themeOptions.map((option) => (
              <button
                key={option.value}
                onClick={() => setTheme(option.value)}
                className={cn(
                  'flex flex-col items-center gap-2 p-4 rounded-lg border-2 transition-colors',
                  theme === option.value
                    ? 'border-primary-500 bg-primary-50 dark:bg-primary-900/20'
                    : 'border-slate-200 dark:border-slate-700 hover:border-slate-300 dark:hover:border-slate-600'
                )}
              >
                <option.icon
                  className={cn(
                    'h-6 w-6',
                    theme === option.value
                      ? 'text-primary-600'
                      : 'text-slate-500'
                  )}
                />
                <span
                  className={cn(
                    'text-sm font-medium',
                    theme === option.value
                      ? 'text-primary-600'
                      : 'text-slate-700 dark:text-slate-300'
                  )}
                >
                  {option.label}
                </span>
              </button>
            ))}
          </div>

          <p className="text-sm text-slate-500 dark:text-slate-400 mt-4">
            Current theme: {resolvedTheme === 'dark' ? 'Dark' : 'Light'}
            {theme === 'system' && ' (following system preference)'}
          </p>
        </CardContent>
      </Card>

      {/* Sign Out */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-red-600">
            <LogOut className="h-5 w-5" />
            Sign Out
          </CardTitle>
          <CardDescription>Sign out of your account</CardDescription>
        </CardHeader>
        <CardContent>
          <Button
            variant="danger"
            onClick={handleSignOut}
            leftIcon={<LogOut className="h-4 w-4" />}
          >
            Sign Out
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
