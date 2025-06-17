
"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { DollarSign, CheckCircle } from "lucide-react";
import { useEffect, useState } from "react";
import { cn } from "@/lib/utils";
import type { PayPeriod } from '@/hooks/useWageTracker';

const payPeriods: { value: PayPeriod; label: string }[] = [
  { value: 'hourly', label: 'Hourly' },
  { value: 'daily', label: 'Daily' },
  { value: 'weekly', label: 'Weekly' },
  { value: 'monthly', label: 'Monthly' },
  { value: 'annually', label: 'Annually' },
];

const wageFormSchema = z.object({
  amount: z.coerce.number().positive({ message: "Amount must be a positive number." }).min(0.01, { message: "Amount must be at least $0.01." }),
  period: z.enum(['hourly', 'daily', 'weekly', 'monthly', 'annually'], {
    required_error: "You need to select a pay period.",
  }),
});

type WageFormValues = z.infer<typeof wageFormSchema>;

interface WageInputFormProps {
  initialAmount: number | null;
  initialPayPeriod: PayPeriod;
  onWageConfigChange: (amount: number, period: PayPeriod) => void;
  disabled: boolean;
  effectiveHourlyWage: number | null;
}

export function WageInputForm({ initialAmount, initialPayPeriod, onWageConfigChange, disabled, effectiveHourlyWage }: WageInputFormProps) {
  const [isWageSet, setIsWageSet] = useState(!!effectiveHourlyWage && effectiveHourlyWage > 0);

  const form = useForm<WageFormValues>({
    resolver: zodResolver(wageFormSchema),
    defaultValues: {
      amount: initialAmount || undefined,
      period: initialPayPeriod || 'hourly',
    },
  });

  useEffect(() => {
    if (initialAmount !== null) {
      form.setValue("amount", initialAmount);
    }
    form.setValue("period", initialPayPeriod || 'hourly');
    setIsWageSet(!!effectiveHourlyWage && effectiveHourlyWage > 0);
  }, [initialAmount, initialPayPeriod, effectiveHourlyWage, form]);

  function onSubmit(data: WageFormValues) {
    onWageConfigChange(data.amount, data.period as PayPeriod);
    setIsWageSet(true); 
  }
  
  return (
    <Card className="w-full shadow-lg">
      <CardHeader>
        <CardTitle className="flex items-center text-2xl">
          <DollarSign className="mr-2 h-6 w-6 text-primary" /> Pay Configuration
        </CardTitle>
        <CardDescription>
          {isWageSet && !disabled ? "Update your pay configuration below." : "Enter your pay amount and select the period."}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 items-end">
              <FormField
                control={form.control}
                name="amount"
                render={({ field }) => (
                  <FormItem className="sm:col-span-2">
                    <FormLabel htmlFor="amount">Your Pay Amount ($)</FormLabel>
                    <FormControl>
                      <Input
                        id="amount"
                        type="number"
                        step="0.01"
                        placeholder="e.g., 25.50"
                        {...field}
                        disabled={disabled}
                        className={cn("text-lg", "no-spinners")}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="period"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel htmlFor="period">Pay Period</FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                      disabled={disabled}
                    >
                      <FormControl>
                        <SelectTrigger id="period" className="text-lg">
                          <SelectValue placeholder="Select period" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {payPeriods.map(p => (
                          <SelectItem key={p.value} value={p.value} className="text-lg">
                            {p.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            <Button type="submit" disabled={disabled || !form.formState.isValid} aria-label="Set Pay Configuration" className="w-full sm:w-auto">
              {disabled ? "Locked" : (isWageSet ? "Update Pay" : "Set Pay")}
            </Button>
          </form>
        </Form>
        {isWageSet && disabled && effectiveHourlyWage && initialAmount && (
          <p className="mt-4 text-sm text-green-400 flex items-center">
            <CheckCircle className="mr-2 h-5 w-5" /> 
            Pay set: ${initialAmount.toFixed(2)} per {initialPayPeriod}. (Effective: ${effectiveHourlyWage.toFixed(2)}/hr). End current shift to change.
          </p>
        )}
      </CardContent>
    </Card>
  );
}
