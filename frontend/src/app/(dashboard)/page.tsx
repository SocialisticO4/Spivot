"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { StatusCard } from "@/components/dashboard/StatusCard";
import { ForecastChart } from "@/components/dashboard/ForecastChart";
import { ExpenseChart } from "@/components/dashboard/ExpenseChart";
import { ActionFeed } from "@/components/dashboard/ActionFeed";
import { RefreshCw, AlertTriangle, Sparkles, LogOut, Loader2, Plus, Database } from "lucide-react";
import type { DashboardMetrics, AgentLog, ExpenseCategory } from "@/lib/types";
import { getDashboardMetrics, getAgentLogs, getTransactions } from "@/lib/data";
import { supabase } from "@/lib/supabase";
import { useRouter } from "next/navigation";

export default function Dashboard() {
  const [metrics, setMetrics] = useState<DashboardMetrics | null>(null);
  const [logs, setLogs] = useState<AgentLog[]>([]);
  const [expenses, setExpenses] = useState<ExpenseCategory[]>([]);
  const [loading, setLoading] = useState(true);
  const [hasData, setHasData] = useState(false);
  const [user, setUser] = useState<any>(null);
  const router = useRouter();

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Get user
        const { data: { user } } = await supabase.auth.getUser();
        setUser(user);

        if (!user) {
          router.push("/login");
          return;
        }

        // Fetch real data
        const [metricsData, logsData, transactionsData] = await Promise.all([
          getDashboardMetrics(),
          getAgentLogs(10),
          getTransactions()
        ]);

        // Check if user has any data
        const hasRealData = transactionsData.length > 0 || 
                           (metricsData.total_inventory_value > 0) ||
                           logsData.length > 0;
        
        setHasData(hasRealData);
        
        if (hasRealData) {
          setMetrics(metricsData);
          setLogs(logsData);
          
          // Calculate expenses from transactions
          const expenseMap: Record<string, number> = {};
          transactionsData
            .filter(t => t.type === 'debit')
            .forEach(t => {
              expenseMap[t.category] = (expenseMap[t.category] || 0) + t.amount;
            });
          
          setExpenses(
            Object.entries(expenseMap).map(([category, amount]) => ({ category, amount }))
          );
        }
      } catch (error) {
        console.error("Error fetching data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [router]);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push("/login");
  };

  const handleRefresh = async () => {
    setLoading(true);
    window.location.reload();
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

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <div className="text-center">
          <Loader2 className="h-12 w-12 animate-spin text-purple-500 mx-auto mb-4" />
          <p className="text-gray-500">Loading your data...</p>
        </div>
      </div>
    );
  }

  // Empty state - no data yet
  if (!hasData) {
    return (
      <div className="space-y-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
            <p className="text-gray-500 mt-1">{user?.email}</p>
          </div>
          <Button
            onClick={handleLogout}
            variant="ghost"
            className="flex items-center gap-2 text-gray-500"
          >
            <LogOut className="h-4 w-4" />
            Logout
          </Button>
        </div>

        {/* Empty State */}
        <div className="bg-white rounded-3xl p-12 shadow-sm border border-gray-100 text-center">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-purple-100 to-pink-100 rounded-full mb-6">
            <Database className="h-10 w-10 text-purple-600" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-3">Welcome to Spivot!</h2>
          <p className="text-gray-500 mb-8 max-w-md mx-auto">
            Get started by adding your business data. Add inventory items, transactions, or upload documents to see your AI-powered insights.
          </p>
          
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 max-w-2xl mx-auto">
            <Button
              onClick={() => router.push("/inventory")}
              className="flex items-center justify-center gap-2 bg-gradient-to-r from-purple-500 to-pink-500 text-white py-6"
            >
              <Plus className="h-5 w-5" />
              Add Inventory
            </Button>
            <Button
              onClick={() => router.push("/cashflow")}
              variant="outline"
              className="flex items-center justify-center gap-2 py-6"
            >
              <Plus className="h-5 w-5" />
              Add Transaction
            </Button>
            <Button
              onClick={() => router.push("/documents")}
              variant="outline"
              className="flex items-center justify-center gap-2 py-6"
            >
              <Plus className="h-5 w-5" />
              Upload Document
            </Button>
          </div>
        </div>

        {/* Footer */}
        <div className="text-center text-sm text-gray-400 py-4 flex items-center justify-center gap-2">
          <Sparkles className="h-4 w-4" />
          Powered by 5 AI Agents • Ready to analyze your data
        </div>
      </div>
    );
  }

  // Dashboard with real data
  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
          <p className="text-gray-500 mt-1">{user?.email}</p>
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
      {metrics && metrics.cash_runway_days < 20 && metrics.cash_runway_days > 0 && (
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
      {metrics && (
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
      )}

      {/* Charts Row */}
      {expenses.length > 0 && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <ForecastChart data={[]} />
          <ExpenseChart data={expenses} />
        </div>
      )}

      {/* Agent Activity */}
      {logs.length > 0 && <ActionFeed logs={logs} />}

      {/* Footer Info */}
      <div className="text-center text-sm text-gray-400 py-4 flex items-center justify-center gap-2">
        <Sparkles className="h-4 w-4" />
        Powered by 5 AI Agents • Live data from Supabase
      </div>
    </div>
  );
}
