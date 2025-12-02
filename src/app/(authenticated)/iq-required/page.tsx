

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
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { PlusCircle, Search, ClipboardList } from 'lucide-react';
import { Dialog } from '@/components/ui/dialog';
import { IQRequiredForm } from '@/components/IQRequiredForm';
import { initialRequests } from '@/lib/data';
import { SsplServerDetail, ClientAppServerDetail, ApplicationUrl } from '@/components/IQRequiredForm';


// Mock data for user's checklist requests
export type IQRequest = {
  id: string;
  projectCode: string;
  crNoDetails: string;
  requestDate: Date;
  status: 'Draft' | 'Pending Approval' | 'Approved' | 'Rejected' | 'Send Back';
  user: string;
  clientFullName: string;
  projectVersion: string;
  ssplContactPerson: string;
  clientContactPerson: string;
  environment: string;
  requestBy: string;
  signatureMode: 'DoQStack Sign' | 'PDF Sign' | 'Others';
  remark?: string;
  ssplServers?: SsplServerDetail[];
  isClientServer?: boolean;
  clientServerContactPerson?: string;
  clientServerContactNo?: string;
  clientServerAlternateContactNo?: string;
  clientServerEmail?: string;
  clientServerConnectionMode?: string;
  clientServerConnectionModeOther?: string;
  ipOrConnectionModeNo?: string;
  userId?: string;
  password?: string;
  otherClientDetail?: string;
  clientAppServers?: ClientAppServerDetail[];
  applicationUrls?: ApplicationUrl[];
  packageLocationApp?: string;
  packageLocationDb?: string;
  finalRemarks?: string;
  reviewedBy?: string;
  reviewDate?: Date;
  reviewerRemark?: string;
};

// Assuming a logged-in user
const LOGGED_IN_USER = 'Admin';

function getInitialState(): IQRequest[] {
    const data = initialRequests.map(req => ({
        ...req,
        requestDate: new Date(req.requestDate),
        reviewDate: req.reviewDate ? new Date(req.reviewDate) : undefined,
    }));
    if (typeof window !== 'undefined') {
        sessionStorage.setItem('allIqRequests', JSON.stringify(data));
    }
    return data;
}


export default function IQRequiredListPage() {
  const [requests, setRequests] = useState<IQRequest[]>(initialRequests.map(req => ({ ...req, requestDate: new Date(req.requestDate), reviewDate: req.reviewDate ? new Date(req.reviewDate) : undefined })));
  const [searchQuery, setSearchQuery] = useState('');
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [selectedRequest, setSelectedRequest] = useState<IQRequest | undefined>(undefined);

  useEffect(() => {
    try {
        const allRequestsStr = sessionStorage.getItem('allIqRequests');
        if (allRequestsStr) {
            const storedRequests = JSON.parse(allRequestsStr).map((req: any) => ({
                ...req,
                requestDate: new Date(req.requestDate),
                reviewDate: req.reviewDate ? new Date(req.reviewDate) : undefined,
            }));
            setRequests(storedRequests);
        } else {
            getInitialState();
        }
    } catch (e) {
        console.error("Could not parse requests from session storage", e);
        setRequests(initialRequests.map(req => ({ ...req, requestDate: new Date(req.requestDate), reviewDate: req.reviewDate ? new Date(req.reviewDate) : undefined })));
    }
  }, []);

  const userRequests = useMemo(() => {
    return requests.filter(req => req.user === LOGGED_IN_USER);
  }, [requests]);

  const filteredRequests = useMemo(() => {
    if (!searchQuery) return userRequests;
    const lowercasedQuery = searchQuery.toLowerCase();
    return userRequests.filter(req =>
      Object.values(req).some(value =>
        String(value).toLowerCase().includes(lowercasedQuery)
      )
    );
}, [searchQuery, userRequests]);

  const handleViewClick = (request: IQRequest) => {
    setSelectedRequest(request);
    setIsFormOpen(true);
  };
  
  const handleFormSubmit = (values: Partial<IQRequest>, action: 'save' | 'send') => {
    console.log(`Action: ${action}`, values);

    // In a real app, you'd send this to an API
    const updatedRequests = requests.map(req => {
      if (req.id === values.id) {
        return {
          ...req,
          ...values,
          status: action === 'send' ? 'Pending Approval' : (values.status === 'Send Back' ? 'Draft' : req.status),
        };
      }
      return req;
    });

    setRequests(updatedRequests as IQRequest[]);
    sessionStorage.setItem('allIqRequests', JSON.stringify(updatedRequests)); // Persist changes
    
    setIsFormOpen(false);
    setSelectedRequest(undefined);
  };


  const getStatusVariant = (status: IQRequest['status']): 'default' | 'secondary' | 'destructive' | 'outline' => {
      switch(status) {
          case 'Approved': return 'default';
          case 'Pending Approval': return 'secondary';
          case 'Draft': return 'outline';
          case 'Rejected': return 'destructive';
          case 'Send Back': return 'destructive';
          default: return 'outline';
      }
  }

  return (
    <Dialog open={isFormOpen} onOpenChange={setIsFormOpen}>
        <Card>
          <CardHeader>
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div>
                <CardTitle className="flex items-center gap-2">
                  <ClipboardList className="h-6 w-6" />
                  IQ Checklist Requests
                </CardTitle>
                <CardDescription>
                  Create and manage your IQ checklist requests.
                </CardDescription>
              </div>
              <Button asChild>
                <Link href="/iq-required/new">
                  <PlusCircle className="mr-2 h-4 w-4" />
                  Create New Checklist Request
                </Link>
              </Button>
            </div>
            <div className="relative mt-4">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                    type="search"
                    placeholder="Search your requests..."
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
                  <TableHead>Request ID</TableHead>
                  <TableHead>Project Code</TableHead>
                  <TableHead>CR No. Details</TableHead>
                  <TableHead>Request Date</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Reviewed By</TableHead>
                  <TableHead>Review Date</TableHead>
                  <TableHead><span className="sr-only">Actions</span></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredRequests.map((req) => (
                  <TableRow key={req.id}>
                    <TableCell className="font-medium">{req.id}</TableCell>
                    <TableCell>{req.projectCode}</TableCell>
                    <TableCell>{req.crNoDetails}</TableCell>
                    <TableCell>{req.requestDate ? new Date(req.requestDate).toLocaleDateString() : ''}</TableCell>
                    <TableCell>
                      <Badge variant={getStatusVariant(req.status)}>{req.status}</Badge>
                    </TableCell>
                    <TableCell>{req.reviewedBy ?? 'N/A'}</TableCell>
                    <TableCell>{req.reviewDate ? new Date(req.reviewDate).toLocaleDateString() : 'N/A'}</TableCell>
                    <TableCell className="text-right">
                       <Button variant="outline" size="sm" onClick={() => handleViewClick(req)}>
                          {req.status === 'Send Back' || req.status === 'Draft' ? 'Edit' : 'View'}
                       </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
        {selectedRequest && (
            <IQRequiredForm 
                mode={selectedRequest.status === 'Draft' || selectedRequest.status === 'Send Back' ? 'edit' : 'view'}
                initialData={selectedRequest}
                onSubmit={handleFormSubmit}
                onClose={() => setIsFormOpen(false)}
            />
        )}
    </Dialog>
  );
}
