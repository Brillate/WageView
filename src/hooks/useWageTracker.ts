
"use client";

import { useState, useEffect, useCallback } from 'react';
import { useToast } from "@/hooks/use-toast";
import { format, formatDistanceStrict } from 'date-fns';

const HOURLY_WAGE_KEY = 'realtimeWageView_hourlyWage';
const SHIFT_START_TIME_KEY = 'realtimeWageView_shiftStartTime';
const IS_SHIFT_ACTIVE_KEY = 'realtimeWageView_isShiftActive';
const LAST_SHIFT_SUMMARY_KEY = 'realtimeWageView_lastShiftSummary';

export interface ShiftSummary {
  duration: string;
  earnings: string;
  endedAt: string;
  actualEarnings: number;
}

export function useWageTracker() {
  const [hourlyWage, setHourlyWageState] = useState<number | null>(null);
  const [shiftStartTime, setShiftStartTimeState] = useState<number | null>(null);
  const [isShiftActive, setIsShiftActiveState] = useState<boolean>(false);
  const [lastShiftSummary, setLastShiftSummaryState] = useState<ShiftSummary | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const { toast } = useToast();

  useEffect(() => {
    try {
      const storedWage = localStorage.getItem(HOURLY_WAGE_KEY);
      if (storedWage) setHourlyWageState(parseFloat(storedWage));

      const storedStartTime = localStorage.getItem(SHIFT_START_TIME_KEY);
      if (storedStartTime) setShiftStartTimeState(parseInt(storedStartTime, 10));
      
      const storedIsActive = localStorage.getItem(IS_SHIFT_ACTIVE_KEY);
      if (storedIsActive) setIsShiftActiveState(storedIsActive === 'true');

      const storedSummary = localStorage.getItem(LAST_SHIFT_SUMMARY_KEY);
      if (storedSummary) setLastShiftSummaryState(JSON.parse(storedSummary));

    } catch (error) {
      console.error("Failed to load data from localStorage", error);
      toast({ title: "Error", description: "Could not load saved session data.", variant: "destructive" });
    } finally {
      setIsLoading(false);
    }
  }, [toast]);

  const setHourlyWage = useCallback((wage: number) => {
    setHourlyWageState(wage);
    try {
      localStorage.setItem(HOURLY_WAGE_KEY, wage.toString());
    } catch (error) {
      console.error("Failed to save wage to localStorage", error);
    }
  }, []);

  const startShift = useCallback(() => {
    if (!hourlyWage || hourlyWage <= 0) {
      toast({ title: "Set Wage", description: "Please set a valid hourly wage before starting a shift.", variant: "destructive" });
      return;
    }
    const now = Date.now();
    setShiftStartTimeState(now);
    setIsShiftActiveState(true);
    try {
      localStorage.setItem(SHIFT_START_TIME_KEY, now.toString());
      localStorage.setItem(IS_SHIFT_ACTIVE_KEY, 'true');
    } catch (error) {
      console.error("Failed to save shift start data to localStorage", error);
    }
    toast({ title: "Shift Started", description: `Your shift started at ${format(now, 'p')}.`});
  }, [hourlyWage, toast]);

  const endShift = useCallback(() => {
    if (!shiftStartTime || !hourlyWage) return;

    const now = Date.now();
    const durationMillis = now - shiftStartTime;
    const earned = (durationMillis / (1000 * 60 * 60)) * hourlyWage;

    const summary: ShiftSummary = {
      duration: formatDistanceStrict(shiftStartTime, now, { unit: 'second' }), // More precise duration
      earnings: earned.toLocaleString('en-US', { style: 'currency', currency: 'USD' }),
      endedAt: format(now, 'Pp'),
      actualEarnings: earned,
    };
    
    setLastShiftSummaryState(summary);
    setIsShiftActiveState(false);
    setShiftStartTimeState(null); // Reset shift start time for UI consistency

    try {
      localStorage.setItem(LAST_SHIFT_SUMMARY_KEY, JSON.stringify(summary));
      localStorage.setItem(IS_SHIFT_ACTIVE_KEY, 'false');
      localStorage.removeItem(SHIFT_START_TIME_KEY); // Clear start time as shift ended
    } catch (error) {
      console.error("Failed to save shift end data to localStorage", error);
    }
    toast({ title: "Shift Ended", description: `You earned ${summary.earnings}.` });
  }, [shiftStartTime, hourlyWage, toast]);

  return {
    hourlyWage,
    setHourlyWage,
    shiftStartTime,
    isShiftActive,
    startShift,
    endShift,
    lastShiftSummary,
    isLoading,
  };
}
