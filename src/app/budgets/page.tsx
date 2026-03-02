"use client";

import { useEffect, useState } from "react";
import { Plus, Pencil, Trash2, PiggyBank, ChevronLeft, ChevronRight } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Progress } from "@/components/ui/progress";
import { BottomNav } from "@/components/bottom-nav";
import { formatCurrency, getMonthName, getCurrentMonth, getCurrentYear } from "@/lib/utils";
import { useToast } from "@/hooks/use-toast";
import { Budget, Category } from "@/types";

export default function BudgetsPage() {
  const [budgets, setBudgets] = useState<Budget[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [month, setMonth] = useState(getCurrentMonth());
  const [year, setYear] = useState(getCurrentYear());
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingBudget, setEditingBudget] = useState<Budget | null>(null);
  const { toast } = useToast();

  const [formData, setFormData] = useState({
    categoryId: "",
    limit: "",
  });

  useEffect(() => {
    fetchData();
  }, [month, year]);

  async function fetchData() {
    try {
      setLoading(true);
      const [budgetsRes, catsRes] = await Promise.all([
        fetch(`/api/budgets?month=${month}&year=${year}`),
        fetch("/api/categories?type=expense"),
      ]);
      const budgetsData = await budgetsRes.json();
      const catsData = await catsRes.json();
      setBudgets(budgetsData.budgets || []);
      setCategories(catsData.categories || []);
    } catch (error) {
      toast({
        title: "เกิดข้อผิดพลาด",
        description: "ไม่สามารถโหลดข้อมูลได้",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  }

  function resetForm() {
    setFormData({
      categoryId: "",
      limit: "",
    });
    setEditingBudget(null);
  }

  function handleEdit(budget: Budget) {
    setEditingBudget(budget);
    setFormData({
      categoryId: budget.categoryId || "",
      limit: budget.limit.toString(),
    });
    setIsDialogOpen(true);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    try {
      const payload = {
        categoryId: formData.categoryId || null,
        month,
        year,
        limit: parseFloat(formData.limit),
      };

      const url = editingBudget ? `/api/budgets/${editingBudget.id}` : "/api/budgets";
      const method = editingBudget ? "PUT" : "POST";

      const response = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (response.ok) {
        toast({
          title: editingBudget ? "แก้ไขสำเร็จ" : "เพิ่มงบประมาณสำเร็จ",
          description: editingBudget
            ? "แก้ไขงบประมาณเรียบร้อยแล้ว"
            : "เพิ่มงบประมาณใหม่เรียบร้อยแล้ว",
        });
        setIsDialogOpen(false);
        resetForm();
        fetchData();
      } else {
        const error = await response.json();
        toast({
          title: "เกิดข้อผิดพลาด",
          description: error.error || "ไม่สามารถบันทึกข้อมูลได้",
          variant: "destructive",
        });
      }
    } catch (error) {
      toast({
        title: "เกิดข้อผิดพลาด",
        description: "ไม่สามารถบันทึกข้อมูลได้",
        variant: "destructive",
      });
    }
  }

  async function handleDelete(id: string) {
    if (!confirm("ต้องการลบงบประมาณนี้?")) return;

    try {
      const response = await fetch(`/api/budgets/${id}`, {
        method: "DELETE",
      });

      if (response.ok) {
        toast({
          title: "ลบสำเร็จ",
          description: "ลบงบประมาณเรียบร้อยแล้ว",
        });
        fetchData();
      } else {
        toast({
          title: "เกิดข้อผิดพลาด",
          description: "ไม่สามารถลบงบประมาณได้",
          variant: "destructive",
        });
      }
    } catch (error) {
      toast({
        title: "เกิดข้อผิดพลาด",
        description: "ไม่สามารถลบงบประมาณได้",
        variant: "destructive",
      });
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

  const usedCategoryIds = budgets.map((b) => b.categoryId);
  const availableCategories = categories.filter((c) => !usedCategoryIds.includes(c.id));

  return (
    <div className="min-h-screen bg-background pb-24">
      <div className="container mx-auto px-4 py-6 max-w-lg md:max-w-2xl lg:max-w-4xl">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-bold">งบประมาณ</h1>
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <Button size="sm" className="rounded-full" onClick={() => setIsDialogOpen(true)}>
              <Plus className="w-4 h-4 mr-1" />
              เพิ่ม
            </Button>
            <DialogContent className="sm:max-w-[425px]">
              <DialogHeader>
                <DialogTitle>
                  {editingBudget ? "แก้ไขงบประมาณ" : "เพิ่มงบประมาณใหม่"}
                </DialogTitle>
              </DialogHeader>
              <form onSubmit={handleSubmit} className="space-y-4 mt-4">
                <div>
                  <label className="text-sm font-medium mb-1 block">หมวดหมู่ (ไม่เลือก = ทั้งหมด)</label>
                  <Select
                    value={formData.categoryId}
                    onValueChange={(value) => setFormData({ ...formData, categoryId: value })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="ทั้งหมด" />
                    </SelectTrigger>
                    <SelectContent>
                      {categories.map((category) => (
                        <SelectItem key={category.id} value={category.id}>
                          <div className="flex items-center gap-2">
                            <div
                              className="w-3 h-3 rounded-full"
                              style={{ backgroundColor: category.color }}
                            />
                            {category.name}
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <label className="text-sm font-medium mb-1 block">วงเงิน</label>
                  <Input
                    type="number"
                    value={formData.limit}
                    onChange={(e) => setFormData({ ...formData, limit: e.target.value })}
                    placeholder="0.00"
                    required
                  />
                </div>

                <div className="flex gap-2 pt-2">
                  <Button
                    type="button"
                    variant="outline"
                    className="flex-1"
                    onClick={() => {
                      setIsDialogOpen(false);
                      resetForm();
                    }}
                  >
                    ยกเลิก
                  </Button>
                  <Button type="submit" className="flex-1">
                    {editingBudget ? "บันทึก" : "เพิ่ม"}
                  </Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>
        </div>

        {/* Month Selector */}
        <div className="flex items-center justify-center gap-2 mb-6">
          <Button variant="ghost" size="icon" onClick={prevMonth}>
            <ChevronLeft className="w-4 h-4" />
          </Button>
          <span className="font-medium min-w-[120px] text-center">
            {getMonthName(month)} {year + 543}
          </span>
          <Button variant="ghost" size="icon" onClick={nextMonth}>
            <ChevronRight className="w-4 h-4" />
          </Button>
        </div>

        {/* Budgets List */}
        <div className="space-y-4">
          {loading ? (
            <div className="space-y-4">
              {[1, 2, 3].map((i) => (
                <Card key={i} className="animate-pulse">
                  <CardContent className="p-6"></CardContent>
                </Card>
              ))}
            </div>
          ) : budgets.length === 0 ? (
            <Card className="border-dashed">
              <CardContent className="p-8 text-center text-muted-foreground">
                <PiggyBank className="w-12 h-12 mx-auto mb-4 opacity-50" />
                <p>ยังไม่มีงบประมาณในเดือนนี้</p>
                <p className="text-sm mt-1">เพิ่มงบประมาณเพื่อติดตามการใช้จ่าย</p>
              </CardContent>
            </Card>
          ) : (
            budgets.map((budget) => {
              // Calculate spent (this would come from API in real implementation)
              const spent = 0; // Placeholder
              const percentage = budget.limit > 0 ? Math.round((spent / Number(budget.limit)) * 100) : 0;
              const isOverBudget = percentage > 100;
              const isWarning = percentage >= 80 && percentage <= 100;

              return (
                <Card key={budget.id} className="group">
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-3">
                        <div
                          className="w-10 h-10 rounded-xl flex items-center justify-center"
                          style={{ backgroundColor: `${budget.category?.color}20` }}
                        >
                          <div
                            className="w-3 h-3 rounded-full"
                            style={{ backgroundColor: budget.category?.color }}
                          />
                        </div>
                        <div>
                          <p className="font-medium">{budget.category?.name || "ทั้งหมด"}</p>
                          <p className="text-sm text-muted-foreground">
                            ใช้ไป {formatCurrency(spent)} / {formatCurrency(Number(budget.limit))}
                          </p>
                        </div>
                      </div>
                      <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8"
                          onClick={() => handleEdit(budget)}
                        >
                          <Pencil className="w-4 h-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 text-destructive"
                          onClick={() => handleDelete(budget.id)}
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                    <div className="relative">
                      <Progress
                        value={Math.min(percentage, 100)}
                        className={`h-2 ${
                          isOverBudget
                            ? "bg-rose-500/20 [&>div]:bg-rose-500"
                            : isWarning
                            ? "bg-amber-500/20 [&>div]:bg-amber-500"
                            : ""
                        }`}
                      />
                      {isOverBudget && (
                        <span className="absolute right-0 -top-5 text-xs text-rose-500 font-medium">
                          เกินงบ!
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-muted-foreground text-right mt-1">
                      {percentage}%
                    </p>
                  </CardContent>
                </Card>
              );
            })
          )}
        </div>
      </div>

      <BottomNav />
    </div>
  );
}
