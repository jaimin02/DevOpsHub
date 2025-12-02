'use client';

import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from '@/components/ui/card';
import { Server, ShieldCheck, ClipboardCheck, ArrowRight } from 'lucide-react';
import Link from 'next/link';

const reportPages = [
  {
    href: '/reports/server-inventory',
    label: 'Server Inventory Report',
    icon: Server,
    description: 'A comprehensive record of all servers.',
  },
  {
    href: '/reports/port-management',
    label: 'Port Management Report',
    icon: ShieldCheck,
    description: 'Audit all port configurations and rules.',
  },
  {
    href: '/reports/iq-details',
    label: 'IQ Details Report',
    icon: ClipboardCheck,
    description: 'Review the status of all IQ processes.',
  },
];

export default function ReportsDashboardPage() {
  return (
    <div className="flex-1 space-y-4">
      <div className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight">Application Reports</h1>
        <p className="text-muted-foreground">
          Select a report below to view, filter, and export data.
        </p>
      </div>
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {reportPages.map((page) => (
          <Link href={page.href} key={page.href} className="group">
            <Card className="transition-all duration-300 hover:scale-[1.02] hover:border-primary h-full flex flex-col">
              <CardHeader className="flex-1">
                <div className="flex items-center gap-4 mb-2">
                  <page.icon className="h-8 w-8 text-primary" />
                  <CardTitle>{page.label}</CardTitle>
                </div>
                <CardDescription>{page.description}</CardDescription>
              </CardHeader>
              <div className="p-6 pt-0 flex justify-end">
                <ArrowRight className="h-5 w-5 text-muted-foreground transition-transform group-hover:translate-x-1" />
              </div>
            </Card>
          </Link>
        ))}
      </div>
    </div>
  );
}
