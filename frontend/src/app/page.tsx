"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { StatusCard } from "@/components/dashboard/StatusCard";
import { ForecastChart } from "@/components/dashboard/ForecastChart";
import { ExpenseChart } from "@/components/dashboard/ExpenseChart";
import { ActionFeed } from "@/components/dashboard/ActionFeed";
import { RefreshCw, AlertTriangle, Sparkles } from "lucide-react";
import type { DashboardMetrics, AgentLog, ExpenseCategory, ForecastItem } from "@/lib/types";

// Mock data for demo (will connect to API)
const mockMetrics: DashboardMetrics = {
  cash_runway_days: 15,
  spivot_score: 580,
  pending_orders: 5,
  forecast_accuracy: 0.87,
  burn_rate: 45000,
  total_inventory_value: 2850000,
};

const mockLogs: AgentLog[] = [
  {
    id: 1,
    timestamp: new Date(Date.now() - 300000).toISOString(),
    agent_name: "Treasurer",
    action: "Cash runway critical",
    result: "Only 15 days of runway left!",
    severity: "critical",
  },
  {
    id: 2,
    timestamp: new Date(Date.now() - 600000).toISOString(),
    agent_name: "Quartermaster",
    action: "Stock alert triggered",
    result: "Steel Sheets below reorder point",
    severity: "critical",
  },
  {
    id: 3,
    timestamp: new Date(Date.now() - 1200000).toISOString(),
    agent_name: "Prophet",
    action: "Demand forecast updated",
    result: "High demand spike predicted (↑35%)",
    severity: "warning",
  },
  {
    id: 4,
    timestamp: new Date(Date.now() - 3600000).toISOString(),
    agent_name: "Visual Eye",
    action: "Processed invoice from Steel Suppliers Inc.",
    result: "Extracted 12 line items",
    severity: "info",
  },
  {
    id: 5,
    timestamp: new Date(Date.now() - 7200000).toISOString(),
    agent_name: "Underwriter",
    action: "Spivot Score updated",
    result: "Score dropped to 580 (Medium Risk)",
    severity: "warning",
  },
];

const mockExpenses: ExpenseCategory[] = [
  { category: "Raw Materials", amount: 450000 },
  { category: "Salaries", amount: 280000 },
  { category: "Utilities", amount: 85000 },
  { category: "Logistics", amount: 120000 },
  { category: "Rent", amount: 75000 },
  { category: "Equipment", amount: 95000 },
  { category: "Marketing", amount: 45000 },
  { category: "Insurance", amount: 35000 },
];

const mockForecast = Array.from({ length: 30 }, (_, i) => ({
  date: new Date(Date.now() + i * 86400000).toISOString().split("T")[0],
  forecast: Math.round(85000 + Math.random() * 30000 + i * 1000),
  actual: i < 7 ? Math.round(80000 + Math.random() * 25000 + i * 800) : undefined,
}));

export default function Dashboard() {
  const [metrics, setMetrics] = useState<DashboardMetrics>(mockMetrics);
  const [logs, setLogs] = useState<AgentLog[]>(mockLogs);
  const [expenses, setExpenses] = useState<ExpenseCategory[]>(mockExpenses);
  const [forecast, setForecast] = useState(mockForecast);
  const [loading, setLoading] = useState(false);
  const [demoResetting, setDemoResetting] = useState(false);

  const handleResetDemo = async () => {
    setDemoResetting(true);
    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 2000));
    
    // Update with crisis scenario data
    setMetrics({
      ...metrics,
      cash_runway_days: 12,
      pending_orders: 7,
      spivot_score: 520,
    });
    
    setDemoResetting(false);
  };

  const getAlertLevel = (runway: number): "normal" | "warning" | "critical" => {
    if (runway < 20) return "critical";
    if (runway < 45) return "warning";
    return "normal";
  };

  const getScoreAlertLevel = (score: number): "normal" | "warning" | "critical" => {
    if (score < 550) return "critical";
    if (score < 700) return "warning";
    return "normal";
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
          <p className="text-gray-500 mt-1">
            Spivot Auto Parts Pvt. Ltd. - Overview
          </p>
        </div>
        <Button
          onClick={handleResetDemo}
          disabled={demoResetting}
          className="flex items-center gap-2"
        >
          {demoResetting ? (
            <>
              <RefreshCw className="h-4 w-4 animate-spin" />
              Resetting...
            </>
          ) : (
            <>
              <AlertTriangle className="h-4 w-4" />
              Reset Demo (Crisis Mode)
            </>
          )}
        </Button>
      </div>

      {/* Crisis Alert Banner */}
      {metrics.cash_runway_days < 20 && (
        <div className="bg-gradient-to-r from-red-500 to-rose-500 text-white rounded-2xl p-4 flex items-center gap-4 shadow-lg">
          <div className="p-2 bg-white/20 rounded-xl">
            <AlertTriangle className="h-6 w-6" />
          </div>
          <div>
            <h3 className="font-semibold">Crisis Mode Active</h3>
            <p className="text-sm text-white/90">
              Low cash runway detected. Agents are working to optimize your situation.
            </p>
          </div>
        </div>
      )}

      {/* Status Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatusCard
          title="Cash Runway"
          value={`${metrics.cash_runway_days} days`}
          subtitle={`₹${metrics.burn_rate.toLocaleString()}/day burn`}
          icon="cash"
          alert={getAlertLevel(metrics.cash_runway_days)}
          trend={metrics.cash_runway_days < 30 ? "down" : "neutral"}
        />
        <StatusCard
          title="Spivot Score"
          value={metrics.spivot_score}
          subtitle="Credit Health Index"
          icon="score"
          alert={getScoreAlertLevel(metrics.spivot_score)}
          trend={metrics.spivot_score < 600 ? "down" : "up"}
        />
        <StatusCard
          title="Pending Orders"
          value={metrics.pending_orders}
          subtitle="Items below reorder point"
          icon="orders"
          alert={metrics.pending_orders > 3 ? "warning" : "normal"}
        />
        <StatusCard
          title="Forecast Accuracy"
          value={`${(metrics.forecast_accuracy * 100).toFixed(0)}%`}
          subtitle="Prophet prediction rate"
          icon="accuracy"
          alert="normal"
          trend="up"
        />
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <ForecastChart data={forecast} />
        <ExpenseChart data={expenses} />
      </div>

      {/* Agent Activity */}
      <ActionFeed logs={logs} />

      {/* Footer Info */}
      <div className="text-center text-sm text-gray-400 py-4 flex items-center justify-center gap-2">
        <Sparkles className="h-4 w-4" />
        Powered by 5 AI Agents • Updated in real-time
      </div>
    </div>
  );
}
