import { Router } from "express";
import { attendanceMarkSchema, attendanceQuerySchema } from "../validation/schemas.js";
import { HttpError } from "../lib/httpError.js";
import { getRepo } from "../db/repo.js";
export const attendanceRouter = Router();
// Mark attendance (idempotent per employeeId+date). If the record exists, it is updated.
attendanceRouter.post("/", async (req, res) => {
    const input = attendanceMarkSchema.parse(req.body);
    const repo = getRepo();
    const employee = await repo.getEmployee(input.employeeId);
    if (!employee)
        throw new HttpError(404, "Employee not found");
    const record = await repo.markAttendance({
        employeeId: input.employeeId,
        date: input.date,
        status: input.status
    });
    res.status(201).json({ data: record });
});
attendanceRouter.get("/employee/:employeeId", async (req, res) => {
    const employeeId = String(req.params.employeeId ?? "").trim();
    if (!employeeId)
        throw new HttpError(400, "Employee ID is required");
    const q = attendanceQuerySchema.parse(req.query);
    const repo = getRepo();
    const [employee, records, presentCount] = await Promise.all([
        repo.getEmployee(employeeId),
        repo.listAttendanceByEmployee({ employeeId, from: q.from, to: q.to }),
        repo.countPresentDays(employeeId)
    ]);
    if (!employee)
        throw new HttpError(404, "Employee not found");
    res.json({ data: { employee, records, totalPresentDays: presentCount } });
});
