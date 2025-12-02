
'use client';

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
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
import { useForm, useFieldArray } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useEffect } from 'react';
import { PlusCircle, Trash2 } from 'lucide-react';
import { Checkbox } from './ui/checkbox';
import { ClientAppServerDetail, softwareSchema } from './IQRequiredForm';

const softwareList = [
    { id: 'sql-server', label: 'Microsoft SQL Server' },
    { id: 'ssms', label: 'Microsoft SQL Server Management Studio' },
    { id: 'iis', label: 'Web Server IIS' },
    { id: 'dotnet', label: '.NET Framework' },
    { id: 'crystal', label: 'Crystal Report Re-Distributable Package' },
    { id: 'ms-access-db', label: 'Microsoft Access Database Engine' },
    { id: 'ms-chart', label: 'Microsoft Chart Controls' },
    { id: 'chrome', label: 'Google Chrome Browser' },
    { id: 'firefox', label: 'Mozilla Firefox Browser' },
    { id: 'acrobat', label: 'Adobe Acrobat PDF Reader' },
    { id: 'jdk', label: 'Java JDK' },
    { id: 'open-office', label: 'Open Office' },
    { id: 'tomcat', label: 'Tomcat' },
];

const otherSoftwareSchema = z.object({
  name: z.string().min(1, 'Software name is required'),
  version: z.string().min(1, 'Version is required'),
});

const formSchema = z.object({
  type: z.string(),
  name: z.string().min(1, 'Server name is required'),
  ip: z.string().min(1, "IP Address is required."),
  os: z.string().min(1, "OS is required."),
  username: z.string().min(1, "Username is required."),
  password: z.string().min(1, "Password is required."),
  selectedSoftware: z.array(z.string()),
  softwareVersions: z.record(z.string()),
  otherSoftware: z.array(otherSoftwareSchema),
});

type FormValues = z.infer<typeof formSchema>;

interface AddClientServerDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (serverData: ClientAppServerDetail) => void;
  serverType: string;
}

const initialSoftwareVersions = softwareList.reduce((acc, software) => {
  acc[software.id] = '';
  return acc;
}, {} as Record<string, string>);

export function AddClientServerDialog({ isOpen, onClose, onSave, serverType }: AddClientServerDialogProps) {
  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      type: serverType,
      name: '',
      ip: '',
      os: '',
      username: '',
      password: '',
      selectedSoftware: [],
      softwareVersions: initialSoftwareVersions,
      otherSoftware: [],
    },
  });

  const { fields: otherSoftwareFields, append, remove } = useFieldArray({
    control: form.control,
    name: 'otherSoftware',
  });

  useEffect(() => {
    if (isOpen) {
      form.reset({
        type: serverType,
        name: '',
        ip: '',
        os: '',
        username: '',
        password: '',
        selectedSoftware: [],
        softwareVersions: initialSoftwareVersions,
        otherSoftware: [],
      });
    }
  }, [serverType, form, isOpen]);

  const onSubmit = (values: FormValues) => {
    const software = values.selectedSoftware.map(id => ({
        name: softwareList.find(s => s.id === id)?.label || '',
        version: values.softwareVersions[id] || '',
    }));

    const allSoftware = [...software, ...values.otherSoftware];

    onSave({
      type: values.type,
      name: values.name,
      ip: values.ip,
      os: values.os,
      username: values.username,
      password: values.password,
      software: allSoftware,
    });
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Add Client Server Details</DialogTitle>
          <DialogDescription>
            Manually enter the server credentials and specify required software.
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6 max-h-[70vh] overflow-y-auto p-1">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                    control={form.control}
                    name="type"
                    render={({ field }) => (
                        <FormItem>
                        <FormLabel>Server Type</FormLabel>
                        <FormControl>
                            <Input {...field} disabled />
                        </FormControl>
                        <FormMessage />
                        </FormItem>
                    )}
                />
                <FormField control={form.control} name="name" render={({ field }) => (<FormItem><FormLabel>Server Name</FormLabel><FormControl><Input placeholder="Server Name" {...field} /></FormControl><FormMessage /></FormItem>)} />
                <FormField control={form.control} name="ip" render={({ field }) => (<FormItem><FormLabel>IP Address</FormLabel><FormControl><Input placeholder="IP Address" {...field} /></FormControl><FormMessage /></FormItem>)} />
                <FormField control={form.control} name="os" render={({ field }) => (<FormItem><FormLabel>OS</FormLabel><FormControl><Input placeholder="Operating System" {...field} /></FormControl><FormMessage /></FormItem>)} />
                <FormField control={form.control} name="username" render={({ field }) => (<FormItem><FormLabel>Username</FormLabel><FormControl><Input placeholder="Username" {...field} /></FormControl><FormMessage /></FormItem>)} />
                <FormField control={form.control} name="password" render={({ field }) => (<FormItem><FormLabel>Password</FormLabel><FormControl><Input type="password" placeholder="Password" {...field} /></FormControl><FormMessage /></FormItem>)} />
            </div>
            
            <div>
              <h3 className="text-lg font-medium">Software Details</h3>
              <FormField
                control={form.control}
                name="selectedSoftware"
                render={() => (
                  <FormItem>
                    {softwareList.map((item) => (
                      <FormField
                        key={item.id}
                        control={form.control}
                        name="selectedSoftware"
                        render={({ field }) => {
                          const isChecked = field.value?.includes(item.id);
                          return (
                            <div className='flex items-center gap-4 mt-2'>
                              <FormItem key={item.id} className="flex items-center space-x-2 space-y-0 flex-1">
                                <FormControl>
                                  <Checkbox
                                    checked={isChecked}
                                    onCheckedChange={(checked) => {
                                      return checked
                                        ? field.onChange([...(field.value || []), item.id])
                                        : field.onChange(
                                            (field.value || []).filter(
                                              (value) => value !== item.id
                                            )
                                          )
                                    }}
                                  />
                                </FormControl>
                                <FormLabel className="font-normal w-80">
                                  {item.label}
                                </FormLabel>
                              </FormItem>
                              {isChecked && (
                                <FormField
                                    control={form.control}
                                    name={`softwareVersions.${item.id}`}
                                    render={({ field }) => (
                                        <FormItem className='flex-1'>
                                            <FormControl>
                                                <Input placeholder='Software Version' {...field} />
                                            </FormControl>
                                        </FormItem>
                                    )}
                                />
                              )}
                            </div>
                          )
                        }}
                      />
                    ))}
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            
            <div>
                <div className="flex justify-between items-center mb-2">
                    <h3 className="text-lg font-medium">Other Software</h3>
                    <Button type="button" size="sm" variant="outline" onClick={() => append({ name: '', version: '' })}>
                        <PlusCircle className="mr-2 h-4 w-4" />
                        Add Software
                    </Button>
                </div>
                <div className='space-y-4'>
                    {otherSoftwareFields.map((field, index) => (
                        <div key={field.id} className='flex items-end gap-4 p-4 border rounded-md relative'>
                            <FormField
                                control={form.control}
                                name={`otherSoftware.${index}.name`}
                                render={({ field }) => (
                                    <FormItem className='flex-1'>
                                        <FormLabel>Software Name</FormLabel>
                                        <FormControl><Input placeholder='e.g., Custom Tool' {...field} /></FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                            <FormField
                                control={form.control}
                                name={`otherSoftware.${index}.version`}
                                render={({ field }) => (
                                    <FormItem className='flex-1'>
                                        <FormLabel>Version</FormLabel>
                                        <FormControl><Input placeholder='e.g., 2.1.0' {...field} /></FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                             <Button
                                type="button"
                                variant="destructive"
                                size="icon"
                                className="absolute -top-3 -right-3"
                                onClick={() => remove(index)}
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                        </div>
                    ))}
                </div>
            </div>

            <DialogFooter>
              <Button type="button" variant="secondary" onClick={onClose}>
                Cancel
              </Button>
              <Button type="submit">Add Server</Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
