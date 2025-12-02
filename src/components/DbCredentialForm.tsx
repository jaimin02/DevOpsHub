
'use client';

import { useEffect } from 'react';
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
import { Textarea } from './ui/textarea';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { initialServers, DbCredential } from '@/lib/data';

interface DbCredentialFormProps {
  mode: 'add' | 'edit';
  initialData?: DbCredential;
  onClose: () => void;
  onSubmit: (values: DbCredential, remark?: string) => void;
}

const createFormSchema = (mode: 'add' | 'edit') => {
    let schemaObject: any = {
        serverName: z.string().min(1, 'Server selection is required.'),
        ipAddress: z.string(),
        os: z.string(),
        dbName: z.string().min(1, 'Database name is required.'),
        dbUserName: z.string().min(1, 'Database username is required.'),
        dbPassword: z.string().min(1, 'Database password is required.'),
    };

    if (mode === 'edit') {
        schemaObject.remark = z.string().min(1, 'A remark is required for this change.');
    }
    
    return z.object(schemaObject);
};

export function DbCredentialForm({ mode, initialData, onClose, onSubmit }: DbCredentialFormProps) {
  const formSchema = createFormSchema(mode);
  type FormValues = z.infer<typeof formSchema>;

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: mode === 'add' ? {
        serverName: '',
        ipAddress: '',
        os: '',
        dbName: '',
        dbUserName: '',
        dbPassword: '',
    } : initialData,
  });

  const selectedServerName = form.watch('serverName');

  useEffect(() => {
    if (mode === 'edit' && initialData) {
      form.reset({ ...initialData, remark: '' });
    } else if (mode === 'add') {
      form.reset({
        serverName: '',
        ipAddress: '',
        os: '',
        dbName: '',
        dbUserName: '',
        dbPassword: '',
      });
    }
  }, [mode, initialData, form]);

  useEffect(() => {
    if (selectedServerName) {
      const server = initialServers.find(s => s.serverName === selectedServerName);
      if (server) {
        form.setValue('ipAddress', server.privateIp);
        form.setValue('os', server.serverOs);
      }
    } else {
        form.setValue('ipAddress', '');
        form.setValue('os', '');
    }
  }, [selectedServerName, form]);


  const handleFormSubmit = (values: FormValues) => {
    onSubmit(values as DbCredential, (values as any).remark);
    onClose();
  };

  return (
    <DialogContent className="sm:max-w-2xl">
      <DialogHeader>
        <DialogTitle>{mode === 'add' ? 'Add New' : 'Edit'} DB Credential</DialogTitle>
        <DialogDescription>
          Fill in the details for the database credential.
        </DialogDescription>
      </DialogHeader>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(handleFormSubmit)} className="space-y-4 py-4 max-h-[70vh] overflow-y-auto p-1">
            <div className="grid grid-cols-2 gap-4">
                 <FormField
                    control={form.control}
                    name="serverName"
                    render={({ field }) => (
                        <FormItem>
                        <FormLabel>Server <span className="text-destructive">*</span></FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value} disabled={mode === 'edit'}>
                            <FormControl>
                            <SelectTrigger>
                                <SelectValue placeholder="Select a server" />
                            </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                            {initialServers.map((server) => (
                                <SelectItem key={server.serverName} value={server.serverName}>
                                {server.serverName}
                                </SelectItem>
                            ))}
                            </SelectContent>
                        </Select>
                        <FormMessage />
                        </FormItem>
                    )}
                />
                 <FormField
                    control={form.control}
                    name="ipAddress"
                    render={({ field }) => (
                    <FormItem>
                        <FormLabel>IP Address</FormLabel>
                        <FormControl>
                        <Input {...field} disabled />
                        </FormControl>
                    </FormItem>
                    )}
                />
                <FormField
                    control={form.control}
                    name="os"
                    render={({ field }) => (
                    <FormItem>
                        <FormLabel>Operating System</FormLabel>
                        <FormControl>
                        <Input {...field} disabled />
                        </FormControl>
                    </FormItem>
                    )}
                />
                 <FormField
                    control={form.control}
                    name="dbName"
                    render={({ field }) => (
                    <FormItem>
                        <FormLabel>Database Name <span className="text-destructive">*</span></FormLabel>
                        <FormControl>
                        <Input placeholder="Enter database name" {...field} />
                        </FormControl>
                        <FormMessage />
                    </FormItem>
                    )}
                />
                <FormField
                    control={form.control}
                    name="dbUserName"
                    render={({ field }) => (
                    <FormItem>
                        <FormLabel>Database User Name <span className="text-destructive">*</span></FormLabel>
                        <FormControl>
                        <Input placeholder="Enter username" {...field} />
                        </FormControl>
                        <FormMessage />
                    </FormItem>
                    )}
                />
                 <FormField
                    control={form.control}
                    name="dbPassword"
                    render={({ field }) => (
                    <FormItem>
                        <FormLabel>Database Password <span className="text-destructive">*</span></FormLabel>
                        <FormControl>
                        <Input type="password" placeholder="••••••••" {...field} />
                        </FormControl>
                        <FormMessage />
                    </FormItem>
                    )}
                />
            </div>
            
          {mode === 'edit' && (
            <FormField
              control={form.control}
              name="remark"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Modification Remark <span className="text-destructive">*</span></FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Provide a reason for this change."
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          )}

          <DialogFooter>
            <DialogClose asChild>
              <Button type="button" variant="secondary" onClick={onClose}>
                Cancel
              </Button>
            </DialogClose>
            <Button type="submit">Save Credential</Button>
          </DialogFooter>
        </form>
      </Form>
    </DialogContent>
  );
}
