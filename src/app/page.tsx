
"use client";

import { useWageTracker } from '@/hooks/useWageTracker';
import { AppHeader } from '@/components/AppHeader';
import { WageInputForm } from '@/components/WageInputForm';
import { EarningsDisplay } from '@/components/EarningsDisplay';
import { ShiftControls } from '@/components/ShiftControls';
import { ShiftSummaryCard } from '@/components/ShiftSummaryCard';
import { EarningsGraph } from '@/components/EarningsGraph';
import { Skeleton } from '@/components/ui/skeleton';
import { Card, CardContent } from '@/components/ui/card';

export default function WageViewPage() {
  const {
    inputAmount,
    payPeriod,
    hourlyWage,
    setWageConfig,
    isShiftActive,
    shiftStartTime,
    startShift,
    endShift,
    lastShiftSummary,
    clearLastShiftSummary,
    earningsGraphData,
    isLoading,
    accumulatedEarningsAtLastChange,
    timestampOfLastWageChange,
  } = useWageTracker();

  if (isLoading) {
    return (
      <div className="flex flex-col min-h-screen font-body selection:bg-primary/20">
        <div className="flex-grow flex flex-col items-center justify-center container mx-auto p-4">
          <Card className="w-full max-w-md p-8">
            <CardContent className="space-y-6">
              <Skeleton className="h-12 w-3/4 mx-auto" />
              <Skeleton className="h-10 w-full" />
              <Skeleton className="h-20 w-full" />
              <Skeleton className="h-12 w-1/2 mx-auto" />
              <Skeleton className="h-40 w-full" /> 
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col min-h-screen font-body selection:bg-primary/20">
      <div className="flex-grow flex flex-col items-center justify-center container mx-auto p-4">
        <AppHeader />
        <main className="w-full max-w-lg space-y-6 mt-8 mb-8">
          <WageInputForm
            initialAmount={inputAmount}
            initialPayPeriod={payPeriod}
            onWageConfigChange={setWageConfig}
            effectiveHourlyWage={hourlyWage}
          />
          
          {isShiftActive && shiftStartTime && hourlyWage && hourlyWage > 0 && (
            <>
              <EarningsDisplay 
                hourlyWage={hourlyWage} 
                shiftStartTime={shiftStartTime} 
                accumulatedEarningsAtLastChange={accumulatedEarningsAtLastChange}
                timestampOfLastWageChange={timestampOfLastWageChange}
              />
              <EarningsGraph data={earningsGraphData} /> 
            </>
          )}

          <ShiftControls
            isShiftActive={isShiftActive}
            onStartShift={startShift}
            onEndShift={endShift}
            wageIsSet={!!hourlyWage && hourlyWage > 0}
          />

          {lastShiftSummary && (
            <ShiftSummaryCard summary={lastShiftSummary} onClearSummary={clearLastShiftSummary} />
          )}

          {!isShiftActive && !lastShiftSummary && hourlyWage && hourlyWage > 0 && (
             <Card className="w-full text-center opacity-70">
               <CardContent className="p-6">
                  <p className="text-muted-foreground">Your shift is not active. Start a new shift to begin tracking your earnings.</p>
               </CardContent>
             </Card>
          )}
        </main>
      </div>
      <footer className="py-4 text-center text-sm text-muted-foreground container mx-auto">
        <p>&copy; {new Date().getFullYear()} WageView. All rights reserved.</p>
      </footer>
    </div>
  );
}
