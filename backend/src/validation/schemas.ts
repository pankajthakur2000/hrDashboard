import { z } from "zod";

export const employeeCreateSchema = z.object({
  employeeId: z.string().trim().min(1, "Employee ID is required"),
  fullName: z.string().trim().min(1, "Full name is required"),
  email: z.string().trim().email("Email must be a valid email address"),
  department: z.string().trim().min(1, "Department is required")
});

const dateOnlyRegex = /^\d{4}-\d{2}-\d{2}$/;

export const attendanceMarkSchema = z.object({
  employeeId: z.string().trim().min(1, "Employee ID is required"),
  date: z
    .string()
    .trim()
    .regex(dateOnlyRegex, "Date must be in YYYY-MM-DD format"),
  status: z.enum(["PRESENT", "ABSENT"])
});

export const attendanceQuerySchema = z.object({
  from: z
    .string()
    .trim()
    .regex(dateOnlyRegex, "from must be YYYY-MM-DD")
    .optional(),
  to: z
    .string()
    .trim()
    .regex(dateOnlyRegex, "to must be YYYY-MM-DD")
    .optional()
});


