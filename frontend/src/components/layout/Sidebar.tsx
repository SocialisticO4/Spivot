"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Package,
  Wallet,
  FileText,
  Bot,
  Plus,
  Menu,
  X,
  Settings,
  HelpCircle,
  LogOut
} from "lucide-react";
import { useState } from "react";
import { supabase } from "@/lib/supabase";
import { useRouter } from "next/navigation";

const navItems = [
  { href: "/", icon: LayoutDashboard, label: "Dashboard" },
  { href: "/inventory", icon: Package, label: "Inventory" },
  { href: "/cashflow", icon: Wallet, label: "Cashflow" },
  { href: "/documents", icon: FileText, label: "Documents" },
  { href: "/agents", icon: Bot, label: "Agents" },
];

export function Sidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [showQuickActions, setShowQuickActions] = useState(false);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push("/login");
  };

  const isActive = (href: string) => {
    if (href === "/") return pathname === "/";
    return pathname.startsWith(href);
  };

  return (
    <>
      {/* Desktop Sidebar */}
      <aside className="sidebar hide-mobile">
        {/* Logo */}
        <div className="p-5 border-b border-subtle">
          <Link href="/" className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-accent-primary flex items-center justify-center" style={{ background: 'var(--accent-primary)' }}>
              <span className="text-white font-bold text-xl">S</span>
            </div>
            <div>
              <h1 className="font-semibold text-primary" style={{ color: 'var(--text-primary)' }}>Spivot</h1>
              <p className="text-xs" style={{ color: 'var(--text-tertiary)' }}>Digital Khata</p>
            </div>
          </Link>
        </div>

        {/* Navigation */}
        <nav className="flex-1 py-4">
          {navItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={`sidebar-nav-item ${isActive(item.href) ? "active" : ""}`}
            >
              <item.icon className="w-5 h-5" />
              <span>{item.label}</span>
            </Link>
          ))}
        </nav>

        {/* Bottom Actions */}
        <div className="p-4 border-t" style={{ borderColor: 'var(--border-subtle)' }}>
          <button className="sidebar-nav-item w-full">
            <Settings className="w-5 h-5" />
            <span>Settings</span>
          </button>
          <button className="sidebar-nav-item w-full">
            <HelpCircle className="w-5 h-5" />
            <span>Help</span>
          </button>
          <button onClick={handleLogout} className="sidebar-nav-item w-full text-loss" style={{ color: 'var(--loss-red)' }}>
            <LogOut className="w-5 h-5" />
            <span>Logout</span>
          </button>
        </div>
      </aside>

      {/* Mobile Header */}
      <header className="hide-desktop fixed top-0 left-0 right-0 h-14 flex items-center justify-between px-4 z-50" style={{ background: 'var(--bg-card)', borderBottom: '1px solid var(--border-subtle)' }}>
        <Link href="/" className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ background: 'var(--accent-primary)' }}>
            <span className="text-white font-bold">S</span>
          </div>
          <span className="font-semibold" style={{ color: 'var(--text-primary)' }}>Spivot</span>
        </Link>
        <button
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          className="p-2 rounded-lg"
          style={{ background: 'var(--bg-accent-subtle)' }}
        >
          {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
        </button>
      </header>

      {/* Mobile Slide Menu */}
      {mobileMenuOpen && (
        <div className="hide-desktop fixed inset-0 z-40" onClick={() => setMobileMenuOpen(false)}>
          <div className="absolute inset-0 bg-black/50" />
          <div 
            className="absolute top-14 right-0 w-64 h-full p-4"
            style={{ background: 'var(--bg-card)' }}
            onClick={(e) => e.stopPropagation()}
          >
            {navItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setMobileMenuOpen(false)}
                className={`flex items-center gap-3 p-3 rounded-lg mb-1 ${
                  isActive(item.href) ? "bg-accent-light text-accent" : ""
                }`}
                style={isActive(item.href) ? { background: 'var(--accent-light)', color: 'var(--accent-primary)' } : { color: 'var(--text-secondary)' }}
              >
                <item.icon className="w-5 h-5" />
                <span>{item.label}</span>
              </Link>
            ))}
            <hr className="my-4" style={{ borderColor: 'var(--border-subtle)' }} />
            <button onClick={handleLogout} className="flex items-center gap-3 p-3 w-full" style={{ color: 'var(--loss-red)' }}>
              <LogOut className="w-5 h-5" />
              <span>Logout</span>
            </button>
          </div>
        </div>
      )}

      {/* Mobile Bottom Tab Bar */}
      <nav className="bottom-nav hide-desktop">
        {navItems.slice(0, 2).map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className={`bottom-nav-item ${isActive(item.href) ? "active" : ""}`}
          >
            <item.icon />
            <span>{item.label}</span>
          </Link>
        ))}
        
        {/* Center FAB */}
        <button 
          onClick={() => setShowQuickActions(!showQuickActions)}
          className="fab-center"
        >
          <Plus className="w-6 h-6" />
        </button>

        {navItems.slice(2, 4).map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className={`bottom-nav-item ${isActive(item.href) ? "active" : ""}`}
          >
            <item.icon />
            <span>{item.label}</span>
          </Link>
        ))}
      </nav>

      {/* Quick Actions Modal */}
      {showQuickActions && (
        <div className="hide-desktop fixed inset-0 z-50 flex items-end" onClick={() => setShowQuickActions(false)}>
          <div className="absolute inset-0 bg-black/50" />
          <div 
            className="relative w-full p-4 rounded-t-2xl"
            style={{ background: 'var(--bg-card)' }}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="w-12 h-1 rounded-full mx-auto mb-4" style={{ background: 'var(--border-default)' }} />
            <h3 className="heading-2 mb-4">Quick Actions</h3>
            <div className="grid grid-cols-2 gap-3 mb-4">
              <Link
                href="/inventory"
                onClick={() => setShowQuickActions(false)}
                className="card flex flex-col items-center justify-center p-4 gap-2"
              >
                <Package className="w-8 h-8" style={{ color: 'var(--accent-primary)' }} />
                <span className="label-text">Add Item</span>
              </Link>
              <Link
                href="/cashflow"
                onClick={() => setShowQuickActions(false)}
                className="card flex flex-col items-center justify-center p-4 gap-2"
              >
                <Wallet className="w-8 h-8" style={{ color: 'var(--profit-green)' }} />
                <span className="label-text">Add Sale</span>
              </Link>
              <Link
                href="/documents"
                onClick={() => setShowQuickActions(false)}
                className="card flex flex-col items-center justify-center p-4 gap-2"
              >
                <FileText className="w-8 h-8" style={{ color: 'var(--info-blue)' }} />
                <span className="label-text">Scan Invoice</span>
              </Link>
              <Link
                href="/cashflow"
                onClick={() => setShowQuickActions(false)}
                className="card flex flex-col items-center justify-center p-4 gap-2"
              >
                <Wallet className="w-8 h-8" style={{ color: 'var(--loss-red)' }} />
                <span className="label-text">Add Expense</span>
              </Link>
            </div>
            <button
              onClick={() => setShowQuickActions(false)}
              className="btn btn-secondary w-full"
            >
              Cancel
            </button>
          </div>
        </div>
      )}
    </>
  );
}
