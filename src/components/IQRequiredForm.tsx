
'use client';

import { useRouter } from 'next/navigation';
import { useForm, useFieldArray } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
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
import { ArrowLeft, Save, CalendarIcon, Send, PlusCircle, Trash2, User, Clock } from 'lucide-react';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar } from '@/components/ui/calendar';
import { cn } from '@/lib/utils';
import { useEffect, useState } from 'react';
import { Separator } from './ui/separator';
import { DialogContent, DialogHeader, DialogTitle, DialogDescription } from './ui/dialog';
import { Alert, AlertDescription, AlertTitle } from './ui/alert';
import { Terminal } from 'lucide-react';
import { RadioGroup, RadioGroupItem } from './ui/radio-group';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { AddServerDialog } from './AddServerDialog';
import { AddClientServerDialog } from './AddClientServerDialog';
import { ApplicationUrlDialog } from './ApplicationUrlDialog';
import { MultiSelect } from './MultiSelect';


const environments = [
  { nEnvironmentNo: 1, vEnvironmentName: 'Test' },
  { nEnvironmentNo: 2, vEnvironmentName: 'Valid' },
  { nEnvironmentNo: 3, vEnvironmentName: 'Production' },
  { nEnvironmentNo: 4, vEnvironmentName: 'Demo' },
];

export const servers = [
  {
    recordNo: 1,
    privateIp: '10.0.1.15',
    publicIp: '54.123.45.67',
    serverName: 'web-prod-01',
    serverType: 'Web Server',
    serverOs: 'Ubuntu 20.04',
  },
  {
    recordNo: 2,
    privateIp: '10.0.2.28',
    publicIp: '34.201.78.90',
    serverName: 'db-master-01',
    serverType: 'Database Server',
    serverOs: 'CentOS 8',
  },
  {
    recordNo: 3,
    privateIp: '10.0.3.41',
    publicIp: '52.91.12.34',
    serverName: 'app-worker-01',
    serverType: 'Application Server',
    serverOs: 'Windows Server 2019',
  },
  {
    recordNo: 4,
    privateIp: '10.0.4.55',
    publicIp: '13.229.100.201',
    serverName: 'cache-main',
    serverType: 'Cache Server',
    serverOs: 'Debian 11',
  },
];

const ServerTypes = [
    "Application Server",
    "Database Server",
    "Demo Server",
    "DR Server",
    "Document Server"
];

const groupOrUserNames = [
    { value: 'NETWORK SERVICE', label: 'NETWORK SERVICE' },
    { value: 'IUSR', label: 'IUSR' },
    { value: 'Administrator', label: 'Administrator' },
    { value: 'IIS User', label: 'IIS User' },
    { value: 'Everyone', label: 'Everyone' },
];

const permissions = ["Full Control", "Modify", "Read & Execute", "Read", "Write", "Delete"];

const DatePickerField = ({ field, label, disabled }: { field: any; label: string, disabled?: boolean }) => (
  <FormItem className="flex flex-col">
    <FormLabel>{label} {field.value && <span className="text-destructive">*</span>}</FormLabel>
    <Popover>
      <PopoverTrigger asChild>
        <FormControl>
          <Button
            variant={'outline'}
            disabled={disabled}
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
          disabled={disabled}
          initialFocus
        />
      </PopoverContent>
    </Popover>
    <FormMessage />
  </FormItem>
);

export const softwareSchema = z.object({
  name: z.string(),
  version: z.string(),
});

export const ssplServerDetailSchema = z.object({
    type: z.string().min(1),
    name: z.string().min(1, "Server name is required."),
    ip: z.string(),
    os: z.string(),
    software: z.array(softwareSchema).optional(),
});

export const clientAppServerDetailSchema = z.object({
    type: z.string().min(1),
    name: z.string().min(1, "Server name is required."),
    ip: z.string().min(1, "IP Address is required."),
    os: z.string().min(1, "OS is required."),
    username: z.string().min(1, "Username is required."),
    password: z.string().min(1, "Password is required."),
    software: z.array(softwareSchema).optional(),
});

const accessRightSchema = z.object({
  serverName: z.string().min(1, 'Server Name is required'),
  folderPath: z.string().min(1, 'Folder Path is required'),
  groupOrUserName: z.array(z.string()).min(1, 'At least one Group/User Name is required'),
  permission: z.string().min(1, 'Permission is required'),
});

export const applicationUrlSchema = z.object({
  isClientDomain: z.enum(['Yes', 'No']),
  domainName: z.string().optional(),
  isHttpsRequired: z.enum(['Yes', 'No']),
  applicationUrl: z.string().min(1, "Application URL is required"),
  sslPath: z.string().optional(),
}).refine(data => {
    if (data.isClientDomain === 'Yes') {
      return !!data.domainName;
    }
    return true;
}, {
    message: "Domain name is required if domain is of client.",
    path: ['domainName'],
});


const formSchema = z.object({
  id: z.string().optional(),
  status: z.string().optional(),
  serverType: z.enum(['sspl', 'client']).optional(),
  clientFullName: z.string().min(1, 'Client company name is required.'),
  projectCode: z.string().min(1, 'Project code is required.'),
  projectVersion: z.string().min(1, 'Project version is required.'),
  ssplContactPerson: z.string().min(1, 'SSPL contact person is required.'),
  clientContactPerson: z.string().min(1, 'Client contact person is required.'),
  environment: z.string().min(1, 'Environment is required.'),
  crNoDetails: z.string().min(1, 'CR No. Details are required.'),
  requestDate: z.date({ required_error: "A request date is required."}),
  requestBy: z.string().min(1, 'Request By is required.'),
  signatureMode: z.enum(['DoQStack Sign', 'PDF Sign', 'Others']),
  remark: z.string().optional(),
  
  ssplServers: z.array(ssplServerDetailSchema).optional(),

  isClientServer: z.boolean().default(false),
  clientServerContactPerson: z.string().optional(),
  clientServerContactNo: z.string().optional(),
  clientServerAlternateContactNo: z.string().optional(),
  clientServerEmail: z.string().email({ message: 'Please enter a valid email address.' }).optional().or(z.literal('')),
  clientServerConnectionMode: z.string().optional(),
  clientServerConnectionModeOther: z.string().optional(),
  ipOrConnectionModeNo: z.string().optional(),
  userId: z.string().optional(),
  password: z.string().optional(),
  otherClientDetail: z.string().optional(),

  clientAppServers: z.array(clientAppServerDetailSchema).optional(),
  
  applicationUrls: z.array(applicationUrlSchema).optional(),

  accessRights: z.array(accessRightSchema).optional(),

  packageLocationApp: z.string().min(1, 'Application package location is required.'),
  packageLocationDb: z.string().min(1, 'Database package location is required.'),
  finalRemarks: z.string().optional(),
  
  reviewedBy: z.string().optional(),
  reviewDate: z.date().optional(),
  reviewerRemark: z.string().optional(),


}).refine(data => {
    if (data.serverType === 'client') {
        return !!data.clientServerContactPerson && !!data.clientServerContactNo && !!data.clientServerEmail && !!data.ipOrConnectionModeNo && !!data.userId && !!data.password;
    }
    return true;
}, {
    message: "When Client Server is selected, all contact and credential fields are required.",
    path: ['serverType']
}).refine(data => {
    if (data.serverType === 'client' && data.clientServerConnectionMode === 'Any Other') {
        return !!data.clientServerConnectionModeOther;
    }
    return true;
}, {
    message: "Please specify the connection mode.",
    path: ['clientServerConnectionModeOther']
});


export type FormValues = z.infer<typeof formSchema>;
export type SsplServerDetail = z.infer<typeof ssplServerDetailSchema>;
export type ClientAppServerDetail = z.infer<typeof clientAppServerDetailSchema>;
export type ApplicationUrl = z.infer<typeof applicationUrlSchema>;

interface IQRequiredFormProps {
  mode: 'add' | 'edit' | 'view';
  initialData?: Partial<FormValues>;
  onSubmit?: (values: Partial<FormValues>, action: 'save' | 'send') => void;
  onClose?: () => void;
}

const addModeDefaults: Partial<FormValues> = {
      clientFullName: 'Sarjen Systems Pvt. Ltd.',
      projectCode: 'STS LP_LTR_Vedoluzumab',
      projectVersion: '1.3.0',
      ssplContactPerson: 'Admin',
      clientContactPerson: 'Kuldip Suthar',
      environment: 'Test',
      crNoDetails: 'STS LP_LTR_Vedoluzumab_ PVR_ DP/10/2024/0051',
      requestBy: 'Admin',
      requestDate: new Date(),
      remark: '',
      signatureMode: 'DoQStack Sign',
      serverType: undefined,
      ssplServers: [],
      isClientServer: false,
      clientServerContactPerson: '',
      clientServerContactNo: '',
      clientServerAlternateContactNo: '',
      clientServerEmail: '',
      clientServerConnectionMode: '',
      clientServerConnectionModeOther: '',
      ipOrConnectionModeNo: '',
      userId: '',
      password: '',
      otherClientDetail: '',
      clientAppServers: [],
      applicationUrls: [],
      accessRights: [],
      packageLocationApp: '',
      packageLocationDb: '',
      finalRemarks: '',
};

export const IQRequiredFormContent: React.FC<IQRequiredFormProps> = ({ mode, initialData, onSubmit, onClose }) => {
  const router = useRouter();
  const isReadOnly = mode === 'view';

  const [isAddSsplServerOpen, setIsAddSsplServerOpen] = useState(false);
  const [isAddClientServerOpen, setIsAddClientServerOpen] = useState(false);
  const [isAppUrlOpen, setIsAppUrlOpen] = useState(false);
  const [serverTypeToAdd, setServerTypeToAdd] = useState('');

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: addModeDefaults,
  });

  const { fields: ssplServerFields, append: appendSsplServer, remove: removeSsplServer } = useFieldArray({
    control: form.control,
    name: "ssplServers",
  });

  const { fields: clientAppServerFields, append: appendClientAppServer, remove: removeClientAppServer } = useFieldArray({
    control: form.control,
    name: "clientAppServers",
  });
  
  const { fields: accessRightsFields, append: appendAccessRight, remove: removeAccessRight } = useFieldArray({
    control: form.control,
    name: "accessRights",
  });

  const { fields: appUrlFields, append: appendAppUrl, remove: removeAppUrl } = useFieldArray({
    control: form.control,
    name: "applicationUrls",
  });

  const serverType = form.watch('serverType');
  const clientConnectionMode = form.watch('clientServerConnectionMode');
  const ssplServers = form.watch('ssplServers') || [];
  const clientAppServers = form.watch('clientAppServers') || [];
  const addedServerNames = [
    ...ssplServers.map(s => s.name),
    ...clientAppServers.map(s => s.name)
  ];

  useEffect(() => {
    let serverTypeValue;
    if (initialData?.ssplServers && initialData.ssplServers.length > 0) serverTypeValue = 'sspl';
    if (initialData?.isClientServer) serverTypeValue = 'client';

    const mergedData: Partial<FormValues> = {
        ...addModeDefaults,
        ...initialData,
        requestDate: initialData?.requestDate ? new Date(initialData.requestDate) : new Date(),
        serverType: serverTypeValue,
    };
    form.reset(mergedData);
}, [form, initialData]);


  const onFormSubmit = (action: 'save' | 'send') => (values: FormValues) => {
    if (onSubmit) {
      const finalValues = {
        ...values,
        isClientServer: values.serverType === 'client',
      }
      onSubmit(finalValues, action);
    }
  };
  
  const handleCancel = () => {
    if (onClose) {
      onClose();
    } else {
      router.back();
    }
  }

  const handleOpenAddSsplServerDialog = (type: string) => {
    setServerTypeToAdd(type);
    setIsAddSsplServerOpen(true);
  };

  const handleOpenAddClientServerDialog = (type: string) => {
    setServerTypeToAdd(type);
    setIsAddClientServerOpen(true);
  };

  const handleSaveSsplServer = (serverData: SsplServerDetail) => {
    appendSsplServer(serverData);
    setIsAddSsplServerOpen(false);
  };

  const handleSaveClientServer = (serverData: ClientAppServerDetail) => {
    appendClientAppServer(serverData);
    setIsAddClientServerOpen(false);
  };

  const handleSaveAppUrl = (urlData: ApplicationUrl) => {
    appendAppUrl(urlData);
    setIsAppUrlOpen(false);
  }

  return (
        <>
        <AddServerDialog
            isOpen={isAddSsplServerOpen}
            onClose={() => setIsAddSsplServerOpen(false)}
            onSave={handleSaveSsplServer}
            serverType={serverTypeToAdd}
        />
        <AddClientServerDialog
            isOpen={isAddClientServerOpen}
            onClose={() => setIsAddClientServerOpen(false)}
            onSave={handleSaveClientServer}
            serverType={serverTypeToAdd}
        />
        <ApplicationUrlDialog
            isOpen={isAppUrlOpen}
            onClose={() => setIsAppUrlOpen(false)}
            onSave={handleSaveAppUrl}
        />
        <Form {...form}>
            <form>
                <div className="space-y-8">
                    {initialData?.status && ['Send Back', 'Approved', 'Rejected'].includes(initialData.status) && (
                        <Alert variant={initialData.status === 'Send Back' ? 'destructive' : 'default'}>
                            <Terminal className="h-4 w-4" />
                            <AlertTitle>{initialData.status} by {initialData.reviewedBy}</AlertTitle>
                            <AlertDescription>
                                <div className='flex justify-between items-center'>
                                  <p className='text-sm'>
                                    Remark: "{initialData.reviewerRemark || initialData.remark}"
                                  </p>
                                  <p className='text-xs text-muted-foreground'>
                                    {initialData.reviewDate ? new Date(initialData.reviewDate).toLocaleString('en-US', { hour12: true }) : ''}
                                  </p>
                                </div>
                            </AlertDescription>
                        </Alert>
                    )}
                    <h3 className="text-lg font-semibold text-primary">Project Information</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    <FormField
                        control={form.control}
                        name="clientFullName"
                        render={({ field }) => (
                        <FormItem>
                            <FormLabel>Client Full Name <span className="text-destructive">*</span></FormLabel>
                            <FormControl>
                            <Input placeholder="e.g., Sarjen Systems Pvt. Ltd." {...field} disabled={isReadOnly} />
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
                            <FormLabel>Project Code <span className="text-destructive">*</span></FormLabel>
                            <FormControl>
                            <Input placeholder="e.g., STS LP_LTR_Vedoluzumab" {...field} disabled={isReadOnly} />
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
                            <FormLabel>Project Version <span className="text-destructive">*</span></FormLabel>
                            <FormControl>
                            <Input placeholder="e.g., 1.3.0" {...field} disabled={isReadOnly} />
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
                            <FormLabel>SSPL Contact Person <span className="text-destructive">*</span></FormLabel>
                            <FormControl>
                            <Input placeholder="Enter name" {...field} disabled={isReadOnly} />
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
                            <FormLabel>Client Contact Person <span className="text-destructive">*</span></FormLabel>
                            <FormControl>
                            <Input placeholder="e.g., Kuldip Suthar" {...field} disabled={isReadOnly} />
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
                            <FormLabel>Environment <span className="text-destructive">*</span></FormLabel>
                            <Select onValueChange={field.onChange} defaultValue={field.value} disabled={isReadOnly}>
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
                            <FormLabel>CR No. Details <span className="text-destructive">*</span></FormLabel>
                            <FormControl>
                            <Input placeholder="e.g., STS LP_LTR_Vedoluzumab_ PVR_ DP/10/2024/0051" {...field} disabled={isReadOnly} />
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                        )}
                    />
                    <FormField
                        control={form.control}
                        name="requestDate"
                        render={({ field }) => <DatePickerField field={field} label="Request Date" disabled />}
                    />
                    <FormField
                        control={form.control}
                        name="requestBy"
                        render={({ field }) => (
                        <FormItem>
                            <FormLabel>Request By <span className="text-destructive">*</span></FormLabel>
                            <FormControl>
                            <Input placeholder="Enter requester name" {...field} disabled />
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
                            <FormLabel>Signature Mode <span className="text-destructive">*</span></FormLabel>
                            <Select onValueChange={field.onChange} defaultValue={field.value} disabled={isReadOnly}>
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
                            <Textarea placeholder="Add any remarks for the project..." {...field} disabled={isReadOnly} />
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                        )}
                    />
                    </div>
                    
                    <Separator className="my-8" />

                     <FormField
                        control={form.control}
                        name="serverType"
                        render={({ field }) => (
                            <FormItem className="space-y-3">
                                <FormLabel>Select Server Type <span className="text-destructive">*</span></FormLabel>
                                <FormControl>
                                    <RadioGroup
                                    onValueChange={field.onChange}
                                    value={field.value}
                                    className="flex items-center gap-8"
                                    disabled={isReadOnly}
                                    >
                                    <FormItem className="flex items-center space-x-3 space-y-0">
                                        <FormControl>
                                        <RadioGroupItem value="sspl" />
                                        </FormControl>
                                        <FormLabel className="font-normal">
                                        SSPL Server
                                        </FormLabel>
                                    </FormItem>
                                    <FormItem className="flex items-center space-x-3 space-y-0">
                                        <FormControl>
                                        <RadioGroupItem value="client" />
                                        </FormControl>
                                        <FormLabel className="font-normal">
                                        Client Server
                                        </FormLabel>
                                    </FormItem>
                                    </RadioGroup>
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />

                    {serverType === 'sspl' && (
                        <>
                            <Separator className="my-8" />
                            <div className="flex justify-between items-center">
                                <h3 className="text-lg font-semibold text-primary">Add the Server Details</h3>
                                {!isReadOnly && (
                                     <DropdownMenu>
                                        <DropdownMenuTrigger asChild>
                                            <Button type="button" variant="outline"><PlusCircle className="mr-2"/> Add Server</Button>
                                        </DropdownMenuTrigger>
                                        <DropdownMenuContent>
                                            {ServerTypes.map(type => (
                                                <DropdownMenuItem key={type} onSelect={() => handleOpenAddSsplServerDialog(type)}>
                                                    {type}
                                                </DropdownMenuItem>
                                            ))}
                                        </DropdownMenuContent>
                                    </DropdownMenu>
                                )}
                            </div>
                            <div className="space-y-4 mt-4">
                                {ssplServerFields.map((field, index) => (
                                    <Card key={field.id} className="bg-muted/30">
                                        <CardHeader className='flex-row items-center justify-between'>
                                            <div>
                                                <CardTitle className="text-base">{field.name}</CardTitle>
                                                <CardDescription>{field.type}</CardDescription>
                                            </div>
                                             {!isReadOnly && (
                                                <Button 
                                                    type="button" 
                                                    variant="ghost" 
                                                    size="icon"
                                                    onClick={() => removeSsplServer(index)}>
                                                    <Trash2 className="h-4 w-4 text-destructive" />
                                                </Button>
                                            )}
                                        </CardHeader>
                                        <CardContent className='space-y-4'>
                                            <div className="grid grid-cols-2 gap-4 text-sm">
                                                <p><span className="font-semibold">IP:</span> {field.ip}</p>
                                                <p><span className="font-semibold">OS:</span> {field.os}</p>
                                            </div>
                                            {field.software && field.software.length > 0 && (
                                                <div>
                                                    <h4 className='font-semibold text-sm mb-2'>Software:</h4>
                                                    <ul className='list-disc pl-5 text-sm space-y-1'>
                                                        {field.software.map((sw, swIndex) => (
                                                            <li key={swIndex}>{sw.name} ({sw.version})</li>
                                                        ))}
                                                    </ul>
                                                </div>
                                            )}
                                        </CardContent>
                                    </Card>
                                ))}
                                {form.formState.errors.ssplServers && <FormMessage>{form.formState.errors.ssplServers.message}</FormMessage>}
                            </div>
                        </>
                    )}


                    {serverType === 'client' && (
                        <>
                            <Separator className="my-8" />
                            <h3 className="text-lg font-semibold text-primary">Client Server Details</h3>
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mt-6">
                                <FormField
                                    control={form.control}
                                    name="clientServerContactPerson"
                                    render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Contact Person <span className="text-destructive">*</span></FormLabel>
                                        <FormControl>
                                        <Input placeholder="Enter contact person name" {...field} disabled={isReadOnly} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                    )}
                                />
                                <FormField
                                    control={form.control}
                                    name="clientServerContactNo"
                                    render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Contact No <span className="text-destructive">*</span></FormLabel>
                                        <FormControl>
                                        <Input placeholder="Enter contact number" {...field} disabled={isReadOnly} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                    )}
                                />
                                <FormField
                                    control={form.control}
                                    name="clientServerAlternateContactNo"
                                    render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Alternate Contact No</FormLabel>
                                        <FormControl>
                                        <Input placeholder="Enter alternate number" {...field} disabled={isReadOnly} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                    )}
                                />
                                <FormField
                                    control={form.control}
                                    name="clientServerEmail"
                                    render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Email ID <span className="text-destructive">*</span></FormLabel>
                                        <FormControl>
                                        <Input type="email" placeholder="Enter email address" {...field} disabled={isReadOnly} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                    )}
                                />
                                <FormField
                                    control={form.control}
                                    name="clientServerConnectionMode"
                                    render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Connection Mode <span className="text-destructive">*</span></FormLabel>
                                        <Select onValueChange={field.onChange} defaultValue={field.value} disabled={isReadOnly}>
                                        <FormControl>
                                            <SelectTrigger><SelectValue placeholder="Select a mode" /></SelectTrigger>
                                        </FormControl>
                                        <SelectContent>
                                            <SelectItem value="VPN">VPN</SelectItem>
                                            <SelectItem value="RDC">RDC</SelectItem>
                                            <SelectItem value="Team Viewer">Team Viewer</SelectItem>
                                            <SelectItem value="AnyDesk">AnyDesk</SelectItem>
                                            <SelectItem value="VNC">VNC</SelectItem>
                                            <SelectItem value="Any Other">Any Other</SelectItem>
                                        </SelectContent>
                                        </Select>
                                        <FormMessage />
                                    </FormItem>
                                    )}
                                />
                                {clientConnectionMode === 'Any Other' && (
                                    <FormField
                                        control={form.control}
                                        name="clientServerConnectionModeOther"
                                        render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Please Specify <span className="text-destructive">*</span></FormLabel>
                                            <FormControl>
                                            <Input placeholder="Specify connection mode" {...field} disabled={isReadOnly} />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                        )}
                                    />
                                )}
                                <FormField
                                    control={form.control}
                                    name="ipOrConnectionModeNo"
                                    render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>IP or Connection Mode NO <span className="text-destructive">*</span></FormLabel>
                                        <FormControl><Input placeholder="Enter IP or ID" {...field} disabled={isReadOnly} /></FormControl>
                                        <FormMessage />
                                    </FormItem>
                                    )}
                                />
                                <FormField
                                    control={form.control}
                                    name="userId"
                                    render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>User ID <span className="text-destructive">*</span></FormLabel>
                                        <FormControl><Input placeholder="Enter user ID" {...field} disabled={isReadOnly} /></FormControl>
                                        <FormMessage />
                                    </FormItem>
                                    )}
                                />
                                <FormField
                                    control={form.control}
                                    name="password"
                                    render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Password <span className="text-destructive">*</span></FormLabel>
                                        <FormControl><Input type="password" placeholder="Enter password" {...field} disabled={isReadOnly} /></FormControl>
                                        <FormMessage />
                                    </FormItem>
                                    )}
                                />
                                <FormField
                                    control={form.control}
                                    name="otherClientDetail"
                                    render={({ field }) => (
                                    <FormItem className="md:col-span-3">
                                        <FormLabel>Other Client Detail</FormLabel>
                                        <FormControl>
                                        <Textarea placeholder="Add any other client server details..." {...field} disabled={isReadOnly} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                    )}
                                />
                            </div>
                            
                            <Separator className="my-8" />
                            <div className="flex justify-between items-center">
                                <h3 className="text-lg font-semibold text-primary">Add Client Server Credentials</h3>
                                {!isReadOnly && (
                                     <DropdownMenu>
                                        <DropdownMenuTrigger asChild>
                                            <Button type="button" variant="outline"><PlusCircle className="mr-2"/> Add Server</Button>
                                        </DropdownMenuTrigger>
                                        <DropdownMenuContent>
                                            {ServerTypes.map(type => (
                                                <DropdownMenuItem key={type} onSelect={() => handleOpenAddClientServerDialog(type)}>
                                                    {type}
                                                </DropdownMenuItem>
                                            ))}
                                        </DropdownMenuContent>
                                    </DropdownMenu>
                                )}
                            </div>
                             <div className="space-y-4 mt-4">
                                {clientAppServerFields.map((field, index) => (
                                    <Card key={field.id} className="bg-muted/30">
                                        <CardHeader className='flex-row items-center justify-between'>
                                            <div>
                                                <CardTitle className="text-base">{field.name}</CardTitle>
                                                <CardDescription>{field.type}</CardDescription>
                                            </div>
                                             {!isReadOnly && (
                                                <Button 
                                                    type="button" 
                                                    variant="ghost" 
                                                    size="icon"
                                                    onClick={() => removeClientAppServer(index)}>
                                                    <Trash2 className="h-4 w-4 text-destructive" />
                                                </Button>
                                            )}
                                        </CardHeader>
                                        <CardContent className='space-y-4'>
                                            <div className="grid grid-cols-2 md:grid-cols-3 gap-4 text-sm">
                                                <p><span className="font-semibold">IP:</span> {field.ip}</p>
                                                <p><span className="font-semibold">OS:</span> {field.os}</p>
                                                <p><span className="font-semibold">Username:</span> {field.username}</p>
                                            </div>
                                            {field.software && field.software.length > 0 && (
                                                <div>
                                                    <h4 className='font-semibold text-sm mb-2'>Software:</h4>
                                                    <ul className='list-disc pl-5 text-sm space-y-1'>
                                                        {field.software.map((sw, swIndex) => (
                                                            <li key={swIndex}>{sw.name} ({sw.version})</li>
                                                        ))}
                                                    </ul>
                                                </div>
                                            )}
                                        </CardContent>
                                    </Card>
                                ))}
                                {form.formState.errors.clientAppServers && <FormMessage>{form.formState.errors.clientAppServers.message}</FormMessage>}
                            </div>
                        </>
                    )}
                    
                    <Separator className="my-8" />
                    <div className="space-y-6">
                        <div>
                            <div className="flex justify-between items-center mb-4">
                                <h3 className="text-lg font-semibold text-primary">Access Rights for Application Folders</h3>
                                {!isReadOnly && (
                                    <Button type="button" variant="outline" size="sm" onClick={() => appendAccessRight({ serverName: '', folderPath: '', groupOrUserName: [], permission: '' })}>
                                    <PlusCircle className="mr-2" /> Add Permission
                                    </Button>
                                )}
                            </div>
                            <div className="space-y-4">
                            {accessRightsFields.map((field, index) => (
                                <div key={field.id} className="grid grid-cols-1 md:grid-cols-4 items-start gap-4 p-4 border rounded-md relative">
                                    <FormField
                                        control={form.control}
                                        name={`accessRights.${index}.serverName`}
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>Server Name <span className="text-destructive">*</span></FormLabel>
                                                <Select onValueChange={field.onChange} defaultValue={field.value} disabled={isReadOnly}>
                                                <FormControl>
                                                    <SelectTrigger>
                                                    <SelectValue placeholder="Select server" />
                                                    </SelectTrigger>
                                                </FormControl>
                                                <SelectContent>
                                                    {addedServerNames.map(name => <SelectItem key={name} value={name}>{name}</SelectItem>)}
                                                </SelectContent>
                                                </Select>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />
                                    <FormField
                                        control={form.control}
                                        name={`accessRights.${index}.folderPath`}
                                        render={({ field }) => (
                                            <FormItem>
                                            <FormLabel>Folder Path <span className="text-destructive">*</span></FormLabel>
                                            <FormControl>
                                                <Input placeholder="e.g., Web/ErrorHandler" {...field} disabled={isReadOnly} />
                                            </FormControl>
                                            <FormMessage />
                                            </FormItem>
                                        )}
                                    />
                                    <FormField
                                        control={form.control}
                                        name={`accessRights.${index}.groupOrUserName`}
                                        render={({ field }) => (
                                            <FormItem>
                                            <FormLabel>Group or User Name <span className="text-destructive">*</span></FormLabel>
                                            <MultiSelect
                                                options={groupOrUserNames}
                                                selected={field.value}
                                                onChange={field.onChange}
                                                disabled={isReadOnly}
                                                className="w-full"
                                                placeholder="Select users/groups..."
                                            />
                                            <FormMessage />
                                            </FormItem>
                                        )}
                                    />
                                    <FormField
                                        control={form.control}
                                        name={`accessRights.${index}.permission`}
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>Permission <span className="text-destructive">*</span></FormLabel>
                                                <Select onValueChange={field.onChange} defaultValue={field.value} disabled={isReadOnly}>
                                                <FormControl>
                                                    <SelectTrigger>
                                                    <SelectValue placeholder="Select permission" />
                                                    </SelectTrigger>
                                                </FormControl>
                                                <SelectContent>
                                                    {permissions.map(p => <SelectItem key={p} value={p}>{p}</SelectItem>)}
                                                </SelectContent>
                                                </Select>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />
                                    {!isReadOnly && (
                                        <Button type="button" variant="ghost" size="icon" className="absolute top-2 right-2" onClick={() => removeAccessRight(index)}>
                                            <Trash2 className="h-4 w-4 text-destructive" />
                                        </Button>
                                    )}
                                </div>
                            ))}
                            </div>
                        </div>

                        <div className="space-y-4">
                            <div className="flex justify-between items-center mb-4">
                                <h3 className="text-lg font-semibold text-primary">Package & URL Configuration</h3>
                                {!isReadOnly && (
                                    <Button type="button" variant="outline" size="sm" onClick={() => setIsAppUrlOpen(true)}>
                                    <PlusCircle className="mr-2" /> Add Application URL
                                    </Button>
                                )}
                            </div>
                            <div className="space-y-4">
                                {appUrlFields.map((field, index) => (
                                    <Card key={field.id} className="bg-muted/30">
                                        <CardHeader className='flex-row items-center justify-between'>
                                            <div>
                                                <CardTitle className="text-base">{field.applicationUrl}</CardTitle>
                                                <CardDescription>
                                                    {field.isClientDomain === 'Yes' ? `Client Domain: ${field.domainName}` : 'SSPL Domain'}
                                                    {` | HTTPS: ${field.isHttpsRequired}`}
                                                </CardDescription>
                                            </div>
                                             {!isReadOnly && (
                                                <Button 
                                                    type="button" 
                                                    variant="ghost" 
                                                    size="icon"
                                                    onClick={() => removeAppUrl(index)}>
                                                    <Trash2 className="h-4 w-4 text-destructive" />
                                                </Button>
                                            )}
                                        </CardHeader>
                                    </Card>
                                ))}
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4">
                                <FormField
                                    control={form.control}
                                    name="packageLocationApp"
                                    render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Application Package Location <span className="text-destructive">*</span></FormLabel>
                                        <FormControl>
                                        <Textarea placeholder="Enter path for application package" {...field} disabled={isReadOnly} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                    )}
                                />
                                <FormField
                                    control={form.control}
                                    name="packageLocationDb"
                                    render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Database Package Location <span className="text-destructive">*</span></FormLabel>
                                        <FormControl>
                                        <Textarea placeholder="Enter path for database package" {...field} disabled={isReadOnly} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                    )}
                                />
                            </div>
                        </div>

                        <FormField
                            control={form.control}
                            name="finalRemarks"
                            render={({ field }) => (
                            <FormItem>
                                <FormLabel>Final Remarks</FormLabel>
                                <FormControl>
                                <Textarea placeholder="Enter any final remarks for the entire IQ Checklist Request" {...field} disabled={isReadOnly} />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                            )}
                        />
                    </div>
                </div>
                {mode !== 'view' && (
                     <CardFooter className="flex justify-between border-t pt-6 mt-8">
                        <Button variant="outline" type="button" onClick={handleCancel}>
                            <ArrowLeft className="mr-2 h-4 w-4" />
                            Cancel
                        </Button>
                        <div className="flex gap-4">
                            {mode === 'add' && (
                                <Button type="button" onClick={form.handleSubmit(onFormSubmit('save'))}>
                                    <Save className="mr-2 h-4 w-4" />
                                    Save as Draft
                                </Button>
                            )}
                             {mode === 'edit' && initialData?.status === 'Draft' && (
                                <Button type="button" onClick={form.handleSubmit(onFormSubmit('save'))}>
                                    <Save className="mr-2 h-4 w-4" />
                                    Save Draft
                                </Button>
                            )}
                            {(mode === 'edit' || mode === 'add') && (
                                <Button type="button" onClick={form.handleSubmit(onFormSubmit('send'))}>
                                    <Send className="mr-2 h-4 w-4" />
                                    {initialData?.status === 'Send Back' ? 'Re-submit for Approval' : 'Save & Send for Approval'}
                                </Button>
                            )}
                        </div>
                    </CardFooter>
                )}
            </form>
        </Form>
        </>
  );
}


export function IQRequiredForm({ mode, initialData, onSubmit, onClose }: IQRequiredFormProps) {
    if (mode === 'add') {
        return (
             <IQRequiredFormContent mode={mode} initialData={initialData} onSubmit={onSubmit} onClose={onClose} />
        )
    }
    
    return (
        <DialogContent className="max-w-4xl p-0">
            <DialogHeader className="p-6 pb-0">
                <DialogTitle>
                    {mode === 'edit' ? 'Edit IQ Checklist Request' : 'Review IQ Checklist Request'}
                </DialogTitle>
                <DialogDescription>
                    {mode === 'edit' ? 'View and edit the details of your IQ Checklist Request.' : 'Review the details below.'}
                </DialogDescription>
            </DialogHeader>
            <div className="max-h-[65vh] overflow-y-auto px-6">
                 <IQRequiredFormContent mode={mode} initialData={initialData} onSubmit={onSubmit} onClose={onClose} />
            </div>
        </DialogContent>
    );
}
