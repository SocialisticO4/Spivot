"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { 
  TrendingUp, 
  TrendingDown, 
  DollarSign,
  ArrowUpRight,
  ArrowDownRight,
} from "lucide-react";

// Mock data
const cashflowData = {
  current_balance: 485000,
  runway_days: 15,
  burn_rate: 45000,
  monthly_inflow: 1250000,
  monthly_outflow: 1380000,
  spivot_score: 580,
};

const recentTransactions = [
  { id: 1, date: "2026-01-08", description: "Invoice #4521 - ABC Auto", amount: 85000, type: "credit" },
  { id: 2, date: "2026-01-07", description: "Steel Suppliers Inc.", amount: -125000, type: "debit" },
  { id: 3, date: "2026-01-07", description: "Salary Disbursement", amount: -280000, type: "debit" },
  { id: 4, date: "2026-01-06", description: "Invoice #4520 - XYZ Motors", amount: 62000, type: "credit" },
  { id: 5, date: "2026-01-05", description: "Utility Bills", amount: -35000, type: "debit" },
  { id: 6, date: "2026-01-05", description: "Invoice #4519 - Quick Parts", amount: 48000, type: "credit" },
];

export default function CashflowPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Cashflow</h1>
        <p className="text-gray-500 mt-1">Managed by Treasurer Agent</p>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="bg-gradient-to-br from-indigo-500 to-purple-600 text-white">
          <CardContent className="p-6">
            <p className="text-indigo-100 text-sm font-medium">Current Balance</p>
            <p className="text-3xl font-bold mt-2">
              ₹{cashflowData.current_balance.toLocaleString()}
            </p>
          </CardContent>
        </Card>

        <Card className={`${cashflowData.runway_days < 20 ? "bg-red-50 border-red-200" : ""}`}>
          <CardContent className="p-6">
            <p className="text-gray-500 text-sm font-medium">Cash Runway</p>
            <p className={`text-3xl font-bold mt-2 ${cashflowData.runway_days < 20 ? "text-red-600" : "text-gray-900"}`}>
              {cashflowData.runway_days} days
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <p className="text-gray-500 text-sm font-medium">Monthly Inflow</p>
            <p className="text-3xl font-bold mt-2 text-emerald-600">
              ₹{(cashflowData.monthly_inflow / 100000).toFixed(1)}L
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <p className="text-gray-500 text-sm font-medium">Monthly Outflow</p>
            <p className="text-3xl font-bold mt-2 text-red-600">
              ₹{(cashflowData.monthly_outflow / 100000).toFixed(1)}L
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
            {recentTransactions.map((tx) => (
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
                    <p className="font-medium text-gray-900">{tx.description}</p>
                    <p className="text-sm text-gray-500">{tx.date}</p>
                  </div>
                </div>
                <span className={`font-semibold ${tx.type === "credit" ? "text-emerald-600" : "text-red-600"}`}>
                  {tx.type === "credit" ? "+" : ""}₹{Math.abs(tx.amount).toLocaleString()}
                </span>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
