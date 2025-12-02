
'use client';

import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  CardFooter
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ArrowLeft, Save, CalendarIcon } from 'lucide-react';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar } from '@/components/ui/calendar';
import { cn } from '@/lib/utils';

const environments = [
  { nEnvironmentNo: 1, vEnvironmentName: 'Test' },
  { nEnvironmentNo: 2, vEnvironmentName: 'Valid' },
  { nEnvironmentNo: 3, vEnvironmentName: 'Production' },
  { nEnvironmentNo: 4, vEnvironmentName: 'Demo' },
];

const DatePickerField = ({ field, label }: { field: any; label: string }) => (
  <FormItem className="flex flex-col">
    <FormLabel>{label}</FormLabel>
    <Popover>
      <PopoverTrigger asChild>
        <FormControl>
          <Button
            variant={'outline'}
            className={cn(
              'w-full pl-3 text-left font-normal',
              !field.value && 'text-muted-foreground'
            )}
          >
            {field.value ? (
              new Date(field.value).toLocaleDateString()
            ) : (
              <span>Pick a date</span>
            )}
            <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
          </Button>
        </FormControl>
      </PopoverTrigger>
      <PopoverContent className="w-auto p-0" align="start">
        <Calendar
          mode="single"
          selected={field.value}
          onSelect={field.onChange}
          initialFocus
        />
      </PopoverContent>
    </Popover>
    <FormMessage />
  </FormItem>
);

const formSchema = z.object({
  // Checklist
  clientFullName: z.string().min(1, 'Client company name is required.'),
  projectCode: z.string().min(1, 'Project code is required.'),
  projectVersion: z.string().min(1, 'Project version is required.'),
  ssplContactPerson: z.string().min(1, 'SSPL contact person is required.'),
  clientContactPerson: z.string().min(1, 'Client contact person is required.'),
  environment: z.string().min(1, 'Environment is required.'),
  crNoDetails: z.string().min(1, 'CR No. Details are required.'),
  requestDate: z.date({ required_error: "A request date is required."}),
  requestBy: z.string().min(1, 'Request By is required.'),
  remark: z.string().optional(),
  signatureMode: z.enum(['DoQStack Sign', 'PDF Sign', 'Others']),

  // Protocol
  protocolSendDate: z.date().optional().nullable(),
  protocolSignedDate: z.date().optional().nullable(),
  protocolSignedBy: z.string().optional(),
  protocolRemark: z.string().optional(),

  // Script
  scriptExecStartDate: z.date().optional().nullable(),
  scriptExecEndDate: z.date().optional().nullable(),
  scriptSendDate: z.date().optional().nullable(),
  scriptSignedDate: z.date().optional().nullable(),
  scriptSignedBy: z.string().optional(),
  scriptRemark: z.string().optional(),
  
  // Report
  reportSendDate: z.date().optional().nullable(),
  reportSignedDate: z.date().optional().nullable(),
  reportSignedBy: z.string().optional(),
  reportRemark: z.string().optional(),
});

type FormValues = z.infer<typeof formSchema>;

export function IQDetailsForm() {
  const router = useRouter();
  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      clientFullName: 'Sarjen Systems Pvt. Ltd.',
      projectCode: 'STS LP_LTR_Vedoluzumab',
      projectVersion: '1.3.0',
      ssplContactPerson: 'Admin',
      clientContactPerson: 'Kuldip Suthar',
      environment: 'Test',
      crNoDetails: 'STS LP_LTR_Vedoluzumab_ PVR_ DP/10/2024/0051',
      requestBy: '',
      remark: '',
      signatureMode: 'DoQStack Sign',
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
    },
  });

  const onSubmit = (values: FormValues) => {
    console.log('New IQ Record submitted:', values);
    // In a real app, you would generate a new ID and save this data.
    router.push('/iq-details');
  };

  return (
    <Card>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)}>
          <CardHeader>
            <CardTitle>Create New IQ Record</CardTitle>
            <CardDescription>
              Fill in all details for the new Installation Qualification record across all stages.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="checklist">
              <TabsList className="grid w-full grid-cols-4">
                <TabsTrigger value="checklist">IQ Checklist</TabsTrigger>
                <TabsTrigger value="protocol">IQ Protocol</TabsTrigger>
                <TabsTrigger value="script">IQ Script</TabsTrigger>
                <TabsTrigger value="report">IQ Report</TabsTrigger>
              </TabsList>
              
              {/* CHECKLIST TAB */}
              <TabsContent value="checklist" className="mt-6">
                <div className="space-y-8">
                    <h3 className="text-lg font-semibold text-primary">Project Information</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                      <FormField
                        control={form.control}
                        name="clientFullName"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Client Full Name</FormLabel>
                            <FormControl>
                              <Input placeholder="e.g., Sarjen Systems Pvt. Ltd." {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={form.control}
                        name="projectCode"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Project Code</FormLabel>
                            <FormControl>
                              <Input placeholder="e.g., STS LP_LTR_Vedoluzumab" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={form.control}
                        name="projectVersion"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Project Version</FormLabel>
                            <FormControl>
                              <Input placeholder="e.g., 1.3.0" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={form.control}
                        name="ssplContactPerson"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>SSPL Contact Person</FormLabel>
                            <FormControl>
                              <Input placeholder="Enter name" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={form.control}
                        name="clientContactPerson"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Client Contact Person</FormLabel>
                            <FormControl>
                              <Input placeholder="e.g., Kuldip Suthar" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={form.control}
                        name="environment"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Environment</FormLabel>
                            <Select onValueChange={field.onChange} defaultValue={field.value}>
                              <FormControl>
                                <SelectTrigger>
                                  <SelectValue placeholder="Select Environment" />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                {environments.map(env => <SelectItem key={env.vEnvironmentName} value={env.vEnvironmentName}>{env.vEnvironmentName}</SelectItem>)}
                              </SelectContent>
                            </Select>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={form.control}
                        name="crNoDetails"
                        render={({ field }) => (
                          <FormItem className="md:col-span-3">
                            <FormLabel>CR No. Details</FormLabel>
                            <FormControl>
                              <Input placeholder="e.g., STS LP_LTR_Vedoluzumab_ PVR_ DP/10/2024/0051" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={form.control}
                        name="requestDate"
                        render={({ field }) => <DatePickerField field={field} label="Request Date" />}
                      />
                      <FormField
                        control={form.control}
                        name="requestBy"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Request By</FormLabel>
                            <FormControl>
                              <Input placeholder="Enter requester name" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={form.control}
                        name="signatureMode"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Signature Mode</FormLabel>
                            <Select onValueChange={field.onChange} defaultValue={field.value}>
                              <FormControl>
                                <SelectTrigger>
                                  <SelectValue placeholder="Select Signature Mode" />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                <SelectItem value="DoQStack Sign">DoQStack Sign</SelectItem>
                                <SelectItem value="PDF Sign">PDF Sign</SelectItem>
                                <SelectItem value="Others">Others</SelectItem>
                              </SelectContent>
                            </Select>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={form.control}
                        name="remark"
                        render={({ field }) => (
                          <FormItem className="md:col-span-3">
                            <FormLabel>Remarks</FormLabel>
                            <FormControl>
                              <Textarea placeholder="Add any remarks for the project..." {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                </div>
              </TabsContent>

              {/* PROTOCOL TAB */}
              <TabsContent value="protocol" className="mt-6">
                <div className="p-4 border rounded-md">
                  <h3 className="text-lg font-semibold mb-4 text-primary">IQ Protocol Details</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                     <FormField
                        control={form.control}
                        name="protocolSendDate"
                        render={({ field }) => <DatePickerField field={field} label="Protocol Send Date" />}
                      />
                      <FormField
                        control={form.control}
                        name="protocolSignedDate"
                        render={({ field }) => <DatePickerField field={field} label="Protocol Signed Date" />}
                      />
                      <FormField
                        control={form.control}
                        name="protocolSignedBy"
                        render={({ field }) => (
                           <FormItem className="md:col-span-2">
                            <FormLabel>Protocol Document Signed by</FormLabel>
                            <FormControl><Input placeholder="Enter signatory name" {...field} /></FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                       <FormField
                        control={form.control}
                        name="protocolRemark"
                        render={({ field }) => (
                           <FormItem className="md:col-span-2">
                            <FormLabel>Remarks</FormLabel>
                            <FormControl><Textarea placeholder="Add remarks for the protocol stage..." {...field} /></FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                  </div>
                </div>
              </TabsContent>
              
              {/* SCRIPT TAB */}
              <TabsContent value="script" className="mt-6">
                 <div className="p-4 border rounded-md">
                  <h3 className="text-lg font-semibold mb-4 text-primary">IQ Script Details</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <FormField
                        control={form.control}
                        name="scriptExecStartDate"
                        render={({ field }) => <DatePickerField field={field} label="Script Execution Start Date" />}
                      />
                      <FormField
                        control={form.control}
                        name="scriptExecEndDate"
                        render={({ field }) => <DatePickerField field={field} label="Script Execution End Date" />}
                      />
                       <FormField
                        control={form.control}
                        name="scriptSendDate"
                        render={({ field }) => <DatePickerField field={field} label="Script Send Date" />}
                      />
                       <FormField
                        control={form.control}
                        name="scriptSignedDate"
                        render={({ field }) => <DatePickerField field={field} label="Script Signed Date" />}
                      />
                      <FormField
                        control={form.control}
                        name="scriptSignedBy"
                        render={({ field }) => (
                           <FormItem className="md:col-span-2">
                            <FormLabel>Script Document Signed by</FormLabel>
                            <FormControl><Input placeholder="Enter signatory name" {...field} /></FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                       <FormField
                        control={form.control}
                        name="scriptRemark"
                        render={({ field }) => (
                           <FormItem className="md:col-span-2">
                            <FormLabel>Remarks</FormLabel>
                            <FormControl><Textarea placeholder="Add remarks for the script stage..." {...field} /></FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                  </div>
                 </div>
              </TabsContent>

              {/* REPORT TAB */}
               <TabsContent value="report" className="mt-6">
                  <div className="p-4 border rounded-md">
                   <h3 className="text-lg font-semibold mb-4 text-primary">IQ Report Details</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <FormField
                            control={form.control}
                            name="reportSendDate"
                            render={({ field }) => <DatePickerField field={field} label="Report Send Date" />}
                        />
                        <FormField
                            control={form.control}
                            name="reportSignedDate"
                            render={({ field }) => <DatePickerField field={field} label="Report Signed Date" />}
                        />
                        <FormField
                            control={form.control}
                            name="reportSignedBy"
                            render={({ field }) => (
                            <FormItem className="md:col-span-2">
                                <FormLabel>Report Document Signed by</FormLabel>
                                <FormControl><Input placeholder="Enter signatory name" {...field} /></FormControl>
                                <FormMessage />
                            </FormItem>
                            )}
                        />
                        <FormField
                            control={form.control}
                            name="reportRemark"
                            render={({ field }) => (
                            <FormItem className="md:col-span-2">
                                <FormLabel>Remarks</FormLabel>
                                <FormControl><Textarea placeholder="Add remarks for the report stage..." {...field} /></FormControl>
                                <FormMessage />
                            </FormItem>
                            )}
                        />
                    </div>
                  </div>
               </TabsContent>
            </Tabs>
          </CardContent>
          <CardFooter className="flex justify-between border-t pt-6">
            <Button variant="outline" type="button" onClick={() => router.back()}>
              <ArrowLeft className="mr-2 h-4 w-4" />
              Cancel
            </Button>
            <Button type="submit">
                <Save className="mr-2 h-4 w-4" />
                Save Record
            </Button>
          </CardFooter>
        </form>
      </Form>
    </Card>
  );
}
