'use client';

import { cn } from '@/lib/utils';

interface AutomationLoaderProps {
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

export function AutomationLoader({ size = 'md', className }: AutomationLoaderProps) {
  const sizeMap = {
    sm: 'w-4 h-4',
    md: 'w-5 h-5',
    lg: 'w-6 h-6',
  };

  return (
    <svg
      className={cn('animate-spin', sizeMap[size], className)}
      xmlns="http://www.w3.org/2000/svg"
      fill="none"
      viewBox="0 0 24 24"
    >
      <defs>
        <linearGradient id="loaderGradient" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="currentColor" />
          <stop offset="100%" stopColor="currentColor" />
        </linearGradient>
      </defs>
      
      {/* Rotating outer ring */}
      <circle
        className="opacity-25"
        cx="12"
        cy="12"
        r="10"
        stroke="currentColor"
        strokeWidth="2"
      />
      
      {/* Animated gradient arc */}
      <path
        className="opacity-75"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        d="M 12 2 A 10 10 0 0 1 22 12"
        strokeDasharray="15.7 62.8"
        strokeDashoffset="0"
      />
      
      {/* Automation dots */}
      <g className="animate-pulse">
        <circle cx="12" cy="3" r="1.5" fill="currentColor" opacity="0.8" />
        <circle cx="19.9" cy="5.1" r="1.2" fill="currentColor" opacity="0.6" />
        <circle cx="21" cy="12" r="1.2" fill="currentColor" opacity="0.6" />
      </g>
    </svg>
  );
}

export function AutomationLoaderSpinner({ size = 'md', className }: AutomationLoaderProps) {
  const sizeMap = {
    sm: 'w-4 h-4',
    md: 'w-5 h-5',
    lg: 'w-6 h-6',
  };

  return (
    <div className={cn('relative inline-block', sizeMap[size], className)}>
      {/* Outer rotating circle */}
      <svg
        className="absolute inset-0 animate-spin"
        xmlns="http://www.w3.org/2000/svg"
        fill="none"
        viewBox="0 0 24 24"
      >
        <circle
          cx="12"
          cy="12"
          r="10"
          stroke="currentColor"
          strokeWidth="2"
          opacity="0.2"
        />
        <path
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          d="M 12 2 A 10 10 0 0 1 22 12"
          opacity="0.8"
        />
      </svg>
      
      {/* Inner rotating circle (opposite direction) */}
      <svg
        className="absolute inset-0 animate-spin"
        style={{ animationDirection: 'reverse' }}
        xmlns="http://www.w3.org/2000/svg"
        fill="none"
        viewBox="0 0 24 24"
      >
        <path
          fill="none"
          stroke="currentColor"
          strokeWidth="1.5"
          strokeLinecap="round"
          d="M 12 2 A 10 10 0 0 0 2 12"
          opacity="0.6"
        />
      </svg>

      {/* Center pulse */}
      <div className="absolute inset-0 flex items-center justify-center">
        <div className="w-1 h-1 bg-current rounded-full animate-pulse"></div>
      </div>
    </div>
  );
}
