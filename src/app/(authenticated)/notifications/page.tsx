'use client';

import { Bell, Trash2, Check, CheckCheck } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { useState } from 'react';
import { PageTransition } from '@/components/PageTransition';
import { useRouter } from 'next/navigation';

interface Notification {
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
  {
    id: '4',
    title: 'User Access Granted',
    description: 'New user "John Smith" has been added to the system with Admin privileges.',
    type: 'user',
    timestamp: new Date(Date.now() - 5 * 3600000),
    redirect: '/user-management',
    read: true,
  },
  {
    id: '5',
    title: 'System Maintenance',
    description: 'Scheduled system maintenance completed successfully.',
    type: 'system',
    timestamp: new Date(Date.now() - 1 * 86400000),
    redirect: undefined,
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

export default function NotificationsPage() {
  const [notifications, setNotifications] = useState<Notification[]>(mockNotifications);
  const router = useRouter();

  const unreadCount = notifications.filter(n => !n.read).length;

  const formatTime = (date: Date) => {
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays < 7) return `${diffDays}d ago`;
    return date.toLocaleDateString();
  };

  const handleMarkAsRead = (id: string) => {
    setNotifications(prev =>
      prev.map(n =>
        n.id === id ? { ...n, read: true } : n
      )
    );
  };

  const handleMarkAllAsRead = () => {
    setNotifications(prev =>
      prev.map(n => ({ ...n, read: true }))
    );
  };

  const handleDelete = (id: string) => {
    setNotifications(prev =>
      prev.filter(n => n.id !== id)
    );
  };

  const handleNotificationClick = (notification: Notification) => {
    handleMarkAsRead(notification.id);
    if (notification.redirect) {
      router.push(notification.redirect);
    }
  };

  const unreadNotifications = notifications.filter(n => !n.read);
  const readNotifications = notifications.filter(n => n.read);

  return (
    <PageTransition>
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold tracking-tight flex items-center gap-3">
              <Bell className="h-8 w-8 text-cyan-600" />
              Notifications
            </h1>
            <p className="text-muted-foreground mt-1">Manage and view all your system notifications</p>
          </div>
          {unreadCount > 0 && (
            <Button
              onClick={handleMarkAllAsRead}
              variant="outline"
              size="sm"
              className="gap-2"
            >
              <CheckCheck className="h-4 w-4" />
              Mark all as read
            </Button>
          )}
        </div>

        {/* Unread Notifications */}
        {unreadNotifications.length > 0 && (
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <h2 className="text-lg font-semibold">Unread ({unreadCount})</h2>
              <Badge className="bg-cyan-500/20 text-cyan-700 border-cyan-300">{unreadCount}</Badge>
            </div>
            <div className="grid gap-3">
              {unreadNotifications.map(notification => (
                <Card
                  key={notification.id}
                  className="cursor-pointer hover:shadow-lg transition-all border-l-4 border-l-cyan-500 bg-gradient-to-r from-cyan-50/50 to-transparent dark:from-cyan-950/20 dark:to-transparent"
                  onClick={() => handleNotificationClick(notification)}
                >
                  <CardContent className="pt-4 pb-4">
                    <div className="flex gap-4">
                      <div className="text-4xl flex-shrink-0">{typeIcons[notification.type]}</div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-2 mb-2">
                          <h3 className="text-base font-semibold text-foreground">{notification.title}</h3>
                          <div className="h-3 w-3 rounded-full bg-cyan-500 flex-shrink-0 mt-1" />
                        </div>
                        <p className="text-sm text-muted-foreground mb-3">{notification.description}</p>
                        <div className="flex items-center justify-between">
                          <Badge className={typeColors[notification.type]}>
                            {notification.type.charAt(0).toUpperCase() + notification.type.slice(1)}
                          </Badge>
                          <div className="flex items-center gap-2">
                            <span className="text-xs text-muted-foreground">{formatTime(notification.timestamp)}</span>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={(e) => {
                                e.stopPropagation();
                                handleDelete(notification.id);
                              }}
                              className="h-8 w-8 p-0"
                            >
                              <Trash2 className="h-4 w-4 text-muted-foreground hover:text-destructive" />
                            </Button>
                          </div>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        )}

        {/* Read Notifications */}
        {readNotifications.length > 0 && (
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <h2 className="text-lg font-semibold text-muted-foreground">Earlier</h2>
            </div>
            <div className="grid gap-3">
              {readNotifications.map(notification => (
                <Card
                  key={notification.id}
                  className="cursor-pointer hover:shadow-md transition-all opacity-75 hover:opacity-100"
                  onClick={() => handleNotificationClick(notification)}
                >
                  <CardContent className="pt-4 pb-4">
                    <div className="flex gap-4">
                      <div className="text-3xl flex-shrink-0">{typeIcons[notification.type]}</div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-2 mb-2">
                          <h3 className="text-base font-semibold text-foreground">{notification.title}</h3>
                          <Check className="h-4 w-4 text-green-600 flex-shrink-0 mt-1" />
                        </div>
                        <p className="text-sm text-muted-foreground mb-3">{notification.description}</p>
                        <div className="flex items-center justify-between">
                          <Badge variant="outline" className={typeColors[notification.type]}>
                            {notification.type.charAt(0).toUpperCase() + notification.type.slice(1)}
                          </Badge>
                          <div className="flex items-center gap-2">
                            <span className="text-xs text-muted-foreground">{formatTime(notification.timestamp)}</span>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={(e) => {
                                e.stopPropagation();
                                handleDelete(notification.id);
                              }}
                              className="h-8 w-8 p-0"
                            >
                              <Trash2 className="h-4 w-4 text-muted-foreground hover:text-destructive" />
                            </Button>
                          </div>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        )}

        {/* Empty State */}
        {notifications.length === 0 && (
          <Card className="border-dashed">
            <CardContent className="pt-12 pb-12 flex flex-col items-center justify-center text-center">
              <Bell className="h-16 w-16 text-muted-foreground/30 mb-4" />
              <h3 className="text-lg font-semibold text-muted-foreground mb-2">No notifications</h3>
              <p className="text-sm text-muted-foreground">You're all caught up! Check back later for updates.</p>
            </CardContent>
          </Card>
        )}
      </div>
    </PageTransition>
  );
}
