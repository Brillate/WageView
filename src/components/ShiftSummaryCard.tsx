
"use client";

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { ClipboardList, Clock, DollarSign, CalendarCheck2 } from 'lucide-react';
import type { ShiftSummary } from '@/hooks/useWageTracker';

interface ShiftSummaryCardProps {
  summary: ShiftSummary;
}

export function ShiftSummaryCard({ summary }: ShiftSummaryCardProps) {
  return (
    <Card className="w-full shadow-lg">
      <CardHeader>
        <CardTitle className="flex items-center text-2xl">
          <ClipboardList className="mr-2 h-6 w-6 text-accent" /> Last Shift Summary
        </CardTitle>
        <CardDescription>Details from your most recently completed shift.</CardDescription>
      </CardHeader>
      <CardContent className="space-y-3 text-lg">
        <div className="flex items-center">
          <CalendarCheck2 className="mr-3 h-5 w-5 text-accent" />
          <span className="font-medium">Ended At:</span>
          <span className="ml-auto text-foreground">{summary.endedAt}</span>
        </div>
        <div className="flex items-center">
          <Clock className="mr-3 h-5 w-5 text-accent" />
          <span className="font-medium">Duration:</span>
          <span className="ml-auto text-foreground">{summary.duration}</span>
        </div>
        <div className="flex items-center">
          <DollarSign className="mr-3 h-5 w-5 text-accent" />
          <span className="font-medium">Total Earned:</span>
          <span className="ml-auto text-foreground font-semibold">{summary.earnings}</span>
        </div>
      </CardContent>
    </Card>
  );
}
