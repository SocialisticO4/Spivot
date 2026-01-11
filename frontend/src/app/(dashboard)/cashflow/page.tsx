"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowUpRight, ArrowDownRight, Plus, Loader2, X, Wallet } from "lucide-react";
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

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <Loader2 className="h-8 w-8 animate-spin text-gray-400" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Cashflow</h1>
          <p className="text-gray-500 mt-1">Managed by Treasurer Agent</p>
        </div>
        <Button onClick={() => setShowAddModal(true)} className="flex items-center gap-2">
          <Plus className="h-4 w-4" />
          Add Transaction
        </Button>
      </div>

      {/* Empty State */}
      {transactions.length === 0 ? (
        <Card>
          <CardContent className="p-12 text-center">
            <Wallet className="h-16 w-16 mx-auto text-gray-300 mb-4" />
            <h2 className="text-xl font-semibold text-gray-900 mb-2">No transactions yet</h2>
            <p className="text-gray-500 mb-6">Add your first transaction to start tracking cashflow.</p>
            <Button onClick={() => setShowAddModal(true)}>
              <Plus className="h-4 w-4 mr-2" />
              Add First Transaction
            </Button>
          </CardContent>
        </Card>
      ) : (
        <>
          {/* Key Metrics */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <Card className="bg-gray-900 text-white">
              <CardContent className="p-6">
                <p className="text-gray-400 text-sm font-medium">Current Balance</p>
                <p className="text-3xl font-bold mt-2">
                  ₹{(cashflow?.current_balance || 0).toLocaleString()}
                </p>
              </CardContent>
            </Card>

            <Card className={cashflow && cashflow.cash_runway_days < 20 ? "bg-red-50 border-red-200" : ""}>
              <CardContent className="p-6">
                <p className="text-gray-500 text-sm font-medium">Cash Runway</p>
                <p className={`text-3xl font-bold mt-2 ${cashflow && cashflow.cash_runway_days < 20 ? "text-red-600" : "text-gray-900"}`}>
                  {cashflow?.cash_runway_days || 0} days
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <p className="text-gray-500 text-sm font-medium">Monthly Inflow</p>
                <p className="text-3xl font-bold mt-2 text-emerald-600">
                  ₹{((cashflow?.monthly_inflow || 0) / 100000).toFixed(1)}L
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <p className="text-gray-500 text-sm font-medium">Monthly Outflow</p>
                <p className="text-3xl font-bold mt-2 text-red-600">
                  ₹{((cashflow?.monthly_outflow || 0) / 100000).toFixed(1)}L
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Recent Transactions */}
          <Card>
            <CardHeader>
              <CardTitle>Recent Transactions</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {transactions.slice(0, 10).map((tx) => (
                  <div
                    key={tx.id}
                    className="flex items-center justify-between p-4 rounded-xl bg-gray-50 hover:bg-gray-100 transition-colors"
                  >
                    <div className="flex items-center gap-4">
                      <div className={`p-2 rounded-lg ${tx.type === "credit" ? "bg-emerald-100" : "bg-red-100"}`}>
                        {tx.type === "credit" ? (
                          <ArrowUpRight className="h-5 w-5 text-emerald-600" />
                        ) : (
                          <ArrowDownRight className="h-5 w-5 text-red-600" />
                        )}
                      </div>
                      <div>
                        <p className="font-medium text-gray-900">{tx.description || tx.category}</p>
                        <p className="text-sm text-gray-500">{new Date(tx.date).toLocaleDateString()}</p>
                      </div>
                    </div>
                    <span className={`font-semibold ${tx.type === "credit" ? "text-emerald-600" : "text-red-600"}`}>
                      {tx.type === "credit" ? "+" : "-"}₹{Math.abs(tx.amount).toLocaleString()}
                    </span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </>
      )}

      {/* Add Transaction Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl p-6 w-full max-w-md">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold">Add Transaction</h2>
              <button onClick={() => setShowAddModal(false)} className="p-2 hover:bg-gray-100 rounded-lg">
                <X className="h-5 w-5" />
              </button>
            </div>
            <form onSubmit={handleAddTransaction} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Type</label>
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => setNewTx({ ...newTx, type: "credit" })}
                    className={`flex-1 py-2 rounded-xl font-medium ${
                      newTx.type === "credit" ? "bg-emerald-100 text-emerald-700 border-2 border-emerald-500" : "bg-gray-100 text-gray-700"
                    }`}
                  >
                    Income
                  </button>
                  <button
                    type="button"
                    onClick={() => setNewTx({ ...newTx, type: "debit" })}
                    className={`flex-1 py-2 rounded-xl font-medium ${
                      newTx.type === "debit" ? "bg-red-100 text-red-700 border-2 border-red-500" : "bg-gray-100 text-gray-700"
                    }`}
                  >
                    Expense
                  </button>
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Amount (₹)</label>
                <input
                  type="number"
                  required
                  min="1"
                  value={newTx.amount}
                  onChange={(e) => setNewTx({ ...newTx, amount: Number(e.target.value) })}
                  className="w-full px-4 py-2 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
                <input
                  type="text"
                  required
                  value={newTx.category}
                  onChange={(e) => setNewTx({ ...newTx, category: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder={newTx.type === "credit" ? "e.g., Product Sales" : "e.g., Raw Materials"}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Date</label>
                <input
                  type="date"
                  required
                  value={newTx.date}
                  onChange={(e) => setNewTx({ ...newTx, date: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Description (Optional)</label>
                <input
                  type="text"
                  value={newTx.description}
                  onChange={(e) => setNewTx({ ...newTx, description: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="e.g., Invoice #4521"
                />
              </div>
              <div className="flex gap-3 pt-4">
                <Button type="button" variant="outline" onClick={() => setShowAddModal(false)} className="flex-1">
                  Cancel
                </Button>
                <Button type="submit" disabled={saving} className="flex-1">
                  {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : "Add Transaction"}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
