
"use client";

import type { EarningsDataPoint } from '@/hooks/useWageTracker';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { ChartContainer, ChartTooltipContent } from "@/components/ui/chart";
import { LineChart, CartesianGrid, XAxis, YAxis, Tooltip as RechartsTooltip, Line, Label } from 'recharts';
import { BarChart as ChartIcon } from 'lucide-react'; // Renamed to avoid conflict

interface EarningsGraphProps {
  data: EarningsDataPoint[];
}

const chartConfig = {
  earnings: {
    label: "Earnings",
    color: "hsl(var(--primary))",
  },
};

const formatTimeForAxis = (seconds: number, totalDurationSeconds: number): string => {
  if (totalDurationSeconds < 300) { // Less than 5 minutes
    return `${Math.round(seconds)}s`;
  } else if (totalDurationSeconds < 3 * 60 * 60) { // Less than 3 hours
    return `${Math.round(seconds / 60)}m`;
  } else if (totalDurationSeconds < 2 * 24 * 60 * 60) { // Less than 2 days
    return `${Math.round(seconds / 3600)}h`;
  } else { // More than 2 days
    return `${Math.round(seconds / (3600 * 24))}d`;
  }
};

const getXAxisLabel = (totalDurationSeconds: number): string => {
  if (totalDurationSeconds < 300) return "Time (seconds)";
  if (totalDurationSeconds < 3 * 60 * 60) return "Time (minutes)";
  if (totalDurationSeconds < 2 * 24 * 60 * 60) return "Time (hours)";
  return "Time (days)";
};


export function EarningsGraph({ data }: EarningsGraphProps) {
  if (!data || data.length < 2) {
    return (
      <Card className="w-full shadow-lg">
        <CardHeader>
          <CardTitle className="flex items-center text-2xl">
            <ChartIcon className="mr-2 h-6 w-6 text-primary" />
            Live Earnings Trend
          </CardTitle>
          <CardDescription>Visualizing your earnings accumulation over time.</CardDescription>
        </CardHeader>
        <CardContent className="h-[300px] flex items-center justify-center">
          <p className="text-muted-foreground">
            { data && data.length >=1 ? "Waiting for more data to display graph..." : "Start your shift to see live earnings trend."}
          </p>
        </CardContent>
      </Card>
    );
  }

  const totalElapsedSeconds = data.length > 0 ? data[data.length - 1].seconds : 0;

  const customTooltipLabelFormatter = (value: number) => {
    // Value is in seconds from dataKey="seconds"
    return formatTimeForAxis(value, totalElapsedSeconds);
  };

  return (
    <Card className="w-full shadow-lg">
      <CardHeader>
        <CardTitle className="flex items-center text-2xl">
           <ChartIcon className="mr-2 h-6 w-6 text-primary" />
           Live Earnings Trend
        </CardTitle>
        <CardDescription>Visualizing your earnings accumulation over time.</CardDescription>
      </CardHeader>
      <CardContent>
        <ChartContainer config={chartConfig} className="h-[300px] w-full">
          <LineChart
            data={data}
            margin={{
              top: 5,
              right: 30, // Increased right margin for potential end labels
              left: 20, // Increased left margin for Y-axis labels
              bottom: 20, // Increased bottom margin for X-axis label
            }}
            accessibilityLayer // Improves accessibility
          >
            <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
            <XAxis
              dataKey="seconds"
              type="number"
              domain={[0, 'dataMax']} // Start from 0, extend to max seconds in data
              tickFormatter={(value) => formatTimeForAxis(value, totalElapsedSeconds)}
              stroke="hsl(var(--foreground))"
              padding={{ left: 10, right: 10 }}
              interval="preserveStartEnd" // Helps with tick distribution
            >
              <Label 
                value={getXAxisLabel(totalElapsedSeconds)} 
                offset={0} // Adjust as needed
                position="insideBottom" 
                dy={10} // Push label down a bit
                fill="hsl(var(--foreground))"
              />
            </XAxis>
            <YAxis
              dataKey="earnings"
              type="number"
              domain={[0, 'auto']}
              tickFormatter={(value) => `$${value.toFixed(2)}`}
              stroke="hsl(var(--foreground))"
              allowDecimals={true}
              width={80} // Explicit width for YAxis to prevent label cropping
            >
              <Label
                value="Earnings ($)"
                angle={-90}
                position="insideLeft"
                dx={-15} // Adjust to not overlap with ticks
                style={{ textAnchor: 'middle', fill: 'hsl(var(--foreground))' }}
              />
            </YAxis>
            <RechartsTooltip
              cursor={{ strokeDasharray: '3 3', stroke: 'hsl(var(--muted-foreground))' }}
              content={
                <ChartTooltipContent 
                  indicator="line" 
                  nameKey="earnings" // This refers to the Y-axis value's "name"
                  labelKey="seconds" // This is the X-axis value from the data point
                  labelFormatter={customTooltipLabelFormatter} 
                />
              }
            />
            <Line
              dataKey="earnings"
              type="monotone"
              stroke="hsl(var(--primary))"
              strokeWidth={2}
              dot={false}
              isAnimationActive={false} 
              name="Earnings" 
            />
          </LineChart>
        </ChartContainer>
      </CardContent>
    </Card>
  );
}
