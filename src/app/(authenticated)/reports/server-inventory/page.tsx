
'use client';

import { useRouter } from 'next/navigation';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Download, ArrowLeft } from 'lucide-react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';

const servers = [
  {
    privateIp: '10.0.1.15',
    publicIp: '54.123.45.67',
    serverName: 'web-prod-01',
    serverType: 'Web Server',
    serverLocation: 'us-east-1',
    serverOs: 'Ubuntu 20.04',
  },
  {
    privateIp: '10.0.2.28',
    publicIp: '34.201.78.90',
    serverName: 'db-master-01',
    serverType: 'Database Server',
    serverLocation: 'us-west-2',
    serverOs: 'CentOS 8',
  },
];

const ReportExportButton = ({ reportName }: { reportName: string }) => (
  <DropdownMenu>
    <DropdownMenuTrigger asChild>
      <Button variant="outline">
        <Download className="mr-2" />
        Export
      </Button>
    </DropdownMenuTrigger>
    <DropdownMenuContent>
      <DropdownMenuItem onClick={() => console.log(`Exporting ${reportName} to PDF...`)}>Export to PDF</DropdownMenuItem>
      <DropdownMenuItem onClick={() => console.log(`Exporting ${reportName} to Excel...`)}>Export to Excel</DropdownMenuItem>
    </DropdownMenuContent>
  </DropdownMenu>
);

export default function ServerInventoryReportPage() {
  const router = useRouter();

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between mb-4">
          <Button variant="outline" size="icon" onClick={() => router.back()}>
            <ArrowLeft className="h-4 w-4" />
            <span className="sr-only">Back</span>
          </Button>
          <ReportExportButton reportName="Server Inventory" />
        </div>
        <CardTitle>Server Inventory Report</CardTitle>
        <CardDescription>A comprehensive record of all servers.</CardDescription>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Private IP</TableHead>
              <TableHead>Public IP</TableHead>
              <TableHead>Server Name</TableHead>
              <TableHead>Type</TableHead>
              <TableHead>Location</TableHead>
              <TableHead>OS</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {servers.map((server) => (
              <TableRow key={server.serverName}>
                <TableCell>{server.privateIp}</TableCell>
                <TableCell>{server.publicIp}</TableCell>
                <TableCell>{server.serverName}</TableCell>
                <TableCell>{server.serverType}</TableCell>
                <TableCell>{server.serverLocation}</TableCell>
                <TableCell>{server.serverOs}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}
