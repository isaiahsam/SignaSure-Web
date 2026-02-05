'use client';

import { useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';
import { useUserProfile } from '@/hooks/useUserProfile';
import { acceptTermsOfService, completeTour } from '@/lib/firebase/firestore';
import { TermsAgreementModal } from './terms-agreement-modal';
import { AppTour } from '@/components/tour/app-tour';
import { useTourStore } from '@/stores/tour-store';
import { PenLoader } from '@/components/ui/pen-loader';

interface AuthGuardProps {
  children: React.ReactNode;
  fallbackUrl?: string;
}

export function AuthGuard({ children, fallbackUrl = '/login' }: AuthGuardProps) {
  const { user, loading, initialized, signOut } = useAuth();
  const { profile, isLoading: profileLoading, invalidate } = useUserProfile();
  const { isTourActive, startTour, endTour } = useTourStore();
  const router = useRouter();
  const tourTriggeredRef = useRef(false);

  useEffect(() => {
    if (initialized && !loading && !user) {
      router.push(fallbackUrl);
    }
  }, [user, loading, initialized, router, fallbackUrl]);

  // Trigger tour after TOS is accepted and profile loads
  useEffect(() => {
    if (
      profile &&
      profile.hasAcceptedTerms &&
      !profile.hasCompletedTour &&
      !tourTriggeredRef.current &&
      !isTourActive
    ) {
      tourTriggeredRef.current = true;
      const timer = setTimeout(() => {
        startTour();
      }, 500);
      return () => clearTimeout(timer);
    }
  }, [profile, isTourActive, startTour]);

  if (!initialized || loading) {
    return <PenLoader />;
  }

  if (!user) {
    return null;
  }

  // Show loading while profile is being fetched
  if (profileLoading) {
    return <PenLoader />;
  }

  // Show TOS modal if user hasn't accepted (covers null profile for deleted/new users)
  if (!profile?.hasAcceptedTerms) {
    return (
      <TermsAgreementModal
        onAccept={async () => {
          await acceptTermsOfService(user.uid);
          invalidate();
        }}
        onDecline={async () => {
          await signOut();
          router.push('/');
        }}
      />
    );
  }

  const handleTourComplete = async () => {
    endTour();
    await completeTour(user.uid);
    invalidate();
  };

  return (
    <>
      {children}
      {isTourActive && <AppTour onComplete={handleTourComplete} />}
    </>
  );
}
