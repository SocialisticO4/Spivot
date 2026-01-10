"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Package,
  AlertTriangle,
  TrendingUp,
  Search,
  Filter,
} from "lucide-react";

// Mock inventory data
const mockInventory = [
  { id: 1, sku: "STL-001", name: "Steel Sheets (1mm)", qty: 25, unit: "kg", reorder_level: 100, unit_cost: 85, status: "critical" },
  { id: 2, sku: "STL-002", name: "Steel Rods (10mm)", qty: 45, unit: "kg", reorder_level: 80, unit_cost: 92, status: "critical" },
  { id: 3, sku: "ALU-001", name: "Aluminum Plates", qty: 180, unit: "kg", reorder_level: 120, unit_cost: 210, status: "warning" },
  { id: 4, sku: "RUB-001", name: "Rubber Gaskets", qty: 450, unit: "pieces", reorder_level: 200, unit_cost: 12, status: "ok" },
  { id: 5, sku: "BRK-001", name: "Brake Pads (Set)", qty: 32, unit: "sets", reorder_level: 50, unit_cost: 450, status: "warning" },
  { id: 6, sku: "OIL-001", name: "Hydraulic Oil", qty: 120, unit: "liters", reorder_level: 80, unit_cost: 180, status: "ok" },
  { id: 7, sku: "BRG-001", name: "Ball Bearings (50mm)", qty: 85, unit: "pieces", reorder_level: 100, unit_cost: 320, status: "warning" },
  { id: 8, sku: "SPR-001", name: "Suspension Springs", qty: 220, unit: "pieces", reorder_level: 100, unit_cost: 780, status: "ok" },
];

const statusColors = {
  critical: "bg-red-100 text-red-700 border-red-200",
  warning: "bg-amber-100 text-amber-700 border-amber-200",
  ok: "bg-emerald-100 text-emerald-700 border-emerald-200",
};

export default function InventoryPage() {
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState<"all" | "critical" | "warning">("all");

  const filteredItems = mockInventory.filter((item) => {
    const matchesSearch = item.name.toLowerCase().includes(search.toLowerCase()) ||
      item.sku.toLowerCase().includes(search.toLowerCase());
    const matchesFilter = filter === "all" || item.status === filter;
    return matchesSearch && matchesFilter;
  });

  const criticalCount = mockInventory.filter(i => i.status === "critical").length;
  const warningCount = mockInventory.filter(i => i.status === "warning").length;

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Inventory</h1>
          <p className="text-gray-500 mt-1">Managed by Quartermaster Agent</p>
        </div>
        <Button className="flex items-center gap-2">
          <TrendingUp className="h-4 w-4" />
          Optimize Inventory
        </Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card>
          <CardContent className="p-4 flex items-center gap-4">
            <div className="p-3 bg-red-100 rounded-xl">
              <AlertTriangle className="h-6 w-6 text-red-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900">{criticalCount}</p>
              <p className="text-sm text-gray-500">Critical Items</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 flex items-center gap-4">
            <div className="p-3 bg-amber-100 rounded-xl">
              <Package className="h-6 w-6 text-amber-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900">{warningCount}</p>
              <p className="text-sm text-gray-500">Low Stock</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 flex items-center gap-4">
            <div className="p-3 bg-emerald-100 rounded-xl">
              <Package className="h-6 w-6 text-emerald-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900">{mockInventory.length}</p>
              <p className="text-sm text-gray-500">Total SKUs</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
          <input
            type="text"
            placeholder="Search by name or SKU..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
        </div>
        <div className="flex gap-2">
          {(["all", "critical", "warning"] as const).map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`px-4 py-2 rounded-xl text-sm font-medium transition-all ${
                filter === f
                  ? "bg-indigo-600 text-white"
                  : "bg-gray-100 text-gray-700 hover:bg-gray-200"
              }`}
            >
              {f.charAt(0).toUpperCase() + f.slice(1)}
            </button>
          ))}
        </div>
      </div>

      {/* Inventory Table */}
      <Card>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="text-left p-4 font-medium text-gray-600">SKU</th>
                  <th className="text-left p-4 font-medium text-gray-600">Item</th>
                  <th className="text-right p-4 font-medium text-gray-600">Qty</th>
                  <th className="text-right p-4 font-medium text-gray-600">Reorder Level</th>
                  <th className="text-right p-4 font-medium text-gray-600">Unit Cost</th>
                  <th className="text-center p-4 font-medium text-gray-600">Status</th>
                </tr>
              </thead>
              <tbody>
                {filteredItems.map((item) => (
                  <tr key={item.id} className="border-b border-gray-100 hover:bg-gray-50">
                    <td className="p-4 font-mono text-sm text-gray-600">{item.sku}</td>
                    <td className="p-4 font-medium text-gray-900">{item.name}</td>
                    <td className="p-4 text-right">
                      {item.qty} {item.unit}
                    </td>
                    <td className="p-4 text-right text-gray-500">
                      {item.reorder_level} {item.unit}
                    </td>
                    <td className="p-4 text-right">₹{item.unit_cost}</td>
                    <td className="p-4 text-center">
                      <span className={`px-3 py-1 rounded-full text-xs font-medium border ${statusColors[item.status as keyof typeof statusColors]}`}>
                        {item.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
