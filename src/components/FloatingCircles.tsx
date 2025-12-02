
'use client';

import { useEffect, useState } from 'react';
import { cn } from '@/lib/utils';
import { useIsMobile } from '@/hooks/use-mobile';

export function FloatingCircles() {
  const [mounted, setMounted] = useState(false);
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const isMobile = useIsMobile();

  useEffect(() => setMounted(true), []);

  useEffect(() => {
    if (isMobile) return;

    const handleMouseMove = (event: MouseEvent) => {
      setMousePosition({ x: event.clientX, y: event.clientY });
    };

    window.addEventListener('mousemove', handleMouseMove);

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
    };
  }, [isMobile]);

  if (!mounted) return null;

  const calculateTransform = (strength: number) => {
    if (typeof window === 'undefined') return 'translate(0px, 0px)';
    const x = (mousePosition.x - window.innerWidth / 2) / strength;
    const y = (mousePosition.y - window.innerHeight / 2) / strength;
    return `translate(${x}px, ${y}px)`;
  };


  return (
    <div className="absolute inset-0 w-full h-full overflow-hidden bg-background -z-10">
      <style jsx>{`
        .circle {
          position: absolute;
          border-radius: 50%;
          background: hsl(var(--primary) / 0.1);
          transition: transform 0.2s ease-out;
        }
        
        .circle:nth-child(1) { width: 80px; height: 80px; left: 15%; top: 10%; }
        .circle:nth-child(2) { width: 30px; height: 30px; left: 35%; top: 30%; }
        .circle:nth-child(3) { width: 100px; height: 100px; left: 70%; top: 5%; }
        .circle:nth-child(4) { width: 50px; height: 50px; left: 90%; top: 40%; }
        .circle:nth-child(5) { width: 20px; height: 20px; left: 5%; top: 60%; }
        .circle:nth-child(6) { width: 120px; height: 120px; left: 50%; top: 70%; }
        .circle:nth-child(7) { width: 60px; height: 60px; left: 25%; top: 80%; }
        .circle:nth-child(8) { width: 40px; height: 40px; left: 80%; top: 90%; }
      `}</style>
      <div className="circle" style={{ transform: calculateTransform(30) }} />
      <div className="circle" style={{ transform: calculateTransform(50) }} />
      <div className="circle" style={{ transform: calculateTransform(20) }} />
      <div className="circle" style={{ transform: calculateTransform(60) }} />
      <div className="circle" style={{ transform: calculateTransform(80) }} />
      <div className="circle" style={{ transform: calculateTransform(15) }} />
      <div className="circle" style={{ transform: calculateTransform(40) }} />
      <div className="circle" style={{ transform: calculateTransform(70) }} />
    </div>
  );
}
