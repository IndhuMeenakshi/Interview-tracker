import { Timestamp } from 'firebase/firestore';

export type InterviewStage = {
  id: string;
  name: string;
  date: string; // ISO string
  result?: string;
};

export type Job = {
  id: string;
  userId: string;
  companyName: string;
  role: string;
  location: string;
  package: string;
  stages: InterviewStage[];
  status: 'Applied' | 'Interviewing' | 'Offer' | 'Rejected';
  offerLetterUrl?: string;
  compensation?: string;
  startDate?: string; // This could be a Timestamp from firestore
  createdAt: Timestamp;
};
