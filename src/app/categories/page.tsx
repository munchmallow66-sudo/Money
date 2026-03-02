"use client";

import { useEffect, useState } from "react";
import { Plus, Pencil, Trash2, Tag } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { BottomNav } from "@/components/bottom-nav";
import { useToast } from "@/hooks/use-toast";
import { Category } from "@/types";
import { TransactionType } from "@prisma/client";

const PRESET_COLORS = [
  "#ef4444", "#f97316", "#f59e0b", "#84cc16", "#22c55e",
  "#10b981", "#14b8a6", "#06b6d4", "#0ea5e9", "#3b82f6",
  "#6366f1", "#8b5cf6", "#a855f7", "#d946ef", "#ec4899",
  "#f43f5e", "#64748b", "#94a3b8",
];

export default function CategoriesPage() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const { toast } = useToast();

  const [formData, setFormData] = useState<{
    name: string;
    type: TransactionType;
    color: string;
  }>({
    name: "",
    type: TransactionType.expense,
    color: PRESET_COLORS[0],
  });

  useEffect(() => {
    fetchCategories();
  }, []);

  async function fetchCategories() {
    try {
      setLoading(true);
      const response = await fetch("/api/categories");
      const data = await response.json();
      setCategories(data.categories || []);
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
      name: "",
      type: TransactionType.expense,
      color: PRESET_COLORS[0],
    });
    setEditingCategory(null);
  }

  function handleEdit(category: Category) {
    setEditingCategory(category);
    setFormData({
      name: category.name,
      type: category.type,
      color: category.color,
    });
    setIsDialogOpen(true);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    try {
      const url = editingCategory
        ? `/api/categories/${editingCategory.id}`
        : "/api/categories";
      const method = editingCategory ? "PUT" : "POST";

      const response = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      if (response.ok) {
        toast({
          title: editingCategory ? "แก้ไขสำเร็จ" : "เพิ่มหมวดหมู่สำเร็จ",
          description: editingCategory
            ? "แก้ไขหมวดหมู่เรียบร้อยแล้ว"
            : "เพิ่มหมวดหมู่ใหม่เรียบร้อยแล้ว",
        });
        setIsDialogOpen(false);
        resetForm();
        fetchCategories();
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
    if (!confirm("ต้องการลบหมวดหมู่นี้? หมวดหมู่ที่มีรายการธุรกรรมจะไม่สามารถลบได้")) return;

    try {
      const response = await fetch(`/api/categories/${id}`, {
        method: "DELETE",
      });

      if (response.ok) {
        toast({
          title: "ลบสำเร็จ",
          description: "ลบหมวดหมู่เรียบร้อยแล้ว",
        });
        fetchCategories();
      } else {
        const error = await response.json();
        toast({
          title: "เกิดข้อผิดพลาด",
          description: error.error || "ไม่สามารถลบหมวดหมู่ได้",
          variant: "destructive",
        });
      }
    } catch (error) {
      toast({
        title: "เกิดข้อผิดพลาด",
        description: "ไม่สามารถลบหมวดหมู่ได้",
        variant: "destructive",
      });
    }
  }

  const incomeCategories = categories.filter((c) => c.type === TransactionType.income);
  const expenseCategories = categories.filter((c) => c.type === TransactionType.expense);

  return (
    <div className="min-h-screen bg-background pb-24">
      <div className="container mx-auto px-4 py-6 max-w-lg md:max-w-2xl lg:max-w-4xl">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-bold">หมวดหมู่</h1>
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <Button size="sm" className="rounded-full" onClick={() => setIsDialogOpen(true)}>
              <Plus className="w-4 h-4 mr-1" />
              เพิ่ม
            </Button>
            <DialogContent className="sm:max-w-[425px]">
              <DialogHeader>
                <DialogTitle>
                  {editingCategory ? "แก้ไขหมวดหมู่" : "เพิ่มหมวดหมู่ใหม่"}
                </DialogTitle>
              </DialogHeader>
              <form onSubmit={handleSubmit} className="space-y-4 mt-4">
                <div>
                  <label className="text-sm font-medium mb-1 block">ชื่อหมวดหมู่</label>
                  <Input
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="เช่น อาหาร, เงินเดือน"
                    required
                  />
                </div>

                <div>
                  <label className="text-sm font-medium mb-1 block">ประเภท</label>
                  <Select
                    value={formData.type}
                    onValueChange={(value) =>
                      setFormData({ ...formData, type: value as TransactionType })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value={TransactionType.income}>รายรับ</SelectItem>
                      <SelectItem value={TransactionType.expense}>รายจ่าย</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <label className="text-sm font-medium mb-1 block">สี</label>
                  <div className="grid grid-cols-6 gap-2">
                    {PRESET_COLORS.map((color) => (
                      <button
                        key={color}
                        type="button"
                        className={`w-8 h-8 rounded-lg transition-all ${
                          formData.color === color
                            ? "ring-2 ring-offset-2 ring-primary scale-110"
                            : "hover:scale-105"
                        }`}
                        style={{ backgroundColor: color }}
                        onClick={() => setFormData({ ...formData, color })}
                      />
                    ))}
                  </div>
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
                    {editingCategory ? "บันทึก" : "เพิ่ม"}
                  </Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>
        </div>

        {/* Categories Lists */}
        {loading ? (
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <Card key={i} className="animate-pulse">
                <CardContent className="p-4 h-16"></CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <>
            {/* Expense Categories */}
            <div className="mb-6">
              <h2 className="text-sm font-medium text-muted-foreground mb-3 flex items-center gap-2">
                <Tag className="w-4 h-4" />
                รายจ่าย
              </h2>
              <div className="space-y-2">
                {expenseCategories.length === 0 ? (
                  <Card className="border-dashed">
                    <CardContent className="p-4 text-center text-muted-foreground text-sm">
                      ยังไม่มีหมวดหมู่รายจ่าย
                    </CardContent>
                  </Card>
                ) : (
                  expenseCategories.map((category) => (
                    <Card key={category.id} className="group">
                      <CardContent className="p-3">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <div
                              className="w-10 h-10 rounded-xl"
                              style={{ backgroundColor: category.color }}
                            />
                            <span className="font-medium">{category.name}</span>
                          </div>
                          <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-8 w-8"
                              onClick={() => handleEdit(category)}
                            >
                              <Pencil className="w-4 h-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-8 w-8 text-destructive"
                              onClick={() => handleDelete(category.id)}
                            >
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))
                )}
              </div>
            </div>

            {/* Income Categories */}
            <div>
              <h2 className="text-sm font-medium text-muted-foreground mb-3 flex items-center gap-2">
                <Tag className="w-4 h-4" />
                รายรับ
              </h2>
              <div className="space-y-2">
                {incomeCategories.length === 0 ? (
                  <Card className="border-dashed">
                    <CardContent className="p-4 text-center text-muted-foreground text-sm">
                      ยังไม่มีหมวดหมู่รายรับ
                    </CardContent>
                  </Card>
                ) : (
                  incomeCategories.map((category) => (
                    <Card key={category.id} className="group">
                      <CardContent className="p-3">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <div
                              className="w-10 h-10 rounded-xl"
                              style={{ backgroundColor: category.color }}
                            />
                            <span className="font-medium">{category.name}</span>
                          </div>
                          <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-8 w-8"
                              onClick={() => handleEdit(category)}
                            >
                              <Pencil className="w-4 h-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-8 w-8 text-destructive"
                              onClick={() => handleDelete(category.id)}
                            >
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))
                )}
              </div>
            </div>
          </>
        )}
      </div>

      <BottomNav />
    </div>
  );
}
