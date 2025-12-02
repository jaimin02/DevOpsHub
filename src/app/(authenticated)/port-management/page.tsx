

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
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';
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
import {
  ShieldCheck,
  Server,
  Globe,
  Plus,
  Edit,
  Eye,
  History,
  Download,
  User,
} from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Dialog, DialogHeader, DialogTitle, DialogDescription, DialogContent } from '@/components/ui/dialog';
import { PortRuleForm, PortRule } from '@/components/PortRuleForm';
import { initialServerPortData } from '@/lib/data';
import { DeleteWithRemarkDialog } from '@/components/DeleteWithRemarkDialog';
import { useToast } from '@/hooks/use-toast';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import Link from 'next/link';
import { ClientOnlyDate } from '@/components/ClientOnlyDate';
import * as XLSX from 'xlsx';
import jsPDF from 'jspdf';
import 'jspdf-autotable';
import { useRouter, useSearchParams } from 'next/navigation';
import { usePortRules } from '@/context/PortRuleProvider';

type ServerData = {
  serverName: string;
  publicIp: string;
  rules: PortRule[];
};

type AuditLogEntry = {
  id: string;
  serverName: string;
  ruleName: string;
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

const getFieldName = (key: string) => {
    const map: Record<string, string> = {
        ruleName: 'Rule Name',
        rule: 'Rule',
        ruleType: 'Rule Type',
        port: 'Port',
        protocol: 'Protocol',
        source: 'Source IP',
        status: 'Active',
    }
    return map[key] || key;
}

export default function PortManagementPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { toast } = useToast();
  const { serverData, setServerData } = usePortRules();
  const [auditLog, setAuditLog] = useState<AuditLogEntry[]>([]);
  
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isRemarkDialogOpen, setIsRemarkDialogOpen] = useState(false);

  const [editingRule, setEditingRule] = useState<{serverName: string; rule: PortRule; index: number} | null>(null);
  const [addingRuleToServer, setAddingRuleToServer] = useState<string | null>(null);
  
  const [editData, setEditData] = useState<Partial<PortRule> | null>(null);
  const [detectedChanges, setDetectedChanges] = useState<any[]>([]);

  const [selectedRuleForAudit, setSelectedRuleForAudit] = useState<{serverName: string, ruleName: string} | null>(null);
  const [isAuditTrailOpen, setIsAuditTrailOpen] = useState(false);
  const [newRuleData, setNewRuleData] = useState<PortRule | null>(null);

  useEffect(() => {
      const auditLogFromParams = searchParams.get('auditLog');
      if (auditLogFromParams) {
          setAuditLog(JSON.parse(auditLogFromParams));
      } else {
          const storedAuditLog = sessionStorage.getItem('portRuleAuditLog');
          if (storedAuditLog) {
              setAuditLog(JSON.parse(storedAuditLog));
          }
      }
  }, [searchParams]);

  useEffect(() => {
    sessionStorage.setItem('portRuleAuditLog', JSON.stringify(auditLog));
  }, [auditLog]);
  
  useEffect(() => {
    if (newRuleData && addingRuleToServer) {
        let ruleAdded = false;
        let ruleExists = false;

        setServerData(prevData => {
            const updatedServerData = prevData.map(server => {
                if (server.serverName === addingRuleToServer) {
                    if (server.rules.some(r => r.ruleName.toLowerCase() === newRuleData.ruleName.toLowerCase())) {
                        ruleExists = true;
                        return server;
                    }
                    const newRule = { ...newRuleData, dModifiedOn: new Date().toISOString(), vUserName: 'Admin' };
                    const newRules = [...server.rules, newRule];
                    createAuditLog('Add', { default: 'New rule created' }, addingRuleToServer, null, newRule);
                    ruleAdded = true;
                    return { ...server, rules: newRules };
                }
                return server;
            });
            return updatedServerData;
        });
        
        if (ruleExists) {
            toast({ variant: "destructive", title: "Validation Error", description: "A rule with this name already exists for this server." });
        } else if (ruleAdded) {
            toast({ title: 'Rule Added', description: `Rule "${newRuleData.ruleName}" has been added to ${addingRuleToServer}.` });
        }
        
        setIsAddDialogOpen(false);
        setAddingRuleToServer(null);
        setNewRuleData(null);
    }
  }, [newRuleData, addingRuleToServer, toast, setServerData]);


  const filteredAuditLog = useMemo(() => {
    if (!selectedRuleForAudit) return [];
    return auditLog.filter(log => log.serverName === selectedRuleForAudit.serverName && log.ruleName === selectedRuleForAudit.ruleName)
      .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
  }, [auditLog, selectedRuleForAudit]);


  const createAuditLog = (action: 'Add' | 'Edit', remarks: { [key: string]: string }, serverName: string, oldData: PortRule | null, newData: PortRule) => {
    const changes: AuditLogEntry['changes'] = [];
    if (action === 'Add') {
        Object.keys(newData).forEach(key => {
            if (key === 'dModifiedOn' || key === 'vUserName') return;
            changes.push({
                field: getFieldName(key),
                oldValue: '-',
                newValue: (newData as any)[key],
                remark: remarks.default || 'New rule created'
            });
        });
    } else if (action === 'Edit' && oldData) {
        Object.keys(newData).forEach(key => {
            if (key === 'dModifiedOn' || key === 'vUserName') return;
            if ((oldData as any)[key] !== (newData as any)[key]) {
                changes.push({
                    field: getFieldName(key),
                    oldValue: (oldData as any)[key],
                    newValue: (newData as any)[key],
                    remark: remarks[key] || ''
                });
            }
        });
    }

    if(changes.length > 0) {
        const logEntry: AuditLogEntry = {
            id: `${Date.now()}-${Math.random()}`,
            serverName,
            ruleName: newData.ruleName,
            action,
            user: 'Admin', // Hardcoded for now
            timestamp: new Date().toISOString(),
            changes,
        };
        setAuditLog(prev => [...prev, logEntry]);
    }
  }

  const handleAddRuleClick = (serverName: string) => {
    setEditingRule(null);
    setAddingRuleToServer(serverName);
    setIsAddDialogOpen(true);
  }

  const handleEditRuleClick = (serverName: string, rule: PortRule, index: number) => {
    setAddingRuleToServer(null);
    setEditingRule({ serverName, rule, index });
    setIsEditDialogOpen(true);
  };
  
  const handleAuditTrailClick = (serverName: string, ruleName: string) => {
    setSelectedRuleForAudit({ serverName, ruleName });
    setIsAuditTrailOpen(true);
  }

  const handleAddFormSubmit = (values: PortRule) => {
    setNewRuleData(values);
  };

  const handleEditFormSubmit = (values: PortRule) => {
    if (editingRule) {
        const changes = [];
        for (const key in values) {
             if (values.hasOwnProperty(key as keyof PortRule) && editingRule.rule.hasOwnProperty(key as keyof PortRule)) {
                if ((values as any)[key] !== (editingRule.rule as any)[key]) {
                    changes.push({ field: key, label: getFieldName(key), oldValue: (editingRule.rule as any)[key], newValue: (values as any)[key] });
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
    if(editingRule && editData) {
        const { serverName, index, rule: oldRule } = editingRule;
        const updatedRule: PortRule = { ...oldRule, ...editData, dModifiedOn: new Date().toISOString(), vUserName: 'Admin' };

        setServerData(prevData => prevData.map(server => {
            if (server.serverName === serverName) {
                const newRules = [...server.rules];
                newRules[index] = updatedRule;
                return { ...server, rules: newRules };
            }
            return server;
        }));
        
        createAuditLog('Edit', remarks, serverName, oldRule, updatedRule);
        toast({ title: "Rule Updated", description: `Rule "${updatedRule.ruleName}" has been updated.` });
    }
    setEditData(null);
    setDetectedChanges([]);
    setEditingRule(null);
    setIsRemarkDialogOpen(false);
  }

  return (
    <>
      <Card>
        <CardHeader>
          <div className="flex flex-row items-start justify-between">
            <div>
                <CardTitle className="flex items-center gap-2">
                    <ShieldCheck className="h-6 w-6" />
                    Port Management
                </CardTitle>
                <CardDescription>
                    Manage server port rules, similar to a security group.
                </CardDescription>
            </div>
            <Button asChild>
                <Link href="/port-management/add">
                    <Plus className="mr-2 h-4 w-4" /> Add Server
                </Link>
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <Accordion type="single" collapsible className="w-full">
            {serverData.map((server) => (
              <AccordionItem value={server.serverName} key={server.serverName}>
                <AccordionTrigger className="hover:bg-muted/50 px-4 rounded-md transition-colors">
                  <div className="flex items-center gap-4">
                    <Server className="h-5 w-5 text-muted-foreground" />
                    <div className="text-left">
                      <div className="font-medium">{server.serverName}</div>
                      <div className="text-sm text-muted-foreground flex items-center gap-2">
                        <Globe className="h-3 w-3" /> {server.publicIp}
                      </div>
                    </div>
                  </div>
                </AccordionTrigger>
                <AccordionContent className="pt-2 pb-4 px-4">
                  <div className="flex justify-end gap-2 mb-4">
                    <Button variant="outline" onClick={() => handleAddRuleClick(server.serverName)}>
                      <Plus className="mr-2 h-4 w-4" /> Add Rule
                    </Button>
                  </div>
                  <div className="border rounded-md">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Rule Name</TableHead>
                          <TableHead>Rule</TableHead>
                          <TableHead>Port</TableHead>
                          <TableHead>Protocol</TableHead>
                          <TableHead>Source IP</TableHead>
                          <TableHead>Active</TableHead>
                          <TableHead>Last Modified</TableHead>
                          <TableHead className="text-center">Actions</TableHead>
                        </TableRow>
                      </TableHeader>
                       <TooltipProvider>
                          <TableBody>
                            {server.rules.map((rule, index) => (
                              <TableRow key={index}>
                                <TableCell className="font-medium">{rule.ruleName}</TableCell>
                                <TableCell>
                                  <Badge variant={rule.rule === 'Allowed' ? 'default' : 'destructive'}>
                                    {rule.rule}
                                  </Badge>
                                </TableCell>
                                <TableCell>{rule.port}</TableCell>
                                <TableCell>{rule.protocol}</TableCell>
                                <TableCell className="font-mono text-xs">{rule.source}</TableCell>
                                <TableCell>
                                  <Badge variant={rule.status === 'Y' ? 'secondary' : 'outline'}>
                                    {rule.status}
                                  </Badge>
                                </TableCell>
                                <TableCell>
                                    <div className="flex flex-col">
                                        <span className="font-medium">{rule.vUserName}</span>
                                        <span className="text-xs text-muted-foreground">
                                            <ClientOnlyDate date={rule.dModifiedOn} />
                                        </span>
                                    </div>
                                </TableCell>
                                 <TableCell>
                                    <div className="flex items-center justify-center gap-2">
                                        <Tooltip>
                                            <TooltipTrigger asChild>
                                                <Button variant="ghost" size="icon" onClick={() => handleEditRuleClick(server.serverName, rule, index)}>
                                                    <Edit className="h-4 w-4" />
                                                    <span className="sr-only">Edit</span>
                                                </Button>
                                            </TooltipTrigger>
                                            <TooltipContent><p>Edit</p></TooltipContent>
                                        </Tooltip>
                                        <Tooltip>
                                            <TooltipTrigger asChild>
                                                <Button variant="ghost" size="icon" asChild>
                                                    <Link href={`/port-management/${server.serverName}/${encodeURIComponent(rule.ruleName)}?auditLog=${encodeURIComponent(JSON.stringify(auditLog))}`}>
                                                        <Eye className="h-4 w-4" />
                                                        <span className="sr-only">View Details</span>
                                                    </Link>
                                                </Button>
                                            </TooltipTrigger>
                                            <TooltipContent><p>View Details</p></TooltipContent>
                                        </Tooltip>
                                        <Tooltip>
                                            <TooltipTrigger asChild>
                                                <Button variant="ghost" size="icon" onClick={() => handleAuditTrailClick(server.serverName, rule.ruleName)}>
                                                    <History className="h-4 w-4" />
                                                    <span className="sr-only">Audit Trail</span>
                                                </Button>
                                            </TooltipTrigger>
                                            <TooltipContent><p>Audit Trail</p></TooltipContent>
                                        </Tooltip>
                                    </div>
                                </TableCell>
                              </TableRow>
                            ))}
                          </TableBody>
                       </TooltipProvider>
                    </Table>
                  </div>
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </CardContent>
      </Card>
      <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
        <PortRuleForm
          mode="add"
          onSubmit={handleAddFormSubmit}
          onClose={() => setIsAddDialogOpen(false)}
        />
      </Dialog>
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <PortRuleForm
          mode="edit"
          onSubmit={handleEditFormSubmit}
          initialData={editingRule?.rule}
          onClose={() => setIsEditDialogOpen(false)}
        />
      </Dialog>
      <DeleteWithRemarkDialog
        open={isRemarkDialogOpen}
        onOpenChange={setIsRemarkDialogOpen}
        onConfirm={handleRemarkConfirm}
        title={"Confirm Rule Changes"}
        description={"Please provide a remark for each of the changes you made."}
        buttonText={"Save Changes"}
        changes={detectedChanges}
      />
       <Dialog open={isAuditTrailOpen} onOpenChange={setIsAuditTrailOpen}>
        <DialogContent className="max-w-4xl">
            <DialogHeader>
                 <div className="flex items-start justify-between pr-6">
                    <div className="space-y-1">
                        <DialogTitle>Audit Trail for {selectedRuleForAudit?.ruleName}</DialogTitle>
                        <DialogDescription>On server: {selectedRuleForAudit?.serverName}</DialogDescription>
                    </div>
                     <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="outline">
                          <Download className="mr-2 h-4 w-4" />
                          Export
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent>
                        <DropdownMenuItem>Export to Excel</DropdownMenuItem>
                        <DropdownMenuItem>Export to PDF</DropdownMenuItem>
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
                        No audit records found for this port rule.
                    </div>
                )}
            </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
