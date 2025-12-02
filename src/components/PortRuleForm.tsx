
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
import { Textarea } from './ui/textarea';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useEffect } from 'react';

const createFormSchema = (mode: 'add' | 'edit') => {
  let schemaObject: any = {
    ruleName: z.string().min(1, 'Rule name is required'),
    rule: z.enum(['Allowed', 'Denied']),
    ruleType: z.enum(['Inbound', 'Outbound']),
    port: z.string().min(1, 'Port is required'),
    protocol: z.string().min(1, 'Protocol is required'),
    source: z.string().min(1, 'Source IP is required'),
    status: z.enum(['Y', 'N']),
  };
  
  return z.object(schemaObject);
}

// Base type without remark
type PortRuleBase = z.infer<ReturnType<typeof createFormSchema>>;
// Final type that could include optional remark
export type PortRule = PortRuleBase & {
    dModifiedOn: string;
    vUserName: string;
};

interface PortRuleFormProps {
  mode: 'add' | 'edit';
  onSubmit: (values: PortRule) => void;
  initialData?: PortRule;
  onClose: () => void;
}

export function PortRuleForm({ mode, onSubmit, initialData, onClose }: PortRuleFormProps) {
  const formSchema = createFormSchema(mode);
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: initialData || {
      ruleName: '',
      rule: 'Allowed',
      ruleType: 'Inbound',
      port: '',
      protocol: 'TCP',
      source: '0.0.0.0/0',
      status: 'Y',
    },
  });
  
  useEffect(() => {
    const defaultVals = mode === 'edit' && initialData
        ? { ...initialData }
        : {
            ruleName: '',
            rule: 'Allowed',
            ruleType: 'Inbound',
            port: '',
            protocol: 'TCP',
            source: '0.0.0.0/0',
            status: 'Y' as 'Y' | 'N',
        };
    form.reset(defaultVals as any);
}, [initialData, mode, form]);


  const handleSubmit = (values: z.infer<typeof formSchema>) => {
    onSubmit(values as PortRule);
    form.reset();
  };

  return (
    <DialogContent className="sm:max-w-[600px]">
      <DialogHeader>
        <DialogTitle>{mode === 'add' ? 'Add New Port Rule' : 'Edit Port Rule'}</DialogTitle>
        <DialogDescription>
          Fill in the details for the server port rule.
        </DialogDescription>
      </DialogHeader>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4 py-4 max-h-[70vh] overflow-y-auto p-1">
          <div className="grid grid-cols-2 gap-4">
            <FormField
              control={form.control}
              name="ruleName"
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
              name="ruleType"
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
              name="rule"
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
              name="port"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Port <span className="text-destructive">*</span></FormLabel>
                  <FormControl>
                    <Input placeholder="e.g., 80 or 443-445" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="protocol"
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
              name="source"
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
              name="status"
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
          
          <DialogFooter>
            <DialogClose asChild>
              <Button type="button" variant="secondary" onClick={onClose}>
                Cancel
              </Button>
            </DialogClose>
            <Button type="submit">Save Rule</Button>
          </DialogFooter>
        </form>
      </Form>
    </DialogContent>
  );
}
