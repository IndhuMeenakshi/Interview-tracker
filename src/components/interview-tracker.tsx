"use client";

import { useState, useEffect } from 'react';
import {
  collection,
  addDoc,
  updateDoc,
  deleteDoc,
  doc,
  query,
  orderBy,
  serverTimestamp,
} from 'firebase/firestore';
import { useAuth, useCollection, useFirestore, useUser, useMemoFirebase } from '@/firebase';
import { initiateAnonymousSignIn, setDocumentNonBlocking, addDocumentNonBlocking, deleteDocumentNonBlocking, updateDocumentNonBlocking } from '@/firebase';
import type { Job } from '@/lib/types';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { InterviewCard } from '@/components/interview-card';
import { Plus, Workflow, Loader2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';


export function InterviewTracker() {
  const { toast } = useToast();
  const auth = useAuth();
  const { user, isUserLoading } = useUser();
  const firestore = useFirestore();

  const jobsQuery = useMemoFirebase(() => 
    user ? query(collection(firestore, `users/${user.uid}/jobs`), orderBy('createdAt', 'desc')) : null
  , [firestore, user]);

  const { data: jobs, isLoading: isJobsLoading } = useCollection<Job>(jobsQuery);
  
  const [newJob, setNewJob] = useState({
    companyName: '',
    role: '',
    location: '',
    package: ''
  });

  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isClient, setIsClient] = useState(false);
  
  useEffect(() => {
    setIsClient(true);
    if (!isUserLoading && !user) {
      initiateAnonymousSignIn(auth);
    }
  }, [isUserLoading, user, auth]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setNewJob(prev => ({...prev, [name]: value}));
  }

  const handleAddJob = () => {
    if (!user) {
      toast({ variant: 'destructive', title: 'Authentication Error', description: 'You must be logged in to add a job.' });
      return;
    }
    if (newJob.companyName.trim() && newJob.role.trim()) {
      const jobsCollection = collection(firestore, `users/${user.uid}/jobs`);
      addDocumentNonBlocking(jobsCollection, {
        ...newJob,
        userId: user.uid,
        stages: [],
        status: 'Applied',
        createdAt: serverTimestamp(),
      });
      
      setNewJob({ companyName: '', role: '', location: '', package: '' });
      setIsDialogOpen(false);
      toast({ title: 'Application Added', description: `${newJob.role} at ${newJob.companyName} has been tracked.` });
    } else {
       toast({ variant: 'destructive', title: 'Missing Information', description: 'Please fill out at least the company name and role.' });
    }
  };

  const handleUpdateJob = (updatedJob: Partial<Job> & { id: string }) => {
    if (!user) return;
    const jobRef = doc(firestore, `users/${user.uid}/jobs/${updatedJob.id}`);
    updateDocumentNonBlocking(jobRef, updatedJob);
  };
  
  const handleDeleteJob = (jobId: string) => {
    if (!user) return;
    const jobRef = doc(firestore, `users/${user.uid}/jobs/${jobId}`);
    deleteDocumentNonBlocking(jobRef);
    toast({ title: 'Application Removed', description: 'The job application has been deleted.' });
  };

  if (!isClient || isUserLoading || isJobsLoading) {
    // You can return a loading skeleton here
    return (
        <div className="container mx-auto px-4 py-8 sm:px-6 lg:px-8">
            <div className="flex flex-col items-start justify-between gap-4 border-b pb-6 sm:flex-row sm:items-center">
                <div>
                    <h2 className="text-2xl font-bold tracking-tight">Your Applications</h2>
                    <p className="text-muted-foreground">Manage and track your job interview pipeline.</p>
                </div>
                <Button disabled><Plus className="mr-2 h-4 w-4" /> Add Application</Button>
            </div>
            <div className="mt-16 flex flex-col items-center justify-center text-center">
                <Loader2 className="h-16 w-16 animate-spin text-muted-foreground/50" />
                <h3 className="mt-4 text-xl font-semibold">Loading your applications...</h3>
                <p className="mt-2 text-muted-foreground">Please wait a moment.</p>
            </div>
        </div>
    );
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
                Enter the details of the job you're applying to.
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="companyName" className="text-right">Company</Label>
                <Input id="companyName" name="companyName" value={newJob.companyName} onChange={handleInputChange} className="col-span-3" placeholder="e.g., Google" />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="role" className="text-right">Role</Label>
                <Input id="role" name="role" value={newJob.role} onChange={handleInputChange} className="col-span-3" placeholder="e.g., Software Engineer" />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="location" className="text-right">Location</Label>
                <Input id="location" name="location" value={newJob.location} onChange={handleInputChange} className="col-span-3" placeholder="e.g., Mountain View, CA" />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="package" className="text-right">Package</Label>
                <Input id="package" name="package" value={newJob.package} onChange={handleInputChange} className="col-span-3" placeholder="e.g., $150,000" />
              </div>
            </div>
            <DialogFooter>
                <Button type="submit" onClick={handleAddJob}>Add Job</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      {jobs && jobs.length > 0 ? (
        <div className="mt-8 grid gap-6 sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
          {jobs.map(job => (
            <InterviewCard
              key={job.id}
              job={job}
              onUpdate={handleUpdateJob}
              onDelete={handleDeleteJob}
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
