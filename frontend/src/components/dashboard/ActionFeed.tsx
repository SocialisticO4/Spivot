"use client";

import { cn } from "@/lib/utils";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { 
  Eye, 
  TrendingUp, 
  Package, 
  Wallet, 
  ShieldCheck,
  AlertTriangle,
  AlertCircle,
  Info
} from "lucide-react";
import type { AgentLog } from "@/lib/types";

interface ActionFeedProps {
  logs: AgentLog[];
  className?: string;
}

const agentIcons: Record<string, React.ElementType> = {
  "Visual Eye": Eye,
  "Prophet": TrendingUp,
  "Quartermaster": Package,
  "Treasurer": Wallet,
  "Underwriter": ShieldCheck,
};

const agentColors: Record<string, string> = {
  "Visual Eye": "bg-blue-100 text-blue-600",
  "Prophet": "bg-purple-100 text-purple-600",
  "Quartermaster": "bg-amber-100 text-amber-600",
  "Treasurer": "bg-emerald-100 text-emerald-600",
  "Underwriter": "bg-indigo-100 text-indigo-600",
};

const severityIcons: Record<string, React.ElementType> = {
  info: Info,
  warning: AlertCircle,
  critical: AlertTriangle,
};

const severityColors: Record<string, string> = {
  info: "text-gray-400",
  warning: "text-amber-500",
  critical: "text-red-500",
};

export function ActionFeed({ logs, className }: ActionFeedProps) {
  const formatTime = (timestamp: string) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMins / 60);
    const diffDays = Math.floor(diffHours / 24);

    if (diffMins < 1) return "Just now";
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays < 7) return `${diffDays}d ago`;
    return date.toLocaleDateString("en-IN", { month: "short", day: "numeric" });
  };

  return (
    <Card className={cn("", className)}>
      <CardHeader className="pb-3">
        <CardTitle className="text-lg flex items-center gap-2">
          <span className="relative flex h-3 w-3">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-3 w-3 bg-emerald-500"></span>
          </span>
          Agent Activity
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4 max-h-[400px] overflow-y-auto pr-2 scrollbar-thin scrollbar-thumb-gray-200">
          {logs.length === 0 ? (
            <div className="text-center text-gray-500 py-8">
              <Package className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>No agent activity yet</p>
              <p className="text-sm">Reset demo to generate data</p>
            </div>
          ) : (
            logs.map((log) => {
              const AgentIcon = agentIcons[log.agent_name] || Package;
              const SeverityIcon = severityIcons[log.severity] || Info;

              return (
                <div
                  key={log.id}
                  className={cn(
                    "flex gap-3 p-3 rounded-xl transition-all duration-200 hover:bg-gray-50",
                    log.severity === "critical" && "bg-red-50 hover:bg-red-100"
                  )}
                >
                  {/* Agent Icon */}
                  <div
                    className={cn(
                      "flex-shrink-0 rounded-lg p-2",
                      agentColors[log.agent_name] || "bg-gray-100 text-gray-600"
                    )}
                  >
                    <AgentIcon className="h-5 w-5" />
                  </div>

                  {/* Content */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="font-medium text-gray-900 text-sm">
                        {log.agent_name}
                      </span>
                      <SeverityIcon
                        className={cn("h-4 w-4", severityColors[log.severity])}
                      />
                    </div>
                    <p className="text-sm text-gray-700 mb-1">{log.action}</p>
                    {log.result && (
                      <p className="text-xs text-gray-500">{log.result}</p>
                    )}
                  </div>

                  {/* Time */}
                  <div className="flex-shrink-0 text-xs text-gray-400">
                    {formatTime(log.timestamp)}
                  </div>
                </div>
              );
            })
          )}
        </div>
      </CardContent>
    </Card>
  );
}
