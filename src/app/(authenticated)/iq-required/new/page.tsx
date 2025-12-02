
'use client';

import { IQRequiredForm } from "@/components/IQRequiredForm";
import { useRouter } from "next/navigation";
import type { IQRequest } from "@/app/iq-required/page";
import { initialRequests } from "@/lib/data";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Button } from "@/components/ui/button";
import { Copy } from "lucide-react";
import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

const LOGGED_IN_USER = 'Admin';

export default function NewIQRequiredPage() {
    const router = useRouter();
    const [template, setTemplate] = useState<Partial<IQRequest> | undefined>(undefined);
    
    const handleSubmit = (values: Partial<IQRequest>, action: 'save' | 'send') => {
        try {
            const allRequestsStr = sessionStorage.getItem('allIqRequests');
            const allRequests: IQRequest[] = allRequestsStr ? JSON.parse(allRequestsStr) : initialRequests;
            
            // Generate a reliable new ID
            const lastIdNum = allRequests.reduce((max, req) => {
                const num = parseInt(req.id.split('-')[1]);
                return num > max ? num : max;
            }, 0);
            const newId = `REQ-${String(lastIdNum + 1).padStart(3, '0')}`;

            const newRequest = {
                ...values,
                id: newId,
                user: LOGGED_IN_USER,
                status: action === 'send' ? 'Pending Approval' : 'Draft',
                requestDate: new Date(),
            };

            const updatedRequests = [...allRequests, newRequest];
            sessionStorage.setItem('allIqRequests', JSON.stringify(updatedRequests));
            
            router.push('/iq-required');

        } catch (e) {
            console.error("Could not update session storage", e);
            // Optionally: show a toast notification to the user
        }
    };

    const handleSelectTemplate = (reqId: string) => {
        const allRequestsStr = sessionStorage.getItem('allIqRequests');
        const allRequests : IQRequest[] = allRequestsStr ? JSON.parse(allRequestsStr) : initialRequests;
        const selectedRequest = allRequests.find(req => req.id === reqId);
        
        if (selectedRequest) {
            const templateData = { ...selectedRequest };
            // Clear fields that should not be copied from a template
            delete templateData.id;
            delete templateData.status;
            delete templateData.reviewedBy;
            delete templateData.reviewDate;
            delete templateData.reviewerRemark;
            setTemplate(templateData);
        }
    };

    const getAvailableTemplates = () => {
        if (typeof window === 'undefined') return initialRequests;
        const allRequestsStr = sessionStorage.getItem('allIqRequests');
        return allRequestsStr ? JSON.parse(allRequestsStr) : initialRequests;
    }

    return (
        <Card>
            <CardHeader>
                <div className="flex justify-between items-center">
                    <div>
                        <CardTitle>Create New IQ Checklist Request</CardTitle>
                        <CardDescription>
                            Fill in all details to create a new IQ Checklist Request.
                        </CardDescription>
                    </div>
                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <Button variant="outline">
                                <Copy className="mr-2 h-4 w-4" />
                                Copy from Existing
                            </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent>
                            {getAvailableTemplates().map((req: IQRequest) => (
                                <DropdownMenuItem key={req.id} onSelect={() => handleSelectTemplate(req.id)}>
                                    {req.id} - {req.projectCode}
                                </DropdownMenuItem>
                            ))}
                        </DropdownMenuContent>
                    </DropdownMenu>
                </div>
            </CardHeader>
            <CardContent>
                <IQRequiredForm mode="add" initialData={template} onSubmit={handleSubmit} />
            </CardContent>
        </Card>
    )
}
