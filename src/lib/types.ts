import { Timestamp } from 'firebase/firestore';

export type Job = {
  id: string;
  userId: string;
  companyName: string;
  role: string;
  location: string;
  package: string;
  status: 'Applied' | 'Interviewing' | 'Offer' | 'Rejected';
  offerLetterUrl?: string;
  compensation?: string;
  startDate?: string; // This could be a Timestamp from firestore
  createdAt: Timestamp;
};
