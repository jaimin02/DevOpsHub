
'use client';

import {
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  DialogClose,
} from '@/components/ui/dialog';
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
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { cn } from '@/lib/utils';
import { CalendarIcon } from 'lucide-react';
import { format } from 'date-fns';
import type { Server } from '@/app/inventory/page';
import { useEffect } from 'react';
import { infraData, locations, osData, antivirusData, providers } from '@/lib/data';
import { Separator } from './ui/separator';

interface ServerInventoryFormProps {
  onClose: () => void;
  onSubmit: (values: Server) => void;
  initialData?: Server;
  mode: 'add' | 'edit';
}

const createFormSchema = () => {
    let schemaShape: z.ZodRawShape = {
    recordNo: z.number().optional(),
    privateIp: z.string().ip({ version: 'v4', message: 'Invalid IPv4 address' }),
    publicIp: z.string().ip({ version: 'v4', message: 'Invalid IPv4 address' }).optional().or(z.literal('')),
    serverName: z.string()
      .min(3, 'Server name must be at least 3 characters long')
      .max(50, 'Server name must be at most 50 characters long')
      .regex(/^[a-zA-Z0-9-]+$/, 'Server name can only contain letters, numbers, and hyphens.'),
    serverInfrastructure: z.string().min(1, 'Server infrastructure is required'),
    serverLocation: z.string().min(1, 'Location is required'),
    serverOs: z.string().min(1, 'OS is required'),
    isOsRented: z.enum(['Yes', 'No'], { required_error: 'You must select an option.' }),
    ramValue: z.string().regex(/^\d+$/, { message: "RAM value must be a number." }),
    ramUnit: z.enum(['MB', 'GB', 'TB']),
    core: z.string().regex(/^\d+$/, { message: "Core count must be a number." }),
    antivirus: z.string().min(1, 'AntiVirus is required'),
    ri: z.enum(['Yes', 'No']),
    riStartDate: z.date().optional(),
    riEndDate: z.date().optional(),
    database: z.enum(['Yes', 'No']),
    databaseType: z.string().optional(),
    serverType: z.string().min(1, 'Server type is required'),
    cActive: z.enum(['Y', 'N'], { required_error: 'Status is required.' }),
  };

  const baseSchema = z.object(schemaShape);

  return baseSchema.superRefine((data, ctx) => {
    if (data.database === 'Yes' && (!data.databaseType || data.databaseType === 'N/A')) {
        ctx.addIssue({
            code: z.ZodIssueCode.custom,
            message: "Database type is required when database is set to 'Yes'",
            path: ['databaseType'],
        });
    }
    if (data.ri === 'Yes') {
        if (!data.riStartDate) {
            ctx.addIssue({
                code: z.ZodIssueCode.custom,
                message: 'RI Start date is required.',
                path: ['riStartDate'],
            });
        }
        if (!data.riEndDate) {
            ctx.addIssue({
                code: z.ZodIssueCode.custom,
                message: 'RI End date is required.',
                path: ['riEndDate'],
            });
        }
        if (data.riStartDate && data.riEndDate && data.riEndDate <= data.riStartDate) {
            ctx.addIssue({
                code: z.ZodIssueCode.custom,
                message: "RI End date must be after the start date.",
                path: ['riEndDate'],
            });
        }
    }
  });
};


// Infer the type from the schema, but then use the imported Server type
type FormValues = z.infer<ReturnType<typeof createFormSchema>>;


export function ServerInventoryForm({ onClose, onSubmit, initialData, mode }: ServerInventoryFormProps) {
  const formSchema = createFormSchema();
  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
  });
  
  useEffect(() => {
    let data;
    const parseRam = (ramString?: string) => {
        if (!ramString) return { ramValue: '', ramUnit: 'GB' as const };
        const match = ramString.match(/(\d+)\s*(MB|GB|TB)/i);
        if (match) {
            return { ramValue: match[1], ramUnit: match[2].toUpperCase() as 'MB' | 'GB' | 'TB' };
        }
        return { ramValue: ramString.replace(/[^0-9]/g, ''), ramUnit: 'GB' as const };
    };

    if (mode === 'edit' && initialData) {
      const { ramValue, ramUnit } = parseRam(initialData.ram);
      data = {
        ...initialData,
        riStartDate: initialData.riStartDate ? new Date(initialData.riStartDate) : undefined,
        riEndDate: initialData.riEndDate ? new Date(initialData.riEndDate) : undefined,
        ramValue,
        ramUnit,
      };
    } else { // mode === 'add'
      data = {
        privateIp: '',
        publicIp: '',
        serverName: '',
        serverInfrastructure: '',
        serverLocation: '',
        serverOs: '',
        isOsRented: 'No' as const,
        ramValue: '',
        ramUnit: 'GB' as const,
        core: '',
        antivirus: '',
        ri: 'No' as const,
        database: 'No' as const,
        databaseType: 'N/A',
        serverType: '',
        cActive: 'Y' as const,
      };
    }
    form.reset(data as FormValues);
  }, [initialData, form, mode]);

  const handleFormSubmit = (values: FormValues) => {
    const submissionValues: Server = {
      ...(values as any),
      ram: `${values.ramValue}${values.ramUnit}`,
      riStartDate: values.ri === 'Yes' ? values.riStartDate : undefined,
      riEndDate: values.ri === 'Yes' ? values.riEndDate : undefined,
      dModifiedOn: new Date().toISOString(),
      vUserName: initialData?.vUserName || 'Admin', // Keep existing user or default
    };
    onSubmit(submissionValues);
  };
  
  const databaseValue = form.watch('database');
  const riValue = form.watch('ri');


  return (
    <DialogContent className="max-w-4xl">
      <DialogHeader>
        <DialogTitle>{mode === 'add' ? 'Add New Server' : 'Edit Server Details'}</DialogTitle>
        <DialogDescription>
          Fill in the details below to {mode} a server.
        </DialogDescription>
      </DialogHeader>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(handleFormSubmit)} className="max-h-[70vh] overflow-y-auto p-1 pr-4">
          <div className="space-y-6">
            
            <div>
              <h3 className="text-lg font-semibold mb-4 text-primary">Core Details</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                <FormField
                  control={form.control}
                  name="serverName"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Server Name <span className="text-destructive">*</span></FormLabel>
                      <FormControl>
                        <Input placeholder="e.g., web-prod-02" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="privateIp"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Private IP <span className="text-destructive">*</span></FormLabel>
                      <FormControl>
                        <Input placeholder="e.g., 10.0.1.16" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="publicIp"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Public IP</FormLabel>
                      <FormControl>
                        <Input placeholder="e.g., 54.123.45.68" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </div>

            <Separator />

            <div>
              <h3 className="text-lg font-semibold mb-4 text-primary">Infrastructure & OS</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                <FormField
                  control={form.control}
                  name="serverInfrastructure"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Server Infrastructure <span className="text-destructive">*</span></FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select infrastructure" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {infraData.map(infra => (
                            <SelectItem key={infra.nInfraNum} value={infra.vInfraName}>{infra.vInfraName}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="serverLocation"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Location <span className="text-destructive">*</span></FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select a location" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {locations.map(loc => <SelectItem key={loc.nLocationNo} value={loc.vLocationName}>{loc.vLocationName}</SelectItem>)}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="serverOs"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Operating System <span className="text-destructive">*</span></FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select an OS" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {osData.map(os => <SelectItem key={os.nOSNo} value={os.vOSName}>{os.vOSName}</SelectItem>)}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="isOsRented"
                  render={({ field }) => (
                    <FormItem className="space-y-3 pt-2">
                      <FormLabel>Is OS Rented? <span className="text-destructive">*</span></FormLabel>
                      <FormControl>
                        <RadioGroup
                          onValueChange={field.onChange}
                          defaultValue={field.value}
                          className="flex items-center space-x-4 pt-2"
                        >
                          <FormItem className="flex items-center space-x-2 space-y-0">
                            <FormControl>
                              <RadioGroupItem value="Yes" />
                            </FormControl>
                            <FormLabel className="font-normal">Yes</FormLabel>
                          </FormItem>
                          <FormItem className="flex items-center space-x-2 space-y-0">
                            <FormControl>
                              <RadioGroupItem value="No" />
                            </FormControl>
                            <FormLabel className="font-normal">No</FormLabel>
                          </FormItem>
                        </RadioGroup>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </div>

            <Separator />
            
            <div>
              <h3 className="text-lg font-semibold mb-4 text-primary">Specifications</h3>
               <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  <div className="flex gap-2">
                    <FormField
                      control={form.control}
                      name="ramValue"
                      render={({ field }) => (
                        <FormItem className="flex-1">
                          <FormLabel>RAM <span className="text-destructive">*</span></FormLabel>
                          <FormControl>
                            <Input placeholder="e.g., 16" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="ramUnit"
                      render={({ field }) => (
                        <FormItem className="flex-none w-[80px] self-end">
                           <Select onValueChange={field.onChange} defaultValue={field.value}>
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value="MB">MB</SelectItem>
                              <SelectItem value="GB">GB</SelectItem>
                              <SelectItem value="TB">TB</SelectItem>
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                  <FormField
                    control={form.control}
                    name="core"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Core Count <span className="text-destructive">*</span></FormLabel>
                        <FormControl>
                          <Input placeholder="e.g., 8" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="antivirus"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>AntiVirus <span className="text-destructive">*</span></FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select an antivirus" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                             {antivirusData.map(av => <SelectItem key={av.nAntivirusNo} value={av.vAntivirusName}>{av.vAntivirusName}</SelectItem>)}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
              </div>
            </div>

             <Separator />

             <div>
                <h3 className="text-lg font-semibold mb-4 text-primary">Database</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    <FormField
                      control={form.control}
                      name="database"
                      render={({ field }) => (
                        <FormItem className="space-y-3 pt-2">
                          <FormLabel>Database Present? <span className="text-destructive">*</span></FormLabel>
                          <FormControl>
                            <RadioGroup
                              onValueChange={field.onChange}
                              defaultValue={field.value}
                              className="flex items-center space-x-4 pt-2"
                            >
                              <FormItem className="flex items-center space-x-2 space-y-0">
                                <FormControl>
                                  <RadioGroupItem value="Yes" />
                                </FormControl>
                                <FormLabel className="font-normal">Yes</FormLabel>
                              </FormItem>
                              <FormItem className="flex items-center space-x-2 space-y-0">
                                <FormControl>
                                  <RadioGroupItem value="No" />
                                </FormControl>
                                <FormLabel className="font-normal">No</FormLabel>
                              </FormItem>
                            </RadioGroup>
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    {databaseValue === 'Yes' && (
                      <FormField
                        control={form.control}
                        name="databaseType"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Database Type <span className="text-destructive">*</span></FormLabel>
                            <Select onValueChange={field.onChange} defaultValue={field.value}>
                              <FormControl>
                                <SelectTrigger>
                                  <SelectValue placeholder="Select DB Type" />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                 {providers.map(p => <SelectItem key={p.nDBProviderNo} value={p.vDBProviderName}>{p.vDBProviderName}</SelectItem>)}
                              </SelectContent>
                            </Select>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    )}
                </div>
             </div>

            <Separator />
            
             <div>
                <h3 className="text-lg font-semibold mb-4 text-primary">Configuration</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                     <FormField
                      control={form.control}
                      name="ri"
                      render={({ field }) => (
                        <FormItem className="space-y-3 pt-2">
                          <FormLabel>Reserved Instance (RI)? <span className="text-destructive">*</span></FormLabel>
                          <FormControl>
                            <RadioGroup
                              onValueChange={field.onChange}
                              defaultValue={field.value}
                              className="flex items-center space-x-4 pt-2"
                            >
                              <FormItem className="flex items-center space-x-2 space-y-0">
                                <FormControl>
                                  <RadioGroupItem value="Yes" />
                                </FormControl>
                                <FormLabel className="font-normal">Yes</FormLabel>
                              </FormItem>
                              <FormItem className="flex items-center space-x-2 space-y-0">
                                <FormControl>
                                  <RadioGroupItem value="No" />
                                </FormControl>
                                <FormLabel className="font-normal">No</FormLabel>
                              </FormItem>
                            </RadioGroup>
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    {riValue === 'Yes' && (
                      <>
                        <FormField
                          control={form.control}
                          name="riStartDate"
                          render={({ field }) => (
                            <FormItem className="flex flex-col">
                              <FormLabel>RI Start Date <span className="text-destructive">*</span></FormLabel>
                              <Popover>
                                <PopoverTrigger asChild>
                                  <FormControl>
                                    <Button
                                      variant={"outline"}
                                      className={cn(
                                        "w-full pl-3 text-left font-normal",
                                        !field.value && "text-muted-foreground"
                                      )}
                                    >
                                      {field.value ? (
                                        format(field.value, "PPP")
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
                          )}
                        />
                        <FormField
                          control={form.control}
                          name="riEndDate"
                          render={({ field }) => (
                            <FormItem className="flex flex-col">
                              <FormLabel>RI End Date <span className="text-destructive">*</span></FormLabel>
                              <Popover>
                                <PopoverTrigger asChild>
                                  <FormControl>
                                    <Button
                                      variant={"outline"}
                                      className={cn(
                                        "w-full pl-3 text-left font-normal",
                                        !field.value && "text-muted-foreground"
                                      )}
                                    >
                                      {field.value ? (
                                        format(field.value, "PPP")
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
                          )}
                        />
                      </>
                    )}
                    <FormField
                      control={form.control}
                      name="serverType"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Server Type <span className="text-destructive">*</span></FormLabel>
                          <Select onValueChange={field.onChange} defaultValue={field.value}>
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Select server type" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value="Business">Business</SelectItem>
                              <SelectItem value="Prevalidated">Prevalidated</SelectItem>
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="cActive"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Active <span className="text-destructive">*</span></FormLabel>
                          <Select onValueChange={field.onChange} defaultValue={field.value}>
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Select status" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value="Y">Y</SelectItem>
                              <SelectItem value="N">N</SelectItem>
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                </div>
            </div>
          </div>
          <DialogFooter className="pt-8">
            <DialogClose asChild>
              <Button type="button" variant="secondary" onClick={onClose}>
                Cancel
              </Button>
            </DialogClose>
            <Button type="submit">Save Server</Button>
          </DialogFooter>
        </form>
      </Form>
    </DialogContent>
  );
}

    
