"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  LayoutDashboard,
  Package,
  Receipt,
  FileText,
  Bot,
  Settings,
  Menu,
  X,
  ChevronRight,
  Sparkles,
} from "lucide-react";

const navItems = [
  { name: "Dashboard", href: "/", icon: LayoutDashboard },
  { name: "Inventory", href: "/inventory", icon: Package },
  { name: "Cashflow", href: "/cashflow", icon: Receipt },
  { name: "Documents", href: "/documents", icon: FileText },
  { name: "Agents", href: "/agents", icon: Bot },
];

export function Sidebar() {
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const pathname = usePathname();

  return (
    <>
      {/* Mobile Menu Button */}
      <button
        onClick={() => setMobileOpen(true)}
        className="fixed top-4 left-4 z-50 lg:hidden p-2 rounded-lg bg-white shadow-md"
      >
        <Menu className="h-6 w-6 text-gray-700" />
      </button>

      {/* Mobile Overlay */}
      {mobileOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={() => setMobileOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={cn(
          "fixed top-0 left-0 z-50 h-screen bg-white border-r border-gray-200 transition-all duration-300 flex flex-col",
          collapsed ? "w-20" : "w-64",
          mobileOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
        )}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-100">
          {!collapsed && (
            <div className="flex items-center gap-2">
              <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center">
                <Sparkles className="h-6 w-6 text-white" />
              </div>
              <div>
                <h1 className="font-bold text-gray-900 text-lg">Spivot</h1>
                <p className="text-xs text-gray-500">Agentic OS</p>
              </div>
            </div>
          )}
          
          {collapsed && (
            <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center mx-auto">
              <Sparkles className="h-6 w-6 text-white" />
            </div>
          )}

          {/* Mobile Close */}
          <button
            onClick={() => setMobileOpen(false)}
            className="lg:hidden p-1 rounded-lg hover:bg-gray-100"
          >
            <X className="h-5 w-5 text-gray-500" />
          </button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 p-4 space-y-2">
          {navItems.map((item) => {
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.name}
                href={item.href}
                onClick={() => setMobileOpen(false)}
                className={cn(
                  "flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200",
                  isActive
                    ? "bg-gradient-to-r from-indigo-500 to-purple-600 text-white shadow-lg shadow-indigo-200"
                    : "text-gray-600 hover:bg-gray-100"
                )}
              >
                <item.icon className={cn("h-5 w-5 flex-shrink-0")} />
                {!collapsed && <span className="font-medium">{item.name}</span>}
              </Link>
            );
          })}
        </nav>

        {/* Collapse Toggle (Desktop only) */}
        <div className="hidden lg:block p-4 border-t border-gray-100">
          <button
            onClick={() => setCollapsed(!collapsed)}
            className="flex items-center justify-center w-full p-2 rounded-lg hover:bg-gray-100 text-gray-500"
          >
            <ChevronRight
              className={cn(
                "h-5 w-5 transition-transform",
                collapsed ? "" : "rotate-180"
              )}
            />
          </button>
        </div>

        {/* Settings Link */}
        <div className="p-4 border-t border-gray-100">
          <Link
            href="/settings"
            className={cn(
              "flex items-center gap-3 px-4 py-3 rounded-xl text-gray-600 hover:bg-gray-100 transition-all"
            )}
          >
            <Settings className="h-5 w-5" />
            {!collapsed && <span className="font-medium">Settings</span>}
          </Link>
        </div>
      </aside>
    </>
  );
}
