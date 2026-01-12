import { Briefcase } from 'lucide-react';

export function Header() {
  return (
    <header className="sticky top-0 z-30 border-b bg-background/80 backdrop-blur-sm">
      <div className="container mx-auto flex h-16 items-center gap-3 px-4 sm:px-6 lg:px-8">
        <Briefcase className="h-7 w-7 text-primary" />
        <h1 className="text-xl font-bold text-foreground sm:text-2xl">
          TrackStar Interviews
        </h1>
      </div>
    </header>
  );
}
