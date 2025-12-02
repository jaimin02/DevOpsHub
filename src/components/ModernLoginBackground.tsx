'use client';

import {
  Server,
  Shield,
  Zap,
  Database,
  Lock,
  Cloud,
  HardDrive,
  Network,
} from 'lucide-react';

const FloatingIcon = ({
  Icon,
  style,
}: {
  Icon: React.ElementType;
  style: React.CSSProperties;
}) => (
  <div
    style={style}
    className="absolute text-blue-400 opacity-20 pointer-events-none"
  >
    <Icon size={40} strokeWidth={1.5} />
  </div>
);

export function ModernLoginBackground() {
  // Fixed positions to prevent hydration mismatches
  const floatingIcons = [
    { Icon: Server, style: { left: '10%', top: '15%', animation: 'float-0 20s ease-in-out infinite' } },
    { Icon: Shield, style: { left: '80%', top: '20%', animation: 'float-1 25s ease-in-out infinite' } },
    { Icon: Zap, style: { left: '15%', top: '70%', animation: 'float-2 22s ease-in-out infinite' } },
    { Icon: Database, style: { left: '75%', top: '75%', animation: 'float-0 23s ease-in-out infinite' } },
    { Icon: Lock, style: { left: '35%', top: '25%', animation: 'float-1 24s ease-in-out infinite' } },
    { Icon: Cloud, style: { left: '60%', top: '50%', animation: 'float-2 26s ease-in-out infinite' } },
    { Icon: HardDrive, style: { left: '25%', top: '55%', animation: 'float-0 21s ease-in-out infinite' } },
    { Icon: Network, style: { left: '85%', top: '45%', animation: 'float-1 27s ease-in-out infinite' } },
  ];

  return (
    <>
      <style>{`
        @keyframes float-0 {
          0%, 100% { transform: translateY(0px) translateX(0px) rotate(0deg); }
          25% { transform: translateY(-30px) translateX(20px) rotate(10deg); }
          50% { transform: translateY(-60px) translateX(-10px) rotate(20deg); }
          75% { transform: translateY(-30px) translateX(10px) rotate(10deg); }
        }

        @keyframes float-1 {
          0%, 100% { transform: translateY(0px) translateX(0px) rotate(0deg); }
          25% { transform: translateY(-40px) translateX(-20px) rotate(-10deg); }
          50% { transform: translateY(-50px) translateX(20px) rotate(-20deg); }
          75% { transform: translateY(-20px) translateX(-10px) rotate(-10deg); }
        }

        @keyframes float-2 {
          0%, 100% { transform: translateY(0px) translateX(0px) rotate(0deg); }
          25% { transform: translateY(-25px) translateX(15px) rotate(5deg); }
          50% { transform: translateY(-70px) translateX(-15px) rotate(15deg); }
          75% { transform: translateY(-35px) translateX(5px) rotate(5deg); }
        }
      `}</style>

      <div
        className="fixed inset-0 -z-10 overflow-hidden"
        style={{
          background: `linear-gradient(135deg, 
            #1e3c72 0%,
            #2a5298 25%,
            #3d3e8f 50%,
            #6b3b9c 75%,
            #8b2f7f 100%
          )`,
        }}
      >
        {/* Floating Icons Background */}
        {floatingIcons.map((item, idx) => (
          <FloatingIcon key={idx} Icon={item.Icon} style={item.style} />
        ))}

        {/* Additional gradient overlay for depth */}
        <div
          className="absolute inset-0 opacity-30 pointer-events-none"
          style={{
            background: `radial-gradient(circle at 50% 50%, rgba(59, 130, 246, 0.1) 0%, transparent 70%)`,
          }}
        />

        {/* Top to bottom gradient overlay */}
        <div
          className="absolute inset-0 opacity-10 pointer-events-none"
          style={{
            background: `linear-gradient(to bottom, rgba(255, 255, 255, 0.1) 0%, transparent 50%, rgba(0, 0, 0, 0.2) 100%)`,
          }}
        />
      </div>
    </>
  );
}
