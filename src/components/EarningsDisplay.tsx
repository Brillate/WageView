
"use client";

import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { TrendingUp, Clock } from 'lucide-react';

interface EarningsDisplayProps {
  hourlyWage: number | null;
  shiftStartTime: number | null;
  accumulatedEarningsAtLastChange?: number; // Optional for backward compatibility if not immediately passed
  timestampOfLastWageChange?: number | null; // Optional
}

export function EarningsDisplay({ 
  hourlyWage, 
  shiftStartTime, 
  accumulatedEarningsAtLastChange = 0, 
  timestampOfLastWageChange = null 
}: EarningsDisplayProps) {
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
      
      // Calculate elapsed time based on original shift start
      const diffMillisTotal = now - shiftStartTime;
      if (diffMillisTotal < 0) {
        setElapsedTime("00:00:00");
      } else {
        const diffSecondsTotal = Math.floor(diffMillisTotal / 1000);
        const hours = Math.floor(diffSecondsTotal / 3600);
        const minutes = Math.floor((diffSecondsTotal % 3600) / 60);
        const seconds = diffSecondsTotal % 60;
        setElapsedTime(
          `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`
        );
      }

      // Calculate current earnings considering potential mid-shift wage changes
      let newCurrentEarnings = 0;
      const effectiveCalculationStartTime = timestampOfLastWageChange || shiftStartTime;
      const baseEarnings = timestampOfLastWageChange ? accumulatedEarningsAtLastChange : 0;
      
      const millisSinceEffectiveStart = now - effectiveCalculationStartTime;
      
      if (millisSinceEffectiveStart >= 0) {
        const earningsThisSegment = (millisSinceEffectiveStart / (1000 * 60 * 60)) * hourlyWage;
        newCurrentEarnings = baseEarnings + earningsThisSegment;
      } else {
         // This case implies timestampOfLastWageChange is in the future or something is off,
         // or shiftStartTime itself is in the future. Fallback to baseEarnings or 0.
        newCurrentEarnings = baseEarnings; 
      }
      setCurrentEarnings(newCurrentEarnings < 0 ? 0 : newCurrentEarnings); // Ensure earnings don't go negative

    }, 100); // Update 10 times per second

    // Initial calculation
      const initialNow = Date.now();
      let initialEarnedValue = 0;
      const initialEffectiveCalcStartTime = timestampOfLastWageChange || shiftStartTime;
      const initialBaseEarnings = timestampOfLastWageChange ? accumulatedEarningsAtLastChange : 0;

      const initialMillisSinceEffectiveStart = initialNow - initialEffectiveCalcStartTime;
      if (initialMillisSinceEffectiveStart >=0 ) {
        const initialEarningsThisSegment = (initialMillisSinceEffectiveStart / (1000 * 60 * 60)) * hourlyWage;
        initialEarnedValue = initialBaseEarnings + initialEarningsThisSegment;
      } else {
        initialEarnedValue = initialBaseEarnings;
      }
      setCurrentEarnings(initialEarnedValue < 0 ? 0 : initialEarnedValue);
      
      const initialTotalDiffMillis = initialNow - shiftStartTime;
       if (initialTotalDiffMillis >=0) {
        const initialDiffSecondsTotal = Math.floor(initialTotalDiffMillis / 1000);
        const initialHours = Math.floor(initialDiffSecondsTotal / 3600);
        const initialMinutes = Math.floor((initialDiffSecondsTotal % 3600) / 60);
        const initialSeconds = initialDiffSecondsTotal % 60;
        setElapsedTime(
          `${String(initialHours).padStart(2, '0')}:${String(initialMinutes).padStart(2, '0')}:${String(initialSeconds).padStart(2, '0')}`
        );
       } else {
         setElapsedTime("00:00:00");
       }


    return () => clearInterval(intervalId);
  }, [hourlyWage, shiftStartTime, accumulatedEarningsAtLastChange, timestampOfLastWageChange]);

  const formattedEarnings = currentEarnings.toLocaleString('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 2, 
    maximumFractionDigits: 2,
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
          style={{ transition: 'opacity 0.2s ease-in-out' }}
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
