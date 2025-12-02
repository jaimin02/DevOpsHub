'use client';

import { Bell, X, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { Badge } from '@/components/ui/badge';
import { useState } from 'react';
import { useRouter } from 'next/navigation';

export interface Notification {
  id: string;
  title: string;
  description: string;
  type: 'server' | 'iq' | 'security' | 'user' | 'system';
  timestamp: Date;
  redirect?: string;
  read: boolean;
}

const mockNotifications: Notification[] = [
  {
    id: '1',
    title: 'Server Update Required',
    description: 'Server details for "Production-01" have been modified. Review the changes in Server Details.',
    type: 'server',
    timestamp: new Date(Date.now() - 2 * 60000),
    redirect: '/inventory',
    read: false,
  },
  {
    id: '2',
    title: 'IQ Approval Pending',
    description: 'New IQ checklist request awaiting approval. Check IQ Review for details.',
    type: 'iq',
    timestamp: new Date(Date.now() - 15 * 60000),
    redirect: '/iq-master',
    read: false,
  },
  {
    id: '3',
    title: 'Security Alert',
    description: 'New port rule added to Port Management. Click to view details and configure.',
    type: 'security',
    timestamp: new Date(Date.now() - 1 * 3600000),
    redirect: '/security',
    read: true,
  },
];

const typeColors = {
  server: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200',
  iq: 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200',
  security: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200',
  user: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200',
  system: 'bg-amber-100 text-amber-800 dark:bg-amber-900 dark:text-amber-200',
};

const typeIcons = {
  server: '🖥️',
  iq: '📋',
  security: '🔒',
  user: '👤',
  system: '⚙️',
};

export function NotificationsPanel() {
  const [open, setOpen] = useState(false);
  const [notifications, setNotifications] = useState<Notification[]>(mockNotifications);
  const router = useRouter();
  const unreadCount = notifications.filter(n => !n.read).length;

  const handleNotificationClick = (notification: Notification) => {
    setNotifications(prev =>
      prev.map(n =>
        n.id === notification.id ? { ...n, read: true } : n
      )
    );

    if (notification.redirect) {
      setOpen(false);
      router.push(notification.redirect);
    }
  };

  const formatTime = (date: Date) => {
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);

    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    return date.toLocaleDateString();
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className="relative hover:bg-muted"
        >
          <Bell className="h-5 w-5 text-muted-foreground" />
          {unreadCount > 0 && (
            <Badge className="absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center p-0 text-xs bg-gradient-to-r from-cyan-500 to-blue-500 border-0 animate-pulse">
              {unreadCount}
            </Badge>
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent side="bottom" align="end" className="w-96 max-h-[500px] p-0 border shadow-lg">
        <div className="flex flex-col">
          <div className="px-6 py-4 border-b bg-background">
            <h3 className="font-semibold text-lg">Notifications</h3>
          </div>

          <div className="overflow-y-auto max-h-[calc(500px-60px)]">
            {notifications.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-64 text-center px-6">
                <Bell className="h-12 w-12 text-muted-foreground/30 mb-4" />
                <p className="text-muted-foreground">No notifications</p>
              </div>
            ) : (
              <div className="divide-y">
                {notifications.map(notification => (
                  <div
                    key={notification.id}
                    onClick={() => handleNotificationClick(notification)}
                    className={`p-4 cursor-pointer transition-all duration-200 hover:bg-muted/50 ${
                      !notification.read ? 'bg-blue-50/50 dark:bg-blue-950/20' : ''
                    }`}
                  >
                    <div className="flex gap-3 items-start">
                      <div className="text-2xl mt-1">{typeIcons[notification.type]}</div>

                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-2">
                          <h4 className="text-sm font-semibold text-foreground">
                            {notification.title}
                          </h4>
                          {!notification.read && (
                            <div className="h-2 w-2 rounded-full bg-cyan-500 mt-1.5 flex-shrink-0" />
                          )}
                        </div>

                        <p className="text-xs text-muted-foreground mt-1 leading-relaxed">
                          {notification.description}
                        </p>

                        <div className="flex items-center justify-between mt-2">
                          <span className={`inline-flex items-center px-2 py-1 rounded-md text-xs font-medium ${typeColors[notification.type]}`}>
                            {notification.type.charAt(0).toUpperCase() + notification.type.slice(1)}
                          </span>
                          <span className="text-xs text-muted-foreground">
                            {formatTime(notification.timestamp)}
                          </span>
                        </div>

                        {notification.redirect && (
                          <div className="flex items-center gap-1 text-xs text-cyan-600 dark:text-cyan-400 mt-2 hover:text-cyan-700 dark:hover:text-cyan-300">
                            <span>Go to</span>
                            <ArrowRight className="h-3 w-3" />
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </PopoverContent>
    </Popover>
  );
}
