
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
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { MasterForm } from '@/components/MasterForm';
import { Database, Search, ArrowLeft, Edit, Download, History, User } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { useRouter } from 'next/navigation';
import { providers as initialProviders, initialServers } from '@/lib/data';
import { useToast } from '@/hooks/use-toast';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import * as XLSX from 'xlsx';
import jsPDF from 'jspdf';
import 'jspdf-autotable';
import { ClientOnlyDate } from '@/components/ClientOnlyDate';
import { DeleteWithRemarkDialog } from '@/components/DeleteWithRemarkDialog';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';


export type DbProvider = typeof initialProviders[0];

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


export default function DatabaseProvidersPage() {
    const router = useRouter();
    const { toast } = useToast();
    const [providers, setProviders] = useState<DbProvider[]>(initialProviders);
    const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
    const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
    const [isRemarkDialogOpen, setIsRemarkDialogOpen] = useState(false);
    const [selectedRecord, setSelectedRecord] = useState<DbProvider | undefined>(undefined);
    const [selectedRecordForAudit, setSelectedRecordForAudit] = useState<DbProvider | undefined>(undefined);
    const [editData, setEditData] = useState<Partial<DbProvider> | null>(null);
    const [detectedChanges, setDetectedChanges] = useState<any[]>([]);
    const [searchQuery, setSearchQuery] = useState('');
    const [alertInfo, setAlertInfo] = useState<{ open: boolean; message: string; }>({ open: false, message: '' });
    const [auditLog, setAuditLog] = useState<AuditLogEntry[]>([]);
    const [isAuditTrailOpen, setIsAuditTrailOpen] = useState(false);

    useEffect(() => {
        try {
            const storedData = sessionStorage.getItem('allDbProviders');
            if (storedData) {
                setProviders(JSON.parse(storedData));
            } else {
                sessionStorage.setItem('allDbProviders', JSON.stringify(initialProviders));
            }

            const storedAuditLog = sessionStorage.getItem('dbProvidersAuditLog');
            if (storedAuditLog) {
                setAuditLog(JSON.parse(storedAuditLog));
            }
        } catch (e) {
            console.error("Could not parse data from session storage", e);
        }
    }, []);

    useEffect(() => {
        sessionStorage.setItem('allDbProviders', JSON.stringify(providers));
    }, [providers]);

    useEffect(() => {
        sessionStorage.setItem('dbProvidersAuditLog', JSON.stringify(auditLog));
    }, [auditLog]);

    const filteredData = useMemo(() => {
        if (!searchQuery) return providers;
        const lowercasedQuery = searchQuery.toLowerCase();
        return providers.filter(item =>
            Object.values(item).some(value =>
                String(value).toLowerCase().includes(lowercasedQuery)
            )
        );
    }, [searchQuery, providers]);

    const filteredAuditLog = useMemo(() => {
      if (!selectedRecordForAudit) return [];
      return auditLog.filter(log => log.recordId === selectedRecordForAudit.nDBProviderNo).sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
    }, [auditLog, selectedRecordForAudit]);


    const handleEditClick = (record: DbProvider) => {
        setSelectedRecord(record);
        setIsEditDialogOpen(true);
    };

    const handleAddNewClick = () => {
        setSelectedRecord(undefined);
        setIsAddDialogOpen(true);
    }
    
    const handleAuditTrailClick = (record: DbProvider) => {
      setSelectedRecordForAudit(record);
      setIsAuditTrailOpen(true);
    }
    
    const getFieldName = (key: string) => {
        if (key === 'cActive') return 'Active';
        if (key === 'vDBProviderName') return 'Provider Name';
        return key.substring(1).replace(/([A-Z])/g, ' $1').trim();
    }

    const createAuditLog = (action: 'Add' | 'Edit', remarks: { [key: string]: string }, oldData: Partial<DbProvider> | null, newData: DbProvider) => {
      const changes: AuditLogEntry['changes'] = [];
      
      if (action === 'Add') {
          for (const key in newData) {
              if (key !== 'nDBProviderNo' && key !== 'dModifiedOn' && key !== 'vUserName' && newData.hasOwnProperty(key)) {
                changes.push({ field: getFieldName(key), oldValue: '-', newValue: (newData as any)[key], remark: remarks.default || 'New record created' });
              }
          }
      } else if (action === 'Edit' && oldData) {
          for (const key in newData) {
               if (key !== 'nDBProviderNo' && key !== 'dModifiedOn' && key !== 'vUserName' && newData.hasOwnProperty(key) && oldData.hasOwnProperty(key) && (oldData as any)[key] !== (newData as any)[key]) {
                  changes.push({ 
                      field: getFieldName(key), 
                      oldValue: (oldData as any)[key], 
                      newValue: (newData as any)[key],
                      remark: remarks[key] || ''
                  });
              }
          }
      }
      
      if (changes.length > 0) {
        const logEntry: AuditLogEntry = {
            id: auditLog.length + 1,
            recordId: newData.nDBProviderNo,
            action,
            user: 'Admin', // Hardcoded for now
            timestamp: new Date().toISOString(),
            changes,
        };
        setAuditLog(prev => [...prev, logEntry]);
      }
  };

    const handleFormSubmit = (values: Partial<DbProvider>) => {
      const mode = isAddDialogOpen ? 'add' : 'edit';
      const providerName = values.vDBProviderName;

      if (providers.some(p => p.vDBProviderName.toLowerCase() === providerName?.toLowerCase() && p.nDBProviderNo !== selectedRecord?.nDBProviderNo)) {
          toast({
              variant: "destructive",
              title: "Validation Error",
              description: "Provider name must be unique.",
          });
          return;
      }

      if (mode === 'edit' && values.cActive === 'N' && selectedRecord?.cActive === 'Y') {
        const activeServersUsingProvider = initialServers.filter(
            server => server.databaseType === selectedRecord.vDBProviderName
        );

        if (activeServersUsingProvider.length > 0) {
            const serverList = activeServersUsingProvider.map(s => s.serverName).join(', ');
            setAlertInfo({
                open: true,
                message: `This provider is used in the following active server(s): ${serverList}. You cannot make it inactive.`
            });
            return;
        }
    }


      if (mode === 'add') {
        const newProvider: DbProvider = {
            nDBProviderNo: Math.max(...providers.map(p => p.nDBProviderNo), 0) + 1,
            vDBProviderName: values.vDBProviderName!,
            cActive: values.cActive!,
            dModifiedOn: new Date().toISOString(),
            vUserName: 'Admin'
        };
        setProviders(prev => [...prev, newProvider]);
        createAuditLog('Add', { default: 'New record created' }, null, newProvider);
        toast({ title: "Provider Added", description: `${newProvider.vDBProviderName} has been added.` });
        setIsAddDialogOpen(false);
      } else if (mode === 'edit' && selectedRecord) {
          const changes = [];
          for (const key in values) {
              if (values.hasOwnProperty(key) && selectedRecord.hasOwnProperty(key) && (values as any)[key] !== (selectedRecord as any)[key]) {
                  changes.push({
                      field: key,
                      label: getFieldName(key),
                      oldValue: (selectedRecord as any)[key],
                      newValue: (values as any)[key]
                  });
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
        if (editData && selectedRecord) {
          const updatedRecord = { ...selectedRecord, ...editData, dModifiedOn: new Date().toISOString(), vUserName: 'Admin' } as DbProvider;
          setProviders(prev => prev.map(item => 
              item.nDBProviderNo === selectedRecord!.nDBProviderNo ? updatedRecord : item
          ));
          createAuditLog('Edit', remarks, selectedRecord, updatedRecord);
          toast({ title: "Provider Updated", description: `${updatedRecord.vDBProviderName} has been updated.` });
        }
        setEditData(null);
        setDetectedChanges([]);
        setIsRemarkDialogOpen(false);
    }
    
    const exportToExcel = (data: any[], fileName: string) => {
        const dataToExport = data.map(item => ({
            "Record No": item.nDBProviderNo,
            "Provider Name": item.vDBProviderName,
            "Active": item.cActive,
            "Modified by": item.vUserName,
            "Modified Date": new Date(item.dModifiedOn).toLocaleString(),
        }));
        const worksheet = XLSX.utils.json_to_sheet(dataToExport);
        const workbook = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(workbook, worksheet, "Sheet1");
        XLSX.writeFile(workbook, `${fileName}.xlsx`);
        toast({ title: "Export Successful", description: `Data has been exported to ${fileName}.xlsx` });
    };
    
    const exportToPdf = (columns: any[], data: any[][], fileName: string, title: string) => {
      const doc = new jsPDF();
      (doc as any).autoTable({
          head: [columns],
          body: data,
          startY: 20,
      });
      doc.text(title, 14, 15);
      doc.save(`${fileName}.pdf`);
      toast({ title: "Export Successful", description: `Data has been exported to ${fileName}.pdf` });
    };
    
    const handleProvidersExportExcel = () => {
      exportToExcel(filteredData, "Database_Providers_Report");
    }
  
    const handleProvidersExportPdf = () => {
      const columns = ["Record No", "Provider Name", "Active", "Modified by", "Modified Date"];
      const data = filteredData.map(item => [
          item.nDBProviderNo,
          item.vDBProviderName,
          item.cActive,
          item.vUserName,
          new Date(item.dModifiedOn).toLocaleString(),
      ]);
      exportToPdf(columns, data, "Database_Providers_Report", "Database Providers Report");
    }
  
    const handleAuditExportExcel = () => {
      const dataToExport = filteredAuditLog.flatMap(log => 
          log.changes.map(change => ({
              Action: log.action,
              'Performed By': log.user,
              Timestamp: new Date(log.timestamp).toLocaleString(),
              Field: change.field,
              'Old Value': String(change.oldValue),
              'New Value': String(change.newValue),
              Remark: change.remark,
          }))
      );
      exportToExcel(dataToExport, `AuditTrail_Database_Provider_${selectedRecordForAudit?.vDBProviderName}`);
    }
  
    const handleAuditExportPdf = () => {
      const columns = ["Action", "Performed By", "Timestamp", "Field", "Old Value", "New Value", "Remark"];
      const data = filteredAuditLog.flatMap(log =>
        log.changes.map(change => [
          log.action,
          log.user,
          new Date(log.timestamp).toLocaleString(),
          change.field,
          String(change.oldValue),
          String(change.newValue),
          change.remark,
        ])
      );
       exportToPdf(columns, data, `AuditTrail_Database_Provider_${selectedRecordForAudit?.vDBProviderName}`, `Audit Trail for ${selectedRecordForAudit?.vDBProviderName}`);
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
                <Database className="h-5 w-5" /> Database Providers
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
                    <DropdownMenuItem onSelect={handleProvidersExportExcel}>Export to Excel</DropdownMenuItem>
                    <DropdownMenuItem onSelect={handleProvidersExportPdf}>Export to PDF</DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
                <Button onClick={handleAddNewClick}>Add New Provider</Button>
              </div>
          </div>
          <CardDescription className="mb-4">
            Manage database provider records.
          </CardDescription>
          <div className="relative">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  type="search"
                  placeholder="Search records..."
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
                <TableHead>Provider Name</TableHead>
                <TableHead>Active</TableHead>
                <TableHead>Modified by</TableHead>
                <TableHead>Modified Date</TableHead>
                <TableHead className="text-center">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody suppressHydrationWarning>
              {filteredData.map((provider) => (
                <TableRow key={provider.nDBProviderNo}>
                  <TableCell>{provider.nDBProviderNo}</TableCell>
                  <TableCell className="font-medium">{provider.vDBProviderName}</TableCell>
                  <TableCell>
                    <Badge variant={provider.cActive === 'Y' ? 'default' : 'destructive'}>
                      {provider.cActive}
                    </Badge>
                  </TableCell>
                  <TableCell>{provider.vUserName}</TableCell>
                  <TableCell><ClientOnlyDate date={provider.dModifiedOn} /></TableCell>
                  <TableCell>
                     <div className="flex items-center justify-center gap-2">
                        <TooltipProvider>
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <Button variant="ghost" size="icon" onClick={() => handleEditClick(provider)}>
                                <Edit className="h-4 w-4" />
                                <span className="sr-only">Edit</span>
                              </Button>
                            </TooltipTrigger>
                            <TooltipContent>
                              <p>Edit</p>
                            </TooltipContent>
                          </Tooltip>
                        </TooltipProvider>
                        <TooltipProvider>
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <Button variant="ghost" size="icon" onClick={() => handleAuditTrailClick(provider)}>
                                <History className="h-4 w-4" />
                                <span className="sr-only">Audit Trail</span>
                              </Button>
                            </TooltipTrigger>
                            <TooltipContent>
                              <p>Audit Trail</p>
                            </TooltipContent>
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
        <MasterForm type="Database Provider" mode="add" onClose={() => setIsAddDialogOpen(false)} onSubmit={handleFormSubmit} />
      </Dialog>
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <MasterForm type="Database Provider" mode="edit" initialData={selectedRecord} onClose={() => setIsEditDialogOpen(false)} onSubmit={handleFormSubmit} />
      </Dialog>
       <DeleteWithRemarkDialog
        open={isRemarkDialogOpen}
        onOpenChange={setIsRemarkDialogOpen}
        onConfirm={handleRemarkConfirm}
        title={"Confirm Changes"}
        description={"Please provide a remark for the changes you made."}
        buttonText={"Save Changes"}
        changes={detectedChanges}
      />
       <AlertDialog open={alertInfo.open} onOpenChange={(open) => setAlertInfo({ ...alertInfo, open })}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Cannot Inactivate Provider</AlertDialogTitle>
            <AlertDialogDescription>{alertInfo.message}</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogAction onClick={() => setAlertInfo({ open: false, message: '' })}>OK</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <Dialog open={isAuditTrailOpen} onOpenChange={setIsAuditTrailOpen}>
        <DialogContent className="max-w-4xl">
           <DialogHeader>
                <div className="flex items-center justify-between pr-6">
                    <div className="space-y-1.5">
                         <DialogTitle>Audit Trail for {selectedRecordForAudit?.vDBProviderName}</DialogTitle>
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
                        No audit records found for this provider.
                    </div>
                )}
            </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
