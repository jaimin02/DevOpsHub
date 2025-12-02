
'use client';

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { useState, useEffect } from 'react';
import { Button } from './ui/button';
import { Separator } from './ui/separator';
import { Badge } from './ui/badge';

interface Change {
    field: string;
    label: string;
    oldValue: any;
    newValue: any;
}

interface RemarkDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onConfirm: (remarks: { [key: string]: string }) => void;
  title?: string;
  description?: string;
  buttonText?: string;
  changes?: Change[];
}

export function DeleteWithRemarkDialog({ 
  open, 
  onOpenChange, 
  onConfirm,
  title = "Are you absolutely sure?",
  description = "This action requires a remark. Please provide a reason below.",
  buttonText = "Continue",
  changes = [],
}: RemarkDialogProps) {
  const [remarks, setRemarks] = useState<{ [key: string]: string }>({});
  const [errors, setErrors] = useState<{ [key: string]: string }>({});

  useEffect(() => {
    if (open && changes.length > 0) {
      // Initialize remarks for each change
      const initialRemarks = changes.reduce((acc, change) => {
        acc[change.field] = '';
        return acc;
      }, {} as { [key: string]: string });
      setRemarks(initialRemarks);
      setErrors({});
    } else if (open && changes.length === 0) {
        // Handle the case with no specific changes (general remark)
        setRemarks({ default: '' });
        setErrors({});
    }
  }, [open, changes]);

  const handleConfirm = () => {
    const newErrors: { [key: string]: string } = {};
    let allValid = true;
    
    if (changes.length > 0) {
        for (const change of changes) {
            if (!remarks[change.field] || remarks[change.field].length < 5) {
                newErrors[change.field] = 'Remark must be at least 5 characters long.';
                allValid = false;
            }
        }
    } else {
        if (!remarks.default || remarks.default.length < 5) {
            newErrors.default = 'Remark must be at least 5 characters long.';
            allValid = false;
        }
    }

    if (!allValid) {
        setErrors(newErrors);
        return;
    }

    onConfirm(remarks);
    onOpenChange(false);
  };

  const handleCancel = () => {
    onOpenChange(false);
  }

  const handleRemarkChange = (field: string, value: string) => {
    setRemarks(prev => ({ ...prev, [field]: value }));
    if (errors[field]) {
        const newErrors = { ...errors };
        delete newErrors[field];
        setErrors(newErrors);
    }
  }

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent className="max-w-2xl">
        <AlertDialogHeader>
          <AlertDialogTitle>{title}</AlertDialogTitle>
          <AlertDialogDescription>{description}</AlertDialogDescription>
        </AlertDialogHeader>
        <div className="max-h-[60vh] overflow-y-auto space-y-4 p-1">
            {changes.length > 0 ? (
                changes.map((change, index) => (
                    <div key={change.field} className="space-y-3">
                        <div className='flex flex-col gap-2 rounded-lg border p-4'>
                            <div className="flex justify-between items-center">
                                <h4 className="font-semibold capitalize">{change.label}</h4>
                            </div>
                            <div className="flex items-center gap-2 text-sm">
                                <Badge variant="destructive">{String(change.oldValue)}</Badge>
                                <span>→</span>
                                <Badge variant="default">{String(change.newValue)}</Badge>
                            </div>
                            <div className="grid w-full gap-2 mt-2">
                                <Label htmlFor={`remark-${change.field}`}>Remark <span className="text-destructive">*</span></Label>
                                <Textarea
                                    id={`remark-${change.field}`}
                                    placeholder={`Reason for changing ${change.label}...`}
                                    value={remarks[change.field] || ''}
                                    onChange={(e) => handleRemarkChange(change.field, e.target.value)}
                                />
                                {errors[change.field] && <p className="text-sm font-medium text-destructive">{errors[change.field]}</p>}
                            </div>
                        </div>
                        {index < changes.length - 1 && <Separator />}
                    </div>
                ))
            ) : (
                 <div className="grid w-full gap-2 mt-2">
                    <Label htmlFor="default-remark">Remark <span className="text-destructive">*</span></Label>
                    <Textarea
                        id="default-remark"
                        placeholder="Please provide a reason..."
                        value={remarks.default || ''}
                        onChange={(e) => handleRemarkChange('default', e.target.value)}
                    />
                    {errors.default && <p className="text-sm font-medium text-destructive">{errors.default}</p>}
                </div>
            )}
        </div>
        <AlertDialogFooter>
          <AlertDialogCancel asChild>
             <Button type="button" variant="secondary" onClick={handleCancel}>Cancel</Button>
          </AlertDialogCancel>
          <AlertDialogAction asChild>
            <Button onClick={handleConfirm}>{buttonText}</Button>
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}

    