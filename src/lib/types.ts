export type InterviewStage = {
  id: string;
  name: string;
  date: string;
};

export type Interview = {
  id: string;
  companyName: string;
  stages: InterviewStage[];
  status: 'Pending' | 'Offer' | 'Rejected';
  offerLetterUrl?: string;
  compensation?: string;
  startDate?: string;
};
