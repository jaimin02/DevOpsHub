
'use client';

import {
  MapPin,
  Laptop,
  Network,
  Database,
  Shield,
  ArrowRight,
  Server,
  Building,
} from 'lucide-react';
import Link from 'next/link';

const masterPages = [
  {
    href: '/inventory',
    label: 'Server Details',
    icon: Server,
    description: 'Manage detailed server records.',
    gradient: 'from-blue-600 to-cyan-500',
    bgLight: 'bg-blue-50 dark:bg-blue-950',
  },
  {
    href: '/locations',
    label: 'Locations',
    icon: MapPin,
    description: 'Manage data center and region locations.',
    gradient: 'from-cyan-500 to-blue-400',
    bgLight: 'bg-cyan-50 dark:bg-cyan-950',
  },
  {
    href: '/os',
    label: 'OS',
    icon: Laptop,
    description: 'Manage approved operating systems.',
    gradient: 'from-purple-600 to-blue-500',
    bgLight: 'bg-purple-50 dark:bg-purple-950',
  },
  {
    href: '/server-infrastructure',
    label: 'Infrastructure',
    icon: Network,
    description: 'Manage infrastructure providers (e.g., AWS, On-Prem).',
    gradient: 'from-indigo-600 to-purple-500',
    bgLight: 'bg-indigo-50 dark:bg-indigo-950',
  },
  {
    href: '/database-providers',
    label: 'Database Providers',
    icon: Database,
    description: 'Manage supported database providers.',
    gradient: 'from-blue-500 to-cyan-400',
    bgLight: 'bg-blue-50 dark:bg-blue-950',
  },
  {
    href: '/antivirus',
    label: 'AntiVirus',
    icon: Shield,
    description: 'Manage antivirus software records.',
    gradient: 'from-rose-600 to-pink-500',
    bgLight: 'bg-rose-50 dark:bg-rose-950',
  },
  {
    href: '/environment',
    label: 'Environments',
    icon: Server,
    description: 'Manage deployment environments.',
    gradient: 'from-emerald-600 to-teal-500',
    bgLight: 'bg-emerald-50 dark:bg-emerald-950',
  },
  {
    href: '/dept-name',
    label: 'Dept. Name',
    icon: Building,
    description: 'Manage department names.',
    gradient: 'from-amber-600 to-orange-500',
    bgLight: 'bg-amber-50 dark:bg-amber-950',
  },
];

export default function MasterDashboardPage() {
  return (
    <div className="flex-1 space-y-8">
      <div className="mb-8">
        <div className="space-y-2">
          <h1 className="text-4xl font-bold tracking-tight bg-gradient-to-r from-blue-600 via-cyan-500 to-purple-600 bg-clip-text text-transparent">
            Master Data Management
          </h1>
          <p className="text-lg text-muted-foreground">
            Select a category below to view and manage its records.
          </p>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3">
        {masterPages.map((page) => {
          const PageIcon = page.icon;
          return (
            <Link href={page.href} key={page.href} className="group">
              <div className="relative overflow-hidden rounded-xl transition-all duration-300 hover:shadow-xl hover:scale-105 cursor-pointer h-full">
                {/* Background gradient card */}
                <div className={`absolute inset-0 bg-gradient-to-br ${page.gradient} opacity-0 group-hover:opacity-5 transition-opacity duration-300`} />
                
                {/* Main card container */}
                <div className={`relative border border-gray-200 dark:border-gray-700 rounded-xl p-6 h-full flex flex-col backdrop-blur-sm ${page.bgLight} transition-all duration-300 group-hover:border-gray-300 dark:group-hover:border-gray-600`}>
                  
                  {/* Icon section with gradient background */}
                  <div className={`mb-4 flex items-center justify-center h-16 w-16 rounded-lg bg-gradient-to-br ${page.gradient} shadow-md group-hover:shadow-lg transition-transform duration-300 group-hover:scale-110`}>
                    <PageIcon className="h-8 w-8 text-white" />
                  </div>

                  {/* Content section */}
                  <div className="flex-1 mb-4">
                    <h3 className="text-xl font-bold tracking-tight text-gray-900 dark:text-white group-hover:text-transparent group-hover:bg-gradient-to-r group-hover:from-blue-600 group-hover:to-cyan-500 group-hover:bg-clip-text transition-all duration-300 mb-2">
                      {page.label}
                    </h3>
                    <p className="text-sm text-gray-600 dark:text-gray-400 group-hover:text-gray-700 dark:group-hover:text-gray-300 transition-colors duration-300 leading-relaxed">
                      {page.description}
                    </p>
                  </div>

                  {/* Arrow indicator */}
                  <div className="flex items-center justify-between pt-4 border-t border-gray-200 dark:border-gray-700 group-hover:border-gray-300 dark:group-hover:border-gray-600 transition-colors duration-300">
                    <span className="text-xs font-semibold text-gray-500 dark:text-gray-400 group-hover:text-gray-600 dark:group-hover:text-gray-300 transition-colors duration-300 uppercase tracking-wider">
                      View Details
                    </span>
                    <ArrowRight className="h-5 w-5 text-gray-400 dark:text-gray-600 group-hover:text-transparent group-hover:bg-gradient-to-r group-hover:from-blue-600 group-hover:to-cyan-500 group-hover:bg-clip-text transition-all duration-300 group-hover:translate-x-1" />
                  </div>
                </div>

                {/* Animated border effect on hover */}
                <div className="absolute inset-0 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none" style={{
                  background: `linear-gradient(135deg, transparent, rgba(34, 197, 94, 0.1), transparent)`,
                  animation: 'shimmer 2s infinite',
                }} />
              </div>
            </Link>
          );
        })}
      </div>

      <style jsx>{`
        @keyframes shimmer {
          0% {
            transform: translateX(-100%);
          }
          100% {
            transform: translateX(100%);
          }
        }
      `}</style>
    </div>
  );
}
