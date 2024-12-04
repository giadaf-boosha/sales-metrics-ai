import { cn } from "@/lib/utils";

interface KpiCardProps {
  title: string;
  value: string | number;
  className?: string;
}

export function KpiCard({ title, value, className }: KpiCardProps) {
  return (
    <div
      className={cn(
        "relative overflow-hidden rounded-xl bg-white p-6 shadow-sm transition-all hover:shadow-md animate-fade-in",
        className
      )}
    >
      <div className="flex flex-col gap-2">
        <p className="text-sm font-medium text-muted-foreground">{title}</p>
        <p className="text-2xl font-semibold text-[#0066FF]">{value}</p>
      </div>
    </div>
  );
}