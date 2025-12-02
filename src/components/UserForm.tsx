
'use client';

import { useEffect, useState } from 'react';
import {
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
import { User } from '@/lib/users';
import { deptData } from '@/lib/data';
import { RadioGroup, RadioGroupItem } from './ui/radio-group';
import { Separator } from './ui/separator';
import { UnsavedChangesDialog } from './UnsavedChangesDialog';

interface UserFormProps {
  mode: 'add' | 'edit';
  initialData?: User;
  onClose: () => void;
  onSubmit: (values: Partial<User>) => void;
}

const createFormSchema = (mode: 'add' | 'edit') => {
    let schemaObject: any = {
        id: z.number().optional(),
        userId: z.string().min(1, 'User ID is required'),
        firstName: z.string().min(1, 'First Name is required').regex(/^[a-zA-Z\s'-]+$/, "Only alphabetic characters are allowed."),
        lastName: z.string().min(1, 'Last Name is required').regex(/^[a-zA-Z\s'-]+$/, "Only alphabetic characters are allowed."),
        email: z.string().email('Invalid email address'),
        mobile: z.string().regex(/^\d{3}-\d{3}-\d{4}$/, "Mobile number must be in XXX-XXX-XXXX format.").optional().or(z.literal('')),
        role: z.enum(['Admin', 'User', 'Viewer'], { required_error: 'Role is required.' }),
        deptName: z.string().min(1, "Dept. Name is required."),
        cActive: z.enum(['Y', 'N'], { required_error: "Active status is required." }),
        userType: z.enum(['AD User', 'Non-AD User']),
        password: z.string().optional(),
        vUserName: z.string().optional(),
    };
    
    const baseSchema = z.object(schemaObject);

    return baseSchema.refine(data => {
        // In 'add' mode, if user is Non-AD, password is required
        if (mode === 'add' && data.userType === 'Non-AD User') {
            return data.password && data.password.length >= 6;
        }
        // In 'edit' mode, if a password is provided for a Non-AD user, it must be valid
        if (mode === 'edit' && data.userType === 'Non-AD User' && data.password) {
             return data.password.length >= 6;
        }
        return true;
    }, {
        message: 'Password must be at least 6 characters long for Non-AD users',
        path: ['password'],
    });
};

const addModeDefaults = { 
  role: 'User' as const, 
  cActive: 'Y' as const, 
  userType: 'Non-AD User' as const, 
  password: '',
  userId: '',
  firstName: '',
  lastName: '',
  email: '',
  mobile: '',
  deptName: '',
  vUserName: 'Admin',
};

export function UserForm({ mode, initialData, onClose, onSubmit }: UserFormProps) {
  const [isExitConfirmOpen, setIsExitConfirmOpen] = useState(false);
  const formSchema = createFormSchema(mode);
  type FormValues = z.infer<typeof formSchema>;
  
  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: mode === 'add' ? addModeDefaults : initialData,
  });
  
  const { formState: { isDirty }, watch } = form;
  const userType = watch('userType');

  useEffect(() => {
    if (mode === 'edit' && initialData) {
      form.reset({ ...initialData, password: '' });
    } else if (mode === 'add') {
      form.reset(addModeDefaults as any);
    }
  }, [mode, initialData, form]);
  
  useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      if (isDirty) {
        e.preventDefault();
        e.returnValue = '';
      }
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
    };
  }, [isDirty]);


  const handleFormSubmit = (values: FormValues) => {
    onSubmit(values);
  };
  
  const handleCancel = () => {
    if (isDirty) {
      setIsExitConfirmOpen(true);
    } else {
      onClose();
    }
  };


  return (
    <>
    <UnsavedChangesDialog
        open={isExitConfirmOpen}
        onOpenChange={setIsExitConfirmOpen}
        onConfirm={onClose}
    />
    <DialogContent className="sm:max-w-2xl">
      <DialogHeader>
        <DialogTitle>{mode === 'add' ? 'Add New' : 'Edit'} User</DialogTitle>
        <DialogDescription>
          Fill in the details below to {mode} a user record.
        </DialogDescription>
      </DialogHeader>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(handleFormSubmit)} className="space-y-6 py-4 max-h-[70vh] overflow-y-auto p-1 pr-4">
            
            <h3 className="text-lg font-semibold text-primary">Account Type & Status</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <FormField
                    control={form.control}
                    name="userType"
                    render={({ field }) => (
                        <FormItem className="space-y-3">
                        <FormLabel>User Type <span className="text-destructive">*</span></FormLabel>
                        <FormControl>
                            <RadioGroup
                            onValueChange={field.onChange}
                            value={field.value}
                            className="flex items-center space-x-4 pt-2"
                            >
                            <FormItem className="flex items-center space-x-2 space-y-0">
                                <FormControl>
                                <RadioGroupItem value="AD User" />
                                </FormControl>
                                <FormLabel className="font-normal">AD User</FormLabel>
                            </FormItem>
                            <FormItem className="flex items-center space-x-2 space-y-0">
                                <FormControl>
                                <RadioGroupItem value="Non-AD User" />
                                </FormControl>
                                <FormLabel className="font-normal">Non-AD User</FormLabel>
                            </FormItem>
                            </RadioGroup>
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
            
            <Separator />
            
            <h3 className="text-lg font-semibold text-primary">Login Credentials</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                 <FormField
                    control={form.control}
                    name="userId"
                    render={({ field }) => (
                    <FormItem>
                        <FormLabel>User ID <span className="text-destructive">*</span></FormLabel>
                        <FormControl>
                        <Input placeholder="Enter user ID" {...field} disabled={mode === 'edit'} />
                        </FormControl>
                        <FormMessage />
                    </FormItem>
                    )}
                />

                <FormField
                    control={form.control}
                    name="password"
                    render={({ field }) => (
                    <FormItem>
                        <FormLabel>
                            Password
                            {mode === 'add' && userType !== 'AD User' && <span className="text-destructive"> *</span>}
                        </FormLabel>
                        <FormControl>
                        <Input 
                            type="password" 
                            placeholder={mode === 'edit' ? "Enter new password (optional)" : "••••••••"}
                            {...field} 
                            disabled={userType === 'AD User'} 
                        />
                        </FormControl>
                        <FormMessage />
                    </FormItem>
                    )}
                />
            </div>
            
            <Separator />

            <h3 className="text-lg font-semibold text-primary">Personal Information</h3>
             <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <FormField
                    control={form.control}
                    name="firstName"
                    render={({ field }) => (
                    <FormItem>
                        <FormLabel>First Name <span className="text-destructive">*</span></FormLabel>
                        <FormControl>
                        <Input placeholder="Enter first name" {...field} />
                        </FormControl>
                        <FormMessage />
                    </FormItem>
                    )}
                />
                <FormField
                    control={form.control}
                    name="lastName"
                    render={({ field }) => (
                    <FormItem>
                        <FormLabel>Last Name <span className="text-destructive">*</span></FormLabel>
                        <FormControl>
                        <Input placeholder="Enter last name" {...field} />
                        </FormControl>
                        <FormMessage />
                    </FormItem>
                    )}
                />
                <FormField
                    control={form.control}
                    name="email"
                    render={({ field }) => (
                    <FormItem>
                        <FormLabel>Email <span className="text-destructive">*</span></FormLabel>
                        <FormControl>
                        <Input type="email" placeholder="user@example.com" {...field} />
                        </FormControl>
                        <FormMessage />
                    </FormItem>
                    )}
                />
                 <FormField
                    control={form.control}
                    name="mobile"
                    render={({ field }) => (
                    <FormItem>
                        <FormLabel>Mobile</FormLabel>
                        <FormControl>
                        <Input placeholder="Enter mobile number" {...field} />
                        </FormControl>
                        <FormMessage />
                    </FormItem>
                    )}
                />
            </div>

            <Separator />
            
            <h3 className="text-lg font-semibold text-primary">Role & Department</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <FormField
                    control={form.control}
                    name="role"
                    render={({ field }) => (
                        <FormItem>
                        <FormLabel>Role <span className="text-destructive">*</span></FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                            <FormControl>
                            <SelectTrigger>
                                <SelectValue placeholder="Select a role" />
                            </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                            <SelectItem value="Admin">Admin</SelectItem>
                            <SelectItem value="User">User</SelectItem>
                            <SelectItem value="Viewer">Viewer</SelectItem>
                            </SelectContent>
                        </Select>
                        <FormMessage />
                        </FormItem>
                    )}
                />
                 <FormField
                    control={form.control}
                    name="deptName"
                    render={({ field }) => (
                        <FormItem>
                        <FormLabel>Dept. Name <span className="text-destructive">*</span></FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                            <FormControl>
                            <SelectTrigger>
                                <SelectValue placeholder="Select a department" />
                            </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                                {deptData.map(dept => <SelectItem key={dept.nDeptNo} value={dept.vDeptName}>{dept.vDeptName}</SelectItem>)}
                            </SelectContent>
                        </Select>
                        <FormMessage />
                        </FormItem>
                    )}
                />
            </div>
          
          <DialogFooter className="pt-8">
            <Button type="button" variant="secondary" onClick={handleCancel}>
                Cancel
            </Button>
            <Button type="submit">Save Record</Button>
          </DialogFooter>
        </form>
      </Form>
    </DialogContent>
    </>
  );
}
