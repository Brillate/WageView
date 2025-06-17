
"use client";

import { useState, useEffect, useCallback } from 'react';
import { useToast } from "@/hooks/use-toast";
import { format, formatDistanceStrict } from 'date-fns';

export type PayPeriod = 'hourly' | 'daily' | 'weekly' | 'monthly' | 'annually';

const INPUT_AMOUNT_KEY = 'realtimeWageView_inputAmount';
const PAY_PERIOD_KEY = 'realtimeWageView_payPeriod';
const EFFECTIVE_HOURLY_WAGE_KEY = 'realtimeWageView_effectiveHourlyWage'; // New key for clarity
const SHIFT_START_TIME_KEY = 'realtimeWageView_shiftStartTime';
const IS_SHIFT_ACTIVE_KEY = 'realtimeWageView_isShiftActive';
const LAST_SHIFT_SUMMARY_KEY = 'realtimeWageView_lastShiftSummary';

export interface ShiftSummary {
  duration: string;
  earnings: string;
  endedAt: string;
  actualEarnings: number;
}

// Constants for conversions
const HOURS_PER_DAY = 8;
const HOURS_PER_WEEK = 40;
const HOURS_PER_MONTH = (52 * HOURS_PER_WEEK) / 12; // Approx 173.333...
const HOURS_PER_YEAR = 52 * HOURS_PER_WEEK; // 2080

function calculateEffectiveHourlyWage(amount: number, period: PayPeriod): number {
  if (amount <= 0) return 0;
  switch (period) {
    case 'hourly':
      return amount;
    case 'daily':
      return amount / HOURS_PER_DAY;
    case 'weekly':
      return amount / HOURS_PER_WEEK;
    case 'monthly':
      return amount / HOURS_PER_MONTH;
    case 'annually':
      return amount / HOURS_PER_YEAR;
    default:
      return 0;
  }
}

export function useWageTracker() {
  const [inputAmount, setInputAmountState] = useState<number | null>(null);
  const [payPeriod, setPayPeriodState] = useState<PayPeriod>('hourly');
  const [effectiveHourlyWage, setEffectiveHourlyWageState] = useState<number | null>(null);
  
  const [shiftStartTime, setShiftStartTimeState] = useState<number | null>(null);
  const [isShiftActive, setIsShiftActiveState] = useState<boolean>(false);
  const [lastShiftSummary, setLastShiftSummaryState] = useState<ShiftSummary | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const { toast } = useToast();

  useEffect(() => {
    try {
      const storedAmount = localStorage.getItem(INPUT_AMOUNT_KEY);
      const storedPeriod = localStorage.getItem(PAY_PERIOD_KEY) as PayPeriod | null;
      
      let loadedAmount: number | null = null;
      let loadedPeriod: PayPeriod = 'hourly';

      if (storedAmount) loadedAmount = parseFloat(storedAmount);
      if (storedPeriod) loadedPeriod = storedPeriod;
      
      setInputAmountState(loadedAmount);
      setPayPeriodState(loadedPeriod);

      if (loadedAmount !== null) {
        setEffectiveHourlyWageState(calculateEffectiveHourlyWage(loadedAmount, loadedPeriod));
      } else {
         // Attempt to load old hourlyWage if new keys are not present
        const oldStoredHourlyWage = localStorage.getItem('realtimeWageView_hourlyWage');
        if (oldStoredHourlyWage) {
            const oldWage = parseFloat(oldStoredHourlyWage);
            setInputAmountState(oldWage);
            setPayPeriodState('hourly');
            setEffectiveHourlyWageState(oldWage);
            // Optionally save these under new keys
            localStorage.setItem(INPUT_AMOUNT_KEY, oldWage.toString());
            localStorage.setItem(PAY_PERIOD_KEY, 'hourly');
            localStorage.setItem(EFFECTIVE_HOURLY_WAGE_KEY, oldWage.toString());
        }
      }

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

  const setWageConfig = useCallback((amount: number, period: PayPeriod) => {
    const newEffectiveHourlyWage = calculateEffectiveHourlyWage(amount, period);
    
    setInputAmountState(amount);
    setPayPeriodState(period);
    setEffectiveHourlyWageState(newEffectiveHourlyWage);

    try {
      localStorage.setItem(INPUT_AMOUNT_KEY, amount.toString());
      localStorage.setItem(PAY_PERIOD_KEY, period);
      localStorage.setItem(EFFECTIVE_HOURLY_WAGE_KEY, newEffectiveHourlyWage.toString());
    } catch (error) {
      console.error("Failed to save wage configuration to localStorage", error);
    }
  }, []);

  const startShift = useCallback(() => {
    if (!effectiveHourlyWage || effectiveHourlyWage <= 0) {
      toast({ title: "Set Wage", description: "Please set a valid wage and pay period before starting a shift.", variant: "destructive" });
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
  }, [effectiveHourlyWage, toast]);

  const endShift = useCallback(() => {
    if (!shiftStartTime || !effectiveHourlyWage) return;

    const now = Date.now();
    const durationMillis = now - shiftStartTime;
    const earned = (durationMillis / (1000 * 60 * 60)) * effectiveHourlyWage;

    const summary: ShiftSummary = {
      duration: formatDistanceStrict(shiftStartTime, now, { unit: 'second' }),
      earnings: earned.toLocaleString('en-US', { style: 'currency', currency: 'USD' }),
      endedAt: format(now, 'Pp'),
      actualEarnings: earned,
    };
    
    setLastShiftSummaryState(summary);
    setIsShiftActiveState(false);
    setShiftStartTimeState(null);

    try {
      localStorage.setItem(LAST_SHIFT_SUMMARY_KEY, JSON.stringify(summary));
      localStorage.setItem(IS_SHIFT_ACTIVE_KEY, 'false');
      localStorage.removeItem(SHIFT_START_TIME_KEY);
    } catch (error) {
      console.error("Failed to save shift end data to localStorage", error);
    }
    toast({ title: "Shift Ended", description: `You earned ${summary.earnings}.` });
  }, [shiftStartTime, effectiveHourlyWage, toast]);

  return {
    inputAmount,
    payPeriod,
    hourlyWage: effectiveHourlyWage, // Expose effectiveHourlyWage as hourlyWage for consumers
    setWageConfig,
    shiftStartTime,
    isShiftActive,
    startShift,
    endShift,
    lastShiftSummary,
    isLoading,
  };
}
