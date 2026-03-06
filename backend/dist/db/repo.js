import { Attendance, Employee } from "./mongo.js";
function isMemoryMode() {
    const v = String(process.env.USE_MEMORY_DB ?? "").trim().toLowerCase();
    return v === "1" || v === "true" || v === "yes";
}
function createMongoRepo() {
    return {
        async listEmployeesWithPresentCounts() {
            const [employees, presentCounts] = await Promise.all([
                Employee.find({}, { _id: 0, employeeId: 1, fullName: 1, email: 1, department: 1, createdAt: 1 })
                    .sort({ createdAt: -1 })
                    .lean(),
                Attendance.aggregate([
                    { $match: { status: "PRESENT" } },
                    { $group: { _id: "$employeeId", count: { $sum: 1 } } }
                ])
            ]);
            const presentMap = new Map(presentCounts.map((r) => [r._id, r.count]));
            return employees.map((e) => ({
                ...e,
                totalPresentDays: presentMap.get(e.employeeId) ?? 0
            }));
        },
        async createEmployee(input) {
            const created = await Employee.create(input);
            return {
                employeeId: created.employeeId,
                fullName: created.fullName,
                email: created.email,
                department: created.department,
                createdAt: created.createdAt
            };
        },
        async getEmployee(employeeId) {
            return Employee.findOne({ employeeId }, { _id: 0, employeeId: 1, fullName: 1, email: 1, department: 1 }).lean();
        },
        async deleteEmployeeCascade(employeeId) {
            await Promise.all([Attendance.deleteMany({ employeeId }), Employee.deleteOne({ employeeId })]);
        },
        async listAttendanceByEmployee({ employeeId, from, to }) {
            const where = { employeeId };
            if (from || to) {
                where.date = {};
                if (from)
                    where.date.$gte = from;
                if (to)
                    where.date.$lte = to;
            }
            return Attendance.find(where, { _id: 0, employeeId: 1, date: 1, status: 1, updatedAt: 1 })
                .sort({ date: -1 })
                .lean();
        },
        async markAttendance({ employeeId, date, status }) {
            const record = await Attendance.findOneAndUpdate({ employeeId, date }, {
                $set: { status },
                $setOnInsert: { employeeId, date }
            }, {
                upsert: true,
                new: true,
                setDefaultsOnInsert: true,
                projection: { _id: 0, employeeId: 1, date: 1, status: 1, createdAt: 1, updatedAt: 1 }
            }).lean();
            // With upsert+new this should not be null, but keep the type safe.
            if (!record) {
                const now = new Date();
                return { employeeId, date, status, createdAt: now, updatedAt: now };
            }
            return record;
        },
        async countSummary({ today }) {
            const [employeeCount, presentToday, absentToday] = await Promise.all([
                Employee.countDocuments({}),
                Attendance.countDocuments({ date: today, status: "PRESENT" }),
                Attendance.countDocuments({ date: today, status: "ABSENT" })
            ]);
            return { employeeCount, presentToday, absentToday };
        },
        async countPresentDays(employeeId) {
            return Attendance.countDocuments({ employeeId, status: "PRESENT" });
        }
    };
}
function createMemoryRepo() {
    const employees = new Map();
    const attendance = new Map(); // key = `${employeeId}|${date}`
    const key = (employeeId, date) => `${employeeId}|${date}`;
    return {
        async listEmployeesWithPresentCounts() {
            const presentCounts = new Map();
            for (const rec of attendance.values()) {
                if (rec.status !== "PRESENT")
                    continue;
                presentCounts.set(rec.employeeId, (presentCounts.get(rec.employeeId) ?? 0) + 1);
            }
            return Array.from(employees.values())
                .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime())
                .map((e) => ({ ...e, totalPresentDays: presentCounts.get(e.employeeId) ?? 0 }));
        },
        async createEmployee(input) {
            const now = new Date();
            const doc = { ...input, createdAt: now };
            employees.set(doc.employeeId, doc);
            return doc;
        },
        async getEmployee(employeeId) {
            const e = employees.get(employeeId);
            if (!e)
                return null;
            return { employeeId: e.employeeId, fullName: e.fullName, email: e.email, department: e.department };
        },
        async deleteEmployeeCascade(employeeId) {
            employees.delete(employeeId);
            for (const k of Array.from(attendance.keys())) {
                if (k.startsWith(`${employeeId}|`))
                    attendance.delete(k);
            }
        },
        async listAttendanceByEmployee({ employeeId, from, to }) {
            const out = [];
            for (const rec of attendance.values()) {
                if (rec.employeeId !== employeeId)
                    continue;
                if (from && rec.date < from)
                    continue;
                if (to && rec.date > to)
                    continue;
                out.push({ employeeId: rec.employeeId, date: rec.date, status: rec.status, updatedAt: rec.updatedAt });
            }
            out.sort((a, b) => (a.date < b.date ? 1 : a.date > b.date ? -1 : 0));
            return out;
        },
        async markAttendance({ employeeId, date, status }) {
            const k = key(employeeId, date);
            const existing = attendance.get(k);
            const now = new Date();
            if (existing) {
                const updated = { ...existing, status, updatedAt: now };
                attendance.set(k, updated);
                return updated;
            }
            const created = { employeeId, date, status, createdAt: now, updatedAt: now };
            attendance.set(k, created);
            return created;
        },
        async countSummary({ today }) {
            let presentToday = 0;
            let absentToday = 0;
            for (const rec of attendance.values()) {
                if (rec.date !== today)
                    continue;
                if (rec.status === "PRESENT")
                    presentToday += 1;
                if (rec.status === "ABSENT")
                    absentToday += 1;
            }
            return { employeeCount: employees.size, presentToday, absentToday };
        },
        async countPresentDays(employeeId) {
            let c = 0;
            for (const rec of attendance.values()) {
                if (rec.employeeId === employeeId && rec.status === "PRESENT")
                    c += 1;
            }
            return c;
        }
    };
}
let repoSingleton = null;
export function getRepo() {
    if (repoSingleton)
        return repoSingleton;
    repoSingleton = isMemoryMode() ? createMemoryRepo() : createMongoRepo();
    return repoSingleton;
}
