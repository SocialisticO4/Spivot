// Dashboard Types
export interface DashboardMetrics {
  cash_runway_days: number;
  spivot_score: number;
  pending_orders: number;
  forecast_accuracy: number;
  burn_rate: number;
  total_inventory_value: number;
}

export interface CashflowAnalysis {
  burn_rate: number;
  cash_runway_days: number;
  current_balance: number;
  alert_level: 'normal' | 'warning' | 'critical';
  monthly_inflow: number;
  monthly_outflow: number;
}

export interface SpivotScore {
  score: number;
  cash_consistency: number;
  revenue_growth: number;
  vendor_payment_history: number;
  risk_level: 'low' | 'medium' | 'high';
}

// Forecast Types
export interface ForecastItem {
  date: string;
  value: number;
  label?: string;
}

export interface DemandForecast {
  forecast_period_days: number;
  predicted_demand: ForecastItem[];
  market_sentiment: number;
  confidence: number;
}

// Inventory Types
export interface InventoryItem {
  id: number;
  user_id: number;
  sku: string;
  name: string;
  qty: number;
  unit: string;
  reorder_level: number;
  lead_time_days: number;
  unit_cost: number;
  last_updated: string;
}

export interface InventoryAlert {
  sku: string;
  name: string;
  current_qty: number;
  reorder_point: number;
  suggested_order_qty: number;
  urgency: 'low' | 'medium' | 'high';
}

export interface PurchaseOrder {
  sku: string;
  item_name: string;
  quantity: number;
  unit: string;
  estimated_cost: number;
  suggested_vendor?: string;
  urgency: string;
}

// Agent Types
export interface AgentLog {
  id: number;
  timestamp: string;
  agent_name: string;
  action: string;
  result?: string;
  severity: 'info' | 'warning' | 'critical';
  metadata?: Record<string, unknown>;
}

export interface Agent {
  name: string;
  status: string;
  description: string;
}

// Transaction Types
export interface Transaction {
  id: number;
  user_id: number;
  date: string;
  amount: number;
  type: 'credit' | 'debit';
  category: string;
  description?: string;
}

// Expense Breakdown
export interface ExpenseCategory {
  category: string;
  amount: number;
}
