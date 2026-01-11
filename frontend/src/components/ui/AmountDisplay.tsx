"use client";

interface AmountDisplayProps {
  amount: number;
  size?: "sm" | "md" | "lg" | "xl";
  showSign?: boolean;
  className?: string;
}

const sizeClasses = {
  sm: "amount-small",   // 18px
  md: "amount-medium",  // 24px
  lg: "amount-large",   // 32px
  xl: "text-[40px] font-bold tabular-nums", // Extra large
};

/**
 * Format number in Indian numbering system (1,23,456.78)
 */
function formatIndianCurrency(amount: number): string {
  const absAmount = Math.abs(amount);
  const parts = absAmount.toFixed(2).split(".");
  let integerPart = parts[0];
  const decimalPart = parts[1];
  
  // Indian numbering: 1,23,45,678
  if (integerPart.length > 3) {
    const lastThree = integerPart.slice(-3);
    const rest = integerPart.slice(0, -3);
    const formatted = rest.replace(/\B(?=(\d{2})+(?!\d))/g, ",");
    integerPart = formatted + "," + lastThree;
  }
  
  return `₹${integerPart}.${decimalPart}`;
}

export function AmountDisplay({ 
  amount, 
  size = "md", 
  showSign = false,
  className = ""
}: AmountDisplayProps) {
  const isPositive = amount >= 0;
  const colorClass = amount === 0 
    ? "text-tertiary" 
    : isPositive 
      ? "amount-profit" 
      : "amount-loss";
  
  const sign = showSign && amount !== 0 
    ? (isPositive ? "+" : "-")
    : (amount < 0 ? "-" : "");
  
  const displayAmount = formatIndianCurrency(Math.abs(amount));
  
  return (
    <span 
      className={`amount ${sizeClasses[size]} ${colorClass} ${className}`}
      aria-label={`${amount >= 0 ? 'Amount' : 'Expense'} ${displayAmount}`}
    >
      {sign}{displayAmount}
    </span>
  );
}

/**
 * Compact amount for small spaces (1.2L instead of 1,20,000)
 */
export function CompactAmount({ 
  amount, 
  className = "" 
}: { 
  amount: number; 
  className?: string;
}) {
  const absAmount = Math.abs(amount);
  let displayValue: string;
  
  if (absAmount >= 10000000) {
    displayValue = `₹${(absAmount / 10000000).toFixed(1)}Cr`;
  } else if (absAmount >= 100000) {
    displayValue = `₹${(absAmount / 100000).toFixed(1)}L`;
  } else if (absAmount >= 1000) {
    displayValue = `₹${(absAmount / 1000).toFixed(1)}K`;
  } else {
    displayValue = `₹${absAmount}`;
  }
  
  const sign = amount < 0 ? "-" : (amount > 0 ? "+" : "");
  const colorClass = amount === 0 
    ? "text-tertiary" 
    : amount > 0 
      ? "amount-profit" 
      : "amount-loss";
  
  return (
    <span className={`amount ${colorClass} ${className}`}>
      {sign}{displayValue}
    </span>
  );
}
