
"use client";

import { useWageTracker } from '@/hooks/useWageTracker';
import { AppHeader } from '@/components/AppHeader';
import { WageInputForm } from '@/components/WageInputForm';
import { EarningsDisplay } from '@/components/EarningsDisplay';
import { ShiftControls } from '@/components/ShiftControls';
import { ShiftSummaryCard } from '@/components/ShiftSummaryCard';
import { Skeleton } from '@/components/ui/skeleton';
import { Card, CardContent } from '@/components/ui/card';

export default function WageViewPage() {
  const {
    hourlyWage,
    setHourlyWage,
    isShiftActive,
    shiftStartTime,
    startShift,
    endShift,
    lastShiftSummary,
    isLoading,
  } = useWageTracker();

  if (isLoading) {
    return (
      <div className="container mx-auto p-4 flex flex-col items-center min-h-screen justify-center">
        <Card className="w-full max-w-md p-8">
          <CardContent className="space-y-6">
            <Skeleton className="h-12 w-3/4 mx-auto" />
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-20 w-full" />
            <Skeleton className="h-12 w-1/2 mx-auto" />
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-4 flex flex-col items-center min-h-screen font-body selection:bg-primary/20">
      <AppHeader />
      <main className="w-full max-w-lg space-y-6 mt-2 mb-8">
        <WageInputForm
          initialWage={hourlyWage}
          onWageChange={setHourlyWage}
          disabled={isShiftActive}
        />
        
        {isShiftActive && shiftStartTime && hourlyWage && (
          <EarningsDisplay hourlyWage={hourlyWage} shiftStartTime={shiftStartTime} />
        )}

        <ShiftControls
          isShiftActive={isShiftActive}
          onStartShift={startShift}
          onEndShift={endShift}
          wageIsSet={!!hourlyWage && hourlyWage > 0}
        />

        {lastShiftSummary && (
          <ShiftSummaryCard summary={lastShiftSummary} />
        )}

        {!isShiftActive && !lastShiftSummary && hourlyWage && hourlyWage > 0 && (
           <Card className="w-full text-center opacity-70">
             <CardContent className="p-6">
                <p className="text-muted-foreground">Your shift is not active. Start a new shift to begin tracking your earnings.</p>
             </CardContent>
           </Card>
        )}
      </main>
      <footer className="py-4 text-center text-sm text-muted-foreground">
        <p>&copy; {new Date().getFullYear()} RealTime WageView. All rights reserved.</p>
      </footer>
    </div>
  );
}
