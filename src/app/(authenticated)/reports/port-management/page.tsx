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
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';

const serverPortData = [
  {
    serverName: 'web-prod-01',
    publicIp: '54.123.45.67',
    rules: [
      { port: '80', protocol: 'TCP', source: '0.0.0.0/0', status: 'Allowed' },
      { port: '443', protocol: 'TCP', source: '0.0.0.0/0', status: 'Allowed' },
    ],
  },
  {
    serverName: 'db-master-01',
    publicIp: '34.201.78.90',
    rules: [
      { port: '5432', protocol: 'TCP', source: '10.0.1.15/32', status: 'Allowed' },
    ],
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

export default function PortManagementReportPage() {
  const router = useRouter();

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between mb-4">
          <Button variant="outline" size="icon" onClick={() => router.back()}>
            <ArrowLeft className="h-4 w-4" />
            <span className="sr-only">Back</span>
          </Button>
          <ReportExportButton reportName="Port Management" />
        </div>
        <CardTitle>Port Management Report</CardTitle>
        <CardDescription>Audit all port configurations and rules.</CardDescription>
      </CardHeader>
      <CardContent>
        <Accordion type="single" collapsible className="w-full">
          {serverPortData.map((server) => (
            <AccordionItem value={server.serverName} key={server.serverName}>
              <AccordionTrigger className="hover:bg-muted/50 px-4 rounded-md transition-colors">
                <div className="font-medium">{server.serverName} ({server.publicIp})</div>
              </AccordionTrigger>
              <AccordionContent className="pt-2 pb-4 px-4">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Port</TableHead>
                      <TableHead>Protocol</TableHead>
                      <TableHead>Source IP</TableHead>
                      <TableHead>Status</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {server.rules.map((rule, index) => (
                      <TableRow key={index}>
                        <TableCell>{rule.port}</TableCell>
                        <TableCell>{rule.protocol}</TableCell>
                        <TableCell>{rule.source}</TableCell>
                        <TableCell>
                          <Badge variant={rule.status === 'Allowed' ? 'default' : 'destructive'}>
                            {rule.status}
                          </Badge>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      </CardContent>
    </Card>
  );
}
