"use client";

import { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Package, AlertTriangle, Plus, Search, Loader2, X } from "lucide-react";
import { getInventory, createInventoryItem } from "@/lib/data";
import { supabase } from "@/lib/supabase";

interface InventoryItem {
  id: number;
  sku: string;
  name: string;
  qty: number;
  unit: string;
  reorder_level: number;
  unit_cost: number;
}

export default function InventoryPage() {
  const [inventory, setInventory] = useState<InventoryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState<"all" | "critical" | "warning">("all");
  const [showAddModal, setShowAddModal] = useState(false);
  const [saving, setSaving] = useState(false);
  
  // Form state
  const [newItem, setNewItem] = useState({
    sku: "",
    name: "",
    qty: 0,
    unit: "units",
    reorder_level: 0,
    unit_cost: 0,
  });

  useEffect(() => {
    fetchInventory();
  }, []);

  const fetchInventory = async () => {
    try {
      const data = await getInventory();
      setInventory(data as InventoryItem[]);
    } catch (error) {
      console.error("Error fetching inventory:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleAddItem = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      await createInventoryItem(newItem);
      setShowAddModal(false);
      setNewItem({ sku: "", name: "", qty: 0, unit: "units", reorder_level: 0, unit_cost: 0 });
      fetchInventory();
    } catch (error) {
      console.error("Error adding item:", error);
      alert("Failed to add item. Please try again.");
    } finally {
      setSaving(false);
    }
  };

  const getStatus = (item: InventoryItem) => {
    if (item.qty <= item.reorder_level * 0.5) return "critical";
    if (item.qty <= item.reorder_level) return "warning";
    return "ok";
  };

  const filteredItems = inventory.filter((item) => {
    const matchesSearch = item.name.toLowerCase().includes(search.toLowerCase()) ||
      item.sku.toLowerCase().includes(search.toLowerCase());
    const status = getStatus(item);
    const matchesFilter = filter === "all" || status === filter;
    return matchesSearch && matchesFilter;
  });

  const criticalCount = inventory.filter(i => getStatus(i) === "critical").length;
  const warningCount = inventory.filter(i => getStatus(i) === "warning").length;

  const statusColors = {
    critical: "bg-red-100 text-red-700 border-red-200",
    warning: "bg-amber-100 text-amber-700 border-amber-200",
    ok: "bg-emerald-100 text-emerald-700 border-emerald-200",
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
          <h1 className="text-3xl font-bold text-gray-900">Inventory</h1>
          <p className="text-gray-500 mt-1">Managed by Quartermaster Agent</p>
        </div>
        <Button onClick={() => setShowAddModal(true)} className="flex items-center gap-2">
          <Plus className="h-4 w-4" />
          Add Item
        </Button>
      </div>

      {/* Empty State */}
      {inventory.length === 0 ? (
        <Card>
          <CardContent className="p-12 text-center">
            <Package className="h-16 w-16 mx-auto text-gray-300 mb-4" />
            <h2 className="text-xl font-semibold text-gray-900 mb-2">No inventory items yet</h2>
            <p className="text-gray-500 mb-6">Add your first inventory item to start tracking.</p>
            <Button onClick={() => setShowAddModal(true)}>
              <Plus className="h-4 w-4 mr-2" />
              Add First Item
            </Button>
          </CardContent>
        </Card>
      ) : (
        <>
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
                  <p className="text-2xl font-bold text-gray-900">{inventory.length}</p>
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
                className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div className="flex gap-2">
              {(["all", "critical", "warning"] as const).map((f) => (
                <button
                  key={f}
                  onClick={() => setFilter(f)}
                  className={`px-4 py-2 rounded-xl text-sm font-medium transition-all ${
                    filter === f
                      ? "bg-gray-900 text-white"
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
                        <td className="p-4 text-right">{item.qty} {item.unit}</td>
                        <td className="p-4 text-right text-gray-500">{item.reorder_level} {item.unit}</td>
                        <td className="p-4 text-right">₹{item.unit_cost}</td>
                        <td className="p-4 text-center">
                          <span className={`px-3 py-1 rounded-full text-xs font-medium border ${statusColors[getStatus(item)]}`}>
                            {getStatus(item)}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </>
      )}

      {/* Add Item Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl p-6 w-full max-w-md">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold">Add Inventory Item</h2>
              <button onClick={() => setShowAddModal(false)} className="p-2 hover:bg-gray-100 rounded-lg">
                <X className="h-5 w-5" />
              </button>
            </div>
            <form onSubmit={handleAddItem} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">SKU</label>
                <input
                  type="text"
                  required
                  value={newItem.sku}
                  onChange={(e) => setNewItem({ ...newItem, sku: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="e.g., STL-001"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Name</label>
                <input
                  type="text"
                  required
                  value={newItem.name}
                  onChange={(e) => setNewItem({ ...newItem, name: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="e.g., Steel Sheets"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Quantity</label>
                  <input
                    type="number"
                    required
                    min="0"
                    value={newItem.qty}
                    onChange={(e) => setNewItem({ ...newItem, qty: Number(e.target.value) })}
                    className="w-full px-4 py-2 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Unit</label>
                  <input
                    type="text"
                    value={newItem.unit}
                    onChange={(e) => setNewItem({ ...newItem, unit: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="kg, pieces, etc."
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Reorder Level</label>
                  <input
                    type="number"
                    min="0"
                    value={newItem.reorder_level}
                    onChange={(e) => setNewItem({ ...newItem, reorder_level: Number(e.target.value) })}
                    className="w-full px-4 py-2 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Unit Cost (₹)</label>
                  <input
                    type="number"
                    min="0"
                    value={newItem.unit_cost}
                    onChange={(e) => setNewItem({ ...newItem, unit_cost: Number(e.target.value) })}
                    className="w-full px-4 py-2 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>
              <div className="flex gap-3 pt-4">
                <Button type="button" variant="outline" onClick={() => setShowAddModal(false)} className="flex-1">
                  Cancel
                </Button>
                <Button type="submit" disabled={saving} className="flex-1">
                  {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : "Add Item"}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
