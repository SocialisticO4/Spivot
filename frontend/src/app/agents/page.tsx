"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Eye,
  TrendingUp,
  Package,
  Wallet,
  ShieldCheck,
  CheckCircle,
} from "lucide-react";

const agents = [
  {
    name: "Visual Eye",
    icon: Eye,
    color: "bg-blue-100 text-blue-600",
    status: "active",
    description: "OCR & Document Ingestion",
    details: "Processes invoices, POs, and bank statements using Google Gemini 2.0 Flash.",
    stats: { processed: 47, accuracy: "98%" },
  },
  {
    name: "Prophet",
    icon: TrendingUp,
    color: "bg-purple-100 text-purple-600",
    status: "active",
    description: "Demand Intelligence & Forecasting",
    details: "Predicts demand based on business type with market sentiment simulation.",
    stats: { forecasts: 30, accuracy: "87%" },
  },
  {
    name: "Quartermaster",
    icon: Package,
    color: "bg-amber-100 text-amber-600",
    status: "active",
    description: "Supply Chain & Inventory Optimization",
    details: "Calculates reorder points and generates draft purchase orders.",
    stats: { alerts: 5, orders: 3 },
  },
  {
    name: "Treasurer",
    icon: Wallet,
    color: "bg-emerald-100 text-emerald-600",
    status: "active",
    description: "Liquidity Guardian & Cashflow Analysis",
    details: "Monitors burn rate, runway, and flags critical cash situations.",
    stats: { runway: "15 days", alert: "CRITICAL" },
  },
  {
    name: "Underwriter",
    icon: ShieldCheck,
    color: "bg-indigo-100 text-indigo-600",
    status: "active",
    description: "Credit Scoring & Risk Assessment",
    details: "Generates Spivot Score (300-900) based on financial health metrics.",
    stats: { score: 580, risk: "Medium" },
  },
];

export default function AgentsPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">AI Agents</h1>
        <p className="text-gray-500 mt-1">5 Digital Employees managing your business</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {agents.map((agent) => (
          <Card key={agent.name} className="hover:shadow-lg transition-shadow">
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className={`p-3 rounded-xl ${agent.color}`}>
                    <agent.icon className="h-6 w-6" />
                  </div>
                  <div>
                    <CardTitle className="text-lg">{agent.name}</CardTitle>
                    <p className="text-sm text-gray-500">{agent.description}</p>
                  </div>
                </div>
                <div className="flex items-center gap-1 text-emerald-600">
                  <CheckCircle className="h-4 w-4" />
                  <span className="text-xs font-medium">Active</span>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-gray-600 mb-4">{agent.details}</p>
              <div className="flex gap-4 text-sm">
                {Object.entries(agent.stats).map(([key, value]) => (
                  <div key={key} className="bg-gray-50 px-3 py-2 rounded-lg">
                    <span className="text-gray-500 capitalize">{key}: </span>
                    <span className="font-medium text-gray-900">{value}</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
