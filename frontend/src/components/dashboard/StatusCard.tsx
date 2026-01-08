"use client";

import { cn } from "@/lib/utils";
import { 
  TrendingUp, 
  TrendingDown, 
  AlertTriangle,
  DollarSign,
  ShieldCheck,
  Package,
  Target
} from "lucide-react";

interface StatusCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  icon?: "cash" | "score" | "orders" | "accuracy";
  trend?: "up" | "down" | "neutral";
  alert?: "normal" | "warning" | "critical";
  className?: string;
}

const iconMap = {
  cash: DollarSign,
  score: ShieldCheck,
  orders: Package,
  accuracy: Target,
};

const alertColors = {
  normal: "from-emerald-500 to-teal-500",
  warning: "from-amber-500 to-orange-500",
  critical: "from-red-500 to-rose-500",
};

const alertBgColors = {
  normal: "bg-emerald-50",
  warning: "bg-amber-50",
  critical: "bg-red-50",
};

export function StatusCard({
  title,
  value,
  subtitle,
  icon = "cash",
  trend = "neutral",
  alert = "normal",
  className,
}: StatusCardProps) {
  const Icon = iconMap[icon];

  return (
    <div
      className={cn(
        "relative overflow-hidden rounded-2xl bg-white p-6 shadow-lg transition-all duration-300 hover:shadow-xl hover:-translate-y-1",
        className
      )}
    >
      {/* Gradient accent */}
      <div
        className={cn(
          "absolute top-0 left-0 h-1 w-full bg-gradient-to-r",
          alertColors[alert]
        )}
      />
      
      <div className="flex items-start justify-between">
        <div className="space-y-2">
          <p className="text-sm font-medium text-gray-500 uppercase tracking-wide">
            {title}
          </p>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-bold text-gray-900">{value}</span>
            {trend !== "neutral" && (
              <span
                className={cn(
                  "flex items-center text-sm font-medium",
                  trend === "up" ? "text-emerald-600" : "text-red-600"
                )}
              >
                {trend === "up" ? (
                  <TrendingUp className="h-4 w-4 mr-0.5" />
                ) : (
                  <TrendingDown className="h-4 w-4 mr-0.5" />
                )}
              </span>
            )}
          </div>
          {subtitle && (
            <p className="text-sm text-gray-500">{subtitle}</p>
          )}
        </div>
        
        <div
          className={cn(
            "rounded-xl p-3",
            alertBgColors[alert]
          )}
        >
          <Icon
            className={cn(
              "h-6 w-6",
              alert === "normal" && "text-emerald-600",
              alert === "warning" && "text-amber-600",
              alert === "critical" && "text-red-600"
            )}
          />
        </div>
      </div>
      
      {alert === "critical" && (
        <div className="mt-4 flex items-center gap-2 text-red-600">
          <AlertTriangle className="h-4 w-4" />
          <span className="text-xs font-medium">Requires Attention</span>
        </div>
      )}
    </div>
  );
}
