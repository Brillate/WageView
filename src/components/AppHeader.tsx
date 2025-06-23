
"use client";

import { Briefcase } from 'lucide-react';
import { ThemeToggle } from '@/components/ThemeToggle';

export function AppHeader() {
  return (
    <header className="w-full py-8">
      <div className="flex flex-col items-center text-center space-y-4">
        <div className="flex items-center space-x-3">
          <Briefcase className="h-10 w-10 text-primary" />
          <h1 className="text-4xl font-headline font-bold tracking-tight text-primary">
            WageView
          </h1>
        </div>
        <p className="text-lg text-muted-foreground">
          Track your earnings as they happen.
        </p>
        <ThemeToggle />
      </div>
    </header>
  );
}
