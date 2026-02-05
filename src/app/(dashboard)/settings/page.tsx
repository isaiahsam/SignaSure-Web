'use client';

import { useAuth } from '@/hooks/useAuth';
import { useTheme } from '@/hooks/useTheme';
import { useRateLimit } from '@/hooks/useRateLimit';
import { useUserProfile } from '@/hooks/useUserProfile';
import { useTourStore } from '@/stores/tour-store';
import { updateUserProfile } from '@/lib/firebase/firestore';
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
  Info,
  FileText,
  Shield,
  ExternalLink,
  RotateCcw,
} from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

export default function SettingsPage() {
  const { user, signOut } = useAuth();
  const { theme, setTheme, resolvedTheme } = useTheme();
  const { currentCount, remainingAnalyses, dailyLimit } = useRateLimit();
  const { invalidate } = useUserProfile();
  const { startTour } = useTourStore();
  const router = useRouter();

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

      {/* About */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Info className="h-5 w-5 text-blue-500" />
            About
          </CardTitle>
          <CardDescription>Legal information and contact</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-3">
            <Link
              href="/terms"
              className="flex items-center justify-between p-4 rounded-lg border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors group"
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-amber-100 dark:bg-amber-900/30 flex items-center justify-center">
                  <FileText className="h-5 w-5 text-amber-600 dark:text-amber-400" />
                </div>
                <div>
                  <p className="font-medium text-slate-900 dark:text-slate-100">
                    Terms of Service
                  </p>
                  <p className="text-sm text-slate-500 dark:text-slate-400">
                    Read our terms and conditions
                  </p>
                </div>
              </div>
              <ExternalLink className="h-4 w-4 text-slate-400 group-hover:text-slate-600 dark:group-hover:text-slate-300" />
            </Link>

            <Link
              href="/privacy"
              className="flex items-center justify-between p-4 rounded-lg border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors group"
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-green-100 dark:bg-green-900/30 flex items-center justify-center">
                  <Shield className="h-5 w-5 text-green-600 dark:text-green-400" />
                </div>
                <div>
                  <p className="font-medium text-slate-900 dark:text-slate-100">
                    Privacy Policy
                  </p>
                  <p className="text-sm text-slate-500 dark:text-slate-400">
                    How we handle your data
                  </p>
                </div>
              </div>
              <ExternalLink className="h-4 w-4 text-slate-400 group-hover:text-slate-600 dark:group-hover:text-slate-300" />
            </Link>

            <a
              href="mailto:contact.loomalabs@gmail.com"
              className="flex items-center justify-between p-4 rounded-lg border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors group"
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-primary-100 dark:bg-primary-900/30 flex items-center justify-center">
                  <Mail className="h-5 w-5 text-primary-600 dark:text-primary-400" />
                </div>
                <div>
                  <p className="font-medium text-slate-900 dark:text-slate-100">
                    Contact Us
                  </p>
                  <p className="text-sm text-slate-500 dark:text-slate-400">
                    contact.loomalabs@gmail.com
                  </p>
                </div>
              </div>
              <ExternalLink className="h-4 w-4 text-slate-400 group-hover:text-slate-600 dark:group-hover:text-slate-300" />
            </a>
          </div>

          <div className="pt-4 border-t border-slate-200 dark:border-slate-700">
            <p className="text-xs text-slate-500 dark:text-slate-400 text-center">
              SignaSure v1.0.0 &copy; {new Date().getFullYear()} LoomaLabs. All rights reserved.
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Restart Tour */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <RotateCcw className="h-5 w-5 text-primary-500" />
            App Tour
          </CardTitle>
          <CardDescription>Replay the guided tour of SignaSure</CardDescription>
        </CardHeader>
        <CardContent>
          <Button
            variant="outline"
            onClick={async () => {
              if (user) {
                await updateUserProfile(user.uid, { hasCompletedTour: false });
                invalidate();
                router.push('/dashboard');
                setTimeout(() => startTour(), 600);
              }
            }}
            leftIcon={<RotateCcw className="h-4 w-4" />}
          >
            Restart Tour
          </Button>
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
