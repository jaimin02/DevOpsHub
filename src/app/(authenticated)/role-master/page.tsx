

'use client';

import { useState, useMemo, useEffect } from 'react';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { RoleForm } from '@/components/RoleForm';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { UserCog, Search, Edit, Download, History, User as UserIcon, Eye, ArrowLeft } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { initialRoles, Role, availablePages, Permission } from '@/lib/roles';
import { ClientOnlyDate } from '@/components/ClientOnlyDate';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import * as XLSX from 'xlsx';
import jsPDF from 'jspdf';
import 'jspdf-autotable';
import { useToast } from '@/hooks/use-toast';
import { DeleteWithRemarkDialog } from '@/components/DeleteWithRemarkDialog';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';


export type AuditLogEntry = {
    id: number;
    recordId: number;
    action: 'Add' | 'Edit';
    user: string;
    timestamp: string;
    changes: {
        field: string;
        oldValue: any;
        newValue: any;
        remark: string;
    }[];
};

export default function RoleMasterPage() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const { toast } = useToast();
    const [roles, setRoles] = useState<Role[]>(initialRoles);
    const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
    const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
    const [selectedRole, setSelectedRole] = useState<Role | undefined>(undefined);
    const [searchQuery, setSearchQuery] = useState('');
    const [isRemarkDialogOpen, setIsRemarkDialogOpen] = useState(false);
    const [editData, setEditData] = useState<Partial<Role> | null>(null);
    const [detectedChanges, setDetectedChanges] = useState<any[]>([]);
    const [auditLog, setAuditLog] = useState<AuditLogEntry[]>([]);
    const [isAuditTrailOpen, setIsAuditTrailOpen] = useState(false);
    const [selectedRoleForAudit, setSelectedRoleForAudit] = useState<Role | undefined>(undefined);

    useEffect(() => {
        const storedRoles = sessionStorage.getItem('allRoles');
        if (storedRoles) {
            setRoles(JSON.parse(storedRoles));
        } else {
            sessionStorage.setItem('allRoles', JSON.stringify(initialRoles));
        }

        try {
            const auditLogFromParams = searchParams.get('auditLog');
            if (auditLogFromParams) {
              const newAuditLog = JSON.parse(auditLogFromParams);
              setAuditLog(newAuditLog);
              sessionStorage.setItem('roleAuditLog', JSON.stringify(newAuditLog));
            } else {
                const storedAuditLog = sessionStorage.getItem('roleAuditLog');
                if (storedAuditLog) {
                    setAuditLog(JSON.parse(storedAuditLog));
                }
            }
        } catch (e) {
            console.error("Failed to parse audit log from URL or sessionStorage", e);
        }
    }, [searchParams]);

    useEffect(() => {
        sessionStorage.setItem('allRoles', JSON.stringify(roles));
    }, [roles]);

    useEffect(() => {
        sessionStorage.setItem('roleAuditLog', JSON.stringify(auditLog));
    }, [auditLog]);

    const filteredData = useMemo(() => {
        if (!searchQuery) return roles;
        const lowercasedQuery = searchQuery.toLowerCase();
        return roles.filter(item =>
            item.name.toLowerCase().includes(lowercasedQuery)
        );
    }, [searchQuery, roles]);

    const filteredAuditLog = useMemo(() => {
      if (!selectedRoleForAudit) return [];
      return auditLog.filter(log => log.recordId === selectedRoleForAudit.id).sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
    }, [auditLog, selectedRoleForAudit]);

    const handleEditClick = (record: Role) => {
        setSelectedRole(record);
        setIsEditDialogOpen(true);
    };

    const handleAddNewClick = () => {
        setSelectedRole(undefined);
        setIsAddDialogOpen(true);
    }

    const handleAuditTrailClick = (role: Role) => {
      setSelectedRoleForAudit(role);
      setIsAuditTrailOpen(true);
    };
    
    const createAuditLog = (action: 'Add' | 'Edit', remarks: { [key: string]: string }, oldData: Partial<Role> | null, newData: Role) => {
        const changes: AuditLogEntry['changes'] = [];
        
        if (action === 'Add') {
            changes.push({ field: 'Role Name', oldValue: '-', newValue: newData.name, remark: remarks.default || 'New role created' });
            changes.push({ field: 'Active', oldValue: '-', newValue: newData.status, remark: remarks.default || 'New role created' });
            const permChanges = Object.entries(newData.permissions).map(([pageId, perm]) => ({
                field: `Permission: ${availablePages.find(p => p.id === pageId)?.label || pageId}`,
                oldValue: '-',
                newValue: perm,
                remark: remarks.default || 'New role created'
            }));
            changes.push(...permChanges);
        } else if (action === 'Edit' && oldData) {
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
        }
        
        if (changes.length > 0) {
            const logEntry: AuditLogEntry = {
                id: auditLog.length + 1,
                recordId: newData.id!,
                action,
                user: 'Admin', // Hardcoded for now
                timestamp: new Date().toISOString(),
                changes,
            };
            setAuditLog(prev => [...prev, logEntry]);
        }
    };
    
    const handleSubmit = (values: Partial<Role>) => {
        const mode = isAddDialogOpen ? 'add' : 'edit';
        const currentId = mode === 'edit' ? selectedRole?.id : undefined;

        if (roles.some(r => r.name.toLowerCase() === values.name?.toLowerCase() && r.id !== currentId)) {
            toast({
                variant: "destructive",
                title: "Validation Error",
                description: "A role with this name already exists.",
            });
            return;
        }

        if (mode === 'add') {
             const newRole: Role = {
                id: Math.max(0, ...roles.map(r => r.id)) + 1,
                name: values.name!,
                permissions: values.permissions!,
                status: values.status!,
                dModifiedOn: new Date().toISOString(),
                vUserName: 'Admin'
             };
             setRoles(prev => [...prev, newRole]);
             createAuditLog('Add', { default: 'New role created' }, null, newRole);
             toast({ title: "Role Added", description: `${newRole.name} has been successfully created.` });
             setIsAddDialogOpen(false);
        } else if (mode === 'edit' && selectedRole) {
            const changes = [];
            if(selectedRole.name !== values.name) changes.push({ field: 'name', label: 'Role Name', oldValue: selectedRole.name, newValue: values.name });
            if(selectedRole.status !== values.status) changes.push({ field: 'status', label: 'Active', oldValue: selectedRole.status, newValue: values.status });

            const allPageIds = new Set([...Object.keys(selectedRole.permissions || {}), ...Object.keys(values.permissions || {})]);
            allPageIds.forEach(pageId => {
                const oldPerm = (selectedRole.permissions as any)?.[pageId] || 'None';
                const newPerm = (values.permissions as any)?.[pageId] || 'None';
                if(oldPerm !== newPerm){
                    changes.push({ field: `permissions.${pageId}`, label: `Permission: ${availablePages.find(p=>p.id === pageId)?.label || pageId}`, oldValue: oldPerm, newValue: newPerm });
                }
            });
            
            if (changes.length > 0) {
                setEditData(values);
                setDetectedChanges(changes);
                setIsEditDialogOpen(false);
                setIsRemarkDialogOpen(true);
            } else {
                toast({ title: "No Changes", description: "No changes were detected." });
                setIsEditDialogOpen(false);
            }
        }
    };
    
    const handleRemarkConfirm = (remarks: { [key: string]: string }) => {
        if (editData && selectedRole) {
            const updatedRole = { ...selectedRole, ...editData, dModifiedOn: new Date().toISOString() } as Role;
            setRoles(prev => prev.map(r => r.id === selectedRole.id ? updatedRole : r));
            createAuditLog('Edit', remarks, selectedRole, updatedRole);
            toast({ title: "Role Updated", description: `${updatedRole.name} has been updated.` });
        }
        setEditData(null);
        setDetectedChanges([]);
        setIsRemarkDialogOpen(false);
    };

    const exportToExcel = (data: any[], fileName: string) => {
        const worksheet = XLSX.utils.json_to_sheet(data);
        const workbook = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(workbook, worksheet, "Sheet1");
        XLSX.writeFile(workbook, `${fileName}.xlsx`);
        toast({ title: "Export Successful", description: `Data has been exported to ${fileName}.xlsx` });
    };

    const exportToPdf = (columns: any[], data: any[][], fileName: string, title: string) => {
        const doc = new jsPDF({ orientation: 'landscape' });
        (doc as any).autoTable({
            head: [columns],
            body: data,
            startY: 20,
            styles: { fontSize: 8 },
            headStyles: { fontSize: 8 },
        });
        doc.text(title, 14, 15);
        doc.save(`${fileName}.pdf`);
        toast({ title: "Export Successful", description: `Data has been exported to ${fileName}.pdf` });
    };

    const handleRoleExportExcel = () => {
        const dataToExport = filteredData.map(role => ({
            "Role Name": role.name,
            "Active": role.status,
            "Last Modified By": role.vUserName,
            "Last Modified On": new Date(role.dModifiedOn).toLocaleString(),
        }));
        exportToExcel(dataToExport, "Role_Master_Report");
    };

    const handleRoleExportPdf = () => {
        const columns = ["Role Name", "Active", "Last Modified By", "Last Modified On"];
        const data = filteredData.map(role => [
            role.name,
            role.status,
            role.vUserName,
            new Date(role.dModifiedOn).toLocaleString(),
        ]);
        exportToPdf(columns, data, "Role_Master_Report", "Role Master Report");
    };

    const handleAuditExportExcel = () => {
        if (!selectedRoleForAudit) return;
        const dataToExport = filteredAuditLog.flatMap(log => 
            log.changes.map(change => ({
                Action: log.action,
                'Performed By': log.user,
                Timestamp: new Date(log.timestamp).toLocaleString('en-US', { hour12: true }),
                Field: change.field,
                'Old Value': String(change.oldValue),
                'New Value': String(change.newValue),
                Remark: change.remark,
            }))
        );
        exportToExcel(dataToExport, `AuditTrail_Role_${selectedRoleForAudit.name}`);
    };

    const handleAuditExportPdf = () => {
        if (!selectedRoleForAudit) return;
        const columns = ["Action", "Performed By", "Timestamp", "Field", "Old Value", "New Value", "Remark"];
        const data = filteredAuditLog.flatMap(log =>
            log.changes.map(change => [
                log.action,
                log.user,
                new Date(log.timestamp).toLocaleString('en-US', { hour12: true }),
                change.field,
                String(change.oldValue),
                String(change.newValue),
                change.remark,
            ])
        );
        exportToPdf(columns, data, `AuditTrail_Role_${selectedRoleForAudit.name}`, `Audit Trail for ${selectedRoleForAudit.name}`);
    };
    
  return (
    <>
      <Card>
        <CardHeader>
          <div className="flex flex-row items-start justify-between mb-6">
            <div className="flex items-center gap-3">
              <Button variant="outline" size="icon" onClick={() => router.push('/user-administration')}>
                  <ArrowLeft className="h-4 w-4" />
                  <span className="sr-only">Back</span>
              </Button>
              <CardTitle className="flex items-center gap-2">
                <UserCog className="h-5 w-5" /> Role Master
              </CardTitle>
            </div>
            <div className="flex items-center gap-2">
                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <Button variant="outline">
                        <Download className="mr-2 h-4 w-4" />
                        Export
                        </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent>
                        <DropdownMenuItem onSelect={handleRoleExportExcel}>Export to Excel</DropdownMenuItem>
                        <DropdownMenuItem onSelect={handleRoleExportPdf}>Export to PDF</DropdownMenuItem>
                    </DropdownMenuContent>
                    </DropdownMenu>
                <Button onClick={handleAddNewClick}>Add New Role</Button>
            </div>
          </div>
          <CardDescription className="mb-4">
            Create and manage user roles and their page permissions.
          </CardDescription>
          <div className="relative">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  type="search"
                  placeholder="Search roles..."
                  className="pl-8 sm:w-[300px]"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
            </div>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Role Name</TableHead>
                <TableHead>Active</TableHead>
                <TableHead>Last Modified By</TableHead>
                <TableHead>Last Modified On</TableHead>
                <TableHead className="text-center">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody suppressHydrationWarning>
              {filteredData.map((role) => (
                <TableRow key={role.id}>
                  <TableCell className="font-medium">{role.name}</TableCell>
                  <TableCell>
                      <Badge variant={role.status === 'Y' ? 'default' : 'destructive'}>
                          {role.status}
                      </Badge>
                  </TableCell>
                  <TableCell>{role.vUserName}</TableCell>
                  <TableCell><ClientOnlyDate date={role.dModifiedOn} /></TableCell>
                  <TableCell>
                    <div className="flex items-center justify-center gap-2">
                        <TooltipProvider>
                            <Tooltip>
                                <TooltipTrigger asChild>
                                    <Button variant="ghost" size="icon" onClick={() => handleEditClick(role)}>
                                        <Edit className="h-4 w-4" />
                                        <span className="sr-only">Edit</span>
                                    </Button>
                                </TooltipTrigger>
                                <TooltipContent><p>Edit</p></TooltipContent>
                            </Tooltip>
                            <Tooltip>
                                <TooltipTrigger asChild>
                                    <Button variant="ghost" size="icon" asChild>
                                        <Link href={`/role-master/${role.id}`}>
                                            <Eye className="h-4 w-4" />
                                            <span className="sr-only">View Details</span>
                                        </Link>
                                    </Button>
                                </TooltipTrigger>
                                <TooltipContent>
                                    <p>View Details</p>
                                </TooltipContent>
                            </Tooltip>
                             <Tooltip>
                                <TooltipTrigger asChild>
                                    <Button variant="ghost" size="icon" onClick={() => handleAuditTrailClick(role)}>
                                        <History className="h-4 w-4" />
                                        <span className="sr-only">Audit Trail</span>
                                    </Button>
                                </TooltipTrigger>
                                <TooltipContent><p>Audit Trail</p></TooltipContent>
                            </Tooltip>
                        </TooltipProvider>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
      <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
       <RoleForm mode="add" onSubmit={handleSubmit} onClose={() => setIsAddDialogOpen(false)} />
    </Dialog>
     <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
      <RoleForm mode="edit" initialData={selectedRole} onSubmit={handleSubmit} onClose={() => setIsEditDialogOpen(false)} />
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
     <Dialog open={isAuditTrailOpen} onOpenChange={setIsAuditTrailOpen}>
        <DialogContent className="max-w-4xl">
            <DialogHeader className="pr-10">
                 <div className="flex items-start justify-between">
                    <div className="space-y-1">
                        <DialogTitle>Audit Trail for {selectedRoleForAudit?.name}</DialogTitle>
                        <DialogDescription>A log of all additions and edits made to this role.</DialogDescription>
                    </div>
                     <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="outline">
                          <Download className="mr-2 h-4 w-4" />
                          Export
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent>
                        <DropdownMenuItem onSelect={handleAuditExportExcel}>Export to Excel</DropdownMenuItem>
                        <DropdownMenuItem onSelect={handleAuditExportPdf}>Export to PDF</DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                </div>
            </DialogHeader>
            <div className="max-h-[60vh] overflow-y-auto space-y-4 pr-2">
                {filteredAuditLog.length > 0 ? filteredAuditLog.map(log => (
                    <Card key={log.id}>
                        <CardHeader>
                            <div className="flex justify-between items-start">
                                <div>
                                    <CardTitle className='text-lg'>
                                        <Badge variant={log.action === 'Add' ? 'default' : 'secondary'}>{log.action}</Badge>
                                    </CardTitle>
                                    <CardDescription className='flex items-center gap-2 mt-2'>
                                        <UserIcon className="h-4 w-4" />
                                        {log.user} on <ClientOnlyDate date={log.timestamp} />
                                    </CardDescription>
                                </div>
                            </div>
                        </CardHeader>
                        <CardContent>
                             <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>Field</TableHead>
                                        <TableHead>Old Value</TableHead>
                                        <TableHead>New Value</TableHead>
                                        <TableHead>Remark</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody suppressHydrationWarning>
                                    {log.changes.map((change, index) => (
                                         <TableRow key={index}>
                                            <TableCell className="font-semibold capitalize">{change.field}</TableCell>
                                            <TableCell>{String(change.oldValue)}</TableCell>
                                            <TableCell>{String(change.newValue)}</TableCell>
                                            <TableCell>{change.remark}</TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </CardContent>
                    </Card>
                )) : (
                    <div className="text-center py-10 text-muted-foreground">
                        No audit records found for this role.
                    </div>
                )}
            </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
