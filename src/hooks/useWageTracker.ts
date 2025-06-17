
"use client";

import { useState, useEffect, useCallback, useRef } from 'react';
import { useToast } from "@/hooks/use-toast";
import { format, formatDistanceStrict } from 'date-fns';

export type PayPeriod = 'hourly' | 'daily' | 'weekly' | 'monthly' | 'annually';

const INPUT_AMOUNT_KEY = 'realtimeWageView_inputAmount';
const PAY_PERIOD_KEY = 'realtimeWageView_payPeriod';
const EFFECTIVE_HOURLY_WAGE_KEY = 'realtimeWageView_effectiveHourlyWage';
const SHIFT_START_TIME_KEY = 'realtimeWageView_shiftStartTime';
const IS_SHIFT_ACTIVE_KEY = 'realtimeWageView_isShiftActive';
const LAST_SHIFT_SUMMARY_KEY = 'realtimeWageView_lastShiftSummary';

export interface ShiftSummary {
  startedAt: string;
  endedAt: string;
  duration: string;
  earnings: string;
  actualEarnings: number;
}

export interface EarningsDataPoint {
  seconds: number;
  earnings: number;
}

const HOURS_PER_DAY = 8;
const HOURS_PER_WEEK = 40;
const HOURS_PER_MONTH = (52 * HOURS_PER_WEEK) / 12; 
const HOURS_PER_YEAR = 52 * HOURS_PER_WEEK; 

const MAX_GRAPH_POINTS = 60; // e.g., 60 points for 2 minutes of data if interval is 2s
const GRAPH_UPDATE_INTERVAL = 2000; // 2 seconds

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
  const [earningsGraphData, setEarningsGraphData] = useState<EarningsDataPoint[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const { toast } = useToast();
  const graphUpdateIntervalRef = useRef<NodeJS.Timeout | null>(null);

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
        const oldStoredHourlyWage = localStorage.getItem('realtimeWageView_hourlyWage');
        if (oldStoredHourlyWage) {
            const oldWage = parseFloat(oldStoredHourlyWage);
            setInputAmountState(oldWage);
            setPayPeriodState('hourly');
            setEffectiveHourlyWageState(oldWage);
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


  useEffect(() => {
    if (isShiftActive && shiftStartTime && effectiveHourlyWage && effectiveHourlyWage > 0) {
      setEarningsGraphData([{ seconds: 0, earnings: 0 }]); // Initialize graph data

      graphUpdateIntervalRef.current = setInterval(() => {
        const now = Date.now();
        const elapsedMillis = now - shiftStartTime;
        if (elapsedMillis < 0) return;

        const elapsedSeconds = elapsedMillis / 1000;
        const currentEarnings = (elapsedMillis / (1000 * 60 * 60)) * effectiveHourlyWage;
        
        setEarningsGraphData(prevData => {
          const newData = [...prevData, { seconds: elapsedSeconds, earnings: currentEarnings }];
          return newData.slice(-MAX_GRAPH_POINTS);
        });
      }, GRAPH_UPDATE_INTERVAL);
    } else {
      if (graphUpdateIntervalRef.current) {
        clearInterval(graphUpdateIntervalRef.current);
        graphUpdateIntervalRef.current = null;
      }
      if (!isShiftActive) { // Clear graph data only if shift is not active
        setEarningsGraphData([]);
      }
    }

    return () => {
      if (graphUpdateIntervalRef.current) {
        clearInterval(graphUpdateIntervalRef.current);
        graphUpdateIntervalRef.current = null;
      }
    };
  }, [isShiftActive, shiftStartTime, effectiveHourlyWage]);


  const startShift = useCallback(() => {
    if (!effectiveHourlyWage || effectiveHourlyWage <= 0) {
      toast({ title: "Set Wage", description: "Please set a valid wage and pay period before starting a shift.", variant: "destructive" });
      return;
    }
    const now = Date.now();
    setShiftStartTimeState(now);
    setIsShiftActiveState(true);
    setEarningsGraphData([{ seconds: 0, earnings: 0 }]); // Initial point for graph

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
      startedAt: format(shiftStartTime, 'Pp'),
      endedAt: format(now, 'Pp'),
      duration: formatDistanceStrict(shiftStartTime, now, { roundingMethod: 'floor' }),
      earnings: earned.toLocaleString('en-US', { style: 'currency', currency: 'USD' }),
      actualEarnings: earned,
    };
    
    setLastShiftSummaryState(summary);
    setIsShiftActiveState(false);
    setShiftStartTimeState(null);
    // setEarningsGraphData([]); // Clear graph data on shift end is handled by useEffect

    try {
      localStorage.setItem(LAST_SHIFT_SUMMARY_KEY, JSON.stringify(summary));
      localStorage.setItem(IS_SHIFT_ACTIVE_KEY, 'false');
      localStorage.removeItem(SHIFT_START_TIME_KEY);
    } catch (error) {
      console.error("Failed to save shift end data to localStorage", error);
    }
    toast({ title: "Shift Ended", description: `You earned ${summary.earnings}.` });
  }, [shiftStartTime, effectiveHourlyWage, toast]);

  const clearLastShiftSummary = useCallback(() => {
    setLastShiftSummaryState(null);
    try {
      localStorage.removeItem(LAST_SHIFT_SUMMARY_KEY);
      toast({ title: "Summary Cleared", description: "Your last shift summary has been cleared." });
    } catch (error) {
      console.error("Failed to clear last shift summary from localStorage", error);
      toast({ title: "Error", description: "Could not clear shift summary.", variant: "destructive" });
    }
  }, [toast]);

  return {
    inputAmount,
    payPeriod,
    hourlyWage: effectiveHourlyWage,
    setWageConfig,
    shiftStartTime,
    isShiftActive,
    startShift,
    endShift,
    lastShiftSummary,
    clearLastShiftSummary,
    earningsGraphData,
    isLoading,
  };
}
