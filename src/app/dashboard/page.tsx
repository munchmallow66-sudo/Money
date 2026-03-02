"use client";

import { useEffect, useState } from "react";
import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
} from "recharts";
import {
  Wallet,
  TrendingUp,
  TrendingDown,
  PiggyBank,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import { BottomNav } from "@/components/bottom-nav";
import { formatCurrency, getMonthName, getCurrentMonth, getCurrentYear } from "@/lib/utils";
import { DashboardData, BudgetProgress } from "@/types";

export default function DashboardPage() {
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [month, setMonth] = useState(getCurrentMonth());
  const [year, setYear] = useState(getCurrentYear());

  useEffect(() => {
    fetchDashboardData();
  }, [month, year]);

  async function fetchDashboardData() {
    try {
      setLoading(true);
      const response = await fetch(`/api/summary?month=${month}&year=${year}`);
      const result = await response.json();
      if (result.data) {
        setData(result.data);
      }
    } catch (error) {
      console.error("Failed to fetch dashboard data:", error);
    } finally {
      setLoading(false);
    }
  }

  function prevMonth() {
    if (month === 1) {
      setMonth(12);
      setYear(year - 1);
    } else {
      setMonth(month - 1);
    }
  }

  function nextMonth() {
    if (month === 12) {
      setMonth(1);
      setYear(year + 1);
    } else {
      setMonth(month + 1);
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-background pb-24">
        <div className="container mx-auto px-4 py-6">
          <div className="animate-pulse space-y-4">
            <div className="h-8 bg-muted rounded w-48"></div>
            <div className="grid grid-cols-3 gap-4">
              <div className="h-24 bg-muted rounded-2xl"></div>
              <div className="h-24 bg-muted rounded-2xl"></div>
              <div className="h-24 bg-muted rounded-2xl"></div>
            </div>
          </div>
        </div>
        <BottomNav />
      </div>
    );
  }

  const summaryCards = [
    {
      title: "รายรับ",
      amount: data?.summary.income || 0,
      icon: TrendingUp,
      color: "text-emerald-500",
      bgColor: "bg-emerald-500/10",
    },
    {
      title: "รายจ่าย",
      amount: data?.summary.expense || 0,
      icon: TrendingDown,
      color: "text-rose-500",
      bgColor: "bg-rose-500/10",
    },
    {
      title: "คงเหลือ",
      amount: data?.summary.balance || 0,
      icon: Wallet,
      color: data && data.summary.balance >= 0 ? "text-blue-500" : "text-rose-500",
      bgColor: data && data.summary.balance >= 0 ? "bg-blue-500/10" : "bg-rose-500/10",
    },
  ];

  const expenseData = data?.expenseByCategory.map((item) => ({
    name: item.categoryName,
    value: item.amount,
    color: item.categoryColor,
  })) || [];

  return (
    <div className="min-h-screen bg-background pb-24">
      <div className="container mx-auto px-4 py-6 max-w-lg md:max-w-2xl lg:max-w-4xl">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-bold">ภาพรวม</h1>
          <div className="flex items-center gap-2 bg-card rounded-xl p-1">
            <Button variant="ghost" size="icon" onClick={prevMonth} className="h-8 w-8">
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <span className="text-sm font-medium min-w-[100px] text-center">
              {getMonthName(month)} {year + 543}
            </span>
            <Button variant="ghost" size="icon" onClick={nextMonth} className="h-8 w-8">
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-3 gap-3 mb-6">
          {summaryCards.map((card, index) => (
            <Card key={index} className="border-0 shadow-soft">
              <CardContent className="p-4">
                <div className={`w-8 h-8 rounded-lg ${card.bgColor} flex items-center justify-center mb-2`}>
                  <card.icon className={`w-4 h-4 ${card.color}`} />
                </div>
                <p className="text-xs text-muted-foreground">{card.title}</p>
                <p className={`text-sm font-bold truncate ${card.color}`}>
                  {formatCurrency(card.amount)}
                </p>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Charts */}
        <div className="grid gap-4 mb-6">
          {/* Pie Chart - Expense by Category */}
          <Card className="border-0 shadow-soft">
            <CardHeader className="pb-2">
              <CardTitle className="text-base">รายจ่ายตามหมวดหมู่</CardTitle>
            </CardHeader>
            <CardContent>
              {expenseData.length > 0 ? (
                <div className="h-[250px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={expenseData}
                        cx="50%"
                        cy="50%"
                        innerRadius={60}
                        outerRadius={90}
                        paddingAngle={2}
                        dataKey="value"
                      >
                        {expenseData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip
                        formatter={(value: number) => formatCurrency(value)}
                        contentStyle={{
                          backgroundColor: "hsl(var(--card))",
                          border: "1px solid hsl(var(--border))",
                          borderRadius: "12px",
                        }}
                      />
                      <Legend />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              ) : (
                <div className="h-[200px] flex items-center justify-center text-muted-foreground">
                  ไม่มีข้อมูลรายจ่ายในเดือนนี้
                </div>
              )}
            </CardContent>
          </Card>

          {/* Line Chart - Daily Trend */}
          <Card className="border-0 shadow-soft">
            <CardHeader className="pb-2">
              <CardTitle className="text-base">แนวโน้มรายวัน</CardTitle>
            </CardHeader>
            <CardContent>
              {data?.dailyTrend && data.dailyTrend.length > 0 ? (
                <div className="h-[250px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={data.dailyTrend}>
                      <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--muted))" />
                      <XAxis
                        dataKey="date"
                        tickFormatter={(date) => new Date(date).getDate().toString()}
                        stroke="hsl(var(--muted-foreground))"
                      />
                      <YAxis
                        stroke="hsl(var(--muted-foreground))"
                        tickFormatter={(value) => (value / 1000).toFixed(0) + "k"}
                      />
                      <Tooltip
                        formatter={(value: number) => formatCurrency(value)}
                        labelFormatter={(label) => `วันที่ ${new Date(label).getDate()}`}
                        contentStyle={{
                          backgroundColor: "hsl(var(--card))",
                          border: "1px solid hsl(var(--border))",
                          borderRadius: "12px",
                        }}
                      />
                      <Legend />
                      <Line
                        type="monotone"
                        dataKey="income"
                        name="รายรับ"
                        stroke="#10b981"
                        strokeWidth={2}
                        dot={false}
                      />
                      <Line
                        type="monotone"
                        dataKey="expense"
                        name="รายจ่าย"
                        stroke="#f43f5e"
                        strokeWidth={2}
                        dot={false}
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              ) : (
                <div className="h-[200px] flex items-center justify-center text-muted-foreground">
                  ไม่มีข้อมูลในเดือนนี้
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Budget Progress */}
        {data?.budgets && data.budgets.length > 0 && (
          <Card className="border-0 shadow-soft mb-6">
            <CardHeader className="pb-2">
              <CardTitle className="text-base flex items-center gap-2">
                <PiggyBank className="w-4 h-4" />
                งบประมาณ
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {data.budgets.map((budget: BudgetProgress) => (
                <div key={budget.budgetId} className="space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <div className="flex items-center gap-2">
                      <div
                        className="w-3 h-3 rounded-full"
                        style={{ backgroundColor: budget.categoryColor }}
                      />
                      <span>{budget.categoryName}</span>
                    </div>
                    <div className="text-muted-foreground">
                      {formatCurrency(budget.spent)} / {formatCurrency(budget.limit)}
                    </div>
                  </div>
                  <div className="relative">
                    <Progress
                      value={Math.min(budget.percentage, 100)}
                      className={`h-2 ${
                        budget.status === "danger"
                          ? "bg-rose-500/20 [&>div]:bg-rose-500"
                          : budget.status === "warning"
                          ? "bg-amber-500/20 [&>div]:bg-amber-500"
                          : ""
                      }`}
                    />
                    {budget.percentage > 100 && (
                      <span className="absolute right-0 -top-4 text-xs text-rose-500">
                        เกินงบ!
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-muted-foreground text-right">
                    {budget.percentage}%
                  </p>
                </div>
              ))}
            </CardContent>
          </Card>
        )}
      </div>

      <BottomNav />
    </div>
  );
}
