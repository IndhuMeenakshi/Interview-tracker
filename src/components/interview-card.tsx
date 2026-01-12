"use client";

import React, { useState, useEffect, useMemo } from 'react';
import { useFormState } from 'react-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { format } from 'date-fns';
import type { Interview, InterviewStage } from '@/lib/types';
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
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar } from '@/components/ui/calendar';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';
import { StageIcon } from '@/components/stage-icon';
import { SubmitButton } from '@/components/submit-button';
import { MoreVertical, Trash2, CalendarIcon, Loader2, ClipboardPaste, Info } from 'lucide-react';

interface InterviewCardProps {
  interview: Interview;
  onUpdate: (interview: Interview) => void;
  onDelete: (id: string) => void;
}

const stageSchema = z.object({
  name: z.string().min(3, 'Stage name is required'),
  date: z.date({ required_error: 'A date is required.' }),
});

export function InterviewCard({ interview, onUpdate, onDelete }: InterviewCardProps) {
  const { toast } = useToast();
  const [isStageFormOpen, setIsStageFormOpen] = useState(false);
  const stageForm = useForm<z.infer<typeof stageSchema>>({
    resolver: zodResolver(stageSchema),
  });

  const initialState: FormState = { data: null, message: '' };
  const [state, formAction] = useFormState(extractOfferInfo, initialState);
  
  const statusColors = {
    Pending: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300 hover:bg-blue-200',
    Offer: 'bg-accent text-accent-foreground hover:bg-green-300',
    Rejected: 'bg-destructive/20 text-destructive-foreground hover:bg-destructive/30',
  };

  const handleStatusChange = (status: Interview['status']) => {
    onUpdate({ ...interview, status });
  };
  
  function onAddStage(values: z.infer<typeof stageSchema>) {
    const newStage: InterviewStage = {
      id: Date.now().toString(),
      name: values.name,
      date: values.date.toISOString(),
    };
    onUpdate({ ...interview, stages: [...interview.stages, newStage].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()) });
    stageForm.reset({name: ""});
    setIsStageFormOpen(false);
  }

  useEffect(() => {
    if (state?.message === 'success' && state.data) {
      onUpdate({ ...interview, compensation: state.data.compensation, startDate: state.data.startDate, offerLetterUrl: (document.querySelector('input[name="offerLetterUrl"]') as HTMLInputElement)?.value });
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
  }, [state]);

  const sortedStages = useMemo(() => {
    return [...interview.stages].sort((a,b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  }, [interview.stages]);

  return (
    <Card className="flex flex-col overflow-hidden transition-all hover:shadow-lg">
      <CardHeader className="flex-row items-start justify-between gap-4">
        <div className="flex-1">
          <CardTitle className="text-lg font-bold">{interview.companyName}</CardTitle>
          <CardDescription>
            <Badge className={cn("mt-2 border", statusColors[interview.status])}>{interview.status}</Badge>
          </CardDescription>
        </div>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon" className="h-8 w-8 flex-shrink-0">
              <MoreVertical className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onSelect={() => handleStatusChange('Pending')}>Mark as Pending</DropdownMenuItem>
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
                    This will permanently delete the application for {interview.companyName}. This action cannot be undone.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                  <AlertDialogAction onClick={() => onDelete(interview.id)} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">Delete</AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </DropdownMenuContent>
        </DropdownMenu>
      </CardHeader>
      <CardContent className="flex-1">
        <Accordion type="single" collapsible defaultValue="item-1">
          <AccordionItem value="item-1">
            <AccordionTrigger className="text-sm font-semibold">
              Interview Stages ({interview.stages.length})
            </AccordionTrigger>
            <AccordionContent>
              <div className="space-y-4 pt-2">
                {sortedStages.map(stage => (
                  <div key={stage.id} className="flex items-center gap-3">
                    <StageIcon stageName={stage.name} className="h-5 w-5 text-muted-foreground" />
                    <div className="flex-1">
                      <p className="text-sm font-medium">{stage.name}</p>
                      <p className="text-xs text-muted-foreground">{format(new Date(stage.date), 'PPP')}</p>
                    </div>
                  </div>
                ))}
                
                <form onSubmit={stageForm.handleSubmit(onAddStage)} className="space-y-3 rounded-lg border bg-secondary/50 p-3">
                  <Input placeholder="New stage name" {...stageForm.register('name')} />
                  {stageForm.formState.errors.name && <p className="text-xs text-destructive">{stageForm.formState.errors.name.message}</p>}
                   <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        variant={"outline"}
                        className={cn(
                          "w-full justify-start text-left font-normal",
                          !stageForm.watch('date') && "text-muted-foreground"
                        )}
                      >
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {stageForm.watch('date') ? format(stageForm.watch('date'), "PPP") : <span>Pick a date</span>}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0">
                      <Calendar
                        mode="single"
                        selected={stageForm.watch('date')}
                        onSelect={(date) => stageForm.setValue('date', date as Date)}
                        initialFocus
                      />
                    </PopoverContent>
                  </Popover>
                  {stageForm.formState.errors.date && <p className="text-xs text-destructive">{stageForm.formState.errors.date.message}</p>}
                  <Button type="submit" size="sm" className="w-full">Add Stage</Button>
                </form>
              </div>
            </AccordionContent>
          </AccordionItem>
        </Accordion>
        
        {interview.status === 'Offer' && (
          <div className="mt-4 border-t pt-4">
            <h4 className="font-semibold text-sm mb-2">Offer Details</h4>
            {interview.compensation && interview.startDate ? (
              <div className="space-y-2 text-sm rounded-lg border border-green-200 bg-green-50 p-4 dark:border-green-800 dark:bg-green-900/30">
                <p><strong>Compensation:</strong> {interview.compensation}</p>
                <p><strong>Start Date:</strong> {format(new Date(interview.startDate), 'PPP')}</p>
                 <p className="text-xs text-muted-foreground truncate">
                    <strong>Source:</strong> <a href={interview.offerLetterUrl} target="_blank" rel="noopener noreferrer" className="underline">{interview.offerLetterUrl}</a>
                </p>
              </div>
            ) : (
              <form action={formAction} className="space-y-3">
                 <Label htmlFor="offerLetterUrl" className="text-xs text-muted-foreground">Offer Letter URL</Label>
                <div className="flex gap-2">
                  <Input name="offerLetterUrl" id="offerLetterUrl" type="url" placeholder="https://..." required />
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
