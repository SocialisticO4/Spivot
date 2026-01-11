import * as React from "react";
import { cn } from "@/lib/utils";

function Card({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="card"
      className={cn(
        "bg-[var(--bg-card)] border border-[var(--border-subtle)] rounded-[var(--radius-lg)] text-[var(--text-primary)] overflow-hidden",
        className
      )}
      {...props}
    />
  );
}

function CardHeader({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="card-header"
      className={cn(
        "flex flex-col gap-1.5 p-5 border-b border-[var(--border-subtle)]",
        className
      )}
      {...props}
    />
  );
}

function CardTitle({ className, ...props }: React.ComponentProps<"h3">) {
  return (
    <h3
      data-slot="card-title"
      className={cn(
        "text-lg font-semibold leading-tight text-[var(--text-primary)]",
        className
      )}
      {...props}
    />
  );
}

function CardDescription({ className, ...props }: React.ComponentProps<"p">) {
  return (
    <p
      data-slot="card-description"
      className={cn("text-sm text-[var(--text-secondary)]", className)}
      {...props}
    />
  );
}

function CardContent({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="card-content"
      className={cn("p-5", className)}
      {...props}
    />
  );
}

function CardFooter({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="card-footer"
      className={cn(
        "flex items-center gap-3 p-5 pt-0 border-t border-[var(--border-subtle)]",
        className
      )}
      {...props}
    />
  );
}

// Metric Card for dashboard
function MetricCard({
  className,
  variant = "default",
  ...props
}: React.ComponentProps<"div"> & {
  variant?: "default" | "accent" | "success" | "danger" | "warning";
}) {
  const variantStyles = {
    default: "",
    accent: "bg-[var(--accent-primary)] text-white border-transparent",
    success: "bg-[var(--profit-light)] border-[var(--profit-green)]",
    danger: "bg-[var(--loss-light)] border-[var(--loss-red)]",
    warning: "bg-[var(--pending-light)] border-[var(--pending-amber)]",
  };

  return (
    <div
      data-slot="metric-card"
      className={cn(
        "bg-[var(--bg-card)] border border-[var(--border-subtle)] rounded-[var(--radius-lg)] p-5",
        variantStyles[variant],
        className
      )}
      {...props}
    />
  );
}

export {
  Card,
  CardHeader,
  CardFooter,
  CardTitle,
  CardDescription,
  CardContent,
  MetricCard,
};
