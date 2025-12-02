

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
import { ArrowLeft, Server, Globe, HardDrive, MapPin, MemoryStick, Cpu, Shield, Calendar, Database, Tag, User, Clock, Edit, CheckCircle } from 'lucide-react';
import { useRouter, useParams, useSearchParams } from 'next/navigation';
import { Separator } from '@/components/ui/separator';
import { Dialog } from '@/components/ui/dialog';
import { ServerInventoryForm } from '@/components/ServerInventoryForm';
import type { Server as ServerType } from '@/app/inventory/page';
import { ClientOnlyDate } from '@/components/ClientOnlyDate';
import { useToast } from '@/hooks/use-toast';
import { DeleteWithRemarkDialog } from '@/components/DeleteWithRemarkDialog';
import { getFieldName } from '@/lib/data';

const DetailItem = ({ icon: Icon, label, value }: { icon: React.ElementType, label: string, value: React.ReactNode }) => (
    <div className="flex items-start gap-3 rounded-lg bg-muted/50 p-3">
        <Icon className="h-5 w-5 mt-1 text-primary flex-shrink-0" />
        <div>
            <p className="text-sm font-medium text-muted-foreground">{label}</p>
            <div className="text-base font-semibold">{value}</div>
        </div>
    </div>
);


export default function ServerDetailsPage() {
  const router = useRouter();
  const params = useParams();
  const searchParams = useSearchParams();
  const { toast } = useToast();
  const serverName = params.serverName as string;

  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isRemarkDialogOpen, setIsRemarkDialogOpen] = useState(false);
  const [server, setServer] = useState<ServerType | undefined>(undefined);
  const [editData, setEditData] = useState<Partial<ServerType> | null>(null);
  const [detectedChanges, setDetectedChanges] = useState<any[]>([]);
  const [auditLog, setAuditLog] = useState<any[]>([]);
  
  useEffect(() => {
    // This effect now correctly handles initial rendering on both server and client
    // Data is fetched from sessionStorage only on the client-side after hydration
    if (typeof window !== 'undefined') {
        const storedServers = sessionStorage.getItem('allServers');
        const servers: ServerType[] = storedServers ? JSON.parse(storedServers) : [];
        const currentServer = servers.find((s: ServerType) => s.serverName === serverName);
        setServer(currentServer);

        try {
            const auditLogFromParams = searchParams.get('auditLog');
            if (auditLogFromParams) {
                setAuditLog(JSON.parse(auditLogFromParams));
            } else {
                const storedAuditLog = sessionStorage.getItem('serverAuditLog');
                if (storedAuditLog) {
                    setAuditLog(JSON.parse(storedAuditLog));
                }
            }
        } catch(e) {
            console.error("Failed to parse audit log from URL or sessionStorage", e);
        }
    }
  }, [serverName, searchParams]);

  useEffect(() => {
    if (typeof window !== 'undefined') {
        sessionStorage.setItem('serverAuditLog', JSON.stringify(auditLog));
    }
  }, [auditLog]);

  const handleBackNavigation = () => {
    const query = { auditLog: JSON.stringify(auditLog) };
    const queryString = new URLSearchParams(query).toString();
    router.push(`/inventory?${queryString}`);
  };

  const createAuditLog = (action: 'Edit', remarks: { [key: string]: string }, oldData: Partial<ServerType> | null, newData: ServerType) => {
    const changes: any[] = [];
    if (action === 'Edit' && oldData) {
        for (const key in newData) {
             if (key !== 'recordNo' && key !== 'dModifiedOn' && key !== 'vUserName' && newData.hasOwnProperty(key as keyof ServerType) && oldData.hasOwnProperty(key as keyof ServerType)) {
                const oldValue = (oldData as any)[key];
                const newValue = (newData as any)[key];
                
                if (oldValue instanceof Date || newValue instanceof Date) {
                    const oldDate = oldValue ? new Date(oldValue).toISOString().split('T')[0] : null;
                    const newDate = newValue ? new Date(newValue).toISOString().split('T')[0] : null;
                    if (oldDate !== newDate) {
                        changes.push({ field: getFieldName(key), oldValue: oldDate, newValue: newDate, remark: remarks[key] || '' });
                    }
                } else if (oldValue !== newValue) {
                    changes.push({ field: getFieldName(key), oldValue: oldValue, newValue: newValue, remark: remarks[key] || '' });
                }
             }
        }
    }
    
    if (changes.length > 0) {
      const logEntry = {
          id: auditLog.length + 1,
          recordId: newData.recordNo!,
          action,
          user: 'Admin',
          timestamp: new Date().toISOString(),
          changes,
      };
      setAuditLog(prev => [...prev, logEntry]);
    }
  };

  const handleFormSubmit = (values: Partial<ServerType>) => {
    const allServersStr = sessionStorage.getItem('allServers');
    const allServers: ServerType[] = allServersStr ? JSON.parse(allServersStr) : [];
    
    if (allServers.some(s => s.serverName.toLowerCase() === values.serverName?.toLowerCase() && s.recordNo !== server?.recordNo)) {
        toast({ variant: "destructive", title: "Validation Error", description: "A server with this name already exists." });
        return;
    }
     if (allServers.some(s => s.privateIp === values.privateIp && s.recordNo !== server?.recordNo)) {
        toast({ variant: "destructive", title: "Validation Error", description: "A server with this private IP already exists." });
        return;
    }

    if (server) {
        const changes = [];
        for (const key in values) {
             if (key === 'dModifiedOn' || key === 'vUserName') continue;
            if (values.hasOwnProperty(key as keyof ServerType) && server.hasOwnProperty(key as keyof ServerType)) {
                const oldValue = (server as any)[key];
                const newValue = (values as any)[key];
                if (oldValue instanceof Date || newValue instanceof Date) {
                    const oldDate = oldValue ? new Date(oldValue).toISOString().split('T')[0] : null;
                    const newDate = newValue ? new Date(newValue).toISOString().split('T')[0] : null;
                    if (oldDate !== newDate) changes.push({ field: key, label: getFieldName(key), oldValue: oldDate, newValue: newDate });
                } else if (oldValue !== newValue) {
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
    if (editData && server) {
      const updatedServer = { ...server, ...editData, dModifiedOn: new Date().toISOString(), vUserName: 'Admin' } as ServerType;

      const storedServers = sessionStorage.getItem('allServers');
      const allServers = storedServers ? JSON.parse(storedServers) : [];
      const updatedServers = allServers.map((s: ServerType) => s.recordNo === server.recordNo ? updatedServer : s);
      sessionStorage.setItem('allServers', JSON.stringify(updatedServers));
      
      setServer(updatedServer);
      createAuditLog('Edit', remarks, server, updatedServer);
      toast({ title: "Server Updated", description: `${updatedServer.serverName} has been updated.` });
    }
    setEditData(null);
    setDetectedChanges([]);
    setIsRemarkDialogOpen(false);
  };


  if (server === undefined) {
    // Render a loading state or a placeholder on the server and initial client render
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
                <p>Loading server details...</p>
            </CardContent>
        </Card>
    );
  }
  
  if (server === null) {
    return (
      <div className="flex flex-col items-center justify-center h-full text-center">
        <Server className="w-16 h-16 text-muted-foreground mb-4" />
        <h1 className="text-2xl font-bold">Server Not Found</h1>
        <p className="text-muted-foreground">The server you are looking for does not exist.</p>
        <Button onClick={handleBackNavigation} className="mt-6">
          <ArrowLeft className="mr-2" /> Go Back
        </Button>
      </div>
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
                        <Server className="h-6 w-6" /> {server.serverName}
                    </CardTitle>
                    <CardDescription>
                        Detailed information for server: {server.serverName}
                    </CardDescription>
                </div>
                </div>
            </CardHeader>
            <CardContent className="space-y-6">
                <div>
                    <h3 className="text-lg font-semibold mb-4 text-primary">Core Details</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        <DetailItem icon={Server} label="Record No" value={server.recordNo} />
                        <DetailItem icon={Globe} label="Private IP" value={<span className="font-mono">{server.privateIp}</span>} />
                        <DetailItem icon={Globe} label="Public IP" value={<span className="font-mono">{server.publicIp}</span>} />
                        <DetailItem icon={HardDrive} label="Server Infrastructure" value={server.serverInfrastructure} />
                        <DetailItem icon={MapPin} label="Location" value={server.serverLocation} />
                        <DetailItem icon={HardDrive} label="Operating System" value={server.serverOs} />
                        <DetailItem icon={Tag} label="Server Type" value={<Badge variant={server.serverType === 'Business' ? 'secondary' : 'outline'}>{server.serverType}</Badge>} />
                        <DetailItem icon={CheckCircle} label="Is OS Rented?" value={<Badge variant={server.isOsRented === 'Yes' ? 'default' : 'outline'}>{server.isOsRented}</Badge>} />
                        <DetailItem icon={CheckCircle} label="Active" value={<Badge variant={server.cActive === 'Y' ? 'default' : 'destructive'}>{server.cActive}</Badge>} />
                    </div>
                </div>
                <Separator />
                <div>
                    <h3 className="text-lg font-semibold mb-4 text-primary">Specifications</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        <DetailItem icon={MemoryStick} label="RAM" value={server.ram} />
                        <DetailItem icon={Cpu} label="Core Count" value={server.core} />
                    </div>
                </div>
                <Separator />
                <div>
                    <h3 className="text-lg font-semibold mb-4 text-primary">Security & RI</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        <DetailItem icon={Shield} label="AntiVirus" value={<Badge variant="secondary">{server.antivirus}</Badge>} />
                        <DetailItem icon={Calendar} label="Reserved Instance (RI)" value={<Badge variant={server.ri === 'Yes' ? 'default' : 'outline'}>{server.ri}</Badge>} />
                        {server.ri === 'Yes' && server.riStartDate && server.riEndDate && (
                        <>
                            <DetailItem icon={Calendar} label="RI Start Date" value={<ClientOnlyDate date={server.riStartDate} />} />
                            <DetailItem icon={Calendar} label="RI End Date" value={<ClientOnlyDate date={server.riEndDate} />} />
                        </>
                        )}
                    </div>
                </div>
                <Separator />
                <div>
                    <h3 className="text-lg font-semibold mb-4 text-primary">Database</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        <DetailItem icon={Database} label="Database Present" value={<Badge variant={server.database === 'Yes' ? 'default' : 'outline'}>{server.database}</Badge>} />
                        {server.database === 'Yes' && (
                            <DetailItem icon={Database} label="Database Type" value={server.databaseType} />
                        )}
                    </div>
                </div>
                <Separator />
                <div>
                    <h3 className="text-lg font-semibold mb-4 text-primary">Metadata</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        <DetailItem icon={User} label="Modified by" value={server.vUserName} />
                        <DetailItem icon={Clock} label="Last Modified On" value={<ClientOnlyDate date={server.dModifiedOn} />} />
                    </div>
                </div>
            </CardContent>
            <CardFooter className="flex justify-end">
                <Button onClick={() => setIsFormOpen(true)}>
                    <Edit className="mr-2 h-4 w-4" /> Edit Server
                </Button>
            </CardFooter>
            </Card>
            <ServerInventoryForm 
                mode="edit"
                key={server.serverName}
                initialData={server}
                onSubmit={handleFormSubmit as (values: ServerType) => void}
                onClose={() => setIsFormOpen(false)}
            />
        </Dialog>
        <DeleteWithRemarkDialog
            open={isRemarkDialogOpen}
            onOpenChange={setIsRemarkDialogOpen}
            onConfirm={handleRemarkConfirm as (remark: string | { [key: string]: string; }) => void}
            title={"Confirm Server Changes"}
            description={"Please provide a remark for each of the changes you made."}
            buttonText={"Save Changes"}
            changes={detectedChanges}
        />
    </>
  );
}
