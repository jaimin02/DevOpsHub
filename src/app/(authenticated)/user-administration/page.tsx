
'use client';

import {
  Users,
  UserCog,
  ArrowRight,
} from 'lucide-react';
import Link from 'next/link';

const adminPages = [
  {
    href: '/user-management',
    label: 'User Master',
    icon: Users,
    description: 'Create, view, and manage user accounts.',
    gradient: 'from-green-600 to-emerald-500',
    bgLight: 'bg-green-50 dark:bg-green-950',
  },
  {
    href: '/role-master',
    label: 'Role Master',
    icon: UserCog,
    description: 'Define roles and assign page permissions.',
    gradient: 'from-teal-600 to-cyan-500',
    bgLight: 'bg-teal-50 dark:bg-teal-950',
  },
];

export default function UserAdministrationDashboardPage() {
  return (
    <div className="flex-1 space-y-8">
      <div className="mb-8">
        <div className="space-y-2">
          <h1 className="text-4xl font-bold tracking-tight bg-gradient-to-r from-green-600 via-emerald-500 to-teal-600 bg-clip-text text-transparent">
            User Administration
          </h1>
          <p className="text-lg text-muted-foreground">
            Select a category below to manage users and roles.
          </p>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-2">
        {adminPages.map((page) => {
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
                    <h3 className="text-xl font-bold tracking-tight text-gray-900 dark:text-white group-hover:text-transparent group-hover:bg-gradient-to-r group-hover:from-green-600 group-hover:to-emerald-500 group-hover:bg-clip-text transition-all duration-300 mb-2">
                      {page.label}
                    </h3>
                    <p className="text-sm text-gray-600 dark:text-gray-400 group-hover:text-gray-700 dark:group-hover:text-gray-300 transition-colors duration-300 leading-relaxed">
                      {page.description}
                    </p>
                  </div>

                  {/* Arrow indicator */}
                  <div className="flex items-center justify-between pt-4 border-t border-gray-200 dark:border-gray-700 group-hover:border-gray-300 dark:group-hover:border-gray-600 transition-colors duration-300">
                    <span className="text-xs font-semibold text-gray-500 dark:text-gray-400 group-hover:text-gray-600 dark:group-hover:text-gray-300 transition-colors duration-300 uppercase tracking-wider">
                      Configure
                    </span>
                    <ArrowRight className="h-5 w-5 text-gray-400 dark:text-gray-600 group-hover:text-transparent group-hover:bg-gradient-to-r group-hover:from-green-600 group-hover:to-emerald-500 group-hover:bg-clip-text transition-all duration-300 group-hover:translate-x-1" />
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
