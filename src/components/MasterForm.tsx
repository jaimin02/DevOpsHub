
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
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';

type MasterType = 'Location' | 'OS' | 'Infrastructure' | 'Database Provider' | 'AntiVirus' | 'Environment' | 'Dept. Name';

interface MasterFormProps {
  type: MasterType;
  mode: 'add' | 'edit';
  initialData?: any;
  onClose: () => void;
  onSubmit: (values: any) => void;
}

const getFieldName = (type: MasterType) => {
    switch (type) {
        case 'Location': return 'vLocationName';
        case 'OS': return 'vOSName';
        case 'Infrastructure': return 'vInfraName';
        case 'Database Provider': return 'vDBProviderName';
        case 'AntiVirus': return 'vAntivirusName';
        case 'Environment': return 'vEnvironmentName';
        case 'Dept. Name': return 'vDeptName';
    }
};

const createFormSchema = (type: MasterType) => {
    const nameField = getFieldName(type);

    let schemaObject: any = {
        [nameField]: z.string().min(1, { message: `${type} name is required.` }),
    };

    schemaObject.cActive = z.string().min(1, { message: 'Active status is required.' });
    
    return z.object(schemaObject);
};

export function MasterForm({ type, mode, initialData, onClose, onSubmit }: MasterFormProps) {
  const formSchema = createFormSchema(type);
  type FormValues = z.infer<typeof formSchema>;

  const defaultValues: Partial<FormValues> = mode === 'add' 
    ? { cActive: 'Y' } 
    : { ...initialData };

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: defaultValues as any,
  });

  useEffect(() => {
    const nameField = getFieldName(type);
    if (initialData) {
      form.reset({ ...initialData });
    } else {
      const resetValues: any = { [nameField]: '' };
      resetValues.cActive = 'Y';
      form.reset(resetValues);
    }
  }, [initialData, form, type]);


  const handleFormSubmit = (values: FormValues) => {
    onSubmit(values);
  };

  const nameField = getFieldName(type);
  
  const getNameLabel = (type: MasterType) => {
    switch (type) {
      case 'OS': return 'OS Name';
      case 'Database Provider': return 'Provider Name';
      case 'AntiVirus': return 'AntiVirus Name';
      case 'Dept. Name': return 'Dept. Name';
      default: return type;
    }
  }
  const nameLabel = getNameLabel(type);

  return (
    <DialogContent>
      <DialogHeader>
        <DialogTitle>{mode === 'add' ? 'Add New' : 'Edit'} {type}</DialogTitle>
        <DialogDescription>
          Fill in the details below to {mode} a {type.toLowerCase()} record.
        </DialogDescription>
      </DialogHeader>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(handleFormSubmit)} className="space-y-4 py-4">
          <FormField
            control={form.control}
            name={nameField}
            render={({ field }) => (
              <FormItem>
                <FormLabel>{nameLabel} <span className="text-destructive">*</span></FormLabel>
                <FormControl>
                  <Input placeholder={`Enter ${nameLabel.toLowerCase()}`} {...field} />
                </FormControl>
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
                  <Select onValueChange={field.onChange} value={field.value}>
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

          <DialogFooter>
            <DialogClose asChild>
              <Button type="button" variant="secondary" onClick={onClose}>
                Cancel
              </Button>
            </DialogClose>
            <Button type="submit">Save Record</Button>
          </DialogFooter>
        </form>
      </Form>
    </DialogContent>
  );
}
