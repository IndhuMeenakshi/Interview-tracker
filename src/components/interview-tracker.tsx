"use client";

import { useState, useEffect } from 'react';
import type { Interview, InterviewStage } from '@/lib/types';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogClose,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { InterviewCard } from '@/components/interview-card';
import { Plus, Workflow } from 'lucide-react';

const initialInterviews: Interview[] = [
  {
    id: '1',
    companyName: 'Innovate Inc.',
    stages: [
      { id: '1-1', name: 'Application Sent', date: new Date(new Date().setDate(new Date().getDate()-10)).toISOString() },
      { id: '1-2', name: 'Phone Screen', date: new Date(new Date().setDate(new Date().getDate()-5)).toISOString() },
    ],
    status: 'Pending',
  },
  {
    id: '2',
    companyName: 'Quantum Solutions',
    stages: [
      { id: '2-1', name: 'Application', date: new Date(new Date().setDate(new Date().getDate()-20)).toISOString() },
      { id: '2-2', name: 'Technical Interview', date: new Date(new Date().setDate(new Date().getDate()-15)).toISOString() },
      { id: '2-3', name: 'Final Interview', date: new Date(new Date().setDate(new Date().getDate()-10)).toISOString() },
      { id: '2-4', name: 'Offer Received', date: new Date(new Date().setDate(new Date().getDate()-2)).toISOString() },
    ],
    status: 'Offer',
    offerLetterUrl: 'https://example.com/offer',
    compensation: '$120,000 per year',
    startDate: '2024-08-01',
  },
];

export function InterviewTracker() {
  const [interviews, setInterviews] = useState<Interview[]>([]);
  const [newCompanyName, setNewCompanyName] = useState('');
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
    // You can load interviews from localStorage here if you want persistence
    setInterviews(initialInterviews);
  }, []);

  const handleAddInterview = () => {
    if (newCompanyName.trim()) {
      const newInterview: Interview = {
        id: Date.now().toString(),
        companyName: newCompanyName.trim(),
        stages: [],
        status: 'Pending',
      };
      setInterviews([newInterview, ...interviews]);
      setNewCompanyName('');
      setIsDialogOpen(false);
    }
  };

  const handleUpdateInterview = (updatedInterview: Interview) => {
    setInterviews(interviews.map(interview =>
      interview.id === updatedInterview.id ? updatedInterview : interview
    ));
  };
  
  const handleDeleteInterview = (interviewId: string) => {
    setInterviews(interviews.filter(interview => interview.id !== interviewId));
  };

  if (!isClient) {
    return null; // or a loading skeleton
  }

  return (
    <div className="container mx-auto px-4 py-8 sm:px-6 lg:px-8">
      <div className="flex flex-col items-start justify-between gap-4 border-b pb-6 sm:flex-row sm:items-center">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Your Applications</h2>
          <p className="text-muted-foreground">Manage and track your job interview pipeline.</p>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              Add Application
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[425px]">
            <DialogHeader>
              <DialogTitle>Add New Application</DialogTitle>
              <DialogDescription>
                Enter the name of the company you're applying to.
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="company-name" className="text-right">
                  Company
                </Label>
                <Input
                  id="company-name"
                  value={newCompanyName}
                  onChange={e => setNewCompanyName(e.target.value)}
                  className="col-span-3"
                  placeholder="e.g., Google"
                  onKeyDown={(e) => e.key === 'Enter' && handleAddInterview()}
                />
              </div>
            </div>
            <DialogFooter>
                <Button type="submit" onClick={handleAddInterview}>Add Company</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      {interviews.length > 0 ? (
        <div className="mt-8 grid gap-6 sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
          {interviews.map(interview => (
            <InterviewCard
              key={interview.id}
              interview={interview}
              onUpdate={handleUpdateInterview}
              onDelete={handleDeleteInterview}
            />
          ))}
        </div>
      ) : (
        <div className="mt-16 flex flex-col items-center justify-center text-center">
          <Workflow className="h-16 w-16 text-muted-foreground/50" />
          <h3 className="mt-4 text-xl font-semibold">No applications yet</h3>
          <p className="mt-2 text-muted-foreground">Click "Add Application" to start tracking your interviews.</p>
        </div>
      )}
    </div>
  );
}
