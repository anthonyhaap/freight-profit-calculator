"use client";

import { useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useCalculations } from "@/hooks/use-calculations";
import { useTripEstimates } from "@/hooks/use-trip-estimates";
import { useOperatingProfile } from "@/hooks/use-operating-profile";
import { calculateBreakevenCostPerMile } from "@/lib/calculations";
import { formatCurrency, formatPercent, formatCurrencyPerMile } from "@/lib/formatters";
import { cn } from "@/lib/utils";
import {
  Calculator,
  Route,
  TrendingUp,
  TrendingDown,
  DollarSign,
  Truck,
  ArrowRight,
} from "lucide-react";
import Link from "next/link";

export default function DashboardPage() {
  const { calculations, isLoaded: calcsLoaded } = useCalculations();
  const { estimates } = useTripEstimates();
  const { profile } = useOperatingProfile();

  const stats = useMemo(() => {
    if (calculations.length === 0) {
      return {
        totalLoads: 0,
        avgMargin: 0,
        avgRpm: 0,
        totalProfit: 0,
        bestLoad: null as null | (typeof calculations)[0],
        worstLoad: null as null | (typeof calculations)[0],
      };
    }

    const margins = calculations.map((c) => c.result.profitMarginPercent);
    const rpms = calculations.map((c) => c.result.revenuePerMile);
    const profits = calculations.map((c) => c.result.netProfit);

    const bestIdx = profits.indexOf(Math.max(...profits));
    const worstIdx = profits.indexOf(Math.min(...profits));

    return {
      totalLoads: calculations.length,
      avgMargin: margins.reduce((a, b) => a + b, 0) / margins.length,
      avgRpm: rpms.reduce((a, b) => a + b, 0) / rpms.length,
      totalProfit: profits.reduce((a, b) => a + b, 0),
      bestLoad: calculations[bestIdx],
      worstLoad: calculations[worstIdx],
    };
  }, [calculations]);

  const breakevenPerMile = useMemo(
    () =>
      calculateBreakevenCostPerMile(
        profile.fixedCosts,
        profile.variableCosts,
        profile.estimatedMonthlyMiles
      ),
    [profile]
  );

  if (!calcsLoaded) return null;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Dashboard</h1>
        <p className="text-muted-foreground">
          Your freight profitability at a glance
        </p>
      </div>

      {/* Quick stats */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          title="Total Loads"
          value={stats.totalLoads.toString()}
          subtitle="calculations saved"
          icon={<Calculator className="h-4 w-4" />}
        />
        <StatCard
          title="Avg Margin"
          value={formatPercent(stats.avgMargin)}
          subtitle={stats.avgMargin >= 15 ? "healthy" : stats.avgMargin > 0 ? "could improve" : "no data"}
          icon={
            stats.avgMargin >= 0 ? (
              <TrendingUp className="h-4 w-4" />
            ) : (
              <TrendingDown className="h-4 w-4" />
            )
          }
          valueClassName={
            stats.avgMargin >= 15
              ? "text-success"
              : stats.avgMargin > 0
                ? "text-warning"
                : undefined
          }
        />
        <StatCard
          title="Avg RPM"
          value={formatCurrency(stats.avgRpm)}
          subtitle="revenue per mile"
          icon={<DollarSign className="h-4 w-4" />}
        />
        <StatCard
          title="Break-Even"
          value={formatCurrencyPerMile(breakevenPerMile)}
          subtitle="operating cost"
          icon={<Truck className="h-4 w-4" />}
        />
      </div>

      {/* Total profit card */}
      {stats.totalLoads > 0 && (
        <Card>
          <CardContent className="p-6">
            <div className="flex flex-col items-center justify-between gap-4 sm:flex-row">
              <div>
                <p className="text-sm text-muted-foreground">
                  Total Profit Across All Saved Loads
                </p>
                <p
                  className={cn(
                    "text-3xl font-bold",
                    stats.totalProfit >= 0 ? "text-success" : "text-destructive"
                  )}
                >
                  {formatCurrency(stats.totalProfit)}
                </p>
              </div>
              {stats.bestLoad && (
                <div className="text-right">
                  <p className="text-sm text-muted-foreground">Best Load</p>
                  <p className="font-medium text-success">
                    {stats.bestLoad.name} —{" "}
                    {formatCurrency(stats.bestLoad.result.netProfit)}
                  </p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Profit bar chart (CSS-based) */}
      {calculations.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Recent Load Profitability</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {calculations.slice(0, 10).map((calc) => {
                const maxProfit = Math.max(
                  ...calculations.slice(0, 10).map((c) => Math.abs(c.result.netProfit)),
                  1
                );
                const width = Math.min(
                  (Math.abs(calc.result.netProfit) / maxProfit) * 100,
                  100
                );
                const isProfitable = calc.result.netProfit >= 0;

                return (
                  <div key={calc.id} className="flex items-center gap-3">
                    <div className="w-32 shrink-0 truncate text-sm">
                      {calc.name}
                    </div>
                    <div className="flex-1">
                      <div
                        className={cn(
                          "h-6 rounded-sm transition-all",
                          isProfitable ? "bg-success/70" : "bg-destructive/70"
                        )}
                        style={{ width: `${Math.max(width, 2)}%` }}
                      />
                    </div>
                    <div
                      className={cn(
                        "w-24 text-right text-sm font-medium",
                        isProfitable ? "text-success" : "text-destructive"
                      )}
                    >
                      {formatCurrency(calc.result.netProfit)}
                    </div>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Recent estimates */}
      {estimates.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Recent Trip Estimates</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {estimates.slice(0, 5).map((est) => (
                <div
                  key={est.id}
                  className="flex items-center justify-between rounded-md bg-secondary p-3"
                >
                  <div>
                    <p className="text-sm font-medium">
                      {est.origin} → {est.destination}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {est.loadedMiles + est.deadheadMiles} miles •{" "}
                      {new Date(est.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-medium text-success">
                      {formatCurrency(est.suggestedRate)}
                    </p>
                    <p className="text-xs text-muted-foreground">suggested</p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Empty state with quick links */}
      {stats.totalLoads === 0 && (
        <Card>
          <CardContent className="flex flex-col items-center gap-6 py-12">
            <div className="text-center">
              <Truck className="mx-auto mb-4 h-12 w-12 text-muted-foreground" />
              <h2 className="text-xl font-semibold">
                Welcome to FreightCalc
              </h2>
              <p className="mt-1 text-muted-foreground">
                Start by setting up your cost profile or calculating your first
                load.
              </p>
            </div>
            <div className="flex flex-wrap justify-center gap-3">
              <Link href="/profile">
                <Button variant="outline">
                  Set Up Cost Profile
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </Link>
              <Link href="/calculator">
                <Button>
                  Calculate a Load
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </Link>
              <Link href="/estimator">
                <Button variant="outline">
                  Estimate a Trip
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

function StatCard({
  title,
  value,
  subtitle,
  icon,
  valueClassName,
}: {
  title: string;
  value: string;
  subtitle: string;
  icon: React.ReactNode;
  valueClassName?: string;
}) {
  return (
    <Card>
      <CardContent className="p-4">
        <div className="flex items-center justify-between">
          <p className="text-sm text-muted-foreground">{title}</p>
          <div className="text-muted-foreground">{icon}</div>
        </div>
        <p className={cn("mt-1 text-2xl font-bold", valueClassName)}>
          {value}
        </p>
        <p className="text-xs text-muted-foreground">{subtitle}</p>
      </CardContent>
    </Card>
  );
}
