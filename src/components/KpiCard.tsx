import { cn } from "@/lib/utils";
import { ArrowUp, ArrowDown } from "lucide-react";

interface KpiCardProps {
  title: string;
  value: string | number;
  className?: string;
  trend?: {
    value: number;
    isPositive: boolean;
  };
}

export function KpiCard({ title, value, className, trend }: KpiCardProps) {
  return (
    <div
      className={cn(
        "relative overflow-hidden rounded-xl bg-white/80 backdrop-blur-lg p-6 shadow-sm transition-all hover:shadow-md animate-fade-in border border-gray-100",
        className
      )}
    >
      <div className="flex flex-col gap-2">
        <p className="text-sm font-medium text-gray-500">{title}</p>
        <div className="flex items-end justify-between">
          <p className="text-2xl font-semibold bg-gradient-to-r from-gray-900 to-gray-600 bg-clip-text text-transparent">
            {value}
          </p>
          {trend && (
            <div className={cn(
              "flex items-center text-sm font-medium",
              trend.isPositive ? "text-green-600" : "text-red-600"
            )}>
              {trend.isPositive ? (
                <ArrowUp className="w-4 h-4 mr-1" />
              ) : (
                <ArrowDown className="w-4 h-4 mr-1" />
              )}
              {Math.abs(trend.value)}%
            </div>
          )}
        </div>
      </div>
      <div className="absolute inset-x-0 bottom-0 h-1 bg-gradient-to-r from-blue-500/20 to-purple-500/20" />
    </div>
  );
}