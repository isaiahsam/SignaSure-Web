'use client';

/**
 * Inline pen-writing SVG animation. Use directly inside cards/sections.
 * Size controlled via className (default w-16 h-16).
 */
export function PenSpinner({ className = 'w-16 h-16' }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 64 64"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={`pen-writing ${className}`}
    >
      {/* Written line (draws on) */}
      <path
        d="M12 52 C 20 48, 28 44, 36 46 C 44 48, 48 52, 52 50"
        className="stroke-primary-300 dark:stroke-primary-700"
        strokeWidth="2"
        strokeLinecap="round"
        fill="none"
        strokeDasharray="60"
        strokeDashoffset="60"
      >
        <animate
          attributeName="stroke-dashoffset"
          from="60"
          to="0"
          dur="1.2s"
          repeatCount="indefinite"
        />
      </path>

      {/* Pen — entire group rotated around one point so parts stay aligned */}
      <g className="pen-hand" transform="rotate(25, 32, 36)">
        {/* Pen barrel */}
        <rect
          x="29"
          y="6"
          width="6"
          height="26"
          rx="2"
          className="fill-primary-600"
        />
        {/* Pen grip */}
        <rect
          x="30"
          y="26"
          width="4"
          height="8"
          rx="1"
          className="fill-primary-800 dark:fill-primary-400"
        />
        {/* Pen tip */}
        <polygon
          points="29,34 32,44 35,34"
          className="fill-slate-400 dark:fill-slate-500"
        />
      </g>
    </svg>
  );
}

/**
 * Full-screen pen loader (for page-level loading states like AuthGuard).
 */
export function PenLoader({ message = 'Loading...' }: { message?: string }) {
  return (
    <div className="min-h-screen flex items-center justify-center bg-white dark:bg-slate-900">
      <div className="flex flex-col items-center gap-4">
        <PenSpinner />
        <p className="text-sm text-slate-500 dark:text-slate-400">{message}</p>
      </div>
    </div>
  );
}
