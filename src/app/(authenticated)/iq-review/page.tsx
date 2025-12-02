
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
import { Input } from '@/components/ui/input';
import { CheckSquare, Search, Send } from 'lucide-react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { IQRequest } from '@/app/iq-required/page';
import { initialRequests } from '@/lib/data';
import { useRouter } from 'next/navigation';
import { useToast } from '@/hooks/use-toast';
import { IQRequiredFormContent } from '@/components/IQRequiredForm';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';

const REVIEWER_NAME = 'Reviewer Admin';

export default function IQReviewPage() {
  const [requests, setRequests] = useState<IQRequest[]>(initialRequests);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedRequest, setSelectedRequest] = useState<IQRequest | undefined>(undefined);
  const [isReviewOpen, setIsReviewOpen] = useState(false);
  const [isSendBackOpen, setIsSendBackOpen] = useState(false);
  const [reviewRemark, setReviewRemark] = useState('');
  const [remarkError, setRemarkError] = useState('');
  const router = useRouter();
  const { toast } = useToast();

  useEffect(() => {
    try {
      const allRequestsStr = sessionStorage.getItem('allIqRequests');
      if (allRequestsStr) {
        const parsedRequests = JSON.parse(allRequestsStr).map((req: any) => ({
          ...req,
          requestDate: new Date(req.requestDate),
        }));
        setRequests(parsedRequests);
      }
    } catch (error) {
      console.error("Failed to parse requests from sessionStorage", error);
      setRequests(initialRequests);
    }
  }, []);

  const pendingRequests = useMemo(() => {
    return requests.filter(req => req.status === 'Pending Approval');
  }, [requests]);

  const filteredRequests = useMemo(() => {
    if (!searchQuery) return pendingRequests;
    const lowercasedQuery = searchQuery.toLowerCase();
    return pendingRequests.filter(req =>
      Object.values(req).some(value =>
        String(value).toLowerCase().includes(lowercasedQuery)
      )
    );
  }, [searchQuery, pendingRequests]);

  const handleReviewClick = (request: IQRequest) => {
    setSelectedRequest(request);
    setReviewRemark('');
    setRemarkError('');
    setIsReviewOpen(true);
  };
  
  const updateRequestStatus = (id: string, status: IQRequest['status'], remark?: string) => {
      const updatedRequests = requests.map(req => 
        req.id === id ? { ...req, status, reviewerRemark: remark, reviewedBy: REVIEWER_NAME, reviewDate: new Date() } : req
      );
      setRequests(updatedRequests);
      sessionStorage.setItem('allIqRequests', JSON.stringify(updatedRequests));
      return updatedRequests.find(req => req.id === id);
  }

  const handleApprove = () => {
    if (!selectedRequest) return;
    
    const updatedRequest = updateRequestStatus(selectedRequest.id, 'Approved');

    const approvedRequestData = JSON.stringify(updatedRequest);
    
    toast({
      title: "Request Approved",
      description: `Request ${selectedRequest.id} has been approved and a new IQ record is being created.`,
    });
    
    setIsReviewOpen(false);
    router.push(`/iq-details?approvedRequest=${encodeURIComponent(approvedRequestData)}`);
  };

  const handleConfirmSendBack = () => {
    if (!reviewRemark) {
        setRemarkError('A remark is required to send this request back.');
        return;
    }
    if (!selectedRequest) return;

    updateRequestStatus(selectedRequest.id, 'Send Back', reviewRemark);

    toast({
        title: "Request Sent Back",
        description: `Request ${selectedRequest.id} has been sent back to the user for revision.`,
        variant: "default",
    });

    setIsSendBackOpen(false);
    setIsReviewOpen(false);
  }

  return (
    <>
      <Card>
        <CardHeader>
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <CardTitle className="flex items-center gap-2">
                <CheckSquare className="h-6 w-6" />
                IQ Checklist Review
              </CardTitle>
              <CardDescription>
                Review and approve pending IQ checklist requests.
              </CardDescription>
            </div>
          </div>
          <div className="relative mt-4">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                  type="search"
                  placeholder="Search pending requests..."
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
                <TableHead>Requested By</TableHead>
                <TableHead>Request Date</TableHead>
                <TableHead>Status</TableHead>
                <TableHead><span className="sr-only">Actions</span></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredRequests.map((req) => (
                <TableRow key={req.id}>
                  <TableCell className="font-medium">{req.id}</TableCell>
                  <TableCell>{req.projectCode}</TableCell>
                  <TableCell>{req.user}</TableCell>
                  <TableCell>{req.requestDate ? new Date(req.requestDate).toLocaleDateString() : ''}</TableCell>
                  <TableCell>
                    <Badge variant="secondary">{req.status}</Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    <Button variant="outline" size="sm" onClick={() => handleReviewClick(req)}>
                      Review
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
           {filteredRequests.length === 0 && (
                <div className="text-center py-10 text-muted-foreground">
                    No pending requests to review.
                </div>
            )}
        </CardContent>
      </Card>
      
      <Dialog open={isReviewOpen} onOpenChange={setIsReviewOpen}>
        <DialogContent className="max-w-3xl flex flex-col h-full max-h-[90vh]">
             <DialogHeader>
                <DialogTitle>Review IQ Checklist Request: {selectedRequest?.id}</DialogTitle>
                <DialogDescription>
                    Review the details below and approve or send back the request.
                </DialogDescription>
            </DialogHeader>
            <div className="flex-1 overflow-y-auto pr-4 -mr-4">
                {selectedRequest && <IQRequiredFormContent mode="view" initialData={selectedRequest} />}
            </div>
            <div className="flex-shrink-0 pt-4 border-t flex justify-end gap-4">
              <Button variant="outline" onClick={() => setIsReviewOpen(false)}>Cancel</Button>
              <Button variant="secondary" onClick={() => setIsSendBackOpen(true)}>
                <Send className="mr-2 h-4 w-4" />
                Send Back
              </Button>
              <Button onClick={handleApprove}>Approve</Button>
            </div>
        </DialogContent>
      </Dialog>

      <AlertDialog open={isSendBackOpen} onOpenChange={setIsSendBackOpen}>
          <AlertDialogContent>
              <AlertDialogHeader>
                  <AlertDialogTitle>Send Back for Revision</AlertDialogTitle>
                  <AlertDialogDescription>
                      Please provide a remark explaining why this request is being sent back. This is required.
                  </AlertDialogDescription>
              </AlertDialogHeader>
              <div className="grid w-full gap-2">
                <Label htmlFor="review-remark" className="sr-only">Review Remarks</Label>
                <Textarea 
                  id="review-remark"
                  placeholder="Type your feedback here..."
                  value={reviewRemark}
                  onChange={(e) => {
                    setReviewRemark(e.target.value)
                    if (remarkError) setRemarkError('');
                  }}
                />
                {remarkError && <p className="text-sm font-medium text-destructive">{remarkError}</p>}
              </div>
              <AlertDialogFooter>
                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                  <AlertDialogAction onClick={handleConfirmSendBack}>Confirm Send Back</AlertDialogAction>
              </AlertDialogFooter>
          </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
