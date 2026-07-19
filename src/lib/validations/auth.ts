import { z } from "zod";

const phoneSchema = z
  .string()
  .trim()
  .regex(/^(?:\+?967|0)?7\d{8}$/, "رقم هاتف غير صحيح (مثال: 770288967)");

export const loginSchema = z.object({
  phone: phoneSchema,
  password: z.string().min(8),
});

export type LoginInput = z.infer<typeof loginSchema>;

export const registerSchema = z
  .object({
    name: z.string().trim().min(2).max(100),
    phone: phoneSchema,
    password: z.string().min(8).max(72),
    confirmPassword: z.string().min(8).max(72),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "passwordMismatch",
    path: ["confirmPassword"],
  });

export type RegisterInput = z.infer<typeof registerSchema>;
