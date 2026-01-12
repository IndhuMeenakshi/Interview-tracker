"use client";

import React, { useEffect, useActionState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { format } from 'date-fns';
import type { Job } from '@/lib/types';
import { extractOfferInfo, type FormState } from '@/lib/actions';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
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
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
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
} from "@/components/ui/alert-dialog";
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';
import { SubmitButton } from '@/components/submit-button';
import { MoreVertical, Trash2, ClipboardPaste, Info, Briefcase, MapPin, Package, FileText } from 'lucide-react';

interface InterviewCardProps {
  job: Job;
  onUpdate: (job: Partial<Job> & { id: string }) => void;
  onDelete: (id: string) => void;
}

export function InterviewCard({ job, onUpdate, onDelete }: InterviewCardProps) {
  const { toast } = useToast();

  const initialState: FormState = { data: null, message: '' };
  const [state, formAction] = useActionState(extractOfferInfo, initialState);
  
  const statusColors: { [key in Job['status']]: string } = {
    Applied: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300 hover:bg-blue-200',
    Interviewing: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300 hover:bg-yellow-200',
    Offer: 'bg-accent text-accent-foreground hover:bg-green-300',
    Rejected: 'bg-destructive/20 text-destructive-foreground hover:bg-destructive/30',
  };

  const handleStatusChange = (status: Job['status']) => {
    onUpdate({ id: job.id, status });
  };
  
  useEffect(() => {
    if (state?.message === 'success' && state.data) {
      const offerLetterUrl = (document.querySelector(`form[data-job-id="${job.id}"] input[name="offerLetterUrl"]`) as HTMLInputElement)?.value;
      onUpdate({ id: job.id, compensation: state.data.compensation, startDate: state.data.startDate, offerLetterUrl });
      toast({
        title: '✨ Offer Details Extracted!',
        description: 'Compensation and start date have been updated.',
      });
    } else if (state?.message && state.message !== 'success') {
      toast({
        variant: 'destructive',
        title: 'Extraction Failed',
        description: state.message,
      });
    }
  }, [state, job.id, onUpdate, toast]);

  return (
    <Card className="flex flex-col overflow-hidden transition-all hover:shadow-lg">
      <CardHeader className="flex-row items-start justify-between gap-4">
        <div className="flex-1">
          <CardTitle className="text-lg font-bold">{job.companyName}</CardTitle>
          <CardDescription className="flex flex-col gap-1 mt-2">
            <div className="flex items-center gap-2 text-sm"><Briefcase className="h-4 w-4 text-muted-foreground" /> {job.role}</div>
            <div className="flex items-center gap-2 text-sm"><MapPin className="h-4 w-4 text-muted-foreground" /> {job.location || 'Not specified'}</div>
            <div className="flex items-center gap-2 text-sm"><Package className="h-4 w-4 text-muted-foreground" /> {job.package || 'Not specified'}</div>
          </CardDescription>
        </div>
        <div className="flex flex-col items-end gap-2">
            <Badge className={cn("border", statusColors[job.status])}>{job.status}</Badge>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="h-8 w-8 flex-shrink-0">
                  <MoreVertical className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onSelect={() => handleStatusChange('Applied')}>Mark as Applied</DropdownMenuItem>
                <DropdownMenuItem onSelect={() => handleStatusChange('Interviewing')}>Mark as Interviewing</DropdownMenuItem>
                <DropdownMenuItem onSelect={() => handleStatusChange('Offer')}>Mark as Offer</DropdownMenuItem>
                <DropdownMenuItem onSelect={() => handleStatusChange('Rejected')}>Mark as Rejected</DropdownMenuItem>
                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <DropdownMenuItem onSelect={e => e.preventDefault()} className="text-red-600 focus:text-red-600 focus:bg-red-50">
                        <Trash2 className="mr-2 h-4 w-4" /> Delete
                    </DropdownMenuItem>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                      <AlertDialogDescription>
                        This will permanently delete the application for {job.companyName}. This action cannot be undone.
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>Cancel</AlertDialogCancel>
                      <AlertDialogAction onClick={() => onDelete(job.id)} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">Delete</AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              </DropdownMenuContent>
            </DropdownMenu>
        </div>
      </CardHeader>
      <CardContent className="flex-1 space-y-4">
        {job.offerLetterUrl && (
          <Accordion type="single" collapsible>
            <AccordionItem value="item-2">
              <AccordionTrigger className="text-sm font-semibold">Documents</AccordionTrigger>
              <AccordionContent>
                <a href={job.offerLetterUrl} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 text-sm text-blue-600 underline">
                  <FileText className="h-4 w-4" />
                  View Offer Letter
                </a>
              </AccordionContent>
            </AccordionItem>
          </Accordion>
        )}
        
        {job.status === 'Offer' && (
          <div className="border-t pt-4">
            <h4 className="font-semibold text-sm mb-2">Offer Details</h4>
            {job.compensation && job.startDate ? (
              <div className="space-y-2 text-sm rounded-lg border border-green-200 bg-green-50 p-4 dark:border-green-800 dark:bg-green-900/30">
                <p><strong>Compensation:</strong> {job.compensation}</p>
                <p><strong>Start Date:</strong> {format(new Date(job.startDate), 'PPP')}</p>
                 <p className="text-xs text-muted-foreground truncate">
                    <strong>Source:</strong> <a href={job.offerLetterUrl} target="_blank" rel="noopener noreferrer" className="underline">{job.offerLetterUrl}</a>
                </p>
              </div>
            ) : (
              <form action={formAction} data-job-id={job.id} className="space-y-3">
                 <Label htmlFor={`offerLetterUrl-${job.id}`} className="text-xs text-muted-foreground">Offer Letter URL</Label>
                <div className="flex gap-2">
                  <Input name="offerLetterUrl" id={`offerLetterUrl-${job.id}`} type="url" placeholder="https://..." required />
                  <SubmitButton size="icon"><ClipboardPaste /></SubmitButton>
                </div>
                {state?.message && state.message !== 'success' && <p className="text-xs text-destructive">{state.message}</p>}
                <p className="flex items-start gap-2 text-xs text-muted-foreground"><Info className="h-4 w-4 flex-shrink-0 mt-0.5" /> <span>Our AI will scan the URL to extract key info like compensation and start date.</span></p>
              </form>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
