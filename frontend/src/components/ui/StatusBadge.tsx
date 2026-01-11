"use client";

import { CheckCircle, Clock, AlertCircle, XCircle, FileText, Loader2 } from "lucide-react";

interface StatusBadgeProps {
  status: "paid" | "pending" | "overdue" | "draft" | "processing" | "failed" | "completed";
  size?: "sm" | "md" | "lg";
}

const statusConfig = {
  paid: {
    label: "Paid",
    icon: CheckCircle,
    className: "badge-success",
  },
  pending: {
    label: "Pending",
    icon: Clock,
    className: "badge-warning",
  },
  overdue: {
    label: "Overdue",
    icon: AlertCircle,
    className: "badge-danger",
  },
  draft: {
    label: "Draft",
    icon: FileText,
    className: "badge-neutral",
  },
  processing: {
    label: "Processing",
    icon: Loader2,
    className: "badge-info",
  },
  failed: {
    label: "Failed",
    icon: XCircle,
    className: "badge-danger",
  },
  completed: {
    label: "Completed",
    icon: CheckCircle,
    className: "badge-success",
  },
};

const sizeClasses = {
  sm: "text-[13px] py-[6px] px-2",
  md: "text-[14px] py-1 px-2",
  lg: "text-[15px] py-1.5 px-3",
};

export function StatusBadge({ status, size = "md" }: StatusBadgeProps) {
  const config = statusConfig[status];
  const Icon = config.icon;
  const isAnimated = status === "processing";

  return (
    <span className={`badge ${config.className} ${sizeClasses[size]}`}>
      <Icon className={`w-4 h-4 ${isAnimated ? "animate-spin" : ""}`} />
      <span>{config.label}</span>
    </span>
  );
}
