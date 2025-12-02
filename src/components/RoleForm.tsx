
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
import { Role, availablePages, Permission } from '@/lib/roles';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from './ui/table';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';


interface RoleFormProps {
  mode: 'add' | 'edit' | 'view';
  initialData?: Role;
  onClose: () => void;
  onSubmit: (values: Partial<Role>) => void;
}

const permissionEnum = z.enum(['Read', 'Write']);

const createFormSchema = (mode: 'add' | 'edit' | 'view') => {
    let schemaObject: any = {
        name: z.string().min(1, 'Role name is required.'),
        permissions: z.record(permissionEnum),
        status: z.enum(['Y', 'N']),
    };
    
    const baseSchema = z.object(schemaObject);

    return baseSchema.refine(data => Object.keys(data.permissions).length > 0, {
        message: 'At least one permission must be set.',
        path: ['permissions'],
    });
};

export function RoleForm({ mode, initialData, onClose, onSubmit }: RoleFormProps) {
  const formSchema = createFormSchema(mode);
  type FormValues = z.infer<typeof formSchema>;
  const isReadOnly = mode === 'view';

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: mode === 'add'
      ? { name: '', permissions: {}, status: 'Y' }
      : initialData
  });

  useEffect(() => {
    if (initialData) {
      form.reset({ ...initialData });
    } else {
      form.reset({ name: '', permissions: {}, status: 'Y' });
    }
  }, [initialData, form]);


  const handleFormSubmit = (values: FormValues) => {
    onSubmit(values);
  };

  const setAllPermissions = (permission: Permission | 'None') => {
    const newPermissions: Record<string, Permission> = {};
    if (permission !== 'None') {
      availablePages.forEach(page => {
        newPermissions[page.id] = permission;
      });
    }
    form.setValue('permissions', newPermissions, { shouldValidate: true });
  };


  return (
    <DialogContent className="sm:max-w-2xl">
      <DialogHeader>
        <DialogTitle>{mode === 'add' ? 'Add New' : mode === 'edit' ? 'Edit' : 'View'} Role</DialogTitle>
        <DialogDescription>
          {mode === 'add' ? 'Define the role and assign page access permissions.' : 'View or edit the role details and permissions.'}
        </DialogDescription>
      </DialogHeader>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(handleFormSubmit)} className="space-y-6 py-4 max-h-[70vh] overflow-y-auto p-1">
            <div className="grid grid-cols-2 gap-4">
                <FormField
                    control={form.control}
                    name="name"
                    render={({ field }) => (
                    <FormItem>
                        <FormLabel>Role Name <span className="text-destructive">*</span></FormLabel>
                        <FormControl>
                        <Input placeholder="Enter role name" {...field} disabled={isReadOnly} />
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
                        <Select onValueChange={field.onChange} defaultValue={field.value} disabled={isReadOnly}>
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
            
            <FormField
                control={form.control}
                name="permissions"
                render={({ field }) => (
                    <FormItem>
                         <div className="mb-4 flex justify-between items-center">
                            <FormLabel className="text-base">Page Permissions <span className="text-destructive">*</span></FormLabel>
                             {!isReadOnly && (
                                <DropdownMenu>
                                    <DropdownMenuTrigger asChild>
                                        <Button type="button" variant="outline">Grant Page Permissions</Button>
                                    </DropdownMenuTrigger>
                                    <DropdownMenuContent>
                                        <DropdownMenuItem onSelect={() => setAllPermissions('Read')}>Grant Read to All</DropdownMenuItem>
                                        <DropdownMenuItem onSelect={() => setAllPermissions('Write')}>Grant Write to All</DropdownMenuItem>
                                        <DropdownMenuItem onSelect={() => setAllPermissions('None')}>Grant None to All</DropdownMenuItem>
                                    </DropdownMenuContent>
                                </DropdownMenu>
                             )}
                        </div>
                        <div className="border rounded-md">
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>Page Name</TableHead>
                                        <TableHead className="text-right">Permission</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {availablePages.map((page) => (
                                        <TableRow key={page.id}>
                                            <TableCell className="font-medium">{page.label}</TableCell>
                                            <TableCell className="text-right">
                                                <Select
                                                    value={field.value[page.id] || 'None'}
                                                    onValueChange={(value) => {
                                                        const newPermissions = { ...field.value };
                                                        if (value === 'None') {
                                                            delete newPermissions[page.id];
                                                        } else {
                                                            newPermissions[page.id] = value as Permission;
                                                        }
                                                        field.onChange(newPermissions);
                                                    }}
                                                    disabled={isReadOnly}
                                                >
                                                    <SelectTrigger className="w-[120px] ml-auto">
                                                        <SelectValue placeholder="Select..." />
                                                    </SelectTrigger>
                                                    <SelectContent>
                                                        <SelectItem value="None">None</SelectItem>
                                                        <SelectItem value="Read">Read</SelectItem>
                                                        <SelectItem value="Write">Write</SelectItem>
                                                    </SelectContent>
                                                </Select>
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </div>
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
            {!isReadOnly && <Button type="submit">Save Role</Button>}
          </DialogFooter>
        </form>
      </Form>
    </DialogContent>
  );
}
