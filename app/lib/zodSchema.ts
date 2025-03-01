import { z } from "zod";

export const RegisterSchema = z
  .object({
    username: z
      .string()
      .min(3, "Username must be at least 3 characters")
      .max(20, "Username cannot exceed 20 characters")
      .refine(
        (value) => /^[a-zA-Z0-9_]+$/.test(value),
        "Username can only contain letters, numbers, and underscores"
      )
      .refine((value) => !/\s/.test(value), "Username cannot contain spaces"),
    email: z
      .string()
      .email("Invalid email address")
      .min(1, "Email is required"),
    password: z
      .string()
      .min(6, "Password must be at least 6 characters")
      .max(50, "Password cannot exceed 50 characters"),
    confirmPassword: z
      .string()
      .min(6, "Password must be at least 6 characters")
      .max(50, "Password cannot exceed 50 characters"),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  });

export const loginSchema = z.object({
  email: z.string().email("Invalid email address").min(1, "Email is required"),
  password: z
    .string()
    .min(6, "Password must be at least 6 characters")
    .max(50, "Password cannot exceed 50 characters"),
});

export const customerSchema = z.object({
  id: z.string().optional(),
  name: z.string().min(1, "Name is required"),
  phoneNumber: z
    .string()
    .min(10, "Phone number must be at least 10 digits")
    .max(15, "Phone number cannot exceed 15 digits"),
  email: z.string().email("Invalid email address"),
  outstandingPayment: z
    .number()
    .min(0, "Outstanding payment cannot be negative"),
  paymentDueDate: z
    .string()
    .min(1, "Payment due date is required")
    .refine(
      (date) => new Date(date) >= new Date(new Date().setHours(0, 0, 0, 0)),
      "Payment due date cannot be in the past"
    ),
  paymentStatus: z.enum(["Paid", "Pending"]),
});

export const paymentSchema = z.object({
  id: z.string().optional(),
  customer: z.string().min(1, "Customer name is required"),
  customerId: z.string().min(1, "Customer ID is required"),
  amount: z
    .number()
    .min(0, "Amount must be a positive number")
    .max(1000000, "Amount cannot exceed 1,000,000"),
  date: z
    .string()
    .min(1, "Payment date is required")
    .refine(
      (date) => new Date(date) >= new Date(new Date().setHours(0, 0, 0, 0)),
      "Payment date cannot be in the past"
    ),
  status: z.enum(["Paid", "Pending"]),
});

export const notificationSchema = z.object({
  id: z.string().optional(),
  type: z.enum([
    "PAYMENT_CREATED",
    "PAYMENT_RECEIVED",
    "PAYMENT_UPDATED",
    "PAYMENT_OVERDUE",
    "NEW_CUSTOMER",
  ]),
  message: z.string(),
  customerId: z.string().optional(),
  paymentId: z.string().optional(),
  timestamp: z.string().datetime(),
  read: z.boolean().default(false),
});

export type Notification = z.infer<typeof notificationSchema>;
export type PaymentFormValues = z.infer<typeof paymentSchema>;
export type CustomerFormValues = z.infer<typeof customerSchema>;
export type RegisterFormValues = z.infer<typeof RegisterSchema>;
export type LoginFormValues = z.infer<typeof loginSchema>;
