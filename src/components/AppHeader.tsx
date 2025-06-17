
"use client";

import { Briefcase } from 'lucide-react';

export function AppHeader() {
  return (
    <header className="flex flex-col items-center justify-center py-8 text-center">
      <div className="flex items-center space-x-3 mb-2">
        <Briefcase className="h-10 w-10 text-primary" />
        <h1 className="text-4xl font-headline font-bold tracking-tight text-primary">
          RealTime WageView
        </h1>
      </div>
      <p className="text-lg text-muted-foreground">
        Track your earnings as they happen.
      </p>
    </header>
  );
}
