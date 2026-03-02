"use client";

import { useEffect, useState } from "react";
import { Plus, Pencil, Trash2, ChevronLeft, ChevronRight, Search } from "lucide-react";
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
import { formatCurrency, formatDate, getMonthName, getCurrentMonth, getCurrentYear } from "@/lib/utils";
import { useToast } from "@/hooks/use-toast";
import { Transaction, Category } from "@/types";
import { TransactionType } from "@prisma/client";

export default function TransactionsPage() {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [month, setMonth] = useState(getCurrentMonth());
  const [year, setYear] = useState(getCurrentYear());
  const [filterType, setFilterType] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingTransaction, setEditingTransaction] = useState<Transaction | null>(null);
  const { toast } = useToast();

  // Form state
  const [formData, setFormData] = useState<{
    type: TransactionType;
    categoryId: string;
    amount: string;
    note: string;
    date: string;
  }>({
    type: TransactionType.expense,
    categoryId: "",
    amount: "",
    note: "",
    date: new Date().toISOString().split("T")[0],
  });

  useEffect(() => {
    fetchData();
  }, [month, year, filterType]);

  async function fetchData() {
    try {
      setLoading(true);
      
      // Fetch categories
      const catRes = await fetch("/api/categories");
      const catData = await catRes.json();
      setCategories(catData.categories || []);

      // Fetch transactions
      const typeParam = filterType !== "all" ? `&type=${filterType}` : "";
      const transRes = await fetch(`/api/transactions?month=${month}&year=${year}${typeParam}`);
      const transData = await transRes.json();
      setTransactions(transData.transactions || []);
    } catch (error) {
      console.error("Failed to fetch data:", error);
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
      type: TransactionType.expense,
      categoryId: "",
      amount: "",
      note: "",
      date: new Date().toISOString().split("T")[0],
    });
    setEditingTransaction(null);
  }

  function handleEdit(transaction: Transaction) {
    setEditingTransaction(transaction);
    setFormData({
      type: transaction.type,
      categoryId: transaction.categoryId,
      amount: transaction.amount.toString(),
      note: transaction.note || "",
      date: new Date(transaction.date).toISOString().split("T")[0],
    });
    setIsDialogOpen(true);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    
    // Validation
    if (!formData.categoryId) {
      toast({
        title: "กรุณาเลือกหมวดหมู่",
        description: "คุณต้องเลือกหมวดหมู่ก่อนบันทึก",
        variant: "destructive",
      });
      return;
    }
    
    if (!formData.amount || parseFloat(formData.amount) <= 0) {
      toast({
        title: "จำนวนเงินไม่ถูกต้อง",
        description: "กรุณาระบุจำนวนเงินที่มากกว่า 0",
        variant: "destructive",
      });
      return;
    }
    
    try {
      const payload = {
        ...formData,
        amount: parseFloat(formData.amount),
        date: formData.date,
      };

      const url = editingTransaction 
        ? `/api/transactions/${editingTransaction.id}` 
        : "/api/transactions";
      const method = editingTransaction ? "PUT" : "POST";

      const response = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (response.ok) {
        toast({
          title: editingTransaction ? "แก้ไขสำเร็จ" : "เพิ่มรายการสำเร็จ",
          description: editingTransaction 
            ? "แก้ไขรายการเรียบร้อยแล้ว" 
            : "เพิ่มรายการใหม่เรียบร้อยแล้ว",
        });
        setIsDialogOpen(false);
        resetForm();
        fetchData();
      } else {
        const error = await response.json();
        const errorMessage = error.details?.fieldErrors 
          ? Object.values(error.details.fieldErrors).flat().join(', ')
          : error.error || "ไม่สามารถบันทึกข้อมูลได้";
        toast({
          title: "เกิดข้อผิดพลาด",
          description: errorMessage,
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
    if (!confirm("ต้องการลบรายการนี้?")) return;

    try {
      const response = await fetch(`/api/transactions/${id}`, {
        method: "DELETE",
      });

      if (response.ok) {
        toast({
          title: "ลบสำเร็จ",
          description: "ลบรายการเรียบร้อยแล้ว",
        });
        fetchData();
      } else {
        toast({
          title: "เกิดข้อผิดพลาด",
          description: "ไม่สามารถลบรายการได้",
          variant: "destructive",
        });
      }
    } catch (error) {
      toast({
        title: "เกิดข้อผิดพลาด",
        description: "ไม่สามารถลบรายการได้",
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

  const filteredTransactions = transactions.filter((t) =>
    t.note?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    t.category?.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const filteredCategories = categories.filter((c) => c.type === formData.type);

  return (
    <div className="min-h-screen bg-background pb-24">
      <div className="container mx-auto px-4 py-6 max-w-lg md:max-w-2xl lg:max-w-4xl">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-bold">รายการธุรกรรม</h1>
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <Button size="sm" className="rounded-full" onClick={() => setIsDialogOpen(true)}>
              <Plus className="w-4 h-4 mr-1" />
              เพิ่ม
            </Button>
            <DialogContent className="sm:max-w-[425px]">
              <DialogHeader>
                <DialogTitle>
                  {editingTransaction ? "แก้ไขรายการ" : "เพิ่มรายการใหม่"}
                </DialogTitle>
              </DialogHeader>
              <form onSubmit={handleSubmit} className="space-y-4 mt-4">
                <div>
                  <label className="text-sm font-medium mb-1 block">ประเภท</label>
                  <Select
                    value={formData.type}
                    onValueChange={(value) =>
                      setFormData({ ...formData, type: value as TransactionType, categoryId: "" })
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
                  <label className="text-sm font-medium mb-1 block">หมวดหมู่</label>
                  <Select
                    value={formData.categoryId}
                    onValueChange={(value) => setFormData({ ...formData, categoryId: value })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="เลือกหมวดหมู่" />
                    </SelectTrigger>
                    <SelectContent>
                      {filteredCategories.map((category) => (
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
                  <label className="text-sm font-medium mb-1 block">จำนวนเงิน</label>
                  <Input
                    type="number"
                    value={formData.amount}
                    onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                    placeholder="0.00"
                    required
                  />
                </div>

                <div>
                  <label className="text-sm font-medium mb-1 block">วันที่</label>
                  <Input
                    type="date"
                    value={formData.date}
                    onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                    required
                  />
                </div>

                <div>
                  <label className="text-sm font-medium mb-1 block">หมายเหตุ</label>
                  <Input
                    value={formData.note}
                    onChange={(e) => setFormData({ ...formData, note: e.target.value })}
                    placeholder="เพิ่มหมายเหตุ (ไม่บังคับ)"
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
                    {editingTransaction ? "บันทึก" : "เพิ่ม"}
                  </Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>
        </div>

        {/* Month Selector */}
        <div className="flex items-center justify-center gap-2 mb-4">
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

        {/* Filters */}
        <div className="flex gap-2 mb-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="ค้นหา..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9"
            />
          </div>
          <Select value={filterType} onValueChange={setFilterType}>
            <SelectTrigger className="w-[120px]">
              <SelectValue placeholder="ทั้งหมด" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">ทั้งหมด</SelectItem>
              <SelectItem value={TransactionType.income}>รายรับ</SelectItem>
              <SelectItem value={TransactionType.expense}>รายจ่าย</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Transactions List */}
        <div className="space-y-3">
          {loading ? (
            <div className="space-y-3">
              {[1, 2, 3].map((i) => (
                <Card key={i} className="animate-pulse">
                  <CardContent className="p-4 h-20"></CardContent>
                </Card>
              ))}
            </div>
          ) : filteredTransactions.length === 0 ? (
            <Card className="border-dashed">
              <CardContent className="p-8 text-center text-muted-foreground">
                ไม่พบรายการธุรกรรม
              </CardContent>
            </Card>
          ) : (
            filteredTransactions.map((transaction) => (
              <Card key={transaction.id} className="group">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div
                        className="w-10 h-10 rounded-xl flex items-center justify-center"
                        style={{ backgroundColor: `${transaction.category?.color}20` }}
                      >
                        <div
                          className="w-3 h-3 rounded-full"
                          style={{ backgroundColor: transaction.category?.color }}
                        />
                      </div>
                      <div>
                        <p className="font-medium">{transaction.category?.name}</p>
                        <p className="text-sm text-muted-foreground">
                          {formatDate(transaction.date)}
                          {transaction.note && ` · ${transaction.note}`}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <span
                        className={`font-bold ${
                          transaction.type === TransactionType.income
                            ? "text-emerald-500"
                            : "text-rose-500"
                        }`}
                      >
                        {transaction.type === TransactionType.income ? "+" : "-"}
                        {formatCurrency(Number(transaction.amount))}
                      </span>
                      <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8"
                          onClick={() => handleEdit(transaction)}
                        >
                          <Pencil className="w-4 h-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 text-destructive"
                          onClick={() => handleDelete(transaction.id)}
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </div>
      </div>

      <BottomNav />
    </div>
  );
}
