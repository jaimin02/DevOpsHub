
'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useForm, useFieldArray } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { initialServerPortData, initialServers } from '@/lib/data';
import { ArrowLeft, PlusCircle, Save, Trash2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import type { PortRule } from '@/components/PortRuleForm';
import type { Server } from '@/app/inventory/page';
import { usePortRules } from '@/context/PortRuleProvider';

const ruleSchema = z.object({
  ruleName: z.string().min(1, 'Rule name is required'),
  rule: z.enum(['Allowed', 'Denied']),
  ruleType: z.enum(['Inbound', 'Outbound']),
  port: z.string().min(1, 'Port is required'),
  protocol: z.string().min(1, 'Protocol is required'),
  source: z.string().min(1, 'Source IP is required'),
  status: z.enum(['Y', 'N']),
});

const formSchema = z.object({
  serverName: z.string().min(1, 'You must select a server.'),
  rules: z.array(ruleSchema).min(1, 'You must add at least one rule.'),
});

type FormValues = z.infer<typeof formSchema>;

export default function AddServerRulesPage() {
  const router = useRouter();
  const { toast } = useToast();
  const [allServers, setAllServers] = useState<Server[]>([]);
  const { serverData, setServerData } = usePortRules();

  useEffect(() => {
    const storedServers = sessionStorage.getItem('allServers');
    if (storedServers) {
        setAllServers(JSON.parse(storedServers));
    } else {
        setAllServers(initialServers);
    }
  }, []);
  
  const configuredServers = serverData.map(s => s.serverName);
  const availableServers = allServers.filter(s => !configuredServers.includes(s.serverName));

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      serverName: '',
      rules: [],
    },
  });

  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: 'rules',
  });

  const onSubmit = (values: FormValues) => {
    const serverToAdd = allServers.find(s => s.serverName === values.serverName);
    if (!serverToAdd) {
        toast({ variant: "destructive", title: "Server not found" });
        return;
    }
    
    const ruleNames = values.rules.map(r => r.ruleName.toLowerCase());
    if (new Set(ruleNames).size !== ruleNames.length) {
        toast({ variant: "destructive", title: "Duplicate Rule Name", description: "Rule names must be unique within this submission." });
        return;
    }

    const newServerEntry = {
        serverName: serverToAdd.serverName,
        publicIp: serverToAdd.publicIp,
        rules: values.rules.map(r => ({ ...r, dModifiedOn: new Date().toISOString(), vUserName: 'Admin' }))
    };

    setServerData([...serverData, newServerEntry]);
    
    toast({
        title: "Server and Rules Added",
        description: `Successfully added ${values.serverName} with ${values.rules.length} rule(s) to Port Management.`
    });
    
    router.push('/port-management');
  };

  return (
    <Card>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)}>
          <CardHeader>
            <CardTitle>Add Server to Port Management</CardTitle>
            <CardDescription>
              Select a server that is not yet configured and add its initial port rules.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-8">
            <FormField
              control={form.control}
              name="serverName"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Select Server <span className="text-destructive">*</span></FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger className="max-w-md">
                        <SelectValue placeholder="Select an unconfigured server..." />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {availableServers.map((server) => (
                        <SelectItem key={server.recordNo} value={server.serverName}>
                          {server.serverName} ({server.publicIp})
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="space-y-4">
              <div className='flex justify-between items-center'>
                <h3 className="text-lg font-medium">Rules</h3>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => append({ ruleName: '', ruleType: 'Inbound', rule: 'Allowed', port: '', protocol: 'TCP', source: '0.0.0.0/0', status: 'Y' })}
                >
                  <PlusCircle className="mr-2 h-4 w-4" />
                  Add Rule
                </Button>
              </div>

              {fields.map((field, index) => (
                <div key={field.id} className="border p-4 rounded-md space-y-4 relative">
                  <Button
                    type="button"
                    variant="destructive"
                    size="icon"
                    className="absolute -top-3 -right-3 h-7 w-7"
                    onClick={() => remove(index)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                   <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                    <FormField
                      control={form.control}
                      name={`rules.${index}.ruleName`}
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Rule Name <span className="text-destructive">*</span></FormLabel>
                          <FormControl>
                            <Input placeholder="e.g., Allow HTTPS" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                        control={form.control}
                        name={`rules.${index}.ruleType`}
                        render={({ field }) => (
                            <FormItem>
                            <FormLabel>Rule Type <span className="text-destructive">*</span></FormLabel>
                            <Select onValueChange={field.onChange} defaultValue={field.value}>
                                <FormControl>
                                <SelectTrigger><SelectValue placeholder="Select a type" /></SelectTrigger>
                                </FormControl>
                                <SelectContent>
                                <SelectItem value="Inbound">Inbound</SelectItem>
                                <SelectItem value="Outbound">Outbound</SelectItem>
                                </SelectContent>
                            </Select>
                            <FormMessage />
                            </FormItem>
                        )}
                        />
                    <FormField
                      control={form.control}
                      name={`rules.${index}.rule`}
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Rule <span className="text-destructive">*</span></FormLabel>
                          <Select onValueChange={field.onChange} defaultValue={field.value}>
                            <FormControl>
                              <SelectTrigger><SelectValue placeholder="Select a rule" /></SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value="Allowed">Allowed</SelectItem>
                              <SelectItem value="Denied">Denied</SelectItem>
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                     <FormField
                      control={form.control}
                      name={`rules.${index}.port`}
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Port <span className="text-destructive">*</span></FormLabel>
                          <FormControl>
                            <Input placeholder="e.g., 443" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                     <FormField
                      control={form.control}
                      name={`rules.${index}.protocol`}
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Protocol <span className="text-destructive">*</span></FormLabel>
                          <Select onValueChange={field.onChange} defaultValue={field.value}>
                            <FormControl>
                              <SelectTrigger><SelectValue placeholder="Select a protocol" /></SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value="TCP">TCP</SelectItem>
                              <SelectItem value="UDP">UDP</SelectItem>
                              <SelectItem value="ALL">ALL</SelectItem>
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                     <FormField
                      control={form.control}
                      name={`rules.${index}.source`}
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Source IP <span className="text-destructive">*</span></FormLabel>
                          <FormControl>
                            <Input placeholder="e.g., 0.0.0.0/0" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                     <FormField
                        control={form.control}
                        name={`rules.${index}.status`}
                        render={({ field }) => (
                            <FormItem>
                            <FormLabel>Active <span className="text-destructive">*</span></FormLabel>
                            <Select onValueChange={field.onChange} defaultValue={field.value}>
                                <FormControl>
                                <SelectTrigger><SelectValue placeholder="Select a status" /></SelectTrigger>
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
              ))}
               <FormMessage>{form.formState.errors.rules?.root?.message || form.formState.errors.rules?.message}</FormMessage>
            </div>
          </CardContent>
          <CardFooter className="flex justify-between">
            <Button variant="outline" type="button" onClick={() => router.push('/port-management')}>
              <ArrowLeft className="mr-2 h-4 w-4" />
              Cancel
            </Button>
            <Button type="submit">
              <Save className="mr-2 h-4 w-4" />
              Save Rules
            </Button>
          </CardFooter>
        </form>
      </Form>
    </Card>
  );
}
