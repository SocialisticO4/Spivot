"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { StatusCard } from "@/components/dashboard/StatusCard";
import { ForecastChart } from "@/components/dashboard/ForecastChart";
import { ExpenseChart } from "@/components/dashboard/ExpenseChart";
import { ActionFeed } from "@/components/dashboard/ActionFeed";
import { RefreshCw, AlertTriangle, Sparkles, LogOut, Loader2 } from "lucide-react";
import type { DashboardMetrics, AgentLog, ExpenseCategory } from "@/lib/types";
import { getDashboardMetrics, getAgentLogs } from "@/lib/data";
import { supabase } from "@/lib/supabase";
import { useRouter } from "next/navigation";

// Default metrics when loading
const defaultMetrics: DashboardMetrics = {
  cash_runway_days: 0,
  spivot_score: 0,
  pending_orders: 0,
  forecast_accuracy: 0,
  burn_rate: 0,
  total_inventory_value: 0,
};

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

export default function Dashboard() {
  const [metrics, setMetrics] = useState<DashboardMetrics>(defaultMetrics);
  const [logs, setLogs] = useState<AgentLog[]>([]);
  const [expenses] = useState<ExpenseCategory[]>(mockExpenses);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<any>(null);
  const router = useRouter();

  // Fetch user and data on mount
  useEffect(() => {
    const fetchData = async () => {
      // Get user
      const { data: { user } } = await supabase.auth.getUser();
      setUser(user);

      // Fetch dashboard data
      try {
        const [metricsData, logsData] = await Promise.all([
          getDashboardMetrics(),
          getAgentLogs(10)
        ]);
        setMetrics(metricsData);
        setLogs(logsData);
      } catch (error) {
        console.error("Error fetching data:", error);
        // Use fallback data if fetch fails
        setMetrics({
          cash_runway_days: 15,
          spivot_score: 580,
          pending_orders: 5,
          forecast_accuracy: 0.87,
          burn_rate: 45000,
          total_inventory_value: 2850000,
        });
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push("/login");
    router.refresh();
  };

  const handleRefresh = async () => {
    setLoading(true);
    try {
      const [metricsData, logsData] = await Promise.all([
        getDashboardMetrics(),
        getAgentLogs(10)
      ]);
      setMetrics(metricsData);
      setLogs(logsData);
    } catch (error) {
      console.error("Error refreshing data:", error);
    } finally {
      setLoading(false);
    }
  };

  const mockForecast = Array.from({ length: 30 }, (_, i) => ({
    date: new Date(Date.now() + i * 86400000).toISOString().split("T")[0],
    forecast: Math.round(85000 + Math.random() * 30000 + i * 1000),
    actual: i < 7 ? Math.round(80000 + Math.random() * 25000 + i * 800) : undefined,
  }));

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

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <div className="text-center">
          <Loader2 className="h-12 w-12 animate-spin text-purple-500 mx-auto mb-4" />
          <p className="text-gray-500">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
          <p className="text-gray-500 mt-1">
            {user?.email || "Spivot Auto Parts Pvt. Ltd."} - Overview
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Button
            onClick={handleRefresh}
            disabled={loading}
            variant="outline"
            className="flex items-center gap-2"
          >
            <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
          <Button
            onClick={handleLogout}
            variant="ghost"
            className="flex items-center gap-2 text-gray-500"
          >
            <LogOut className="h-4 w-4" />
            Logout
          </Button>
        </div>
      </div>

      {/* Crisis Alert Banner */}
      {metrics.cash_runway_days < 20 && metrics.cash_runway_days > 0 && (
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
        <ForecastChart data={mockForecast} />
        <ExpenseChart data={expenses} />
      </div>

      {/* Agent Activity */}
      <ActionFeed logs={logs.length > 0 ? logs : [
        {
          id: 1,
          timestamp: new Date().toISOString(),
          agent_name: "System",
          action: "Waiting for data",
          result: "Add transactions and inventory to see agent activity",
          severity: "info",
        }
      ]} />

      {/* Footer Info */}
      <div className="text-center text-sm text-gray-400 py-4 flex items-center justify-center gap-2">
        <Sparkles className="h-4 w-4" />
        Powered by 5 AI Agents • Data from Supabase
      </div>
    </div>
  );
}
