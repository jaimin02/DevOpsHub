'use client';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Server,
  AppWindow,
  DatabaseZap,
  FileSignature,
  Users,
  Lock,
  TrendingUp,
  Clock,
  Activity,
  RefreshCw,
  CheckCircle,
  AlertCircle,
} from 'lucide-react';
import { Separator } from '@/components/ui/separator';
import { 
  initialServers, 
  initialIqData, 
  initialRequests, 
  initialDbCredentials, 
  initialPortRules, 
  initialUsers, 
  initialRoles 
} from '@/lib/data';
import { useMemo, useState, useEffect, Suspense } from 'react';
import { formatDistanceToNow } from 'date-fns';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { SkeletonDashboard } from '@/components/SkeletonLoader';
import { PageTransition } from '@/components/PageTransition';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

function DashboardContent() {
  const router = useRouter();
  const [lastRefresh, setLastRefresh] = useState(new Date());
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [autoRefresh, setAutoRefresh] = useState(true);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    setIsLoading(true);
    const timer = setTimeout(() => setIsLoading(false), 800);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    if (!autoRefresh) return;
    const interval = setInterval(() => {
      setLastRefresh(new Date());
    }, 30000);
    return () => clearInterval(interval);
  }, [autoRefresh]);

  const handleRefresh = () => {
    setIsRefreshing(true);
    setIsLoading(true);
    setTimeout(() => {
      setLastRefresh(new Date());
      setIsRefreshing(false);
      setIsLoading(false);
    }, 1200);
  };

  const summaryStats = useMemo(() => {
    return {
      totalServers: initialServers?.length || 0,
      activeServers: initialServers?.filter(s => s.cActive === 'Y').length || 0,
      iqRecords: initialIqData?.length || 0,
      pendingIQ: initialRequests?.filter(r => r.status === 'Pending Approval').length || 0,
      dbCredentials: initialDbCredentials?.length || 0,
      portRules: initialPortRules?.length || 0,
      totalUsers: initialUsers?.length || 0,
      totalRoles: initialRoles?.length || 0,
    };
  }, []);

  const recentActivity = useMemo(() => {
    const serverActivity = initialServers
      .sort((a, b) => new Date(b.dModifiedOn).getTime() - new Date(a.dModifiedOn).getTime())
      .slice(0, 5)
      .map(s => ({
        id: `server-${s.recordNo}`,
        type: 'Server',
        name: s.serverName,
        action: 'Updated',
        date: new Date(s.dModifiedOn),
        icon: Server,
        color: 'text-cyan-600',
      }));

    const iqActivity = initialRequests
      .sort((a, b) => new Date(b.requestDate).getTime() - new Date(a.requestDate).getTime())
      .slice(0, 3)
      .map(r => ({
        id: `iq-${r.id}`,
        type: 'IQ Request',
        name: r.projectCode,
        action: r.status,
        date: new Date(r.requestDate),
        icon: FileSignature,
        color: 'text-blue-600',
      }));

    return [...serverActivity, ...iqActivity]
      .sort((a, b) => b.date.getTime() - a.date.getTime())
      .slice(0, 8);
  }, [lastRefresh]);

  if (isLoading) {
    return <SkeletonDashboard />;
  }

  return (
    <PageTransition>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
            <p className="text-muted-foreground">Complete infrastructure overview and management</p>
          </div>
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Clock className="h-4 w-4" />
              <span>Updated {formatDistanceToNow(lastRefresh, { addSuffix: true })}</span>
            </div>
            <Button 
              variant="outline" 
              size="sm" 
              onClick={handleRefresh}
              disabled={isRefreshing}
              className="gap-2"
            >
              <RefreshCw className={`h-4 w-4 ${isRefreshing ? 'animate-spin' : ''}`} />
              Refresh
            </Button>
          </div>
        </div>

        {/* Key Metrics Grid */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {/* Total Servers */}
          <Link href="/inventory">
            <Card className="card-hover shadow-lg bg-gradient-to-br from-cyan-500/20 to-cyan-500/5 cursor-pointer hover:shadow-2xl hover:scale-105 transition-all border border-cyan-400/40 hover:border-cyan-400/80">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Servers</CardTitle>
                <div className="h-12 w-12 rounded-xl bg-cyan-500/30 flex items-center justify-center">
                  <Server className="h-6 w-6 text-cyan-600" />
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-cyan-700">{summaryStats.totalServers}</div>
                <div className="flex items-center gap-1 mt-1">
                  <CheckCircle className="h-3 w-3 text-green-500" />
                  <p className="text-xs text-muted-foreground">{summaryStats.activeServers} active</p>
                </div>
              </CardContent>
            </Card>
          </Link>

          {/* IQ Records */}
          <Link href="/iq-details">
            <Card className="card-hover shadow-lg bg-gradient-to-br from-blue-500/20 to-blue-500/5 cursor-pointer hover:shadow-2xl hover:scale-105 transition-all border border-blue-400/40 hover:border-blue-400/80">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">IQ Records</CardTitle>
                <div className="h-12 w-12 rounded-xl bg-blue-500/30 flex items-center justify-center">
                  <FileSignature className="h-6 w-6 text-blue-600" />
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-blue-700">{summaryStats.iqRecords}</div>
                <div className="flex items-center gap-1 mt-1">
                  <AlertCircle className="h-3 w-3 text-amber-500" />
                  <p className="text-xs text-muted-foreground">{summaryStats.pendingIQ} pending</p>
                </div>
              </CardContent>
            </Card>
          </Link>

          {/* DB Credentials */}
          <Link href="/db-credentials">
            <Card className="card-hover shadow-lg bg-gradient-to-br from-purple-500/20 to-purple-500/5 cursor-pointer hover:shadow-2xl hover:scale-105 transition-all border border-purple-400/40 hover:border-purple-400/80">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">DB Credentials</CardTitle>
                <div className="h-12 w-12 rounded-xl bg-purple-500/30 flex items-center justify-center">
                  <DatabaseZap className="h-6 w-6 text-purple-600" />
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-purple-700">{summaryStats.dbCredentials}</div>
                <p className="text-xs text-muted-foreground mt-1">databases configured</p>
              </CardContent>
            </Card>
          </Link>

          {/* Security Rules */}
          <Link href="/port-management">
            <Card className="card-hover shadow-lg bg-gradient-to-br from-amber-500/20 to-amber-500/5 cursor-pointer hover:shadow-2xl hover:scale-105 transition-all border border-amber-400/40 hover:border-amber-400/80">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Port Rules</CardTitle>
                <div className="h-12 w-12 rounded-xl bg-amber-500/30 flex items-center justify-center">
                  <Lock className="h-6 w-6 text-amber-600" />
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-amber-700">{summaryStats.portRules}</div>
                <p className="text-xs text-muted-foreground mt-1">security rules active</p>
              </CardContent>
            </Card>
          </Link>
        </div>

        {/* User Management Overview */}
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
          <Link href="/user-management" className="lg:col-span-2 block">
            <Card className="h-full cursor-pointer hover:shadow-2xl hover:scale-105 transition-all shadow-lg bg-gradient-to-br from-green-500/15 to-green-500/5 border border-green-400/30 hover:border-green-400/60">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Users className="h-6 w-6 text-green-600" />
                  User Administration
                </CardTitle>
                <CardDescription>User and role management overview</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <p className="text-sm font-medium text-muted-foreground">Total Users</p>
                  <p className="text-2xl font-bold">{summaryStats.totalUsers}</p>
                </div>
                <div className="space-y-2">
                  <p className="text-sm font-medium text-muted-foreground">Total Roles</p>
                  <p className="text-2xl font-bold">{summaryStats.totalRoles}</p>
                </div>
              </div>
              <Separator />
              <div className="space-y-3">
                <div className="flex justify-between items-center text-sm">
                  <span>System Usage</span>
                  <span className="font-medium">{Math.round((summaryStats.totalUsers / 100) * 100)}%</span>
                </div>
                <Progress value={(summaryStats.totalUsers / 100) * 100} className="h-2" />
              </div>
              </CardContent>
            </Card>
          </Link>

          {/* Stats Overview */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="h-5 w-5 text-green-600" />
                System Status
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">Servers</span>
                  <span className="font-medium text-green-600">{((summaryStats.activeServers / summaryStats.totalServers) * 100).toFixed(0)}%</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">Security</span>
                  <span className="font-medium text-blue-600">Good</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">IQ Compliance</span>
                  <span className="font-medium text-amber-600">Pending</span>
                </div>
              </div>
              <Separator />
              <div className="text-xs text-muted-foreground">
                <p>✓ System Online</p>
                <p>✓ All Services Running</p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Recent Activity */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Activity className="h-5 w-5 text-blue-600" />
              Recent Activity
            </CardTitle>
            <CardDescription>Latest changes across your infrastructure</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {recentActivity.map((activity) => {
                const IconComponent = activity.icon;
                return (
                  <div key={activity.id} className="flex items-start gap-4 pb-4 border-b last:border-0 last:pb-0">
                    <div className={`p-2 rounded-lg bg-muted`}>
                      <IconComponent className={`h-4 w-4 ${activity.color}`} />
                    </div>
                    <div className="flex-1 space-y-1">
                      <div className="flex items-center justify-between">
                        <p className="font-medium text-sm">{activity.name}</p>
                        <span className="text-xs text-muted-foreground">{formatDistanceToNow(activity.date, { addSuffix: true })}</span>
                      </div>
                      <p className="text-xs text-muted-foreground">{activity.type} - {activity.action}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      </div>
    </PageTransition>
  );
}

export default function DashboardPage() {
  return (
    <Suspense fallback={<SkeletonDashboard />}>
      <DashboardContent />
    </Suspense>
  );
}
