'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  Home,
  Server,
  PanelLeft,
  Settings,
  LogOut,
  ShieldCheck,
  ClipboardCheck,
  FileText,
  UserCog,
  Building,
  Laptop,
  Network,
  Database,
  Users,
  MapPin,
  KeyRound,
  CheckSquare,
  ClipboardList,
  Bell,
  Search,
} from 'lucide-react';
import {
  Sheet,
  SheetContent,
  SheetTrigger,
} from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { DevOpsHubMark, DevOpsHubLogo } from '@/components/DevOpsHubLogo';
import { cn } from '@/lib/utils';
import { ThemeToggle } from '@/components/ThemeToggle';
import React, { useState } from 'react';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { NotificationsPanel } from '@/components/NotificationsPanel';

const masterSubItems = [
  { href: '/inventory', label: 'Server Details', icon: Server },
  { href: '/locations', label: 'Locations', icon: MapPin },
  { href: '/os', label: 'OS', icon: Laptop },
  { href: '/server-infrastructure', label: 'Infrastructure', icon: Network },
  { href: '/database-providers', label: 'Database Providers', icon: Database },
  { href: '/antivirus', label: 'AntiVirus', icon: ShieldCheck },
  { href: '/environment', label: 'Environments', icon: Server },
  { href: '/dept-name', label: 'Dept. Name', icon: Building },
];

const securitySubItems = [
    { href: '/port-management', label: 'Port Management', icon: ShieldCheck },
    { href: '/db-credentials', label: 'DB Credentials', icon: KeyRound },
];

const iqMasterSubItems = [
    { href: '/iq-details', label: 'IQ Details', icon: ClipboardCheck },
    { href: '/iq-required', label: 'IQ Checklist Request', icon: ClipboardList },
    { href: '/iq-review', label: 'IQ Review', icon: CheckSquare },
];

const userAdminSubItems = [
    { href: '/user-management', label: 'User Master', icon: Users },
    { href: '/role-master', label: 'Role Master', icon: UserCog },
]

const menuItems = [
  { href: '/dashboard', label: 'Dashboard', icon: Home, subItems: [] },
  { href: '/iq-master', label: 'IQ Master', icon: ClipboardCheck, subItems: iqMasterSubItems },
  { href: '/security', label: 'Security', icon: ShieldCheck, subItems: securitySubItems },
  { href: '/reports', label: 'Reports', icon: FileText },
  { href: '/master', label: 'Master', icon: Settings, subItems: masterSubItems },
  { href: '/user-administration', label: 'User Administration', icon: UserCog, subItems: userAdminSubItems },
];

const NavItem = ({ item, pathname, isExpanded }: { item: typeof menuItems[0], pathname: string, isExpanded: boolean }) => {
    const hasSubItems = item.subItems && item.subItems.length > 0;
    const [isSubMenuOpen, setIsSubMenuOpen] = useState(false);
    const isParentActive = pathname === item.href || (hasSubItems && item.subItems.some(sub => pathname === sub.href || pathname.startsWith(sub.href)));
    const isCurrentItemActive = pathname === item.href;

    if (hasSubItems) {
        return (
             <Collapsible
                open={(isSubMenuOpen || isParentActive) && isExpanded}
                onOpenChange={isExpanded ? setIsSubMenuOpen : undefined}
                className="w-full"
            >
                 <CollapsibleTrigger asChild onMouseEnter={() => isExpanded && setIsSubMenuOpen(true)} onMouseLeave={() => isExpanded && setIsSubMenuOpen(false)}>
                    <Link
                      href={item.href}
                      className={cn(`flex items-center gap-3 px-3 py-2 transition-all hover:text-primary w-full`,
                          'text-muted-foreground',
                          !isExpanded && 'justify-center p-2'
                      )}
                    >
                        <item.icon className="h-5 w-5 shrink-0" />
                        <span className={cn("truncate", !isExpanded && "sr-only")}>{item.label}</span>
                    </Link>
                </CollapsibleTrigger>
                <CollapsibleContent className={cn("pl-8 space-y-1 py-1", !isExpanded && "hidden")} onMouseEnter={() => isExpanded && setIsSubMenuOpen(true)} onMouseLeave={() => isExpanded && setIsSubMenuOpen(false)}>
                    {item.subItems?.map(subItem => (
                         <Link
                            key={subItem.href}
                            href={subItem.href}
                            className={cn(`flex items-center gap-3 px-3 py-2 text-sm transition-all hover:text-primary`,
                                'text-muted-foreground'
                            )}
                        >
                            <subItem.icon className="h-4 w-4 shrink-0" />
                            <span className="truncate">{subItem.label}</span>
                        </Link>
                    ))}
                </CollapsibleContent>
            </Collapsible>
        );
    }

    return (
        <Link
            href={item.href}
            className={cn(
              `flex items-center gap-3 px-3 py-2 transition-all hover:text-primary`,
              'text-muted-foreground',
              !isExpanded && 'justify-center p-2'
            )}
        >
            <item.icon className="h-5 w-5 shrink-0" />
            <span className={cn("truncate", !isExpanded && "sr-only")}>{item.label}</span>
        </Link>
    )
}

export default function AuthenticatedLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const [isSidebarExpanded, setIsSidebarExpanded] = useState(false);

  return (
    <div className="flex min-h-screen w-full bg-background">
      <aside 
        className={cn(
          "hidden sm:flex flex-col border-r bg-card/50 backdrop-blur-sm sticky top-0 h-screen transition-all duration-300 ease-in-out",
          isSidebarExpanded ? "w-64" : "w-20"
        )}
        onMouseEnter={() => setIsSidebarExpanded(true)}
        onMouseLeave={() => setIsSidebarExpanded(false)}
      >
        <div className="flex h-16 items-center border-b px-4 justify-center">
          <Link href="/dashboard" className="flex items-center gap-2 font-semibold">
            {isSidebarExpanded ? (
              <DevOpsHubLogo size="md" showText={true} />
            ) : (
              <DevOpsHubMark size="sm" />
            )}
          </Link>
        </div>
        <nav className="flex-1 overflow-auto py-4">
          <div className="grid items-start px-2 text-sm font-medium gap-1">
            {menuItems.map((item) => (
              <NavItem key={item.href} item={item} pathname={pathname} isExpanded={isSidebarExpanded} />
            ))}
          </div>
        </nav>
        <div className={cn("p-4 border-t", !isSidebarExpanded && "hidden")}>
          <div className="flex items-center gap-3 text-sm text-muted-foreground">
            <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
            <span>System Online</span>
          </div>
        </div>
      </aside>
      
      <div className="flex flex-1 flex-col">
        <header className="sticky top-0 z-10 flex h-16 items-center gap-4 border-b bg-card/80 backdrop-blur-md px-4 md:px-6">
          <Sheet>
            <SheetTrigger asChild>
              <Button
                variant="outline"
                size="icon"
                className="shrink-0 sm:hidden"
              >
                <PanelLeft className="h-5 w-5" />
                <span className="sr-only">Toggle navigation menu</span>
              </Button>
            </SheetTrigger>
            <SheetContent side="left" className="sm:max-w-xs">
              <nav className="grid gap-6 text-lg font-medium">
                <Link
                  href="/dashboard"
                  className="group flex h-10 w-10 shrink-0 items-center justify-center gap-2 rounded-full bg-gradient-to-r from-cyan-500 to-blue-500 text-lg font-semibold text-white md:text-base"
                >
                  <DevOpsHubMark size="sm" />
                  <span className="sr-only">DevOps Hub</span>
                </Link>
                {menuItems.map((item) => {
                  const hasSubItems = item.subItems && item.subItems.length > 0;
                  const isItemActive = pathname === item.href || (hasSubItems && item.subItems.some(sub => pathname === sub.href || pathname.startsWith(sub.href)));
                  return (
                  <React.Fragment key={item.href}>
                    <Link
                      href={item.href}
                      className={`-mb-2 flex items-center gap-4 px-2.5 hover:text-foreground font-semibold transition-colors ${isItemActive ? 'text-foreground' : 'text-muted-foreground'}`}
                    >
                      <item.icon className="h-5 w-5" />
                      {item.label}
                    </Link>
                    {item.subItems && (
                      <div className="grid gap-2 pl-12 text-base font-normal">
                        {item.subItems.map(subItem => (
                          <Link
                            key={subItem.href}
                            href={subItem.href}
                            className={`flex items-center gap-4 px-2.5 hover:text-foreground transition-colors ${pathname === subItem.href || pathname.startsWith(subItem.href) ? 'text-foreground font-semibold' : 'text-muted-foreground'}`}
                          >
                            <subItem.icon className="h-4 w-4" />
                            {subItem.label}
                          </Link>
                        ))}
                      </div>
                    )}
                  </React.Fragment>
                  );
                })}
              </nav>
            </SheetContent>
          </Sheet>
          
          <div className="hidden md:flex flex-1 items-center gap-4 max-w-md">
            <div className="relative w-full">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input 
                placeholder="Search servers, users, reports..." 
                className="pl-10 bg-muted/50 border-0 focus-visible:ring-1 focus-visible:ring-primary"
              />
            </div>
          </div>
          
          <div className="flex items-center gap-3 ml-auto">
            <NotificationsPanel />
            
            <ThemeToggle />
            
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="relative h-10 w-10 rounded-full p-0 overflow-hidden ring-2 ring-primary/20 hover:ring-primary/40 transition-all">
                  <div className="w-full h-full bg-gradient-to-br from-cyan-500 via-blue-500 to-purple-500 flex items-center justify-center text-white font-semibold">
                    JR
                  </div>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                <DropdownMenuLabel className="font-normal">
                  <div className="flex flex-col space-y-1">
                    <p className="text-sm font-medium">Admin User</p>
                    <p className="text-xs text-muted-foreground">admin@devopshub.com</p>
                  </div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem>
                  <Settings className="mr-2 h-4 w-4" />
                  Settings
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link href="/notifications">
                    <Bell className="mr-2 h-4 w-4" />
                    Notifications
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem asChild className="text-destructive focus:text-destructive">
                  <Link href="/">
                    <LogOut className="mr-2 h-4 w-4" />
                    <span>Logout</span>
                  </Link>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </header>
        
        <main className="flex-1 overflow-y-auto p-4 md:p-6 lg:p-8 bg-muted/30">
          {children}
        </main>
      </div>
    </div>
  );
}
