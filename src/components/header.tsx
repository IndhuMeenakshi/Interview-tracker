'use client';

import { Briefcase } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useAuth, useUser, initiateAnonymousSignIn } from '@/firebase';
import { Github } from 'lucide-react';

export function Header() {
    const auth = useAuth();
    const { user, isUserLoading } = useUser();

    const handleLogin = () => {
        if (auth) {
            initiateAnonymousSignIn(auth);
        }
    };

    const handleLogout = () => {
        if (auth) {
            auth.signOut();
        }
    };


  return (
    <header className="sticky top-0 z-30 border-b bg-background/80 backdrop-blur-sm">
      <div className="container mx-auto flex h-16 items-center gap-3 px-4 sm:px-6 lg:px-8">
        <Briefcase className="h-7 w-7 text-primary" />
        <h1 className="text-xl font-bold text-foreground sm:text-2xl">
          TrackStar Interviews
        </h1>
        <div className="ml-auto">
            {isUserLoading ? (
                <div className="h-8 w-20 animate-pulse rounded-md bg-muted" />
            ) : user ? (
                <div className="flex items-center gap-4">
                    <span className="text-sm text-muted-foreground hidden sm:inline">Welcome, {user.isAnonymous ? 'Guest' : user.displayName}</span>
                    <Button variant="outline" size="sm" onClick={handleLogout}>Logout</Button>
                </div>
            ) : (
                <Button size="sm" onClick={handleLogin}>
                    <Github className="mr-2 h-4 w-4" /> Login
                </Button>
            )}
        </div>
      </div>
    </header>
  );
}
