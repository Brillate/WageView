
"use client";

import type { EarningsDataPoint } from '@/hooks/useWageTracker';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { ChartContainer, ChartTooltipContent } from "@/components/ui/chart";
import { LineChart, CartesianGrid, XAxis, YAxis, Tooltip as RechartsTooltip, Line } from 'recharts';
import { BarChart } from 'lucide-react'; // Using BarChart as a generic chart icon

interface EarningsGraphProps {
  data: EarningsDataPoint[];
}

const chartConfig = {
  earnings: {
    label: "Earnings",
    color: "hsl(var(--primary))",
  },
};

export function EarningsGraph({ data }: EarningsGraphProps) {
  if (!data || data.length < 2) {
    return (
      <Card className="w-full shadow-lg">
        <CardHeader>
          <CardTitle className="flex items-center text-2xl">
            <BarChart className="mr-2 h-6 w-6 text-primary" />
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

  return (
    <Card className="w-full shadow-lg">
      <CardHeader>
        <CardTitle className="flex items-center text-2xl">
           <BarChart className="mr-2 h-6 w-6 text-primary" />
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
              right: 20, 
              left: 10, // Increased left margin for Y-axis labels
              bottom: 5,
            }}
            accessibilityLayer // Improves accessibility
          >
            <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
            <XAxis
              dataKey="seconds"
              type="number"
              domain={['dataMin', 'dataMax']}
              tickFormatter={(value) => `${Math.round(value)}s`}
              stroke="hsl(var(--foreground))"
              padding={{ left: 10, right: 10 }}
            />
            <YAxis
              dataKey="earnings"
              type="number"
              domain={[0, 'auto']}
              tickFormatter={(value) => `$${value.toFixed(2)}`}
              stroke="hsl(var(--foreground))"
              allowDecimals={true}
              width={70} // Explicit width for YAxis to prevent label cropping
            />
            <RechartsTooltip
              cursor={{ strokeDasharray: '3 3', stroke: 'hsl(var(--muted-foreground))' }}
              content={<ChartTooltipContent indicator="line" nameKey="earnings" labelKey="seconds" />}
            />
            <Line
              dataKey="earnings"
              type="monotone"
              stroke="hsl(var(--primary))"
              strokeWidth={2}
              dot={false}
              isAnimationActive={false} // Recommended for live data
              name="Earnings" // Name for tooltip
            />
          </LineChart>
        </ChartContainer>
      </CardContent>
    </Card>
  );
}
