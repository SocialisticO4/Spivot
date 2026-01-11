"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle, MetricCard } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { AmountDisplay } from "@/components/ui/AmountDisplay";
import { Package, AlertTriangle, Plus, Search, Loader2, X, TrendingUp } from "lucide-react";
import { getInventory, createInventoryItem } from "@/lib/data";

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
  const totalValue = inventory.reduce((sum, i) => sum + (i.qty * i.unit_cost), 0);

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
          <h1 className="heading-1">Inventory</h1>
          <p className="small-text" style={{ color: 'var(--text-tertiary)' }}>Managed by Quartermaster Agent</p>
        </div>
        <Button onClick={() => setShowAddModal(true)}>
          <Plus className="h-5 w-5" />
          Add Item
        </Button>
      </div>

      {/* Empty State */}
      {inventory.length === 0 ? (
        <Card>
          <CardContent className="empty-state">
            <Package className="empty-state-icon" />
            <h2 className="empty-state-title">No inventory items yet</h2>
            <p className="empty-state-description">Add your first inventory item to start tracking stock levels.</p>
            <Button onClick={() => setShowAddModal(true)}>
              <Plus className="h-5 w-5" />
              Add First Item
            </Button>
          </CardContent>
        </Card>
      ) : (
        <>
          {/* Stats */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6">
            <MetricCard variant={criticalCount > 0 ? "danger" : "default"}>
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg" style={{ background: 'var(--loss-light)' }}>
                  <AlertTriangle className="h-5 w-5" style={{ color: 'var(--loss-red)' }} />
                </div>
                <div>
                  <p className="text-2xl font-bold">{criticalCount}</p>
                  <p className="small-text">Critical</p>
                </div>
              </div>
            </MetricCard>
            
            <MetricCard variant={warningCount > 0 ? "warning" : "default"}>
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg" style={{ background: 'var(--pending-light)' }}>
                  <Package className="h-5 w-5" style={{ color: 'var(--pending-amber)' }} />
                </div>
                <div>
                  <p className="text-2xl font-bold">{warningCount}</p>
                  <p className="small-text">Low Stock</p>
                </div>
              </div>
            </MetricCard>

            <MetricCard>
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg" style={{ background: 'var(--profit-light)' }}>
                  <Package className="h-5 w-5" style={{ color: 'var(--profit-green)' }} />
                </div>
                <div>
                  <p className="text-2xl font-bold">{inventory.length}</p>
                  <p className="small-text">Total SKUs</p>
                </div>
              </div>
            </MetricCard>

            <MetricCard>
              <div>
                <p className="small-text mb-1">Total Value</p>
                <AmountDisplay amount={totalValue} size="sm" />
              </div>
            </MetricCard>
          </div>

          {/* Filters */}
          <div className="flex flex-col sm:flex-row gap-4 mb-6">
            <div className="relative flex-1">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5" style={{ color: 'var(--text-tertiary)' }} />
              <input
                type="text"
                placeholder="Search by name or SKU..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="input pl-12"
              />
            </div>
            <div className="flex gap-2">
              {(["all", "critical", "warning"] as const).map((f) => (
                <button
                  key={f}
                  onClick={() => setFilter(f)}
                  className={`px-4 py-2 rounded-[var(--radius-md)] text-sm font-medium transition-all ${
                    filter === f
                      ? "bg-[var(--text-primary)] text-[var(--bg-page)]"
                      : "bg-[var(--bg-card)] border border-[var(--border-default)] text-[var(--text-secondary)] hover:bg-[var(--bg-accent-subtle)]"
                  }`}
                >
                  {f.charAt(0).toUpperCase() + f.slice(1)}
                </button>
              ))}
            </div>
          </div>

          {/* Inventory Table (Desktop) / Cards (Mobile) */}
          <Card className="hide-mobile">
            <CardContent className="p-0">
              <table className="ledger-table">
                <thead>
                  <tr>
                    <th>SKU</th>
                    <th>Item</th>
                    <th className="text-right">Qty</th>
                    <th className="text-right">Reorder</th>
                    <th className="text-right">Unit Cost</th>
                    <th className="text-center">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredItems.map((item) => {
                    const status = getStatus(item);
                    return (
                      <tr key={item.id}>
                        <td className="font-mono text-sm" style={{ color: 'var(--text-secondary)' }}>{item.sku}</td>
                        <td className="font-medium">{item.name}</td>
                        <td className="amount-cell">{item.qty} {item.unit}</td>
                        <td className="amount-cell" style={{ color: 'var(--text-tertiary)' }}>{item.reorder_level}</td>
                        <td className="amount-cell">₹{item.unit_cost}</td>
                        <td className="text-center">
                          <span className={`badge ${
                            status === "critical" ? "badge-danger" : 
                            status === "warning" ? "badge-warning" : 
                            "badge-success"
                          }`}>
                            {status}
                          </span>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </CardContent>
          </Card>

          {/* Mobile Cards */}
          <div className="hide-desktop space-y-3">
            {filteredItems.map((item) => {
              const status = getStatus(item);
              return (
                <Card key={item.id}>
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between mb-2">
                      <div>
                        <p className="font-medium" style={{ color: 'var(--text-primary)' }}>{item.name}</p>
                        <p className="small-text">{item.sku}</p>
                      </div>
                      <span className={`badge ${
                        status === "critical" ? "badge-danger" : 
                        status === "warning" ? "badge-warning" : 
                        "badge-success"
                      }`}>
                        {status}
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <p className="label-text">
                        {item.qty} {item.unit} • Reorder at {item.reorder_level}
                      </p>
                      <p className="font-medium">₹{item.unit_cost}</p>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </>
      )}

      {/* Add Item Modal */}
      {showAddModal && (
        <div className="modal-overlay" onClick={() => setShowAddModal(false)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2 className="heading-2">Add Inventory Item</h2>
              <button onClick={() => setShowAddModal(false)} className="p-2 rounded-lg hover:bg-[var(--bg-accent-subtle)]">
                <X className="h-5 w-5" />
              </button>
            </div>
            <form onSubmit={handleAddItem}>
              <div className="modal-body space-y-4">
                <div>
                  <label className="label-text block mb-1">SKU</label>
                  <input
                    type="text"
                    required
                    value={newItem.sku}
                    onChange={(e) => setNewItem({ ...newItem, sku: e.target.value })}
                    className="input"
                    placeholder="e.g., STL-001"
                  />
                </div>
                <div>
                  <label className="label-text block mb-1">Name</label>
                  <input
                    type="text"
                    required
                    value={newItem.name}
                    onChange={(e) => setNewItem({ ...newItem, name: e.target.value })}
                    className="input"
                    placeholder="e.g., Steel Sheets"
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="label-text block mb-1">Quantity</label>
                    <input
                      type="number"
                      required
                      min="0"
                      value={newItem.qty}
                      onChange={(e) => setNewItem({ ...newItem, qty: Number(e.target.value) })}
                      className="input"
                    />
                  </div>
                  <div>
                    <label className="label-text block mb-1">Unit</label>
                    <input
                      type="text"
                      value={newItem.unit}
                      onChange={(e) => setNewItem({ ...newItem, unit: e.target.value })}
                      className="input"
                      placeholder="kg, pieces"
                    />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="label-text block mb-1">Reorder Level</label>
                    <input
                      type="number"
                      min="0"
                      value={newItem.reorder_level}
                      onChange={(e) => setNewItem({ ...newItem, reorder_level: Number(e.target.value) })}
                      className="input"
                    />
                  </div>
                  <div>
                    <label className="label-text block mb-1">Unit Cost (₹)</label>
                    <input
                      type="number"
                      min="0"
                      value={newItem.unit_cost}
                      onChange={(e) => setNewItem({ ...newItem, unit_cost: Number(e.target.value) })}
                      className="input"
                    />
                  </div>
                </div>
              </div>
              <div className="modal-footer">
                <Button type="button" variant="secondary" onClick={() => setShowAddModal(false)}>
                  Cancel
                </Button>
                <Button type="submit" loading={saving}>
                  Add Item
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
