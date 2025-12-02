
'use client';

import { useState, useMemo, useEffect } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  CardFooter
} from '@/components/ui/card';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { cn } from '@/lib/utils';
import { CalendarIcon, ClipboardCheck, Search, PlusCircle, Save, User, Clock, CheckCircle } from 'lucide-react';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { Checkbox } from '@/components/ui/checkbox';
import { Progress } from '@/components/ui/progress';
import { ClientOnlyDate } from '@/components/ClientOnlyDate';
import { initialIqData, environmentData as environments } from '@/lib/data';

export type IQData = typeof initialIqData[0];

const DatePickerField = ({ date, setDate, disabled }: { date: Date | null, setDate: (date: Date | null) => void, disabled?: boolean }) => {
  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button
          variant={"outline"}
          disabled={disabled}
          className={cn(
            "w-full justify-start text-left font-normal",
            !date && "text-muted-foreground"
          )}
        >
          <CalendarIcon className="mr-2 h-4 w-4" />
          {date ? new Date(date).toLocaleDateString() : <span>Pick a date</span>}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-auto p-0">
        <Calendar
          mode="single"
          selected={date ?? undefined}
          onSelect={(d) => setDate(d || null)}
          initialFocus
        />
      </PopoverContent>
    </Popover>
  );
};

const getCompletionPercentage = (item: IQData): number => {
    let completedSteps = 0;
    if (item.id) completedSteps++; // Checklist is the base, so it's step 1
    if (item.protocolSignedDate && item.protocolSignedBy) completedSteps++;
    if (item.scriptSignedDate && item.scriptSignedBy) completedSteps++;
    if (item.reportSignedDate && item.reportSignedBy) completedSteps++;
    
    return Math.round((completedSteps / 4) * 100);
};


export default function IQDetailsPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  
  const getInitialData = (): IQData[] => {
    if (typeof window === 'undefined') return initialIqData;

    const allIqDataStr = sessionStorage.getItem('allIqData');
    let allIqData: IQData[] = allIqDataStr ? JSON.parse(allIqDataStr).map((d: any) => ({
      ...d,
      requestDate: d.requestDate ? new Date(d.requestDate) : null,
      protocolSendDate: d.protocolSendDate ? new Date(d.protocolSendDate) : null,
      protocolSignedDate: d.protocolSignedDate ? new Date(d.protocolSignedDate) : null,
      scriptExecStartDate: d.scriptExecStartDate ? new Date(d.scriptExecStartDate) : null,
      scriptExecEndDate: d.scriptExecEndDate ? new Date(d.scriptExecEndDate) : null,
      scriptSendDate: d.scriptSendDate ? new Date(d.scriptSendDate) : null,
      scriptSignedDate: d.scriptSignedDate ? new Date(d.scriptSignedDate) : null,
      reportSendDate: d.reportSendDate ? new Date(d.reportSendDate) : null,
      reportSignedDate: d.reportSignedDate ? new Date(d.reportSignedDate) : null,
    })) : initialIqData;

    const approvedRequestStr = searchParams.get('approvedRequest');
    if (approvedRequestStr) {
      const approvedRequest = JSON.parse(decodeURIComponent(approvedRequestStr));
      const recordExists = allIqData.some(item => item.id.replace('IQ-','REQ-') === approvedRequest.id);

      if (!recordExists) {
        const newId = `IQ-${String(allIqData.length + 1).padStart(3, '0')}`;
        const newRecord: IQData = {
          ...approvedRequest,
          id: newId,
          requestDate: new Date(approvedRequest.requestDate),
          dModifiedOn: new Date().toISOString(),
          status: 'InProgress',
          protocolSendDate: null,
          protocolSignedDate: null,
          protocolSignedBy: '',
          protocolRemark: '',
          scriptExecStartDate: null,
          scriptExecEndDate: null,
          scriptSendDate: null,
          scriptSignedDate: null,
          scriptSignedBy: '',
          scriptRemark: '',
          reportSendDate: null,
          reportSignedDate: null,
          reportSignedBy: '',
          reportRemark: '',
        };
        allIqData = [...allIqData, newRecord];
        sessionStorage.setItem('allIqData', JSON.stringify(allIqData));
      }
      
      // Clean up the URL
      router.replace('/iq-details', undefined);
    } else if (!allIqDataStr) {
      sessionStorage.setItem('allIqData', JSON.stringify(initialIqData));
    }
    
    return allIqData;
  }

  const [iqData, setIqData] = useState<IQData[]>(getInitialData);
  const [searchQuery, setSearchQuery] = useState('');
  const [showCompletedOnly, setShowCompletedOnly] = useState(false);
  
  const filteredData = useMemo(() => {
    let data = iqData;
    if (showCompletedOnly) {
      data = data.filter(item => getCompletionPercentage(item) === 100);
    }
    if (!searchQuery) return data;
    
    const lowercasedQuery = searchQuery.toLowerCase();
    return data.filter(item => 
      Object.values(item).some(value =>
        String(value).toLowerCase().includes(lowercasedQuery)
      )
    );
  }, [searchQuery, showCompletedOnly, iqData]);
  
  const handleUpdate = (id: string, field: string, value: any) => {
    const updatedData = iqData.map(item => {
        if (item.id === id) {
            return { ...item, [field]: value, dModifiedOn: new Date().toISOString() };
        }
        return item;
    });
    setIqData(updatedData);
    sessionStorage.setItem('allIqData', JSON.stringify(updatedData));
  };

  const createHandleDateUpdate = (id: string, field: keyof IQData) => {
    return (date: Date | null) => {
      handleUpdate(id, field, date);
    };
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
                 <CardTitle className="flex items-center gap-2">
                    <ClipboardCheck className="h-6 w-6" />
                    Installation Qualification (IQ) Details
                </CardTitle>
                <CardDescription>
                    Track and manage the entire IQ process from checklist to final report.
                </CardDescription>
            </div>
            <Button asChild>
              <Link href="/iq-details/new">
                <PlusCircle className="mr-2 h-4 w-4" />
                Create New IQ Record
              </Link>
            </Button>
        </div>
        <Separator className="my-4" />
        <div className="flex items-center gap-4">
          <div className="relative">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                  type="search"
                  placeholder="Search IQ records..."
                  className="pl-8 sm:w-[300px]"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
              />
          </div>
          <div className="flex items-center space-x-2">
            <Checkbox id="completed" checked={showCompletedOnly} onCheckedChange={(checked) => setShowCompletedOnly(Boolean(checked))} />
            <label
              htmlFor="completed"
              className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
            >
              Show Completed Only
            </label>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <Accordion type="multiple" className="w-full space-y-4">
          {filteredData.map((item) => (
            <AccordionItem value={item.id} key={item.id} className="border-b-0">
                 <AccordionTrigger className="flex items-center justify-between rounded-md bg-muted/50 px-4 py-3 hover:bg-muted transition-all">
                    <div className="flex flex-col items-start text-left flex-1 gap-2">
                        <span className="font-semibold text-base">{item.id} - {item.clientFullName}: {item.projectCode}</span>
                        <div className="w-full">
                           <div className="flex justify-between items-center mb-1">
                             <span className="text-xs font-medium text-primary">
                                Status: {getCompletionPercentage(item)}%
                            </span>
                             {getCompletionPercentage(item) === 100 && <CheckCircle className="h-4 w-4 text-green-500" />}
                           </div>
                           <Progress value={getCompletionPercentage(item)} className="h-2" />
                        </div>
                        <div className="flex items-center gap-4 text-xs text-muted-foreground mt-1">
                            <div className="flex items-center gap-1">
                                <User className="h-3 w-3" />
                                <span>{item.vUserName}</span>
                            </div>
                            <div className="flex items-center gap-1">
                                <Clock className="h-3 w-3" />
                                <ClientOnlyDate date={item.dModifiedOn} />
                            </div>
                        </div>
                    </div>
                 </AccordionTrigger>
              <AccordionContent className="pt-4 px-2">
                <Tabs defaultValue="checklist">
                    <TabsList className="grid w-full grid-cols-4">
                        <TabsTrigger value="checklist">IQ Checklist</TabsTrigger>
                        <TabsTrigger value="protocol">IQ Protocol</TabsTrigger>
                        <TabsTrigger value="script">IQ Script</TabsTrigger>
                        <TabsTrigger value="report">IQ Report</TabsTrigger>
                    </TabsList>

                    {/* CHECKLIST TAB */}
                    <TabsContent value="checklist" className="mt-4">
                        <div className="p-4 border rounded-md">
                          <CardTitle className="mb-4 text-lg">Checklist Summary</CardTitle>
                          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                              <div className="space-y-2">
                                  <Label>Client</Label>
                                  <Input defaultValue={item.clientFullName} onChange={(e) => handleUpdate(item.id, 'clientFullName', e.target.value)} />
                              </div>
                              <div className="space-y-2">
                                  <Label>Project</Label>
                                  <Input defaultValue={`${item.projectCode} (v${item.projectVersion})`} onChange={(e) => handleUpdate(item.id, 'projectCode', e.target.value)} />
                              </div>
                              <div className="space-y-2">
                                  <Label>Environment</Label>
                                    <Select defaultValue={item.environment} onValueChange={(value) => handleUpdate(item.id, 'environment', value)}>
                                        <SelectTrigger>
                                            <SelectValue placeholder="Select Environment" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {environments.map(env => <SelectItem key={env.vEnvironmentName} value={env.vEnvironmentName}>{env.vEnvironmentName}</SelectItem>)}
                                        </SelectContent>
                                    </Select>
                              </div>
                               <div className="space-y-2">
                                  <Label>Request Date</Label>
                                  <DatePickerField date={item.requestDate} setDate={() => {}} disabled />
                              </div>
                              <div className="space-y-2">
                                  <Label>Request By</Label>
                                  <Input defaultValue={item.requestBy} disabled />
                              </div>
                               <div className="space-y-2">
                                  <Label>Signature Mode</Label>
                                  <Select defaultValue={item.signatureMode} onValueChange={(value) => handleUpdate(item.id, 'signatureMode', value)}>
                                    <SelectTrigger>
                                        <SelectValue placeholder="Select Signature Mode" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="DoQStack Sign">DoQStack Sign</SelectItem>
                                        <SelectItem value="PDF Sign">PDF Sign</SelectItem>
                                        <SelectItem value="Others">Others</SelectItem>
                                    </SelectContent>
                                  </Select>
                              </div>
                              <div className="space-y-2 md:col-span-3">
                                  <Label>Remarks</Label>
                                  <Textarea defaultValue={item.remark} onChange={(e) => handleUpdate(item.id, 'remark', e.target.value)} />
                              </div>
                          </div>
                        </div>
                    </TabsContent>

                    {/* IQ PROTOCOL TAB */}
                    <TabsContent value="protocol" className="mt-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 p-4 border rounded-md">
                             <div className="space-y-2">
                                <Label>Protocol Send Date</Label>
                                <DatePickerField date={item.protocolSendDate} setDate={createHandleDateUpdate(item.id, 'protocolSendDate')} />
                            </div>
                            <div className="space-y-2">
                                <Label>Protocol Signed Date</Label>
                                <DatePickerField date={item.protocolSignedDate} setDate={createHandleDateUpdate(item.id, 'protocolSignedDate')} />
                            </div>
                             <div className="space-y-2 md:col-span-2">
                                <Label>Protocol Document Signed by</Label>
                                <Input defaultValue={item.protocolSignedBy} onChange={(e) => handleUpdate(item.id, 'protocolSignedBy', e.target.value)} />
                            </div>
                            <div className="space-y-2 md:col-span-2">
                                <Label>Remarks</Label>
                                <Textarea defaultValue={item.protocolRemark} placeholder="Add remarks for the protocol stage..." onChange={(e) => handleUpdate(item.id, 'protocolRemark', e.target.value)} />
                            </div>
                        </div>
                    </TabsContent>

                    {/* IQ SCRIPT TAB */}
                    <TabsContent value="script" className="mt-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 p-4 border rounded-md">
                            <div className="space-y-2">
                                <Label>Script Execution Start Date</Label>
                                <DatePickerField date={item.scriptExecStartDate} setDate={createHandleDateUpdate(item.id, 'scriptExecStartDate')} />
                            </div>
                             <div className="space-y-2">
                                <Label>Script Execution End Date</Label>
                                <DatePickerField date={item.scriptExecEndDate} setDate={createHandleDateUpdate(item.id, 'scriptExecEndDate')} />
                            </div>
                             <div className="space-y-2">
                                <Label>Script Send Date</Label>
                                <DatePickerField date={item.scriptSendDate} setDate={createHandleDateUpdate(item.id, 'scriptSendDate')} />
                            </div>
                             <div className="space-y-2">
                                <Label>Script Signed Date</Label>
                                <DatePickerField date={item.scriptSignedDate} setDate={createHandleDateUpdate(item.id, 'scriptSignedDate')} />
                            </div>
                             <div className="space-y-2 md:col-span-2">
                                <Label>Script Document Signed by</Label>
                                <Input defaultValue={item.scriptSignedBy} onChange={(e) => handleUpdate(item.id, 'scriptSignedBy', e.target.value)} />
                            </div>
                            <div className="space-y-2 md:col-span-2">
                                <Label>Remarks</Label>
                                <Textarea defaultValue={item.scriptRemark} placeholder="Add remarks for the script stage..." onChange={(e) => handleUpdate(item.id, 'scriptRemark', e.target.value)} />
                            </div>
                        </div>
                    </TabsContent>

                    {/* IQ REPORT TAB */}
                    <TabsContent value="report" className="mt-4">
                         <div className="grid grid-cols-1 md:grid-cols-2 gap-6 p-4 border rounded-md">
                            <div className="space-y-2">
                                <Label>Report Send Date</Label>
                                <DatePickerField date={item.reportSendDate} setDate={createHandleDateUpdate(item.id, 'reportSendDate')} />
                            </div>
                            <div className="space-y-2">
                                <Label>Report Signed Date</Label>
                                <DatePickerField date={item.reportSignedDate} setDate={createHandleDateUpdate(item.id, 'reportSignedDate')} />
                            </div>
                             <div className="space-y-2 md:col-span-2">
                                <Label>Report Document Signed by</Label>
                                <Input defaultValue={item.reportSignedBy} onChange={(e) => handleUpdate(item.id, 'reportSignedBy', e.target.value)} />
                            </div>
                             <div className="space-y-2 md:col-span-2">
                                <Label>Remarks</Label>
                                <Textarea defaultValue={item.reportRemark} placeholder="Add remarks for the report stage..." onChange={(e) => handleUpdate(item.id, 'reportRemark', e.target.value)} />
                            </div>
                        </div>
                    </TabsContent>
                </Tabs>
                 <CardFooter className="mt-6 p-0 justify-end">
                    {/* The save button is illustrative; state is already updated on change. */}
                    <Button onClick={() => handleUpdate(item.id, 'dModifiedOn', new Date().toISOString())}>
                        <Save className="mr-2 h-4 w-4" />
                        Save Changes
                    </Button>
                </CardFooter>
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      </CardContent>
    </Card>
  );
}
