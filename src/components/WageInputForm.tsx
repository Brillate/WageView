
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
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { DollarSign, CheckCircle } from "lucide-react";
import { useEffect, useState } from "react";

const wageFormSchema = z.object({
  wage: z.coerce.number().positive({ message: "Wage must be a positive number." }).min(0.01, { message: "Wage must be at least $0.01." }),
});

type WageFormValues = z.infer<typeof wageFormSchema>;

interface WageInputFormProps {
  initialWage: number | null;
  onWageChange: (wage: number) => void;
  disabled: boolean;
}

export function WageInputForm({ initialWage, onWageChange, disabled }: WageInputFormProps) {
  const [isWageSet, setIsWageSet] = useState(!!initialWage && initialWage > 0);

  const form = useForm<WageFormValues>({
    resolver: zodResolver(wageFormSchema),
    defaultValues: {
      wage: initialWage || undefined,
    },
  });

  useEffect(() => {
    if (initialWage !== null) {
      form.setValue("wage", initialWage);
      setIsWageSet(initialWage > 0);
    }
  }, [initialWage, form]);

  function onSubmit(data: WageFormValues) {
    onWageChange(data.wage);
    setIsWageSet(true);
  }

  return (
    <Card className="w-full shadow-lg">
      <CardHeader>
        <CardTitle className="flex items-center text-2xl">
          <DollarSign className="mr-2 h-6 w-6 text-primary" /> Hourly Wage
        </CardTitle>
        <CardDescription>
          {isWageSet && !disabled ? "Update your hourly wage below." : "Enter your hourly wage to begin."}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <FormField
              control={form.control}
              name="wage"
              render={({ field }) => (
                <FormItem>
                  <FormLabel htmlFor="wage">Your Wage ($/hour)</FormLabel>
                  <div className="flex items-center space-x-2">
                    <FormControl>
                      <Input
                        id="wage"
                        type="number"
                        step="0.01"
                        placeholder="e.g., 25.50"
                        {...field}
                        disabled={disabled}
                        className="text-lg"
                      />
                    </FormControl>
                    <Button type="submit" disabled={disabled || !form.formState.isValid} aria-label="Set Wage">
                       {isWageSet && !disabled ? <CheckCircle className="h-5 w-5"/> : (disabled ? "Locked" : "Set Wage")}
                    </Button>
                  </div>
                  <FormMessage />
                </FormItem>
              )}
            />
          </form>
        </Form>
        {isWageSet && disabled && (
          <p className="mt-4 text-sm text-green-400 flex items-center">
            <CheckCircle className="mr-2 h-5 w-5" /> Wage set to ${initialWage?.toFixed(2)}. End current shift to change.
          </p>
        )}
      </CardContent>
    </Card>
  );
}
