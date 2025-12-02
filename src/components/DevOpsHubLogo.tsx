import * as React from 'react';
import { cn } from '@/lib/utils';

interface LogoProps extends React.SVGAttributes<SVGSVGElement> {
  showText?: boolean;
  size?: 'sm' | 'md' | 'lg' | 'xl';
}

const sizeMap = {
  sm: { width: 32, height: 32 },
  md: { width: 48, height: 48 },
  lg: { width: 64, height: 64 },
  xl: { width: 120, height: 120 },
};

export const DevOpsHubLogo = ({ className, showText = true, size = 'lg', ...props }: LogoProps) => {
  const { width, height } = sizeMap[size];
  
  return (
    <div className={cn("flex items-center gap-3", className)}>
      <svg
        width={width}
        height={height}
        viewBox="0 0 64 64"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        {...props}
      >
        <defs>
          <linearGradient id="logoGradient1" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#06b6d4" />
            <stop offset="50%" stopColor="#3b82f6" />
            <stop offset="100%" stopColor="#8b5cf6" />
          </linearGradient>
          <linearGradient id="logoGradient2" x1="100%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#8b5cf6" />
            <stop offset="100%" stopColor="#06b6d4" />
          </linearGradient>
          <filter id="glow" x="-50%" y="-50%" width="200%" height="200%">
            <feGaussianBlur stdDeviation="2" result="coloredBlur"/>
            <feMerge>
              <feMergeNode in="coloredBlur"/>
              <feMergeNode in="SourceGraphic"/>
            </feMerge>
          </filter>
        </defs>
        
        <rect x="4" y="4" width="56" height="56" rx="14" fill="url(#logoGradient1)" opacity="0.1"/>
        <rect x="4" y="4" width="56" height="56" rx="14" stroke="url(#logoGradient1)" strokeWidth="2" fill="none"/>
        
        <g filter="url(#glow)">
          <circle cx="20" cy="20" r="6" fill="url(#logoGradient1)"/>
          <circle cx="44" cy="20" r="6" fill="url(#logoGradient2)"/>
          <circle cx="32" cy="44" r="6" fill="url(#logoGradient1)"/>
          
          <path d="M24 22 L40 22" stroke="url(#logoGradient1)" strokeWidth="2" strokeLinecap="round"/>
          <path d="M22 24 L30 40" stroke="url(#logoGradient1)" strokeWidth="2" strokeLinecap="round"/>
          <path d="M42 24 L34 40" stroke="url(#logoGradient2)" strokeWidth="2" strokeLinecap="round"/>
          
          <circle cx="32" cy="32" r="4" fill="url(#logoGradient1)"/>
          
          <path d="M20 14 L20 11 M14 20 L11 20 M44 14 L44 11 M50 20 L53 20 M32 50 L32 53 M26 44 L23 47 M38 44 L41 47" 
                stroke="url(#logoGradient2)" strokeWidth="1.5" strokeLinecap="round" opacity="0.6"/>
        </g>
        
        <path d="M29 32 L31 34 L35 30" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
      </svg>
      
      {showText && (
        <div className="flex flex-col">
          <span className="text-xl font-bold bg-gradient-to-r from-cyan-400 via-blue-500 to-purple-500 bg-clip-text text-transparent">
            DevOps
          </span>
          <span className="text-sm font-semibold text-muted-foreground -mt-1">
            HUB
          </span>
        </div>
      )}
    </div>
  );
};

export const DevOpsHubMark = ({ className, size = 'md', ...props }: LogoProps) => {
  const { width, height } = sizeMap[size];
  
  return (
    <svg
      width={width}
      height={height}
      viewBox="0 0 64 64"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={cn("", className)}
      {...props}
    >
      <defs>
        <linearGradient id="markGradient1" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#06b6d4" />
          <stop offset="50%" stopColor="#3b82f6" />
          <stop offset="100%" stopColor="#8b5cf6" />
        </linearGradient>
        <linearGradient id="markGradient2" x1="100%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor="#8b5cf6" />
          <stop offset="100%" stopColor="#06b6d4" />
        </linearGradient>
      </defs>
      
      <rect x="4" y="4" width="56" height="56" rx="14" fill="url(#markGradient1)" opacity="0.1"/>
      <rect x="4" y="4" width="56" height="56" rx="14" stroke="url(#markGradient1)" strokeWidth="2" fill="none"/>
      
      <circle cx="20" cy="20" r="5" fill="url(#markGradient1)"/>
      <circle cx="44" cy="20" r="5" fill="url(#markGradient2)"/>
      <circle cx="32" cy="44" r="5" fill="url(#markGradient1)"/>
      
      <path d="M24 22 L40 22" stroke="url(#markGradient1)" strokeWidth="2" strokeLinecap="round"/>
      <path d="M22 24 L30 40" stroke="url(#markGradient1)" strokeWidth="2" strokeLinecap="round"/>
      <path d="M42 24 L34 40" stroke="url(#markGradient2)" strokeWidth="2" strokeLinecap="round"/>
      
      <circle cx="32" cy="32" r="3" fill="url(#markGradient1)"/>
      <path d="M30 32 L31 33 L34 30" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  );
};

export const DevOpsHubAdvancedLogo = DevOpsHubLogo;
export const DevOpsHubLogoName = DevOpsHubLogo;
