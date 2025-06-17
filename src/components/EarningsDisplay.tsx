
"use client";

import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { TrendingUp, Clock } from 'lucide-react';

interface EarningsDisplayProps {
  hourlyWage: number | null;
  shiftStartTime: number | null;
}

export function EarningsDisplay({ hourlyWage, shiftStartTime }: EarningsDisplayProps) {
  const [currentEarnings, setCurrentEarnings] = useState<number>(0);
  const [elapsedTime, setElapsedTime] = useState<string>("00:00:00");

  useEffect(() => {
    if (!hourlyWage || !shiftStartTime) {
      setCurrentEarnings(0);
      setElapsedTime("00:00:00");
      return;
    }

    const intervalId = setInterval(() => {
      const now = Date.now();
      const diffMillis = now - shiftStartTime;
      
      if (diffMillis < 0) { // Should not happen if logic is correct
        setCurrentEarnings(0);
        setElapsedTime("00:00:00");
        return;
      }

      const diffSecondsTotal = Math.floor(diffMillis / 1000);
      
      const hours = Math.floor(diffSecondsTotal / 3600);
      const minutes = Math.floor((diffSecondsTotal % 3600) / 60);
      const seconds = diffSecondsTotal % 60;
      
      setElapsedTime(
        `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`
      );

      const earned = (diffMillis / (1000 * 60 * 60)) * hourlyWage;
      setCurrentEarnings(earned);
    }, 100); // Update 10 times per second for smoother visuals

    // Initial calculation
    const initialNow = Date.now();
    const initialDiffMillis = initialNow - shiftStartTime;
    if (initialDiffMillis >= 0) {
      const initialEarned = (initialDiffMillis / (1000 * 60 * 60)) * hourlyWage;
      setCurrentEarnings(initialEarned);
      const initialDiffSecondsTotal = Math.floor(initialDiffMillis / 1000);
      const initialHours = Math.floor(initialDiffSecondsTotal / 3600);
      const initialMinutes = Math.floor((initialDiffSecondsTotal % 3600) / 60);
      const initialSeconds = initialDiffSecondsTotal % 60;
      setElapsedTime(
        `${String(initialHours).padStart(2, '0')}:${String(initialMinutes).padStart(2, '0')}:${String(initialSeconds).padStart(2, '0')}`
      );
    }


    return () => clearInterval(intervalId);
  }, [hourlyWage, shiftStartTime]);

  const formattedEarnings = currentEarnings.toLocaleString('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 2, 
    maximumFractionDigits: 2, // Changed from 4 to 2
  });

  return (
    <Card className="w-full text-center shadow-lg bg-gradient-to-br from-primary/10 via-background to-background">
      <CardHeader>
        <CardTitle className="flex items-center justify-center text-2xl">
          <TrendingUp className="mr-2 h-7 w-7 text-primary" /> Current Earnings
        </CardTitle>
        <CardDescription>Your earnings are accumulating in real-time.</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <p 
          className="text-5xl font-bold text-primary tracking-wider tabular-nums"
          aria-live="polite"
          aria-atomic="true"
          style={{ transition: 'opacity 0.2s ease-in-out' }} // Simple transition for number change
        >
          {formattedEarnings}
        </p>
        <div className="flex items-center justify-center text-muted-foreground text-lg">
          <Clock className="mr-2 h-5 w-5" />
          <span>Elapsed Time: {elapsedTime}</span>
        </div>
      </CardContent>
    </Card>
  );
}
