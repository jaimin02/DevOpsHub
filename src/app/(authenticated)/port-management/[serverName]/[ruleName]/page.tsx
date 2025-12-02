
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
import { ArrowLeft, ShieldCheck, Server, Globe, Type, Network, Terminal, GitBranch, Edit, User, Clock } from 'lucide-react';
import { useRouter, useParams, useSearchParams } from 'next/navigation';
import { initialServerPortData } from '@/lib/data';
import type { PortRule } from '@/components/PortRuleForm';
import { Separator } from '@/components/ui/separator';
import { Dialog } from '@/components/ui/dialog';
import { PortRuleForm } from '@/components/PortRuleForm';
import { useToast } from '@/hooks/use-toast';
import { DeleteWithRemarkDialog } from '@/components/DeleteWithRemarkDialog';
import { ClientOnlyDate } from '@/components/ClientOnlyDate';

const DetailItem = ({ icon: Icon, label, value }: { icon: React.ElementType, label: string, value: React.ReactNode }) => (
    <div className="flex items-start gap-3 rounded-lg bg-muted/50 p-3">
        <Icon className="h-5 w-5 mt-1 text-primary flex-shrink-0" />
        <div>
            <p className="text-sm font-medium text-muted-foreground">{label}</p>
            <div className="text-base font-semibold">{value}</div>
        </div>
    </div>
);


export default function PortRuleDetailsPage() {
  const router = useRouter();
  const params = useParams();
  const searchParams = useSearchParams();
  const { toast } = useToast();
  const serverName = params.serverName as string;
  const ruleName = decodeURIComponent(params.ruleName as string);

  const [rule, setRule] = useState<PortRule | undefined>(undefined);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isRemarkDialogOpen, setIsRemarkDialogOpen] = useState(false);
  const [editData, setEditData] = useState<Partial<PortRule> | null>(null);
  const [detectedChanges, setDetectedChanges] = useState<any[]>([]);
  const [auditLog, setAuditLog] = useState<any[]>([]);
  
  useEffect(() => {
    if (typeof window !== 'undefined') {
        const storedData = sessionStorage.getItem('allPortRules');
        const allData: { serverName: string, rules: PortRule[] }[] = storedData ? JSON.parse(storedData) : initialServerPortData;
        const server = allData.find(s => s.serverName === serverName);
        const currentRule = server?.rules.find(r => r.ruleName === ruleName);
        setRule(currentRule);

        try {
            const auditLogFromParams = searchParams.get('auditLog');
            if (auditLogFromParams) {
                setAuditLog(JSON.parse(auditLogFromParams));
            } else {
                const storedAuditLog = sessionStorage.getItem('portRuleAuditLog');
                if (storedAuditLog) {
                    setAuditLog(JSON.parse(storedAuditLog));
                }
            }
        } catch(e) {
            console.error("Failed to parse audit log from URL or sessionStorage", e);
        }
    }
  }, [serverName, ruleName, searchParams]);

  useEffect(() => {
    if (typeof window !== 'undefined') {
        sessionStorage.setItem('portRuleAuditLog', JSON.stringify(auditLog));
    }
  }, [auditLog]);

  const handleBackNavigation = () => {
    const query = { auditLog: JSON.stringify(auditLog) };
    const queryString = new URLSearchParams(query).toString();
    router.push(`/port-management?${queryString}`);
  };

  const getFieldName = (key: string) => {
    const map: Record<string, string> = { ruleName: 'Rule Name', rule: 'Rule', ruleType: 'Rule Type', port: 'Port', protocol: 'Protocol', source: 'Source IP', status: 'Active' };
    return map[key] || key;
  };

  const createAuditLog = (action: 'Edit', remarks: { [key: string]: string }, oldData: PortRule | null, newData: PortRule) => {
    const changes: any[] = [];
    if (action === 'Edit' && oldData) {
        Object.keys(newData).forEach(key => {
            if (key === 'dModifiedOn' || key === 'vUserName') return;
            if ((oldData as any)[key] !== (newData as any)[key]) {
                changes.push({ field: getFieldName(key), oldValue: (oldData as any)[key], newValue: (newData as any)[key], remark: remarks[key] || '' });
            }
        });
    }

    if(changes.length > 0) {
        const logEntry = { id: auditLog.length + 1, serverName, ruleName: newData.ruleName, action, user: 'Admin', timestamp: new Date().toISOString(), changes };
        setAuditLog(prev => [...prev, logEntry]);
    }
  }

  const handleFormSubmit = (values: Partial<PortRule>) => {
    if (rule) {
        const changes = [];
        for (const key in values) {
             if (values.hasOwnProperty(key as keyof PortRule) && rule.hasOwnProperty(key as keyof PortRule)) {
                if ((values as any)[key] !== (rule as any)[key]) {
                    changes.push({ field: key, label: getFieldName(key), oldValue: (rule as any)[key], newValue: (values as any)[key] });
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
    if(editData && rule) {
        const updatedRule: PortRule = { ...rule, ...editData, dModifiedOn: new Date().toISOString(), vUserName: 'Admin' };

        const storedData = sessionStorage.getItem('allPortRules');
        const allData: { serverName: string, rules: PortRule[] }[] = storedData ? JSON.parse(storedData) : [];
        const updatedAllData = allData.map(server => {
            if (server.serverName === serverName) {
                const ruleIndex = server.rules.findIndex(r => r.ruleName === rule.ruleName);
                if (ruleIndex !== -1) {
                    server.rules[ruleIndex] = updatedRule;
                }
            }
            return server;
        });
        sessionStorage.setItem('allPortRules', JSON.stringify(updatedAllData));
        
        setRule(updatedRule);
        createAuditLog('Edit', remarks, serverName, rule, updatedRule);
        toast({ title: "Rule Updated", description: `Rule "${updatedRule.ruleName}" has been updated.` });
    }
    setEditData(null);
    setDetectedChanges([]);
    setIsRemarkDialogOpen(false);
  }

  if (rule === undefined) {
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
                <p>Loading port rule details...</p>
            </CardContent>
        </Card>
    );
  }
  
  if (rule === null) {
    return (
      <div className="flex flex-col items-center justify-center h-full text-center">
        <ShieldCheck className="w-16 h-16 text-muted-foreground mb-4" />
        <h1 className="text-2xl font-bold">Port Rule Not Found</h1>
        <p className="text-muted-foreground">The rule you are looking for does not exist for this server.</p>
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
                        <ShieldCheck className="h-6 w-6" /> {rule.ruleName}
                    </CardTitle>
                    <CardDescription>
                        Detailed information for rule on server: {serverName}
                    </CardDescription>
                </div>
                </div>
            </CardHeader>
            <CardContent className="space-y-6">
                <div>
                    <h3 className="text-lg font-semibold mb-4 text-primary">Rule Details</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        <DetailItem icon={Server} label="Server" value={serverName} />
                        <DetailItem icon={Type} label="Rule Name" value={rule.ruleName} />
                        <DetailItem icon={Globe} label="Rule" value={<Badge variant={rule.rule === 'Allowed' ? 'default' : 'destructive'}>{rule.rule}</Badge>} />
                        <DetailItem icon={Network} label="Rule Type" value={rule.ruleType} />
                        <DetailItem icon={Terminal} label="Port" value={rule.port} />
                        <DetailItem icon={GitBranch} label="Protocol" value={rule.protocol} />
                        <DetailItem icon={Globe} label="Source IP" value={<span className="font-mono">{rule.source}</span>} />
                        <DetailItem icon={ShieldCheck} label="Active" value={<Badge variant={rule.status === 'Y' ? 'secondary' : 'outline'}>{rule.status}</Badge>} />
                    </div>
                </div>
                <Separator />
                <div>
                    <h3 className="text-lg font-semibold mb-4 text-primary">Metadata</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        <DetailItem icon={User} label="Modified by" value={rule.vUserName} />
                        <DetailItem icon={Clock} label="Last Modified On" value={<ClientOnlyDate date={rule.dModifiedOn} />} />
                    </div>
                </div>
            </CardContent>
             <CardFooter className="flex justify-end">
                <Button onClick={() => setIsFormOpen(true)}>
                    <Edit className="mr-2 h-4 w-4" /> Edit Rule
                </Button>
            </CardFooter>
            </Card>
            <PortRuleForm 
                mode="edit"
                key={rule.ruleName}
                initialData={rule}
                onSubmit={handleFormSubmit}
                onClose={() => setIsFormOpen(false)}
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
    </>
  );
}
