import { z } from 'zod';
import { TransactionType } from '@prisma/client';

export const transactionSchema = z.object({
  id: z.string().cuid().optional(),
  categoryId: z.string().min(1, { message: 'กรุณาเลือกหมวดหมู่' }),
  type: z.nativeEnum(TransactionType),
  amount: z.number()
    .positive({ message: 'จำนวนเงินต้องมากกว่า 0' })
    .max(999999999, { message: 'จำนวนเงินมากเกินไป' }),
  note: z.string().max(200, { message: 'หมายเหตุไม่เกิน 200 ตัวอักษร' }).nullable().optional(),
  date: z.union([z.string(), z.date()]).transform((val) => new Date(val)),
});

export const categorySchema = z.object({
  id: z.string().cuid().optional(),
  name: z.string()
    .min(1, { message: 'กรุณาระบุชื่อหมวดหมู่' })
    .max(50, { message: 'ชื่อหมวดหมู่ไม่เกิน 50 ตัวอักษร' }),
  type: z.nativeEnum(TransactionType),
  color: z.string().regex(/^#[0-9A-Fa-f]{6}$/, { message: 'รูปแบบสีไม่ถูกต้อง' }),
});

export const budgetSchema = z.object({
  id: z.string().cuid().optional(),
  categoryId: z.string().cuid().nullable().optional(),
  month: z.number().int().min(1).max(12),
  year: z.number().int().min(2020).max(2100),
  limit: z.number()
    .positive({ message: 'วงเงินต้องมากกว่า 0' })
    .max(999999999, { message: 'วงเงินมากเกินไป' }),
});

export const transactionQuerySchema = z.object({
  month: z.coerce.number().int().min(1).max(12).optional(),
  year: z.coerce.number().int().min(2020).max(2100).optional(),
  type: z.nativeEnum(TransactionType).optional(),
  categoryId: z.string().cuid().optional(),
});

export type TransactionInput = z.infer<typeof transactionSchema>;
export type CategoryInput = z.infer<typeof categorySchema>;
export type BudgetInput = z.infer<typeof budgetSchema>;
export type TransactionQuery = z.infer<typeof transactionQuerySchema>;
