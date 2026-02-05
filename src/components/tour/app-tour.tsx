'use client';

import { useState, useEffect, useCallback } from 'react';
import { tourSteps, type TourStep } from '@/lib/tour-steps';
import { ChevronLeft, ChevronRight, X } from 'lucide-react';

interface AppTourProps {
  onComplete: () => void;
}

interface SpotlightRect {
  top: number;
  left: number;
  width: number;
  height: number;
}

function getTooltipPosition(
  rect: SpotlightRect,
  placement: TourStep['placement'],
  tooltipWidth: number,
  tooltipHeight: number
) {
  const padding = 12;
  const vw = window.innerWidth;
  const vh = window.innerHeight;

  let top = 0;
  let left = 0;

  switch (placement) {
    case 'bottom':
      top = rect.top + rect.height + padding;
      left = rect.left + rect.width / 2 - tooltipWidth / 2;
      break;
    case 'top':
      top = rect.top - tooltipHeight - padding;
      left = rect.left + rect.width / 2 - tooltipWidth / 2;
      break;
    case 'left':
      top = rect.top + rect.height / 2 - tooltipHeight / 2;
      left = rect.left - tooltipWidth - padding;
      break;
    case 'right':
      top = rect.top + rect.height / 2 - tooltipHeight / 2;
      left = rect.left + rect.width + padding;
      break;
    case 'center':
      top = vh / 2 - tooltipHeight / 2;
      left = vw / 2 - tooltipWidth / 2;
      break;
  }

  // Clamp within viewport
  if (left < padding) left = padding;
  if (left + tooltipWidth > vw - padding) left = vw - tooltipWidth - padding;
  if (top < padding) top = padding;
  if (top + tooltipHeight > vh - padding) top = vh - tooltipHeight - padding;

  return { top, left };
}

export function AppTour({ onComplete }: AppTourProps) {
  const [currentStep, setCurrentStep] = useState(0);
  const [spotlightRect, setSpotlightRect] = useState<SpotlightRect | null>(null);
  const [tooltipPos, setTooltipPos] = useState({ top: 0, left: 0 });

  const step = tourSteps[currentStep];
  const isFirst = currentStep === 0;
  const isLast = currentStep === tourSteps.length - 1;

  const tooltipWidth = 340;
  const tooltipEstimatedHeight = 200;

  const updatePosition = useCallback(() => {
    if (!step) return;

    if (step.placement === 'center' || !step.target) {
      setSpotlightRect(null);
      setTooltipPos(
        getTooltipPosition(
          { top: 0, left: 0, width: 0, height: 0 },
          'center',
          tooltipWidth,
          tooltipEstimatedHeight
        )
      );
      return;
    }

    // On mobile, swap sidebar-nav for mobile-nav
    let selector = step.target;
    if (step.id === 'sidebar-nav' && window.innerWidth < 1024) {
      selector = '[data-tour="mobile-nav"]';
    }

    const el = document.querySelector(selector);
    if (!el) {
      setSpotlightRect(null);
      setTooltipPos(
        getTooltipPosition(
          { top: 0, left: 0, width: 0, height: 0 },
          'center',
          tooltipWidth,
          tooltipEstimatedHeight
        )
      );
      return;
    }

    const rect = el.getBoundingClientRect();
    const padding = 8;
    const spotlight: SpotlightRect = {
      top: rect.top - padding + window.scrollY,
      left: rect.left - padding,
      width: rect.width + padding * 2,
      height: rect.height + padding * 2,
    };
    setSpotlightRect(spotlight);

    // For tooltip, use viewport-relative rect
    const viewportSpotlight: SpotlightRect = {
      top: rect.top - padding,
      left: rect.left - padding,
      width: rect.width + padding * 2,
      height: rect.height + padding * 2,
    };

    let placement = step.placement;
    if (step.id === 'sidebar-nav' && window.innerWidth < 1024) {
      placement = 'top';
    }

    setTooltipPos(
      getTooltipPosition(viewportSpotlight, placement, tooltipWidth, tooltipEstimatedHeight)
    );

    // Scroll element into view if needed
    el.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
  }, [step]);

  useEffect(() => {
    updatePosition();

    window.addEventListener('resize', updatePosition);
    window.addEventListener('scroll', updatePosition, true);
    return () => {
      window.removeEventListener('resize', updatePosition);
      window.removeEventListener('scroll', updatePosition, true);
    };
  }, [updatePosition]);

  const handleNext = () => {
    if (isLast) {
      onComplete();
    } else {
      setCurrentStep((s) => s + 1);
    }
  };

  const handleBack = () => {
    if (!isFirst) {
      setCurrentStep((s) => s - 1);
    }
  };

  const handleSkip = () => {
    onComplete();
  };

  // Handle escape key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') handleSkip();
      if (e.key === 'ArrowRight') handleNext();
      if (e.key === 'ArrowLeft') handleBack();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentStep]);

  if (!step) return null;

  return (
    <div className="fixed inset-0 z-[9999]">
      {/* SVG overlay with spotlight cutout */}
      <svg
        className="absolute inset-0 w-full h-full"
        style={{ pointerEvents: 'none' }}
      >
        <defs>
          <mask id="tour-spotlight-mask">
            <rect x="0" y="0" width="100%" height="100%" fill="white" />
            {spotlightRect && (
              <rect
                x={spotlightRect.left}
                y={spotlightRect.top}
                width={spotlightRect.width}
                height={spotlightRect.height}
                rx="12"
                ry="12"
                fill="black"
              />
            )}
          </mask>
        </defs>
        <rect
          x="0"
          y="0"
          width="100%"
          height="100%"
          fill="rgba(0,0,0,0.6)"
          mask="url(#tour-spotlight-mask)"
          style={{ pointerEvents: 'auto' }}
          onClick={handleNext}
        />
      </svg>

      {/* Spotlight ring */}
      {spotlightRect && (
        <div
          className="absolute rounded-xl ring-2 ring-primary-400 ring-offset-2 ring-offset-transparent pointer-events-none"
          style={{
            top: spotlightRect.top,
            left: spotlightRect.left,
            width: spotlightRect.width,
            height: spotlightRect.height,
          }}
        />
      )}

      {/* Tooltip card */}
      <div
        className="absolute z-[10000] animate-page-enter"
        style={{
          top: tooltipPos.top,
          left: tooltipPos.left,
          width: tooltipWidth,
          position: 'fixed',
        }}
      >
        <div className="bg-white dark:bg-slate-800 rounded-xl shadow-2xl border border-slate-200 dark:border-slate-700 overflow-hidden">
          {/* Header */}
          <div className="flex items-center justify-between px-4 pt-4 pb-2">
            <h3 className="text-base font-semibold text-slate-900 dark:text-slate-100">
              {step.title}
            </h3>
            <button
              onClick={handleSkip}
              className="p-1 rounded-md text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors"
              aria-label="Skip tour"
            >
              <X className="h-4 w-4" />
            </button>
          </div>

          {/* Description */}
          <p className="px-4 pb-4 text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
            {step.description}
          </p>

          {/* Footer */}
          <div className="flex items-center justify-between px-4 py-3 border-t border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/50">
            {/* Progress dots */}
            <div className="flex gap-1.5">
              {tourSteps.map((_, i) => (
                <div
                  key={i}
                  className={`h-2 w-2 rounded-full transition-colors ${
                    i === currentStep
                      ? 'bg-primary-600'
                      : i < currentStep
                      ? 'bg-primary-300 dark:bg-primary-700'
                      : 'bg-slate-300 dark:bg-slate-600'
                  }`}
                />
              ))}
            </div>

            {/* Navigation buttons */}
            <div className="flex gap-2">
              {!isFirst && (
                <button
                  onClick={handleBack}
                  className="flex items-center gap-1 px-3 py-1.5 text-sm font-medium text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors"
                >
                  <ChevronLeft className="h-4 w-4" />
                  Back
                </button>
              )}
              {isFirst && (
                <button
                  onClick={handleSkip}
                  className="px-3 py-1.5 text-sm font-medium text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-300 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors"
                >
                  Skip tour
                </button>
              )}
              <button
                onClick={handleNext}
                className="flex items-center gap-1 px-4 py-1.5 text-sm font-medium text-white bg-primary-600 hover:bg-primary-700 rounded-lg transition-colors"
              >
                {isLast ? 'Finish' : 'Next'}
                {!isLast && <ChevronRight className="h-4 w-4" />}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
