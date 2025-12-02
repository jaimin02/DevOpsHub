

'use client';

import { useState, useEffect } from 'react';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  CardFooter
} from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ArrowLeft, User, Mail, Smartphone, Users, UserCog, Building, Clock, Edit } from 'lucide-react';
import { useRouter, useParams, useSearchParams } from 'next/navigation';
import { Separator } from '@/components/ui/separator';
import type { User as UserType } from '@/lib/users';
import { ClientOnlyDate } from '@/components/ClientOnlyDate';
import { Dialog } from '@/components/ui/dialog';
import { UserForm } from '@/components/UserForm';
import { useToast } from '@/hooks/use-toast';
import { DeleteWithRemarkDialog } from '@/components/DeleteWithRemarkDialog';
import { getFieldName } from '@/lib/users';

const DetailItem = ({ icon: Icon, label, value }: { icon: React.ElementType, label: string, value: React.ReactNode }) => (
    <div className="flex items-start gap-3 rounded-lg bg-muted/50 p-3">
        <Icon className="h-5 w-5 mt-1 text-primary flex-shrink-0" />
        <div>
            <p className="text-sm font-medium text-muted-foreground">{label}</p>
            <div className="text-base font-semibold">{value}</div>
        </div>
    </div>
);


export default function UserDetailsPage() {
  const router = useRouter();
  const params = useParams();
  const searchParams = useSearchParams();
  const { toast } = useToast();
  const userId = params.userId as string;

  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isRemarkDialogOpen, setIsRemarkDialogOpen] = useState(false);
  const [user, setUser] = useState<UserType | undefined>(undefined);
  const [editData, setEditData] = useState<Partial<UserType> | null>(null);
  const [detectedChanges, setDetectedChanges] = useState<any[]>([]);
  const [auditLog, setAuditLog] = useState<any[]>([]);
  
  useEffect(() => {
    if (typeof window !== 'undefined') {
        const storedUsers = sessionStorage.getItem('allUsers');
        const users = storedUsers ? JSON.parse(storedUsers) : [];
        const currentUser = users.find((u: UserType) => u.userId === userId);
        setUser(currentUser);

        try {
            const auditLogFromParams = searchParams.get('auditLog');
            if (auditLogFromParams) {
                setAuditLog(JSON.parse(auditLogFromParams));
            } else {
                const storedAuditLog = sessionStorage.getItem('userAuditLog');
                if (storedAuditLog) {
                    setAuditLog(JSON.parse(storedAuditLog));
                }
            }
        } catch (e) {
            console.error("Failed to parse audit log from URL or sessionStorage", e);
        }
    }
  }, [userId, searchParams]);

  useEffect(() => {
    if (typeof window !== 'undefined') {
        sessionStorage.setItem('userAuditLog', JSON.stringify(auditLog));
    }
  }, [auditLog]);

  const handleBackNavigation = () => {
    const query = {
        auditLog: JSON.stringify(auditLog)
    };
    const queryString = new URLSearchParams(query).toString();
    router.push(`/user-management?${queryString}`);
  };
  
  const createAuditLog = (action: 'Edit', remarks: { [key: string]: string }, oldData: Partial<UserType> | null, newData: UserType) => {
    const changes: any[] = [];
    if (action === 'Edit' && oldData) {
        for (const key in newData) {
            if (key !== 'id' && key !== 'dModifiedOn' && newData.hasOwnProperty(key) && oldData.hasOwnProperty(key)) {
                if (key !== 'password' && (oldData as any)[key] !== (newData as any)[key]) {
                    changes.push({
                        field: getFieldName(key),
                        oldValue: (oldData as any)[key],
                        newValue: (newData as any)[key],
                        remark: remarks[key] || ''
                    });
                }
            }
        }
    }
    
    if (changes.length > 0) {
        const logEntry = {
            id: auditLog.length + 1,
            recordId: newData.id!,
            action,
            user: 'Admin', // Hardcoded
            timestamp: new Date().toISOString(),
            changes,
        };
        setAuditLog(prev => [...prev, logEntry]);
    }
  };

  const handleFormSubmit = (values: Partial<UserType>) => {
    const allUsersStr = sessionStorage.getItem('allUsers');
    const allUsers: UserType[] = allUsersStr ? JSON.parse(allUsersStr) : [];
    
    if (allUsers.some(u => u.userId.toLowerCase() === values.userId?.toLowerCase() && u.id !== user?.id)) {
        toast({
            variant: "destructive",
            title: "Validation Error",
            description: "A user with this User ID already exists.",
        });
        return;
    }

    if (user) {
        const changes = [];
        for (const key in values) {
            if (key === 'dModifiedOn' || key === 'vUserName') continue;
            if (values.hasOwnProperty(key) && user.hasOwnProperty(key as keyof UserType)) {
                const oldValue = (user as any)[key];
                const newValue = (values as any)[key];
                if (oldValue !== newValue) {
                    changes.push({ field: key, label: getFieldName(key), oldValue, newValue });
                }
            }
        }
        if (changes.length > 0) {
            setEditData(values);
            setDetectedChanges(changes);
            setIsFormOpen(false);
            setIsRemarkDialogOpen(true);
        } else {
            toast({ title: "No Changes", description: "No changes were detected." });
            setIsFormOpen(false);
        }
    }
  };

  const handleRemarkConfirm = (remarks: { [key: string]: string }) => {
    if (editData && user) {
        const updatedUser: UserType = { ...user, ...editData, dModifiedOn: new Date().toISOString(), vUserName: 'Admin' };
        
        const allUsersStr = sessionStorage.getItem('allUsers');
        const allUsers: UserType[] = allUsersStr ? JSON.parse(allUsersStr) : [];
        const updatedUsers = allUsers.map(u => u.id === user.id ? updatedUser : u);
        sessionStorage.setItem('allUsers', JSON.stringify(updatedUsers));

        setUser(updatedUser);
        createAuditLog('Edit', remarks, user, updatedUser);
        toast({ title: "User Updated", description: `${updatedUser.firstName} ${updatedUser.lastName} has been updated.` });
    }
    setEditData(null);
    setDetectedChanges([]);
    setIsRemarkDialogOpen(false);
  };

  if (!user) {
    return (
        <Card>
            <CardHeader>
                <div className="flex items-center gap-4">
                    <Button variant="outline" size="icon" onClick={() => router.back()}>
                        <ArrowLeft className="h-4 w-4" />
                    </Button>
                    <CardTitle>Loading...</CardTitle>
                </div>
            </CardHeader>
            <CardContent>
                <p>Loading user details...</p>
            </CardContent>
        </Card>
    );
  }

  return (
     <>
        <Dialog open={isFormOpen} onOpenChange={setIsFormOpen}>
            <Card>
            <CardHeader>
                <div className="flex items-center gap-4">
                <Button variant="outline" size="icon" onClick={handleBackNavigation}>
                    <ArrowLeft className="h-4 w-4" />
                    <span className="sr-only">Back</span>
                </Button>
                <div>
                    <CardTitle className="flex items-center gap-2">
                        <User className="h-6 w-6" /> {user.firstName} {user.lastName}
                    </CardTitle>
                    <CardDescription>
                        Detailed information for user: {user.userId}
                    </CardDescription>
                </div>
                </div>
            </CardHeader>
            <CardContent className="space-y-6">
                <div>
                    <h3 className="text-lg font-semibold mb-4 text-primary">Personal Information</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        <DetailItem icon={User} label="User ID" value={user.userId} />
                        <DetailItem icon={User} label="First Name" value={user.firstName} />
                        <DetailItem icon={User} label="Last Name" value={user.lastName} />
                        <DetailItem icon={Mail} label="Email" value={<a href={`mailto:${user.email}`} className="text-primary hover:underline">{user.email}</a>} />
                        <DetailItem icon={Smartphone} label="Mobile" value={user.mobile || 'N/A'} />
                    </div>
                </div>
                <Separator />
                <div>
                    <h3 className="text-lg font-semibold mb-4 text-primary">Account, Role & Department</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        <DetailItem icon={Users} label="User Type" value={<Badge variant="secondary">{user.userType}</Badge>} />
                        <DetailItem icon={UserCog} label="Role" value={<Badge variant={user.role === 'Admin' ? 'default' : 'secondary'}>{user.role}</Badge>} />
                        <DetailItem icon={Building} label="Dept. Name" value={user.deptName || 'N/A'} />
                        <DetailItem icon={UserCog} label="Active" value={<Badge variant={user.cActive === 'Y' ? 'default' : 'destructive'}>{user.cActive}</Badge>} />
                    </div>
                </div>
                <Separator />
                <div>
                    <h3 className="text-lg font-semibold mb-4 text-primary">Metadata</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        <DetailItem icon={User} label="Modified by" value={user.vUserName} />
                        <DetailItem icon={Clock} label="Last Modified On" value={<ClientOnlyDate date={user.dModifiedOn} />} />
                    </div>
                </div>
            </CardContent>
            <CardFooter className="flex justify-end">
                <Button onClick={() => setIsFormOpen(true)}>
                    <Edit className="mr-2 h-4 w-4" /> Edit User
                </Button>
            </CardFooter>
            </Card>
            <UserForm 
                mode="edit"
                initialData={user}
                onSubmit={handleFormSubmit}
                onClose={() => setIsFormOpen(false)}
            />
        </Dialog>
        <DeleteWithRemarkDialog
            open={isRemarkDialogOpen}
            onOpenChange={setIsRemarkDialogOpen}
            onConfirm={handleRemarkConfirm}
            title={"Confirm User Changes"}
            description={"Please provide a remark for each of the changes you made."}
            buttonText={"Save Changes"}
            changes={detectedChanges}
        />
     </>
  );
}
