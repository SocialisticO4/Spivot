"use client";

import * as React from "react";
import { Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "default" | "secondary" | "ghost" | "destructive" | "success" | "outline" | "link";
  size?: "default" | "sm" | "lg" | "icon";
  loading?: boolean;
}

const variantStyles = {
  default: "bg-[var(--accent-primary)] text-white hover:bg-[var(--accent-hover)] active:scale-[0.98]",
  secondary: "bg-transparent border border-[var(--border-default)] text-[var(--text-primary)] hover:bg-[var(--bg-accent-subtle)] hover:border-[var(--border-strong)]",
  ghost: "bg-transparent text-[var(--text-secondary)] hover:bg-[var(--bg-accent-subtle)] hover:text-[var(--text-primary)]",
  destructive: "bg-[var(--loss-red)] text-white hover:opacity-90 active:scale-[0.98]",
  success: "bg-[var(--profit-green)] text-white hover:opacity-90 active:scale-[0.98]",
  outline: "border border-[var(--border-default)] bg-[var(--bg-card)] text-[var(--text-primary)] hover:bg-[var(--bg-accent-subtle)]",
  link: "text-[var(--accent-primary)] underline-offset-4 hover:underline p-0 h-auto",
};

const sizeStyles = {
  default: "h-12 px-5 py-3 rounded-[var(--radius-md)]",
  sm: "h-10 px-4 py-2 text-sm rounded-[var(--radius-md)]",
  lg: "h-14 px-6 py-4 text-lg rounded-[var(--radius-lg)]",
  icon: "size-12 rounded-[var(--radius-md)]",
};

function Button({
  className,
  variant = "default",
  size = "default",
  loading = false,
  children,
  disabled,
  ...props
}: ButtonProps) {
  return (
    <button
      className={cn(
        "inline-flex items-center justify-center gap-2 whitespace-nowrap text-base font-medium transition-all cursor-pointer disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg:not([class*='size-'])]:size-5 shrink-0 [&_svg]:shrink-0",
        variantStyles[variant],
        sizeStyles[size],
        className
      )}
      disabled={disabled || loading}
      {...props}
    >
      {loading ? (
        <>
          <Loader2 className="animate-spin" />
          <span>Processing...</span>
        </>
      ) : (
        children
      )}
    </button>
  );
}

export { Button };
