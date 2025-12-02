
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
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useEffect } from 'react';
import { RadioGroup, RadioGroupItem } from './ui/radio-group';
import type { ApplicationUrl } from './IQRequiredForm';

const formSchema = z.object({
  isClientDomain: z.enum(['Yes', 'No'], { required_error: 'You must select an option.'}),
  domainName: z.string().optional(),
  isHttpsRequired: z.enum(['Yes', 'No'], { required_error: 'You must select an option.'}),
  applicationUrl: z.string().url({ message: 'Please enter a valid URL.' }),
  sslPath: z.string().optional(),
}).refine(data => {
    if (data.isClientDomain === 'Yes') {
      return !!data.domainName && data.domainName.length > 0;
    }
    return true;
}, {
    message: "Domain name is required if domain is of client.",
    path: ['domainName'],
});

type FormValues = z.infer<typeof formSchema>;

interface ApplicationUrlDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (urlData: ApplicationUrl) => void;
}

export function ApplicationUrlDialog({ isOpen, onClose, onSave }: ApplicationUrlDialogProps) {
  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      isClientDomain: 'No',
      isHttpsRequired: 'No',
      applicationUrl: '',
      domainName: '',
      sslPath: '',
    },
  });
  
  const isClientDomain = form.watch('isClientDomain');
  const isHttpsRequired = form.watch('isHttpsRequired');

  useEffect(() => {
    if (isOpen) {
      form.reset();
    }
  }, [isOpen, form]);

  const onSubmit = (values: FormValues) => {
    onSave(values);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-xl">
        <DialogHeader>
          <DialogTitle>Add Application URL</DialogTitle>
          <DialogDescription>
            Provide the details for the application URL and domain configuration.
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <FormField
              control={form.control}
              name="isClientDomain"
              render={({ field }) => (
                <FormItem className="space-y-3">
                  <FormLabel>Is domain of client?</FormLabel>
                  <FormControl>
                    <RadioGroup
                      onValueChange={field.onChange}
                      value={field.value}
                      className="flex items-center gap-8"
                    >
                      <FormItem className="flex items-center space-x-3 space-y-0">
                        <FormControl><RadioGroupItem value="Yes" /></FormControl>
                        <FormLabel className="font-normal">Yes</FormLabel>
                      </FormItem>
                      <FormItem className="flex items-center space-x-3 space-y-0">
                        <FormControl><RadioGroupItem value="No" /></FormControl>
                        <FormLabel className="font-normal">No</FormLabel>
                      </FormItem>
                    </RadioGroup>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="isHttpsRequired"
              render={({ field }) => (
                <FormItem className="space-y-3">
                  <FormLabel>Is HTTPS required?</FormLabel>
                  <FormControl>
                    <RadioGroup
                      onValueChange={field.onChange}
                      value={field.value}
                      className="flex items-center gap-8"
                    >
                      <FormItem className="flex items-center space-x-3 space-y-0">
                        <FormControl><RadioGroupItem value="Yes" /></FormControl>
                        <FormLabel className="font-normal">Yes</FormLabel>
                      </FormItem>
                      <FormItem className="flex items-center space-x-3 space-y-0">
                        <FormControl><RadioGroupItem value="No" /></FormControl>
                        <FormLabel className="font-normal">No</FormLabel>
                      </FormItem>
                    </RadioGroup>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            {isClientDomain === 'Yes' && isHttpsRequired === 'Yes' && (
                <FormField
                  control={form.control}
                  name="sslPath"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>SSL Path</FormLabel>
                      <FormControl>
                        <Input placeholder="/path/to/ssl/certificate" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
            )}

            {isClientDomain === 'Yes' && (
                <FormField
                  control={form.control}
                  name="domainName"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Domain Name</FormLabel>
                      <FormControl>
                        <Input placeholder="example.com" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
            )}

            <FormField
                control={form.control}
                name="applicationUrl"
                render={({ field }) => (
                    <FormItem>
                    <FormLabel>Application URL</FormLabel>
                    <FormControl>
                        <Input placeholder="https://app.example.com" {...field} />
                    </FormControl>
                    <FormMessage />
                    </FormItem>
                )}
            />

            <DialogFooter>
              <Button type="button" variant="secondary" onClick={onClose}>
                Cancel
              </Button>
              <Button type="submit">Add URL</Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
