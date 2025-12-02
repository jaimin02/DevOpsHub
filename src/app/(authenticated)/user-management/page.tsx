

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
import { UserForm } from '@/components/UserForm';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Users, Search, Edit, ArrowLeft, Download, History, User as UserIcon, Eye } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { initialUsers, User } from '@/lib/users';
import { ClientOnlyDate } from '@/components/ClientOnlyDate';
import { useRouter, useSearchParams } from 'next/navigation';
import { useToast } from '@/hooks/use-toast';
import { DeleteWithRemarkDialog } from '@/components/DeleteWithRemarkDialog';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import * as XLSX from 'xlsx';
import jsPDF from 'jspdf';
import 'jspdf-autotable';
import Link from 'next/link';

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

export default function UserMasterPage() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const { toast } = useToast();
    const [users, setUsers] = useState<User[]>(initialUsers);
    const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
    const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
    const [isRemarkDialogOpen, setIsRemarkDialogOpen] = useState(false);
    const [selectedUser, setSelectedUser] = useState<User | undefined>(undefined);
    const [selectedUserForAudit, setSelectedUserForAudit] = useState<User | undefined>(undefined);
    const [editData, setEditData] = useState<Partial<User> | null>(null);
    const [detectedChanges, setDetectedChanges] = useState<any[]>([]);
    const [searchQuery, setSearchQuery] = useState('');
    const [auditLog, setAuditLog] = useState<AuditLogEntry[]>([]);
    const [isAuditTrailOpen, setIsAuditTrailOpen] = useState(false);

    useEffect(() => {
        const storedUsers = sessionStorage.getItem('allUsers');
        if (storedUsers) {
            setUsers(JSON.parse(storedUsers));
        } else {
            sessionStorage.setItem('allUsers', JSON.stringify(initialUsers));
        }
        
        try {
            const auditLogFromParams = searchParams.get('auditLog');
            if (auditLogFromParams) {
              const newAuditLog = JSON.parse(auditLogFromParams);
              setAuditLog(newAuditLog);
              sessionStorage.setItem('userAuditLog', JSON.stringify(newAuditLog));
            } else {
                const storedAuditLog = sessionStorage.getItem('userAuditLog');
                if (storedAuditLog) {
                    setAuditLog(JSON.parse(storedAuditLog));
                }
            }
        } catch (e) {
            console.error("Failed to parse audit log from URL or sessionStorage", e);
        }
    }, [searchParams]);

    useEffect(() => {
        sessionStorage.setItem('allUsers', JSON.stringify(users));
    }, [users]);

    useEffect(() => {
        sessionStorage.setItem('userAuditLog', JSON.stringify(auditLog));
    }, [auditLog]);

    const filteredData = useMemo(() => {
        if (!searchQuery) return users;
        const lowercasedQuery = searchQuery.toLowerCase();
        return users.filter(item =>
            Object.values(item).some(value =>
                String(value).toLowerCase().includes(lowercasedQuery)
            )
        );
    }, [searchQuery, users]);

    const filteredAuditLog = useMemo(() => {
        if (!selectedUserForAudit) return [];
        return auditLog.filter(log => log.recordId === selectedUserForAudit.id).sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
    }, [auditLog, selectedUserForAudit]);


    const handleEditClick = (record: User) => {
        setSelectedUser(record);
        setIsEditDialogOpen(true);
    };

    const handleAddNewClick = () => {
        setSelectedUser(undefined);
        setIsAddDialogOpen(true);
    }

    const handleAuditTrailClick = (user: User) => {
        setSelectedUserForAudit(user);
        setIsAuditTrailOpen(true);
    }
    
    const getFieldName = (key: string) => {
        const fieldNameMap: { [key: string]: string } = {
            userId: 'User ID',
            firstName: 'First Name',
            lastName: 'Last Name',
            email: 'Email',
            mobile: 'Mobile',
            role: 'Role',
            deptName: 'Dept. Name',
            cActive: 'Active',
            userType: 'User Type',
            dModifiedOn: 'Modified On'
        };
        return fieldNameMap[key] || key.replace(/([A-Z])/g, ' $1').trim();
    }
    
    const createAuditLog = (action: 'Add' | 'Edit', remarks: { [key: string]: string }, oldData: Partial<User> | null, newData: User) => {
        const changes: AuditLogEntry['changes'] = [];
        
        if (action === 'Add') {
            for (const key in newData) {
                if (key !== 'id' && key !== 'dModifiedOn' && newData.hasOwnProperty(key) && (newData as any)[key]) {
                    changes.push({ field: getFieldName(key), oldValue: '-', newValue: (newData as any)[key], remark: remarks.default || 'New record created' });
                }
            }
        } else if (action === 'Edit' && oldData) {
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


    const handleFormSubmit = (values: Partial<User>) => {
        const mode = isAddDialogOpen ? 'add' : 'edit';
        
        if (users.some(u => u.userId.toLowerCase() === values.userId?.toLowerCase() && u.id !== values.id)) {
            toast({
                variant: "destructive",
                title: "Validation Error",
                description: "A user with this User ID already exists.",
            });
            return;
        }

        if (mode === 'add') {
             const newUser: User = {
                id: Math.max(...users.map(u => u.id), 0) + 1,
                userId: values.userId!,
                firstName: values.firstName!,
                lastName: values.lastName!,
                email: values.email!,
                userType: values.userType!,
                mobile: values.mobile,
                role: values.role!,
                deptName: values.deptName,
                cActive: values.cActive!,
                dModifiedOn: new Date().toISOString(),
                vUserName: 'Admin'
             };
             setUsers(prev => [...prev, newUser]);
             createAuditLog('Add', { default: 'New user created' }, null, newUser);
             toast({ title: 'User Added', description: `${newUser.firstName} ${newUser.lastName} has been added.` });
             setIsAddDialogOpen(false);
        } else if (mode === 'edit' && selectedUser) {
            const changes = [];
            for (const key in values) {
                if (key === 'dModifiedOn' || key === 'vUserName') continue;
                if (values.hasOwnProperty(key) && selectedUser.hasOwnProperty(key as keyof User)) {
                    const oldValue = (selectedUser as any)[key];
                    const newValue = (values as any)[key];
                    if (oldValue !== newValue) {
                        changes.push({ field: key, label: getFieldName(key), oldValue, newValue });
                    }
                }
            }
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
        if (editData && selectedUser) {
            const updatedUser: User = { ...selectedUser, ...editData, dModifiedOn: new Date().toISOString(), vUserName: 'Admin' };
            setUsers(prev => prev.map(u => u.id === selectedUser.id ? updatedUser : u));
            createAuditLog('Edit', remarks, selectedUser, updatedUser);
            toast({ title: "User Updated", description: `${updatedUser.firstName} ${updatedUser.lastName} has been updated.` });
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

    const handleUserExportExcel = () => {
        const dataToExport = filteredData.map((user, index) => ({
            "Sr. No.": index + 1,
            "User ID": user.userId,
            "Name": `${user.firstName} ${user.lastName}`,
            "Role": user.role,
            "Dept. Name": user.deptName,
            "Active": user.cActive,
        }));
        exportToExcel(dataToExport, "User_Master_Report");
    };

    const handleUserExportPdf = () => {
        const columns = ["Sr. No.", "User ID", "Name", "Role", "Dept. Name", "Active", "Last Modified"];
        const data = filteredData.map((user, index) => [
            index + 1,
            user.userId,
            `${user.firstName} ${user.lastName}`,
            user.role,
            user.deptName || 'N/A',
            user.cActive,
            `${user.vUserName} on ${new Date(user.dModifiedOn).toLocaleString('en-US', { hour12: false })}`
        ]);
        exportToPdf(columns, data, "User_Master_Report", "User Master Report");
    };

    const handleAuditExportExcel = () => {
        if (!selectedUserForAudit) return;
        const dataToExport = filteredAuditLog.flatMap(log => 
            log.changes.map(change => ({
                Action: log.action,
                'Performed By': log.user,
                Timestamp: new Date(log.timestamp).toLocaleString('en-US', { hour12: false }),
                Field: change.field,
                'Old Value': String(change.oldValue),
                'New Value': String(change.newValue),
                Remark: change.remark,
            }))
        );
        exportToExcel(dataToExport, `AuditTrail_User_${selectedUserForAudit.userId}`);
    };

    const handleAuditExportPdf = () => {
        if (!selectedUserForAudit) return;
        const columns = ["Action", "Performed By", "Timestamp", "Field", "Old Value", "New Value", "Remark"];
        const data = filteredAuditLog.flatMap(log =>
            log.changes.map(change => [
                log.action,
                log.user,
                new Date(log.timestamp).toLocaleString('en-US', { hour12: false }),
                change.field,
                String(change.oldValue),
                String(change.newValue),
                change.remark,
            ])
        );
        exportToPdf(columns, data, `AuditTrail_User_${selectedUserForAudit.firstName} ${selectedUserForAudit.lastName}`, `Audit Trail for ${selectedUserForAudit.firstName} ${selectedUserForAudit.lastName}`);
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
                <Users className="h-5 w-5" /> User Master
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
                    <DropdownMenuItem onSelect={handleUserExportExcel}>Export to Excel</DropdownMenuItem>
                    <DropdownMenuItem onSelect={handleUserExportPdf}>Export to PDF</DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
                <Button onClick={handleAddNewClick}>Add New User</Button>
            </div>
          </div>
          <CardDescription className="mb-4">
            Create and manage user accounts.
          </CardDescription>
          <div className="relative">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  type="search"
                  placeholder="Search users..."
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
                <TableHead>Sr. No.</TableHead>
                <TableHead>User ID</TableHead>
                <TableHead>Name</TableHead>
                <TableHead>Role</TableHead>
                <TableHead>Dept. Name</TableHead>
                <TableHead>Active</TableHead>
                <TableHead>Last Modified</TableHead>
                <TableHead className="text-center">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody suppressHydrationWarning>
              {filteredData.map((user, index) => (
                <TableRow key={user.id}>
                  <TableCell>{index + 1}</TableCell>
                  <TableCell>{user.userId}</TableCell>
                  <TableCell>{`${user.firstName} ${user.lastName}`}</TableCell>
                   <TableCell>
                    <Badge variant={user.role === 'Admin' ? 'default' : 'secondary'}>
                        {user.role}
                    </Badge>
                  </TableCell>
                  <TableCell>{user.deptName || 'N/A'}</TableCell>
                  <TableCell>
                    <Badge variant={user.cActive === 'Y' ? 'default' : 'destructive'}>
                      {user.cActive}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <div className="flex flex-col">
                        <span className="font-medium">{user.vUserName}</span>
                        <span className="text-xs text-muted-foreground">
                            <ClientOnlyDate date={user.dModifiedOn} />
                        </span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center justify-center gap-2">
                        <TooltipProvider>
                            <Tooltip>
                                <TooltipTrigger asChild>
                                    <Button variant="ghost" size="icon" onClick={() => handleEditClick(user)}>
                                        <Edit className="h-4 w-4" />
                                        <span className="sr-only">Edit</span>
                                    </Button>
                                </TooltipTrigger>
                                <TooltipContent><p>Edit</p></TooltipContent>
                            </Tooltip>
                            <Tooltip>
                                <TooltipTrigger asChild>
                                    <Button variant="ghost" size="icon" asChild>
                                        <Link href={`/user-management/${user.userId}`}>
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
                                    <Button variant="ghost" size="icon" onClick={() => handleAuditTrailClick(user)}>
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
       <UserForm mode="add" onSubmit={handleFormSubmit} onClose={() => setIsAddDialogOpen(false)} />
    </Dialog>
     <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
      <UserForm mode="edit" initialData={selectedUser} onSubmit={handleFormSubmit} onClose={() => setIsEditDialogOpen(false)} />
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
      <Dialog open={isAuditTrailOpen} onOpenChange={setIsAuditTrailOpen}>
        <DialogContent className="max-w-4xl">
            <DialogHeader className="pr-10">
                 <div className="flex items-start justify-between">
                    <div className="space-y-1">
                        <DialogTitle>Audit Trail for {selectedUserForAudit?.firstName} {selectedUserForAudit?.lastName}</DialogTitle>
                        <DialogDescription>A log of all additions and edits made to this user record.</DialogDescription>
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
                        No audit records found for this user.
                    </div>
                )}
            </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
