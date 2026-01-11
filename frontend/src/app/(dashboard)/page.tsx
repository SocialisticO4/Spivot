"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle, MetricCard } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { AmountDisplay, CompactAmount } from "@/components/ui/AmountDisplay";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { 
  TrendingUp, 
  TrendingDown, 
  Wallet, 
  Package, 
  FileText, 
  AlertCircle,
  RefreshCw,
  ArrowRight,
  Clock,
  Loader2,
  Plus
} from "lucide-react";
import { getDashboardMetrics, getTransactions, getAgentLogs, getInventory } from "@/lib/data";
import { supabase } from "@/lib/supabase";
import Link from "next/link";

interface DashboardData {
  todaySales: number;
  todayExpenses: number;
  pendingReceivables: number;
  pendingCount: number;
  cashRunway: number;
  spivotScore: number;
  lowStockCount: number;
}

interface Activity {
  id: number;
  type: "credit" | "debit";
  description: string;
  amount: number;
  date: string;
}

export default function Dashboard() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [userName, setUserName] = useState("");
  const [data, setData] = useState<DashboardData | null>(null);
  const [activities, setActivities] = useState<Activity[]>([]);
  const [hasData, setHasData] = useState(false);

  useEffect(() => {
    fetchUserAndData();
  }, []);

  const fetchUserAndData = async () => {
    try {
      // Get user
      const { data: { user } } = await supabase.auth.getUser();
      if (user?.email) {
        const name = user.email.split("@")[0];
        setUserName(name.charAt(0).toUpperCase() + name.slice(1));
      }

      // Fetch all data
      const [metrics, transactions, inventory] = await Promise.all([
        getDashboardMetrics(),
        getTransactions(),
        getInventory()
      ]);

      // Check if user has any data
      const hasAnyData = transactions.length > 0 || inventory.length > 0;
      setHasData(hasAnyData);

      if (hasAnyData) {
        // Calculate dashboard metrics
        const today = new Date().toISOString().split("T")[0];
        const todayTx = transactions.filter((t: any) => t.date?.startsWith(today));
        const todaySales = todayTx
          .filter((t: any) => t.type === "credit")
          .reduce((sum: number, t: any) => sum + t.amount, 0);
        const todayExpenses = todayTx
          .filter((t: any) => t.type === "debit")
          .reduce((sum: number, t: any) => sum + t.amount, 0);

        const pendingReceivables = transactions
          .filter((t: any) => t.type === "credit" && !t.paid)
          .reduce((sum: number, t: any) => sum + t.amount, 0);
        const pendingCount = transactions.filter((t: any) => t.type === "credit" && !t.paid).length;

        const lowStock = inventory.filter((i: any) => i.qty <= i.reorder_level);

        setData({
          todaySales,
          todayExpenses,
          pendingReceivables,
          pendingCount: pendingCount || 0,
          cashRunway: metrics.cash_runway_days || 0,
          spivotScore: metrics.spivot_score || 650,
          lowStockCount: lowStock.length,
        });

        // Get recent activities
        const recentActivities = transactions.slice(0, 5).map((t: any) => ({
          id: t.id,
          type: t.type,
          description: t.description || t.category || "Transaction",
          amount: t.amount,
          date: t.date,
        }));
        setActivities(recentActivities);
      }
    } catch (error) {
      console.error("Error fetching data:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    await fetchUserAndData();
    setRefreshing(false);
  };

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return "Good morning";
    if (hour < 17) return "Good afternoon";
    return "Good evening";
  };

  const formatTimeAgo = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    const diffDays = Math.floor(diffHours / 24);

    if (diffDays > 0) return `${diffDays} day${diffDays > 1 ? "s" : ""} ago`;
    if (diffHours > 0) return `${diffHours} hour${diffHours > 1 ? "s" : ""} ago`;
    return "Just now";
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Loader2 className="w-8 h-8 animate-spin" style={{ color: 'var(--text-tertiary)' }} />
      </div>
    );
  }

  // Empty state for new users
  if (!hasData) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-8">
        <div className="text-center mb-8">
          <h1 className="heading-1 mb-2">
            {getGreeting()}, {userName}! 👋
          </h1>
          <p className="text-secondary" style={{ color: 'var(--text-secondary)' }}>
            Welcome to Spivot - your digital khata
          </p>
        </div>

        <Card className="mb-6">
          <CardContent className="p-8 text-center">
            <div className="w-16 h-16 rounded-2xl mx-auto mb-4 flex items-center justify-center" style={{ background: 'var(--accent-light)' }}>
              <Package className="w-8 h-8" style={{ color: 'var(--accent-primary)' }} />
            </div>
            <h2 className="heading-2 mb-2">Let's get started!</h2>
            <p className="mb-6" style={{ color: 'var(--text-secondary)' }}>
              Add your first transaction or inventory item to see your dashboard come to life.
            </p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <Link href="/cashflow">
                <Button>
                  <Plus className="w-5 h-5" />
                  Add Transaction
                </Button>
              </Link>
              <Link href="/inventory">
                <Button variant="secondary">
                  <Package className="w-5 h-5" />
                  Add Inventory
                </Button>
              </Link>
              <Link href="/documents">
                <Button variant="ghost">
                  <FileText className="w-5 h-5" />
                  Scan Invoice
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <Card className="p-4 text-center">
            <Wallet className="w-8 h-8 mx-auto mb-2" style={{ color: 'var(--profit-green)' }} />
            <p className="label-text">Track Sales</p>
          </Card>
          <Card className="p-4 text-center">
            <Package className="w-8 h-8 mx-auto mb-2" style={{ color: 'var(--accent-primary)' }} />
            <p className="label-text">Manage Stock</p>
          </Card>
          <Card className="p-4 text-center">
            <FileText className="w-8 h-8 mx-auto mb-2" style={{ color: 'var(--info-blue)' }} />
            <p className="label-text">Auto-OCR Invoices</p>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="px-4 py-6 max-w-6xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="heading-1">
            {getGreeting()}, {userName}! 👋
          </h1>
          <p className="small-text" style={{ color: 'var(--text-tertiary)' }}>
            Here's your business at a glance
          </p>
        </div>
        <Button 
          variant="ghost" 
          size="icon" 
          onClick={handleRefresh}
          disabled={refreshing}
        >
          <RefreshCw className={`w-5 h-5 ${refreshing ? "animate-spin" : ""}`} />
        </Button>
      </div>

      {/* Key Metrics - 2 column on mobile */}
      <div className="grid grid-cols-2 gap-4 mb-6">
        <MetricCard>
          <p className="label-text mb-1">Today's Sales</p>
          <AmountDisplay amount={data?.todaySales || 0} size="md" />
          {data?.todaySales && data.todaySales > 0 && (
            <div className="flex items-center gap-1 mt-1" style={{ color: 'var(--profit-green)' }}>
              <TrendingUp className="w-4 h-4" />
              <span className="text-xs">+12%</span>
            </div>
          )}
        </MetricCard>

        <MetricCard>
          <p className="label-text mb-1">Expenses</p>
          <AmountDisplay amount={-(data?.todayExpenses || 0)} size="md" />
          <p className="small-text mt-1">Today</p>
        </MetricCard>
      </div>

      {/* Pending Receivables */}
      {(data?.pendingReceivables || 0) > 0 && (
        <Card className="mb-6">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg" style={{ background: 'var(--pending-light)' }}>
                  <Clock className="w-5 h-5" style={{ color: 'var(--pending-amber)' }} />
                </div>
                <div>
                  <p className="font-medium" style={{ color: 'var(--text-primary)' }}>Pending Receivables</p>
                  <p className="small-text">
                    <AmountDisplay amount={data?.pendingReceivables || 0} size="sm" className="!text-[var(--pending-amber)] mr-1" />
                    • {data?.pendingCount} invoices
                  </p>
                </div>
              </div>
              <Link href="/cashflow">
                <Button variant="ghost" size="sm">
                  View All <ArrowRight className="w-4 h-4" />
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Stats Row */}
      <div className="grid grid-cols-3 gap-4 mb-6">
        <MetricCard variant={(data?.cashRunway || 0) < 20 ? "danger" : "default"}>
          <p className="small-text mb-1">Cash Runway</p>
          <p className="text-2xl font-bold">{data?.cashRunway || 0}</p>
          <p className="small-text">days</p>
        </MetricCard>

        <MetricCard>
          <p className="small-text mb-1">Spivot Score</p>
          <p className="text-2xl font-bold" style={{ color: 'var(--profit-green)' }}>{data?.spivotScore || 650}</p>
          <p className="small-text">Good</p>
        </MetricCard>

        <MetricCard variant={data?.lowStockCount ? "warning" : "default"}>
          <p className="small-text mb-1">Low Stock</p>
          <p className="text-2xl font-bold">{data?.lowStockCount || 0}</p>
          <p className="small-text">items</p>
        </MetricCard>
      </div>

      {/* Recent Activity */}
      {activities.length > 0 && (
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>Recent Activity</CardTitle>
              <Link href="/cashflow">
                <Button variant="link" size="sm">
                  View All
                </Button>
              </Link>
            </div>
          </CardHeader>
          <CardContent className="p-0">
            {activities.map((activity, index) => (
              <div 
                key={activity.id}
                className="flex items-center justify-between px-5 py-4 transition-colors hover:bg-[var(--bg-accent-subtle)]"
                style={{ borderBottom: index < activities.length - 1 ? '1px solid var(--border-subtle)' : 'none' }}
              >
                <div className="flex items-center gap-3">
                  <div 
                    className="p-2 rounded-lg"
                    style={{ 
                      background: activity.type === "credit" ? 'var(--profit-light)' : 'var(--loss-light)'
                    }}
                  >
                    {activity.type === "credit" ? (
                      <TrendingUp className="w-4 h-4" style={{ color: 'var(--profit-green)' }} />
                    ) : (
                      <TrendingDown className="w-4 h-4" style={{ color: 'var(--loss-red)' }} />
                    )}
                  </div>
                  <div>
                    <p className="font-medium" style={{ color: 'var(--text-primary)' }}>{activity.description}</p>
                    <p className="small-text">{formatTimeAgo(activity.date)}</p>
                  </div>
                </div>
                <AmountDisplay 
                  amount={activity.type === "credit" ? activity.amount : -activity.amount} 
                  size="sm"
                  showSign
                />
              </div>
            ))}
          </CardContent>
        </Card>
      )}
    </div>
  );
}
