"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle, MetricCard } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { AmountDisplay, CompactAmount } from "@/components/ui/AmountDisplay";
import { TrendingUp, TrendingDown, Plus, Loader2, X, Wallet, Clock } from "lucide-react";
import { getTransactions, createTransaction, getCashflowAnalysis } from "@/lib/data";

interface Transaction {
  id: number;
  date: string;
  amount: number;
  type: "credit" | "debit";
  category: string;
  description: string | null;
}

interface CashflowData {
  current_balance: number;
  cash_runway_days: number;
  burn_rate: number;
  monthly_inflow: number;
  monthly_outflow: number;
}

export default function CashflowPage() {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [cashflow, setCashflow] = useState<CashflowData | null>(null);
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [saving, setSaving] = useState(false);
  
  const [newTx, setNewTx] = useState({
    date: new Date().toISOString().split("T")[0],
    amount: 0,
    type: "credit" as "credit" | "debit",
    category: "",
    description: "",
  });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [txData, cfData] = await Promise.all([
        getTransactions(),
        getCashflowAnalysis()
      ]);
      setTransactions(txData as Transaction[]);
      setCashflow(cfData as CashflowData);
    } catch (error) {
      console.error("Error fetching data:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleAddTransaction = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      await createTransaction({
        ...newTx,
        date: new Date(newTx.date).toISOString(),
      });
      setShowAddModal(false);
      setNewTx({ date: new Date().toISOString().split("T")[0], amount: 0, type: "credit", category: "", description: "" });
      fetchData();
    } catch (error) {
      console.error("Error adding transaction:", error);
      alert("Failed to add transaction. Please try again.");
    } finally {
      setSaving(false);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-IN", {
      day: "numeric",
      month: "short",
      year: "numeric"
    });
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <Loader2 className="h-8 w-8 animate-spin" style={{ color: 'var(--text-tertiary)' }} />
      </div>
    );
  }

  return (
    <div className="px-4 py-6 max-w-6xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
        <div>
          <h1 className="heading-1">Cashflow</h1>
          <p className="small-text" style={{ color: 'var(--text-tertiary)' }}>Managed by Treasurer Agent</p>
        </div>
        <Button onClick={() => setShowAddModal(true)}>
          <Plus className="h-5 w-5" />
          Add Transaction
        </Button>
      </div>

      {/* Empty State */}
      {transactions.length === 0 ? (
        <Card>
          <CardContent className="empty-state">
            <Wallet className="empty-state-icon" />
            <h2 className="empty-state-title">No transactions yet</h2>
            <p className="empty-state-description">Add your first transaction to start tracking cashflow.</p>
            <Button onClick={() => setShowAddModal(true)}>
              <Plus className="h-5 w-5" />
              Add First Transaction
            </Button>
          </CardContent>
        </Card>
      ) : (
        <>
          {/* Key Metrics */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
            <MetricCard variant="accent">
              <p className="text-sm opacity-80 mb-1">Current Balance</p>
              <p className="text-3xl font-bold text-white">
                {cashflow ? <CompactAmount amount={cashflow.current_balance} className="!text-white" /> : "₹0"}
              </p>
            </MetricCard>

            <MetricCard variant={cashflow && cashflow.cash_runway_days < 20 ? "danger" : "default"}>
              <p className="small-text mb-1">Cash Runway</p>
              <p className="text-3xl font-bold">{cashflow?.cash_runway_days || 0}</p>
              <p className="small-text">days</p>
            </MetricCard>

            <MetricCard>
              <p className="small-text mb-1">Monthly Inflow</p>
              <AmountDisplay amount={cashflow?.monthly_inflow || 0} size="md" />
            </MetricCard>

            <MetricCard>
              <p className="small-text mb-1">Monthly Outflow</p>
              <AmountDisplay amount={-(cashflow?.monthly_outflow || 0)} size="md" />
            </MetricCard>
          </div>

          {/* Transactions Table (Desktop) */}
          <Card className="hide-mobile">
            <CardHeader>
              <CardTitle>Recent Transactions</CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              <table className="ledger-table">
                <thead>
                  <tr>
                    <th>Date</th>
                    <th>Description</th>
                    <th className="text-right">Amount</th>
                  </tr>
                </thead>
                <tbody>
                  {transactions.slice(0, 15).map((tx) => (
                    <tr key={tx.id}>
                      <td style={{ color: 'var(--text-tertiary)' }}>{formatDate(tx.date)}</td>
                      <td>
                        <div>
                          <p className="font-medium">{tx.description || tx.category}</p>
                          <p className="small-text">{tx.category}</p>
                        </div>
                      </td>
                      <td className="amount-cell">
                        <AmountDisplay 
                          amount={tx.type === "credit" ? tx.amount : -tx.amount} 
                          size="sm"
                          showSign
                        />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </CardContent>
          </Card>

          {/* Transactions Cards (Mobile) */}
          <div className="hide-desktop">
            <h2 className="heading-2 mb-4">Recent Transactions</h2>
            <div className="space-y-3">
              {transactions.slice(0, 10).map((tx) => (
                <Card key={tx.id}>
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div 
                          className="p-2 rounded-lg"
                          style={{ 
                            background: tx.type === "credit" ? 'var(--profit-light)' : 'var(--loss-light)'
                          }}
                        >
                          {tx.type === "credit" ? (
                            <TrendingUp className="w-5 h-5" style={{ color: 'var(--profit-green)' }} />
                          ) : (
                            <TrendingDown className="w-5 h-5" style={{ color: 'var(--loss-red)' }} />
                          )}
                        </div>
                        <div>
                          <p className="font-medium" style={{ color: 'var(--text-primary)' }}>
                            {tx.description || tx.category}
                          </p>
                          <p className="small-text">{formatDate(tx.date)}</p>
                        </div>
                      </div>
                      <AmountDisplay 
                        amount={tx.type === "credit" ? tx.amount : -tx.amount} 
                        size="sm"
                        showSign
                      />
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </>
      )}

      {/* Add Transaction Modal */}
      {showAddModal && (
        <div className="modal-overlay" onClick={() => setShowAddModal(false)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2 className="heading-2">Add Transaction</h2>
              <button onClick={() => setShowAddModal(false)} className="p-2 rounded-lg hover:bg-[var(--bg-accent-subtle)]">
                <X className="h-5 w-5" />
              </button>
            </div>
            <form onSubmit={handleAddTransaction}>
              <div className="modal-body space-y-4">
                <div>
                  <label className="label-text block mb-2">Type</label>
                  <div className="grid grid-cols-2 gap-3">
                    <button
                      type="button"
                      onClick={() => setNewTx({ ...newTx, type: "credit" })}
                      className={`p-4 rounded-[var(--radius-lg)] border-2 flex flex-col items-center gap-2 transition-all ${
                        newTx.type === "credit" 
                          ? "border-[var(--profit-green)] bg-[var(--profit-light)]" 
                          : "border-[var(--border-default)] hover:border-[var(--border-strong)]"
                      }`}
                    >
                      <TrendingUp className="w-6 h-6" style={{ color: 'var(--profit-green)' }} />
                      <span className="font-medium">Income</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => setNewTx({ ...newTx, type: "debit" })}
                      className={`p-4 rounded-[var(--radius-lg)] border-2 flex flex-col items-center gap-2 transition-all ${
                        newTx.type === "debit" 
                          ? "border-[var(--loss-red)] bg-[var(--loss-light)]" 
                          : "border-[var(--border-default)] hover:border-[var(--border-strong)]"
                      }`}
                    >
                      <TrendingDown className="w-6 h-6" style={{ color: 'var(--loss-red)' }} />
                      <span className="font-medium">Expense</span>
                    </button>
                  </div>
                </div>
                <div>
                  <label className="label-text block mb-1">Amount (₹)</label>
                  <input
                    type="number"
                    required
                    min="1"
                    value={newTx.amount}
                    onChange={(e) => setNewTx({ ...newTx, amount: Number(e.target.value) })}
                    className="input"
                    placeholder="Enter amount"
                  />
                </div>
                <div>
                  <label className="label-text block mb-1">Category</label>
                  <input
                    type="text"
                    required
                    value={newTx.category}
                    onChange={(e) => setNewTx({ ...newTx, category: e.target.value })}
                    className="input"
                    placeholder={newTx.type === "credit" ? "e.g., Product Sales" : "e.g., Raw Materials"}
                  />
                </div>
                <div>
                  <label className="label-text block mb-1">Date</label>
                  <input
                    type="date"
                    required
                    value={newTx.date}
                    onChange={(e) => setNewTx({ ...newTx, date: e.target.value })}
                    className="input"
                  />
                </div>
                <div>
                  <label className="label-text block mb-1">Description (Optional)</label>
                  <input
                    type="text"
                    value={newTx.description}
                    onChange={(e) => setNewTx({ ...newTx, description: e.target.value })}
                    className="input"
                    placeholder="e.g., Invoice #4521"
                  />
                </div>
              </div>
              <div className="modal-footer">
                <Button type="button" variant="secondary" onClick={() => setShowAddModal(false)}>
                  Cancel
                </Button>
                <Button type="submit" loading={saving}>
                  Add Transaction
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
