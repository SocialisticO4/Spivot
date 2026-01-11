"use client";

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface ExpenseChartProps {
  data: Array<{
    category: string;
    amount: number;
  }>;
  title?: string;
}

const COLORS = [
  "#6366f1", // indigo
  "#8b5cf6", // violet
  "#a855f7", // purple
  "#d946ef", // fuchsia
  "#ec4899", // pink
  "#f43f5e", // rose
  "#ef4444", // red
  "#f97316", // orange
  "#eab308", // yellow
  "#22c55e", // green
];

export function ExpenseChart({ data, title = "Monthly Expenses by Category" }: ExpenseChartProps) {
  // Sort by amount descending and take top 8
  const sortedData = [...data]
    .sort((a, b) => b.amount - a.amount)
    .slice(0, 8)
    .map((item) => ({
      ...item,
      // Truncate long category names
      displayName: item.category.length > 12 
        ? item.category.slice(0, 12) + "..." 
        : item.category,
    }));

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">{title}</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="h-[300px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={sortedData}
              layout="vertical"
              margin={{ top: 5, right: 30, left: 60, bottom: 5 }}
            >
              <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" horizontal={false} />
              <XAxis
                type="number"
                stroke="#6b7280"
                fontSize={12}
                tickLine={false}
                tickFormatter={(value) => `₹${(value / 1000).toFixed(0)}k`}
              />
              <YAxis
                type="category"
                dataKey="displayName"
                stroke="#6b7280"
                fontSize={12}
                tickLine={false}
                width={60}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: "white",
                  border: "1px solid #e5e7eb",
                  borderRadius: "8px",
                  boxShadow: "0 4px 6px -1px rgb(0 0 0 / 0.1)",
                }}
                formatter={(value: unknown) => [`₹${Number(value).toLocaleString()}`, "Amount"]}
                labelFormatter={(label: unknown) => sortedData.find(d => d.displayName === label)?.category || String(label)}
              />
              <Bar dataKey="amount" radius={[0, 4, 4, 0]}>
                {sortedData.map((_, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
}
