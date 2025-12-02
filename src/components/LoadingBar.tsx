'use client';

import { useEffect, useState, useId } from 'react';
import { usePathname, useSearchParams } from 'next/navigation';

export function LoadingBar() {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [isVisible, setIsVisible] = useState(false);
  const gradId1 = useId();
  const gradId2 = useId();

  useEffect(() => {
    setIsVisible(true);
    const timer = setTimeout(() => {
      setIsVisible(false);
    }, 2000);

    return () => clearTimeout(timer);
  }, [pathname, searchParams]);

  if (!isVisible) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/20 backdrop-blur-sm animate-in fade-in duration-300">
      <div className="flex flex-col items-center gap-6">
        {/* Outer rotating ring */}
        <div className="relative w-16 h-16">
          <svg
            className="absolute inset-0 w-full h-full animate-spin"
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 60 60"
          >
            <defs>
              <linearGradient id={`gradient-ring-${gradId1}`} x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#06b6d4" />
                <stop offset="50%" stopColor="#3b82f6" />
                <stop offset="100%" stopColor="#8b5cf6" />
              </linearGradient>
            </defs>
            {/* Outer circle */}
            <circle
              cx="30"
              cy="30"
              r="26"
              stroke={`url(#gradient-ring-${gradId1})`}
              strokeWidth="2"
              opacity="0.2"
            />
            {/* Animated arc */}
            <path
              fill="none"
              stroke={`url(#gradient-ring-${gradId1})`}
              strokeWidth="3"
              strokeLinecap="round"
              d="M 30 6 A 24 24 0 0 1 50 15"
              opacity="1"
            />
          </svg>

          {/* Inner counter-rotating ring */}
          <svg
            className="absolute inset-0 w-full h-full animate-spin"
            style={{ animationDirection: 'reverse' }}
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 60 60"
          >
            <defs>
              <linearGradient id={`gradient-ring-${gradId2}`} x1="100%" y1="0%" x2="0%" y2="100%">
                <stop offset="0%" stopColor="#8b5cf6" />
                <stop offset="100%" stopColor="#06b6d4" />
              </linearGradient>
            </defs>
            <path
              fill="none"
              stroke={`url(#gradient-ring-${gradId2})`}
              strokeWidth="2"
              strokeLinecap="round"
              d="M 30 6 A 24 24 0 0 0 8 30"
              opacity="0.6"
            />
          </svg>

          {/* Center pulsing dots */}
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="flex gap-1">
              <div className="w-1.5 h-1.5 bg-gradient-to-r from-cyan-400 to-blue-500 rounded-full animate-pulse"></div>
              <div className="w-1.5 h-1.5 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full animate-pulse" style={{ animationDelay: '0.2s' }}></div>
              <div className="w-1.5 h-1.5 bg-gradient-to-r from-purple-500 to-cyan-400 rounded-full animate-pulse" style={{ animationDelay: '0.4s' }}></div>
            </div>
          </div>
        </div>

        {/* Loading text */}
        <div className="text-center space-y-2">
          <p className="text-sm font-semibold bg-gradient-to-r from-cyan-500 via-blue-500 to-purple-500 bg-clip-text text-transparent">
            Processing
          </p>
          <p className="text-xs text-muted-foreground">Please wait</p>
        </div>
      </div>
    </div>
  );
}
