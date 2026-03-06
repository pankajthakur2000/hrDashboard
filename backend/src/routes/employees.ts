import { Router } from "express";
import { attendanceQuerySchema, employeeCreateSchema } from "../validation/schemas.js";
import { HttpError } from "../lib/httpError.js";
import { getRepo } from "../db/repo.js";

export const employeesRouter = Router();

employeesRouter.get("/", async (_req, res) => {
  const repo = getRepo();
  const data = await repo.listEmployeesWithPresentCounts();
  res.json({ data });
});

employeesRouter.post("/", async (req, res) => {
  const input = employeeCreateSchema.parse(req.body);

  const repo = getRepo();
  const created = await repo.createEmployee({
    employeeId: input.employeeId,
    fullName: input.fullName,
    email: input.email,
    department: input.department
  });

  res.status(201).json({
    data: {
      employeeId: created.employeeId,
      fullName: created.fullName,
      email: created.email,
      department: created.department,
      createdAt: created.createdAt
    }
  });
});

// Requirement-friendly route: view attendance records for an employee
employeesRouter.get("/:employeeId/attendance", async (req, res) => {
  const employeeId = String(req.params.employeeId ?? "").trim();
  if (!employeeId) throw new HttpError(400, "Employee ID is required");

  const q = attendanceQuerySchema.parse(req.query);
  const repo = getRepo();
  const [employee, records] = await Promise.all([
    repo.getEmployee(employeeId),
    repo.listAttendanceByEmployee({ employeeId, from: q.from, to: q.to })
  ]);

  if (!employee) throw new HttpError(404, "Employee not found");

  res.json({ data: { employee, records } });
});

employeesRouter.delete("/:employeeId", async (req, res) => {
  const employeeId = String(req.params.employeeId ?? "").trim();
  if (!employeeId) throw new HttpError(400, "Employee ID is required");

  const repo = getRepo();
  const existing = await repo.getEmployee(employeeId);
  if (!existing) throw new HttpError(404, "Employee not found");

  // Match README: deleting an employee cascades attendance.
  await repo.deleteEmployeeCascade(employeeId);
  res.status(204).send();
});


