import { cn } from "@/lib/utils";
import { ArrowDownIcon, ArrowUpIcon } from "lucide-react";

interface KpiCardProps {
  title: string;
  value: string | number;
  trend: number;
  className?: string;
}

export function KpiCard({ title, value, trend, className }: KpiCardProps) {
  const isPositive = trend > 0;
  const isNeutral = trend === 0;

  return (
    <div
      className={cn(
        "relative overflow-hidden rounded-xl bg-white p-6 shadow-sm transition-all hover:shadow-md animate-fade-in",
        className
      )}
    >
      <div className="flex flex-col gap-2">
        <p className="text-sm font-medium text-muted-foreground">{title}</p>
        <p className="text-2xl font-semibold">{value}</p>
        <div className="flex items-center gap-1">
          {!isNeutral && (
            <>
              {isPositive ? (
                <ArrowUpIcon className="h-4 w-4 text-metric-up" />
              ) : (
                <ArrowDownIcon className="h-4 w-4 text-metric-down" />
              )}
            </>
          )}
          <span
            className={cn("text-sm font-medium", {
              "text-metric-up": isPositive,
              "text-metric-down": !isPositive && !isNeutral,
              "text-metric-neutral": isNeutral,
            })}
          >
            {Math.abs(trend)}%
          </span>
        </div>
      </div>
    </div>
  );
}