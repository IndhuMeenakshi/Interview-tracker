import { Header } from '@/components/header';
import { InterviewTracker } from '@/components/interview-tracker';

export default function Home() {
  return (
    <div className="flex min-h-screen w-full flex-col">
      <Header />
      <main className="flex-1">
        <InterviewTracker />
      </main>
    </div>
  );
}
