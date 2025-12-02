

'use client';

import { useState, useEffect } from 'react';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  CardFooter,
} from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ArrowLeft, UserCog, Clock, Edit } from 'lucide-react';
import { useRouter, useParams, useSearchParams } from 'next/navigation';
import { Separator } from '@/components/ui/separator';
import type { Role } from '@/lib/roles';
import { availablePages, Permission } from '@/lib/roles';
import { ClientOnlyDate } from '@/components/ClientOnlyDate';
import { Dialog } from '@/components/ui/dialog';
import { RoleForm } from '@/components/RoleForm';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { useToast } from '@/hooks/use-toast';
import { DeleteWithRemarkDialog } from '@/components/DeleteWithRemarkDialog';

const DetailItem = ({ icon: Icon, label, value }: { icon: React.ElementType, label: string, value: React.ReactNode }) => (
    <div className="flex items-start gap-3 rounded-lg bg-muted/50 p-3">
        <Icon className="h-5 w-5 mt-1 text-primary flex-shrink-0" />
        <div>
            <p className="text-sm font-medium text-muted-foreground">{label}</p>
            <div className="text-base font-semibold">{value}</div>
        </div>
    </div>
);


export default function RoleDetailsPage() {
  const router = useRouter();
  const params = useParams();
  const searchParams = useSearchParams();
  const { toast } = useToast();
  const roleId = params.roleId as string;

  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isRemarkDialogOpen, setIsRemarkDialogOpen] = useState(false);
  const [role, setRole] = useState<Role | undefined>(undefined);
  const [editData, setEditData] = useState<Partial<Role> | null>(null);
  const [detectedChanges, setDetectedChanges] = useState<any[]>([]);
  const [auditLog, setAuditLog] = useState<any[]>([]);

  useEffect(() => {
    // Only run on client
    if (typeof window !== 'undefined') {
      const allRolesStr = sessionStorage.getItem('allRoles');
      const roles: Role[] = allRolesStr ? JSON.parse(allRolesStr) : [];
      const currentRole = roles.find((r: Role) => String(r.id) === roleId);
      setRole(currentRole);

       try {
        const auditLogFromParams = searchParams.get('auditLog');
        if (auditLogFromParams) {
          setAuditLog(JSON.parse(auditLogFromParams));
        } else {
            const storedAuditLog = sessionStorage.getItem('roleAuditLog');
            if (storedAuditLog) {
                setAuditLog(JSON.parse(storedAuditLog));
            }
        }
      } catch (e) {
          console.error("Failed to parse audit log from URL or sessionStorage", e);
      }
    }
  }, [roleId, searchParams]);

  useEffect(() => {
    // Persist auditLog to sessionStorage whenever it changes
    if (typeof window !== 'undefined') {
        sessionStorage.setItem('roleAuditLog', JSON.stringify(auditLog));
    }
  }, [auditLog]);

  const handleBackNavigation = () => {
    // Pass the updated audit log back to the list page
    const query = {
        auditLog: JSON.stringify(auditLog)
    };
    const queryString = new URLSearchParams(query).toString();
    router.push(`/role-master?${queryString}`);
  };
  
  const createAuditLog = (action: 'Edit', remarks: { [key: string]: string }, oldData: Partial<Role> | null, newData: Role) => {
    if (action !== 'Edit' || !oldData) return;
    
    const changes: any[] = [];

    if (oldData.name !== newData.name) {
        changes.push({ field: 'name', oldValue: oldData.name, newValue: newData.name, remark: remarks.name || '' });
    }
    if (oldData.status !== newData.status) {
        changes.push({ field: 'status', oldValue: oldData.status, newValue: newData.status, remark: remarks.status || '' });
    }

    const allPageIds = new Set([...Object.keys(oldData.permissions || {}), ...Object.keys(newData.permissions)]);
    allPageIds.forEach(pageId => {
        const oldPerm = (oldData.permissions as any)?.[pageId] || 'None';
        const newPerm = newData.permissions[pageId] || 'None';
        const remarkKey = `permissions.${pageId}`;
        if (oldPerm !== newPerm) {
            changes.push({
                field: `Permission: ${availablePages.find(p => p.id === pageId)?.label || pageId}`,
                oldValue: oldPerm,
                newValue: newPerm,
                remark: remarks[remarkKey] || remarks.permissions || ''
            });
        }
    });

    if (changes.length > 0) {
      const logEntry = {
          id: auditLog.length + 1,
          recordId: newData.id!,
          action,
          user: 'Admin',
          timestamp: new Date().toISOString(),
          changes,
      };
      setAuditLog(prev => [...prev, logEntry]);
    }
  };

  const handleFormSubmit = (values: Partial<Role>) => {
    const allRolesStr = sessionStorage.getItem('allRoles');
    const allRoles: Role[] = allRolesStr ? JSON.parse(allRolesStr) : [];
    
    if (allRoles.some(r => r.name.toLowerCase() === values.name?.toLowerCase() && r.id !== role?.id)) {
        toast({
            variant: "destructive",
            title: "Validation Error",
            description: "A role with this name already exists.",
        });
        return;
    }
    
    if (role) {
        const changes = [];
        if(role.name !== values.name) changes.push({ field: 'name', label: 'Role Name', oldValue: role.name, newValue: values.name });
        if(role.status !== values.status) changes.push({ field: 'status', label: 'Active', oldValue: role.status, newValue: values.status });

        const allPageIds = new Set([...Object.keys(role.permissions || {}), ...Object.keys(values.permissions || {})]);
        allPageIds.forEach(pageId => {
            const oldPerm = (role.permissions as any)?.[pageId] || 'None';
            const newPerm = (values.permissions as any)?.[pageId] || 'None';
            if(oldPerm !== newPerm){
                changes.push({ field: `permissions.${pageId}`, label: `Permission: ${availablePages.find(p=>p.id === pageId)?.label || pageId}`, oldValue: oldPerm, newValue: newPerm });
            }
        });

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
    if (editData && role) {
      const updatedRole = { ...role, ...editData, dModifiedOn: new Date().toISOString(), vUserName: 'Admin' } as Role;
      
      const allRolesStr = sessionStorage.getItem('allRoles');
      const allRoles = allRolesStr ? JSON.parse(allRolesStr) : [];
      const updatedRoles = allRoles.map((r: Role) => r.id === role.id ? updatedRole : r);
      sessionStorage.setItem('allRoles', JSON.stringify(updatedRoles));
      
      setRole(updatedRole);
      createAuditLog('Edit', remarks, role, updatedRole);
      toast({ title: "Role Updated", description: `${updatedRole.name} has been updated.` });
    }
    setEditData(null);
    setDetectedChanges([]);
    setIsRemarkDialogOpen(false);
  };

  if (!role) {
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
                <p>Loading role details...</p>
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
                        <UserCog className="h-6 w-6" /> {role.name}
                    </CardTitle>
                    <CardDescription>
                        Detailed information for role: {role.name}
                    </CardDescription>
                </div>
                </div>
            </CardHeader>
            <CardContent className="space-y-6">
                <div>
                    <h3 className="text-lg font-semibold mb-4 text-primary">Role Details</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        <DetailItem icon={UserCog} label="Role Name" value={role.name} />
                        <DetailItem icon={UserCog} label="Active" value={<Badge variant={role.status === 'Y' ? 'default' : 'destructive'}>{role.status}</Badge>} />
                    </div>
                </div>
                <Separator />
                <div>
                    <h3 className="text-lg font-semibold mb-4 text-primary">Page Permissions</h3>
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
                                            <Badge variant={role.permissions[page.id] ? 'secondary' : 'outline'}>
                                                {role.permissions[page.id] || 'None'}
                                            </Badge>
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </div>
                </div>
                <Separator />
                <div>
                    <h3 className="text-lg font-semibold mb-4 text-primary">Metadata</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        <DetailItem icon={UserCog} label="Modified by" value={role.vUserName} />
                        <DetailItem icon={Clock} label="Last Modified On" value={<ClientOnlyDate date={role.dModifiedOn} />} />
                    </div>
                </div>
            </CardContent>
            <CardFooter className="flex justify-end">
                <Button onClick={() => setIsFormOpen(true)}>
                    <Edit className="mr-2 h-4 w-4" /> Edit Role
                </Button>
            </CardFooter>
            </Card>
            <RoleForm 
                mode="edit"
                initialData={role}
                onSubmit={handleFormSubmit}
                onClose={() => setIsFormOpen(false)}
            />
        </Dialog>
        <DeleteWithRemarkDialog
            open={isRemarkDialogOpen}
            onOpenChange={setIsRemarkDialogOpen}
            onConfirm={handleRemarkConfirm}
            title={"Confirm Role Changes"}
            description={"Please provide a remark for each of the changes you made."}
            buttonText={"Save Changes"}
            changes={detectedChanges}
        />
     </>
  );
}
