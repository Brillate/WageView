
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
const ACCUMULATED_EARNINGS_AT_CHANGE_KEY = 'realtimeWageView_accumulatedEarningsAtChange';
const TIMESTAMP_OF_LAST_WAGE_CHANGE_KEY = 'realtimeWageView_timestampOfLastWageChange';


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
  
  const [accumulatedEarningsAtLastChange, setAccumulatedEarningsAtLastChangeState] = useState<number>(0);
  const [timestampOfLastWageChange, setTimestampOfLastWageChangeState] = useState<number | null>(null);

  const [earningsGraphData, setEarningsGraphData] = useState<EarningsDataPoint[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const { toast } = useToast();
  const graphUpdateIntervalRef = useRef<NodeJS.Timeout | null>(null);

  const getCurrentTotalEarnings = useCallback((currentEffectiveHourlyWage: number | null) => {
    if (!isShiftActive || !shiftStartTime || !currentEffectiveHourlyWage || currentEffectiveHourlyWage <= 0) return 0;
    
    const now = Date.now();
    const baseEarnings = timestampOfLastWageChange ? accumulatedEarningsAtLastChange : 0;
    const startTimeForCurrentSegment = timestampOfLastWageChange || shiftStartTime;
    
    const millisSinceCurrentSegmentStart = now - startTimeForCurrentSegment;
    if (millisSinceCurrentSegmentStart < 0) return baseEarnings; // Should not happen

    const earningsThisSegment = (millisSinceCurrentSegmentStart / (1000 * 60 * 60)) * currentEffectiveHourlyWage;
    return baseEarnings + earningsThisSegment;
  }, [isShiftActive, shiftStartTime, timestampOfLastWageChange, accumulatedEarningsAtLastChange]);


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
        const oldStoredHourlyWage = localStorage.getItem('realtimeWageView_hourlyWage'); // Legacy key
        if (oldStoredHourlyWage) {
            const oldWage = parseFloat(oldStoredHourlyWage);
            setInputAmountState(oldWage);
            setPayPeriodState('hourly');
            setEffectiveHourlyWageState(oldWage);
            localStorage.setItem(INPUT_AMOUNT_KEY, oldWage.toString());
            localStorage.setItem(PAY_PERIOD_KEY, 'hourly');
        }
      }

      const storedStartTime = localStorage.getItem(SHIFT_START_TIME_KEY);
      if (storedStartTime) setShiftStartTimeState(parseInt(storedStartTime, 10));
      
      const storedIsActive = localStorage.getItem(IS_SHIFT_ACTIVE_KEY);
      if (storedIsActive) setIsShiftActiveState(storedIsActive === 'true');

      const storedSummary = localStorage.getItem(LAST_SHIFT_SUMMARY_KEY);
      if (storedSummary) setLastShiftSummaryState(JSON.parse(storedSummary));

      const storedAccumulatedEarnings = localStorage.getItem(ACCUMULATED_EARNINGS_AT_CHANGE_KEY);
      if (storedAccumulatedEarnings) setAccumulatedEarningsAtLastChangeState(parseFloat(storedAccumulatedEarnings));

      const storedTimestampLastChange = localStorage.getItem(TIMESTAMP_OF_LAST_WAGE_CHANGE_KEY);
      if (storedTimestampLastChange) setTimestampOfLastWageChangeState(parseInt(storedTimestampLastChange, 10));

    } catch (error) {
      console.error("Failed to load data from localStorage", error);
      toast({ title: "Error", description: "Could not load saved session data.", variant: "destructive" });
    } finally {
      setIsLoading(false);
    }
  }, [toast]);

  const setWageConfig = useCallback((amount: number, period: PayPeriod) => {
    let currentTotalEarnedBeforeChange = 0;
    if (isShiftActive && shiftStartTime && effectiveHourlyWage && effectiveHourlyWage > 0) {
      currentTotalEarnedBeforeChange = getCurrentTotalEarnings(effectiveHourlyWage);
      setAccumulatedEarningsAtLastChangeState(currentTotalEarnedBeforeChange);
      const now = Date.now();
      setTimestampOfLastWageChangeState(now);
      try {
        localStorage.setItem(ACCUMULATED_EARNINGS_AT_CHANGE_KEY, currentTotalEarnedBeforeChange.toString());
        localStorage.setItem(TIMESTAMP_OF_LAST_WAGE_CHANGE_KEY, now.toString());
      } catch (error) {
        console.error("Failed to save mid-shift wage change data to localStorage", error);
      }
    }
    
    const newEffectiveHourlyWage = calculateEffectiveHourlyWage(amount, period);
    setInputAmountState(amount);
    setPayPeriodState(period);
    setEffectiveHourlyWageState(newEffectiveHourlyWage);

    try {
      localStorage.setItem(INPUT_AMOUNT_KEY, amount.toString());
      localStorage.setItem(PAY_PERIOD_KEY, period);
      // effectiveHourlyWage is derived, so no direct localStorage for it.
    } catch (error) {
      console.error("Failed to save wage configuration to localStorage", error);
    }
  }, [isShiftActive, shiftStartTime, effectiveHourlyWage, getCurrentTotalEarnings]);


  useEffect(() => {
    if (isShiftActive && shiftStartTime && effectiveHourlyWage && effectiveHourlyWage > 0) {
      if (earningsGraphData.length === 0) {
        const now = Date.now();
        const initialPoints: EarningsDataPoint[] = [];
        initialPoints.push({ seconds: 0, earnings: 0 });

        if (timestampOfLastWageChange && timestampOfLastWageChange > shiftStartTime && accumulatedEarningsAtLastChange > 0) {
          const secondsAtWageChange = (timestampOfLastWageChange - shiftStartTime) / 1000;
          if (secondsAtWageChange > 0) { // Ensure this point is after (0,0)
             initialPoints.push({ seconds: secondsAtWageChange, earnings: accumulatedEarningsAtLastChange });
          }
        }
        
        const totalCurrentEarnings = getCurrentTotalEarnings(effectiveHourlyWage);
        const totalElapsedSeconds = (now - shiftStartTime) / 1000;

        if (totalElapsedSeconds > (initialPoints.length > 1 ? initialPoints[initialPoints.length-1].seconds : 0) ) {
            initialPoints.push({ seconds: totalElapsedSeconds, earnings: totalCurrentEarnings });
        } else if (initialPoints.length === 1 && totalElapsedSeconds <=0) { // if only (0,0) and no time elapsed
             initialPoints.push({ seconds: 0.01, earnings: 0}); // Add a tiny offset point
        }
        
        setEarningsGraphData(initialPoints.filter((p, i, arr) => i === 0 || p.seconds > arr[i-1].seconds || p.earnings !== arr[i-1].earnings));
      }

      graphUpdateIntervalRef.current = setInterval(() => {
        const now = Date.now();
        const currentTotalEarningsForGraph = getCurrentTotalEarnings(effectiveHourlyWage);
        const elapsedSecondsOverall = (now - shiftStartTime) / 1000;
        
        setEarningsGraphData(prevData => {
          return [...prevData, { seconds: elapsedSecondsOverall, earnings: currentTotalEarningsForGraph }];
        });
      }, GRAPH_UPDATE_INTERVAL);
    } else {
      if (graphUpdateIntervalRef.current) {
        clearInterval(graphUpdateIntervalRef.current);
        graphUpdateIntervalRef.current = null;
      }
    }

    return () => {
      if (graphUpdateIntervalRef.current) {
        clearInterval(graphUpdateIntervalRef.current);
        graphUpdateIntervalRef.current = null;
      }
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isShiftActive, shiftStartTime, effectiveHourlyWage, getCurrentTotalEarnings, timestampOfLastWageChange, accumulatedEarningsAtLastChange]);


  const startShift = useCallback(() => {
    if (!effectiveHourlyWage || effectiveHourlyWage <= 0) {
      toast({ title: "Set Wage", description: "Please set a valid wage and pay period before starting a shift.", variant: "destructive" });
      return;
    }
    const now = Date.now();
    setShiftStartTimeState(now);
    setIsShiftActiveState(true);
    setAccumulatedEarningsAtLastChangeState(0);
    setTimestampOfLastWageChangeState(null);
    setEarningsGraphData([{ seconds: 0, earnings: 0 }]); 

    try {
      localStorage.setItem(SHIFT_START_TIME_KEY, now.toString());
      localStorage.setItem(IS_SHIFT_ACTIVE_KEY, 'true');
      localStorage.removeItem(ACCUMULATED_EARNINGS_AT_CHANGE_KEY);
      localStorage.removeItem(TIMESTAMP_OF_LAST_WAGE_CHANGE_KEY);
    } catch (error) {
      console.error("Failed to save shift start data to localStorage", error);
    }
    toast({ title: "Shift Started", description: `Your shift started at ${format(now, 'p')}.`});
  }, [effectiveHourlyWage, toast]);

  const endShift = useCallback(() => {
    if (!shiftStartTime || !effectiveHourlyWage) return;

    const earned = getCurrentTotalEarnings(effectiveHourlyWage);

    const summary: ShiftSummary = {
      startedAt: format(shiftStartTime, 'Pp'),
      endedAt: format(Date.now(), 'Pp'),
      duration: formatDistanceStrict(shiftStartTime, Date.now(), { roundingMethod: 'floor' }),
      earnings: earned.toLocaleString('en-US', { style: 'currency', currency: 'USD' }),
      actualEarnings: earned,
    };
    
    setLastShiftSummaryState(summary);
    setIsShiftActiveState(false);
    // Reset mid-shift wage change trackers for the next shift
    // setAccumulatedEarningsAtLastChangeState(0); // Done in startShift
    // setTimestampOfLastWageChangeState(null); // Done in startShift

    try {
      localStorage.setItem(LAST_SHIFT_SUMMARY_KEY, JSON.stringify(summary));
      localStorage.setItem(IS_SHIFT_ACTIVE_KEY, 'false');
      localStorage.removeItem(SHIFT_START_TIME_KEY);
      // Don't remove ACCUMULATED_EARNINGS_AT_CHANGE_KEY and TIMESTAMP_OF_LAST_WAGE_CHANGE_KEY here,
      // they are reset on startShift.
    } catch (error) {
      console.error("Failed to save shift end data to localStorage", error);
    }
    toast({ title: "Shift Ended", description: `You earned ${summary.earnings}.` });
  }, [shiftStartTime, effectiveHourlyWage, toast, getCurrentTotalEarnings]);

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
    accumulatedEarningsAtLastChange, // Expose for EarningsDisplay
    timestampOfLastWageChange,     // Expose for EarningsDisplay
  };
}
