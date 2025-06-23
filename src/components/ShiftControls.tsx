
"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { PlayCircle, StopCircle } from 'lucide-react';

interface ShiftControlsProps {
  isShiftActive: boolean;
  onStartShift: () => void;
  onEndShift: () => void;
  wageIsSet: boolean;
}

export function ShiftControls({ isShiftActive, onStartShift, onEndShift, wageIsSet }: ShiftControlsProps) {
  return (
    <Card className="w-full shadow-lg">
      <CardContent className="p-6">
        <div className="flex flex-col sm:flex-row space-y-4 sm:space-y-0 sm:space-x-4 justify-center">
          {!isShiftActive ? (
            <Button
              onClick={onStartShift}
              disabled={!wageIsSet}
              className="w-full sm:w-auto text-lg py-6 px-8"
              aria-label="Start Shift"
            >
              <PlayCircle className="mr-2 h-6 w-6" /> Start Shift
            </Button>
          ) : (
            <Button
              onClick={onEndShift}
              variant="destructive"
              className="w-full sm:w-auto text-lg py-6 px-8"
              aria-label="End Shift"
            >
              <StopCircle className="mr-2 h-6 w-6" /> End Shift
            </Button>
          )}
        </div>
        {!wageIsSet && !isShiftActive && (
          <p className="mt-4 text-center text-sm text-destructive">
            Please set your hourly wage before starting a shift.
          </p>
        )}
      </CardContent>
    </Card>
  );
}
