

'use client';

import { useState, useMemo, useEffect } from 'react';
import Link from 'next/link';
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
import { Server, Database, Globe, Tag, Search, Edit, Eye, History, Download, User, ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Dialog, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { ServerInventoryForm } from '@/components/ServerInventoryForm';
import { Input } from '@/components/ui/input';
import { initialServers } from '@/lib/data';
import { ClientOnlyDate } from '@/components/ClientOnlyDate';
import { useToast } from '@/hooks/use-toast';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { DeleteWithRemarkDialog } from '@/components/DeleteWithRemarkDialog';
import * as XLSX from 'xlsx';
import jsPDF from 'jspdf';
import 'jspdf-autotable';
import { DialogContent } from '@/components/ui/dialog';
import { useRouter, useSearchParams } from 'next/navigation';


export type Server = typeof initialServers[0];
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

import { PageHeader } from '@/components/PageHeader';

export default function InventoryPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [servers, setServers] = useState<Server[]>(initialServers);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isRemarkDialogOpen, setIsRemarkDialogOpen] = useState(false);
  const [selectedServer, setSelectedServer] = useState<Server | undefined>(undefined);
  const [selectedServerForAudit, setSelectedServerForAudit] = useState<Server | undefined>(undefined);
  const [editData, setEditData] = useState<Partial<Server> | null>(null);
  const [detectedChanges, setDetectedChanges] = useState<any[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [auditLog, setAuditLog] = useState<AuditLogEntry[]>([]);
  const [isAuditTrailOpen, setIsAuditTrailOpen] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    const storedServers = sessionStorage.getItem('allServers');
    if (storedServers) {
        setServers(JSON.parse(storedServers));
    } else {
        sessionStorage.setItem('allServers', JSON.stringify(initialServers));
    }

    try {
        const auditLogFromParams = searchParams.get('auditLog');
        if (auditLogFromParams) {
            const newAuditLog = JSON.parse(auditLogFromParams);
            setAuditLog(newAuditLog);
            sessionStorage.setItem('serverAuditLog', JSON.stringify(newAuditLog));
        } else {
            const storedAuditLog = sessionStorage.getItem('serverAuditLog');
            if (storedAuditLog) {
                setAuditLog(JSON.parse(storedAuditLog));
            }
        }
    } catch (e) {
        console.error("Failed to parse audit log from URL or sessionStorage", e);
    }
  }, [searchParams]);


  useEffect(() => {
    sessionStorage.setItem('allServers', JSON.stringify(servers));
  }, [servers]);

  useEffect(() => {
    sessionStorage.setItem('serverAuditLog', JSON.stringify(auditLog));
  }, [auditLog]);

  const filteredServers = useMemo(() => {
    if (!searchQuery) return servers;
    const lowercasedQuery = searchQuery.toLowerCase();
    return servers.filter(server => 
      Object.values(server).some(value => {
        if (value instanceof Date) {
            return new Date(value).toLocaleDateString().toLowerCase().includes(lowercasedQuery);
        }
        return String(value).toLowerCase().includes(lowercasedQuery);
      })
    );
  }, [servers, searchQuery]);

  const filteredAuditLog = useMemo(() => {
    if (!selectedServerForAudit) return [];
    return auditLog.filter(log => log.recordId === selectedServerForAudit.recordNo).sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
  }, [auditLog, selectedServerForAudit]);

  const handleEditClick = (server: Server) => {
    setSelectedServer(server);
    setIsEditDialogOpen(true);
  };
  
  const handleAddNewClick = () => {
    setSelectedServer(undefined);
    setIsAddDialogOpen(true);
  }

  const handleAuditTrailClick = (server: Server) => {
    setSelectedServerForAudit(server);
    setIsAuditTrailOpen(true);
  }

  const getFieldName = (key: string) => {
    const fieldNameMap: { [key: string]: string } = {
        recordNo: 'Record No',
        privateIp: 'Private IP',
        publicIp: 'Public IP',
        serverName: 'Server Name',
        serverInfrastructure: 'Infrastructure',
        serverLocation: 'Location',
        serverOs: 'Operating System',
        ram: 'RAM',
        core: 'Core Count',
        antivirus: 'AntiVirus',
        ri: 'Reserved Instance',
        riStartDate: 'RI Start Date',
        riEndDate: 'RI End Date',
        database: 'Database Present',
        databaseType: 'Database Type',
        serverType: 'Server Type',
        isOsRented: 'Is OS Rented?',
        cActive: 'Active',
        vUserName: 'User Name',
        dModifiedOn: 'Modified On'
    };
    return fieldNameMap[key] || key.replace(/([A-Z])/g, ' $1').trim();
  }

  const createAuditLog = (action: 'Add' | 'Edit', remarks: { [key: string]: string }, oldData: Partial<Server> | null, newData: Server) => {
    const changes: AuditLogEntry['changes'] = [];
    
    if (action === 'Add') {
        for (const key in newData) {
            if (key !== 'recordNo' && key !== 'dModifiedOn' && key !== 'vUserName' && newData.hasOwnProperty(key) && (newData as any)[key]) {
              changes.push({ field: getFieldName(key), oldValue: '-', newValue: (newData as any)[key], remark: remarks.default || 'New record created' });
            }
        }
    } else if (action === 'Edit' && oldData) {
        for (const key in newData) {
             if (key !== 'recordNo' && key !== 'dModifiedOn' && key !== 'vUserName' && newData.hasOwnProperty(key) && oldData.hasOwnProperty(key)) {
                const oldValue = (oldData as any)[key];
                const newValue = (newData as any)[key];
                
                // Special date handling
                if (oldValue instanceof Date || newValue instanceof Date) {
                    const oldDate = oldValue ? new Date(oldValue).toISOString().split('T')[0] : null;
                    const newDate = newValue ? new Date(newValue).toISOString().split('T')[0] : null;
                    if (oldDate !== newDate) {
                        changes.push({ 
                            field: getFieldName(key), 
                            oldValue: oldDate, 
                            newValue: newDate,
                            remark: remarks[key] || ''
                        });
                    }
                } else if (oldValue !== newValue) {
                    changes.push({ 
                        field: getFieldName(key), 
                        oldValue: oldValue, 
                        newValue: newValue,
                        remark: remarks[key] || ''
                    });
                }
             }
        }
    }
    
    if (changes.length > 0) {
      const logEntry: AuditLogEntry = {
          id: auditLog.length + 1,
          recordId: newData.recordNo!,
          action,
          user: 'Admin', // Hardcoded for now
          timestamp: new Date().toISOString(),
          changes,
      };
      setAuditLog(prev => [...prev, logEntry]);
    }
  };
  
  const handleFormSubmit = (values: Server) => {
    const mode = isAddDialogOpen ? 'add' : 'edit';
    
    // Uniqueness checks
    if (servers.some(s => s.serverName.toLowerCase() === values.serverName.toLowerCase() && s.recordNo !== values.recordNo)) {
        toast({
            variant: "destructive",
            title: "Validation Error",
            description: "A server with this name already exists.",
        });
        return;
    }
     if (servers.some(s => s.privateIp === values.privateIp && s.recordNo !== values.recordNo)) {
        toast({
            variant: "destructive",
            title: "Validation Error",
            description: "A server with this private IP already exists.",
        });
        return;
    }
    
    if (mode === 'add') {
      const newRecordNo = Math.max(...servers.map(s => s.recordNo), 0) + 1;
      const newServer = { ...values, recordNo: newRecordNo, dModifiedOn: new Date().toISOString() };
      setServers(prev => [...prev, newServer]);
      createAuditLog('Add', { default: 'New record created' }, null, newServer);
      toast({ title: "Server Added", description: `${newServer.serverName} has been added.` });
      setIsAddDialogOpen(false);
    } else if (mode === 'edit' && selectedServer) {
        const changes = [];
        for (const key in values) {
             if (key === 'dModifiedOn' || key === 'vUserName') {
                continue;
            }

            if (values.hasOwnProperty(key) && selectedServer.hasOwnProperty(key)) {
                const oldValue = (selectedServer as any)[key];
                const newValue = (values as any)[key];

                if (oldValue instanceof Date || newValue instanceof Date) {
                    const oldDate = oldValue ? new Date(oldValue).toISOString().split('T')[0] : null;
                    const newDate = newValue ? new Date(newValue).toISOString().split('T')[0] : null;
                    if (oldDate !== newDate) {
                        changes.push({ field: key, label: getFieldName(key), oldValue: oldDate, newValue: newDate });
                    }
                } else if (oldValue !== newValue) {
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
    if (editData && selectedServer) {
      const updatedServer = { ...selectedServer, ...editData, dModifiedOn: new Date().toISOString() };
      setServers(prev => prev.map(s => s.recordNo === selectedServer.recordNo ? updatedServer : s));
      createAuditLog('Edit', remarks, selectedServer, updatedServer);
      toast({ title: "Server Updated", description: `${updatedServer.serverName} has been updated.` });
    }
    setEditData(null);
    setDetectedChanges([]);
    setIsRemarkDialogOpen(false);
  }

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

  const handleServerExportExcel = () => {
    const dataToExport = servers.map(server => ({
        "Record No": server.recordNo,
        "Server Name": server.serverName,
        "Private IP": server.privateIp,
        "Public IP": server.publicIp,
        "Infrastructure": server.serverInfrastructure,
        "Location": server.serverLocation,
        "Operating System": server.serverOs,
        "OS Rented": server.isOsRented,
        "RAM": server.ram,
        "Core Count": server.core,
        "AntiVirus": server.antivirus,
        "Reserved Instance": server.ri,
        "RI Start Date": server.riStartDate ? new Date(server.riStartDate).toLocaleDateString() : 'N/A',
        "RI End Date": server.riEndDate ? new Date(server.riEndDate).toLocaleDateString() : 'N/A',
        "Database Present": server.database,
        "Database Type": server.databaseType,
        "Server Type": server.serverType,
        "Status": server.cActive === 'Y' ? 'Active' : 'Inactive',
        "Last Modified By": server.vUserName,
        "Last Modified On": new Date(server.dModifiedOn).toLocaleString('en-US', { hour12: false }),
    }));
    exportToExcel(dataToExport, "Server_Details_Report.xlsx");
  }

  const handleServerExportPdf = () => {
    const columns = [
        "Record No", "Server Name", "Private IP", "Public IP", "Infrastructure", "Location", 
        "OS", "OS Rented", "RAM", "Core", "AntiVirus", "RI", "RI Start", "RI End", 
        "DB Present", "DB Type", "Server Type", "Status", "Modified By", "Modified On"
    ];
    const data = servers.map(server => [
        server.recordNo,
        server.serverName,
        server.privateIp,
        server.publicIp,
        server.serverInfrastructure,
        server.serverLocation,
        server.serverOs,
        server.isOsRented,
        server.ram,
        server.core,
        server.antivirus,
        server.ri,
        server.riStartDate ? new Date(server.riStartDate).toLocaleDateString() : 'N/A',
        server.riEndDate ? new Date(server.riEndDate).toLocaleDateString() : 'N/A',
        server.database,
        server.databaseType,
        server.serverType,
        server.cActive === 'Y' ? 'Active' : 'Inactive',
        server.vUserName,
        new Date(server.dModifiedOn).toLocaleString('en-US', { hour12: false }),
    ]);
    exportToPdf(columns, data, "Server_Details_Report.pdf", "Server Details Report");
  }


  const handleAuditExportExcel = () => {
    if (!selectedServerForAudit) return;
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
    exportToExcel(dataToExport, `AuditTrail_Server_${selectedServerForAudit.serverName}`);
  }

  const handleAuditExportPdf = () => {
    if (!selectedServerForAudit) return;
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
     exportToPdf(columns, data, `AuditTrail_Server_${selectedServerForAudit.serverName}`, `Audit Trail for ${selectedServerForAudit.serverName}`);
  }

  return (
    <>
      <Card>
        <CardHeader>
          <div className="flex flex-row items-start justify-between mb-6">
            <div className="flex items-center gap-3">
              <Button variant="outline" size="icon" onClick={() => router.push('/master')}>
                  <ArrowLeft className="h-4 w-4" />
                  <span className="sr-only">Back</span>
              </Button>
              <CardTitle className="flex items-center gap-2">
                <Server className="h-5 w-5" /> Server Details
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
                    <DropdownMenuItem onSelect={handleServerExportExcel}>Export to Excel</DropdownMenuItem>
                    <DropdownMenuItem onSelect={handleServerExportPdf}>Export to PDF</DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
                <Button onClick={handleAddNewClick}>Add New Server</Button>
              </div>
          </div>
          <CardDescription className="mb-4">
            A comprehensive record of all servers in the infrastructure.
          </CardDescription>
           <div className="relative">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  type="search"
                  placeholder="Search servers..."
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
                <TableHead>Record No</TableHead>
                <TableHead>Server Name</TableHead>
                <TableHead>Public IP</TableHead>
                <TableHead>Operating System</TableHead>
                <TableHead>Database</TableHead>
                <TableHead>Server Type</TableHead>
                <TableHead>Active</TableHead>
                <TableHead>Last Modified By</TableHead>
                <TableHead>Last Modified On</TableHead>
                <TableHead className="text-center">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TooltipProvider>
              <TableBody suppressHydrationWarning>
                {filteredServers.map((server) => (
                  <TableRow key={server.serverName}>
                    <TableCell>{server.recordNo}</TableCell>
                    <TableCell className="font-medium">{server.serverName}</TableCell>
                    <TableCell className="text-muted-foreground">{server.publicIp}</TableCell>
                    <TableCell>{server.serverOs}</TableCell>
                    <TableCell>
                      <Badge variant={server.database === 'Yes' ? 'default' : 'outline'}>
                        {server.database}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Badge variant={server.serverType === 'Business' ? 'secondary' : 'outline'}>
                        {server.serverType}
                      </Badge>
                    </TableCell>
                    <TableCell>
                       <Badge variant={server.cActive === 'Y' ? 'default' : 'destructive'}>
                        {server.cActive === 'Y' ? 'Y' : 'N'}
                      </Badge>
                    </TableCell>
                    <TableCell>{server.vUserName}</TableCell>
                    <TableCell><ClientOnlyDate date={server.dModifiedOn} /></TableCell>
                    <TableCell>
                        <div className="flex items-center justify-center gap-2">
                              <Tooltip>
                                  <TooltipTrigger asChild>
                                      <Button variant="ghost" size="icon" onClick={() => handleEditClick(server)}>
                                          <Edit className="h-4 w-4" />
                                          <span className="sr-only">Edit</span>
                                      </Button>
                                  </TooltipTrigger>
                                  <TooltipContent>
                                      <p>Edit</p>
                                  </TooltipContent>
                              </Tooltip>
                              <Tooltip>
                                  <TooltipTrigger asChild>
                                      <Button variant="ghost" size="icon" asChild>
                                          <Link href={`/inventory/${server.serverName}`}>
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
                                  <Button variant="ghost" size="icon" onClick={() => handleAuditTrailClick(server)}>
                                      <History className="h-4 w-4" />
                                      <span className="sr-only">Audit Trail</span>
                                  </Button>
                                  </TooltipTrigger>
                                  <TooltipContent>
                                  <p>Audit Trail</p>
                                  </TooltipContent>
                              </Tooltip>
                        </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </TooltipProvider>
          </Table>
        </CardContent>
      </Card>
      <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
        <ServerInventoryForm 
          mode="add"
          onSubmit={handleFormSubmit}
          onClose={() => setIsAddDialogOpen(false)}
        />
      </Dialog>
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <ServerInventoryForm 
          mode="edit"
          key={selectedServer?.serverName || 'edit-server'}
          initialData={selectedServer}
          onSubmit={handleFormSubmit}
          onClose={() => setIsEditDialogOpen(false)}
        />
      </Dialog>
      <DeleteWithRemarkDialog
        open={isRemarkDialogOpen}
        onOpenChange={setIsRemarkDialogOpen}
        onConfirm={handleRemarkConfirm as (remark: string | { [key: string]: string; }) => void}
        title={"Confirm Changes"}
        description={"Please provide a remark for each of the changes you made."}
        buttonText={"Save Changes"}
        changes={detectedChanges}
      />
       <Dialog open={isAuditTrailOpen} onOpenChange={setIsAuditTrailOpen}>
        <DialogContent className="max-w-4xl">
            <DialogHeader>
                <div className="flex items-start justify-between pr-6">
                    <div className="space-y-1.5">
                         <DialogTitle>Audit Trail for {selectedServerForAudit?.serverName}</DialogTitle>
                        <DialogDescription>A log of all additions and edits made to this record.</DialogDescription>
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
            <div className="max-h-[60vh] overflow-y-auto space-y-4 p-6 pt-2">
                {filteredAuditLog.length > 0 ? filteredAuditLog.map(log => (
                    <Card key={log.id}>
                        <CardHeader>
                            <div className="flex justify-between items-start">
                                <div>
                                    <CardTitle className='text-lg'>
                                        <Badge variant={log.action === 'Add' ? 'default' : 'secondary'}>{log.action}</Badge>
                                    </CardTitle>
                                    <CardDescription className='flex items-center gap-2 mt-2'>
                                        <User className="h-4 w-4" />
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
                                <TableBody>
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
                        No audit records found for this server.
                    </div>
                )}
            </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
