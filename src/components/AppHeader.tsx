
"use client";

import { Briefcase } from 'lucide-react';
import { ThemeToggle } from '@/components/ThemeToggle';

export function AppHeader() {
  return (
    <header className="w-full py-8">
      <div className="container mx-auto flex flex-col sm:flex-row items-center justify-between">
        <div className="flex flex-col items-center sm:items-start text-center sm:text-left mb-4 sm:mb-0">
          <div className="flex items-center space-x-3 mb-1">
            <Briefcase className="h-10 w-10 text-primary" />
            <h1 className="text-4xl font-headline font-bold tracking-tight text-primary">
              RealTime WageView
            </h1>
          </div>
          <p className="text-lg text-muted-foreground">
            Track your earnings as they happen.
          </p>
        </div>
        <div className="sm:ml-auto">
          <ThemeToggle />
        </div>
      </div>
    </header>
  );
}
