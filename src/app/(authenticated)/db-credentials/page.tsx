
'use client';

import { useState, useMemo } from 'react';
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
import { Button } from '@/components/ui/button';
import { Dialog } from '@/components/ui/dialog';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { MoreHorizontal, KeyRound, Search, Edit } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { initialDbCredentials, DbCredential } from '@/lib/data';
import { ClientOnlyDate } from '@/components/ClientOnlyDate';
import { DbCredentialForm } from '@/components/DbCredentialForm';

export default function DbCredentialsPage() {
    const [credentials, setCredentials] = useState<DbCredential[]>(initialDbCredentials);
    const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
    const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
    const [selectedCredential, setSelectedCredential] = useState<DbCredential | undefined>(undefined);
    const [searchQuery, setSearchQuery] = useState('');

    const filteredData = useMemo(() => {
        if (!searchQuery) return credentials;
        const lowercasedQuery = searchQuery.toLowerCase();
        return credentials.filter(item =>
            Object.values(item).some(value =>
                String(value).toLowerCase().includes(lowercasedQuery)
            )
        );
    }, [searchQuery, credentials]);

    const handleEditClick = (record: DbCredential) => {
        setSelectedCredential(record);
        setIsEditDialogOpen(true);
    };

    const handleAddNewClick = () => {
        setSelectedCredential(undefined);
        setIsAddDialogOpen(true);
    }
    
    const handleSubmit = (values: DbCredential, remark?: string) => {
        const mode = isAddDialogOpen ? 'add' : 'edit';
        console.log(`Submitting in ${mode} mode with remark: ${remark}`);

        if (mode === 'add') {
             const newCredential = {
                ...values,
                id: Math.max(...credentials.map(c => c.id), 0) + 1,
                dModifiedOn: new Date().toISOString(),
                vUserName: 'Admin'
             };
             setCredentials(prev => [...prev, newCredential]);
        } else if (mode === 'edit' && selectedCredential) {
            setCredentials(prev => prev.map(c => c.id === selectedCredential.id ? { ...c, ...values, dModifiedOn: new Date().toISOString() } : c));
        }
    };
    
  return (
    <>
      <Card>
        <CardHeader>
          <div className="flex flex-row items-start justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <KeyRound className="h-5 w-5" /> Database Credentials
              </CardTitle>
              <CardDescription>
                Manage database usernames and passwords for your servers.
              </CardDescription>
            </div>
            <Button onClick={handleAddNewClick}>Add New Credential</Button>
          </div>
          <div className="relative mt-4">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  type="search"
                  placeholder="Search credentials..."
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
                <TableHead>Server Name</TableHead>
                <TableHead>Database Name</TableHead>
                <TableHead>DB User Name</TableHead>
                <TableHead>IP Address</TableHead>
                <TableHead>OS</TableHead>
                <TableHead>Last Modified By</TableHead>
                <TableHead>Last Modified On</TableHead>
                <TableHead><span className="sr-only">Actions</span></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredData.map((cred) => (
                <TableRow key={cred.id}>
                  <TableCell className="font-medium">{cred.serverName}</TableCell>
                  <TableCell>{cred.dbName}</TableCell>
                  <TableCell>{cred.dbUserName}</TableCell>
                  <TableCell>{cred.ipAddress}</TableCell>
                  <TableCell>{cred.os}</TableCell>
                  <TableCell>{cred.vUserName}</TableCell>
                  <TableCell><ClientOnlyDate date={cred.dModifiedOn} /></TableCell>
                  <TableCell>
                      <Button variant="ghost" size="icon" onClick={() => handleEditClick(cred)}>
                        <Edit className="h-4 w-4" />
                        <span className="sr-only">Edit</span>
                      </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
      <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
       <DbCredentialForm mode="add" onSubmit={handleSubmit} onClose={() => setIsAddDialogOpen(false)} />
    </Dialog>
     <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
      <DbCredentialForm mode="edit" initialData={selectedCredential} onSubmit={handleSubmit} onClose={() => setIsEditDialogOpen(false)} />
    </Dialog>
    </>
  );
}
