
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
import { Download, Filter, ArrowLeft } from 'lucide-react';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';

const initialIqData = [
  {
    id: 'IQ-001',
    client: 'Pharma Inc.',
    project: 'Automated QC System',
    environment: 'Test',
    requestDate: new Date('2024-01-15T09:00:00Z'),
    protocolSendDate: null,
    reportSignedDate: null,
  },
  {
    id: 'IQ-002',
    client: 'BioGen Corp.',
    project: 'Data Lake Migration',
    environment: 'Production',
    requestDate: new Date('2024-07-10T11:30:00Z'),
    protocolSendDate: new Date('2024-07-12T14:00:00Z'),
    reportSignedDate: new Date('2024-07-19T16:00:00Z'),
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

export default function IQDetailsReportPage() {
  const router = useRouter();

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between mb-4">
          <Button variant="outline" size="icon" onClick={() => router.back()}>
            <ArrowLeft className="h-4 w-4" />
            <span className="sr-only">Back</span>
          </Button>
          <ReportExportButton reportName="IQ Details" />
        </div>
        <CardTitle>IQ Details Report</CardTitle>
        <CardDescription>Review the status of all IQ processes.</CardDescription>
        <Separator className="my-4" />
        <div className="flex items-center gap-4">
          <Filter className="h-5 w-5 text-muted-foreground" />
          <div className="flex flex-col sm:flex-row sm:items-center gap-4 w-full">
            <Input placeholder="Filter by Client..." className="max-w-xs" />
            <Input placeholder="Filter by Project..." className="max-w-xs" />
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <Accordion type="multiple" className="w-full space-y-4">
          {initialIqData.map((item) => (
            <AccordionItem value={item.id} key={item.id} className="border-b-0">
              <AccordionTrigger className="flex items-center justify-between rounded-md bg-muted/50 px-4 py-3 text-sm font-medium hover:bg-muted transition-all">
                <span>{item.id} - {item.client}: {item.project}</span>
              </AccordionTrigger>
              <AccordionContent className="pt-4 px-2">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 p-4 border rounded-md">
                  <div className="space-y-2">
                    <Label>Client</Label>
                    <Input defaultValue={item.client} readOnly />
                  </div>
                  <div className="space-y-2">
                    <Label>Project</Label>
                    <Input defaultValue={item.project} readOnly />
                  </div>
                  <div className="space-y-2">
                    <Label>Environment</Label>
                    <Input defaultValue={item.environment} readOnly />
                  </div>
                  <div className="space-y-2">
                    <Label>Request Date</Label>
                    <Input defaultValue={item.requestDate ? new Date(item.requestDate).toLocaleDateString() : 'N/A'} readOnly />
                  </div>
                  <div className="space-y-2">
                    <Label>Protocol Send Date</Label>
                    <Input defaultValue={item.protocolSendDate ? new Date(item.protocolSendDate).toLocaleDateString() : 'N/A'} readOnly />
                  </div>
                  <div className="space-y-2">
                    <Label>Report Signed Date</Label>
                    <Input defaultValue={item.reportSignedDate ? new Date(item.reportSignedDate).toLocaleDateString() : 'N/A'} readOnly />
                  </div>
                </div>
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      </CardContent>
    </Card>
  );
}
