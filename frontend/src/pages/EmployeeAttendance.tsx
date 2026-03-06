import React from "react";
import { Link, useParams } from "react-router-dom";
import { api, getErrorMessage } from "../lib/api";
import { Alert, Button, Card, EmptyState, Input, Select } from "../components/ui";

type Employee = {
  employeeId: string;
  fullName: string;
  email: string;
  department: string;
};

type AttendanceRecord = {
  employeeId: string;
  date: string; // YYYY-MM-DD
  status: "PRESENT" | "ABSENT";
  updatedAt: string;
};

export default function EmployeeAttendance() {
  const { employeeId = "" } = useParams();

  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);

  const [employee, setEmployee] = React.useState<Employee | null>(null);
  const [records, setRecords] = React.useState<AttendanceRecord[]>([]);
  const [totalPresentDays, setTotalPresentDays] = React.useState(0);

  const [marking, setMarking] = React.useState(false);
  const [markError, setMarkError] = React.useState<string | null>(null);
  const [markForm, setMarkForm] = React.useState({
    date: new Date().toISOString().slice(0, 10),
    status: "PRESENT" as "PRESENT" | "ABSENT"
  });

  const [filter, setFilter] = React.useState({ from: "", to: "" });

  async function load() {
    try {
      setLoading(true);
      setError(null);
      const params: Record<string, string> = {};
      if (filter.from) params.from = filter.from;
      if (filter.to) params.to = filter.to;
      const res = await api.get(`/api/attendance/employee/${encodeURIComponent(employeeId)}`, { params });
      setEmployee(res.data.data.employee);
      setRecords(res.data.data.records);
      setTotalPresentDays(res.data.data.totalPresentDays);
    } catch (e) {
      setError(getErrorMessage(e));
    } finally {
      setLoading(false);
    }
  }

  React.useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [employeeId]);

  async function onMark(e: React.FormEvent) {
    e.preventDefault();
    try {
      setMarking(true);
      setMarkError(null);
      await api.post("/api/attendance", { employeeId, ...markForm });
      await load();
    } catch (err) {
      setMarkError(getErrorMessage(err));
    } finally {
      setMarking(false);
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <div className="flex items-center gap-2">
            <Link
              to="/employees"
              className="text-sm font-medium text-slate-700 underline decoration-slate-200 underline-offset-4 hover:decoration-slate-400"
            >
              Employees
            </Link>
            <span className="text-sm text-slate-400">/</span>
            <span className="text-sm font-medium text-slate-900">{employeeId}</span>
          </div>
          <h1 className="mt-1 text-lg font-semibold text-slate-900">Attendance</h1>
        </div>
        <Button variant="ghost" onClick={load} disabled={loading}>
          Refresh
        </Button>
      </div>

      {loading ? (
        <Card title="Employee">Loading…</Card>
      ) : error ? (
        <Card title="Employee">
          <Alert tone="error">{error}</Alert>
        </Card>
      ) : !employee ? (
        <EmptyState title="Employee not found" description="Go back to Employees and try again." />
      ) : (
        <div className="grid gap-4 lg:grid-cols-3">
          <div className="lg:col-span-1">
            <Card title="Employee">
              <div className="space-y-2 text-sm">
                <div>
                  <p className="text-xs font-medium text-slate-500">Name</p>
                  <p className="font-medium text-slate-900">{employee.fullName}</p>
                </div>
                <div>
                  <p className="text-xs font-medium text-slate-500">Email</p>
                  <p className="text-slate-800">{employee.email}</p>
                </div>
                <div>
                  <p className="text-xs font-medium text-slate-500">Department</p>
                  <p className="text-slate-800">{employee.department}</p>
                </div>
                <div className="pt-2">
                  <p className="text-xs font-medium text-slate-500">Total present days</p>
                  <p className="text-2xl font-semibold tracking-tight text-slate-900">{totalPresentDays}</p>
                </div>
              </div>
            </Card>
          </div>

          <div className="space-y-4 lg:col-span-2">
            <Card title="Mark attendance">
              <form onSubmit={onMark} className="grid gap-3 sm:grid-cols-3">
                <Input
                  label="Date"
                  type="date"
                  value={markForm.date}
                  onChange={(e) => setMarkForm((f) => ({ ...f, date: e.target.value }))}
                  required
                />
                <Select
                  label="Status"
                  value={markForm.status}
                  onChange={(e) =>
                    setMarkForm((f) => ({ ...f, status: e.target.value as "PRESENT" | "ABSENT" }))
                  }
                >
                  <option value="PRESENT">Present</option>
                  <option value="ABSENT">Absent</option>
                </Select>
                <div className="flex items-end">
                  <Button type="submit" disabled={marking} className="w-full">
                    {marking ? "Saving…" : "Save"}
                  </Button>
                </div>
                {markError && (
                  <div className="sm:col-span-3">
                    <Alert tone="error">{markError}</Alert>
                  </div>
                )}
              </form>
              <p className="mt-2 text-xs text-slate-500">
                Note: marking the same date again updates the status (prevents duplicates).
              </p>
            </Card>

            <Card
              title="Attendance records"
              right={
                <div className="flex items-center gap-2">
                  <Input
                    label="From"
                    type="date"
                    value={filter.from}
                    onChange={(e) => setFilter((f) => ({ ...f, from: e.target.value }))}
                  />
                  <Input
                    label="To"
                    type="date"
                    value={filter.to}
                    onChange={(e) => setFilter((f) => ({ ...f, to: e.target.value }))}
                  />
                  <div className="flex items-end gap-2">
                    <Button
                      variant="ghost"
                      type="button"
                      onClick={() => {
                        setFilter({ from: "", to: "" });
                      }}
                    >
                      Clear
                    </Button>
                    <Button type="button" onClick={load}>
                      Apply
                    </Button>
                  </div>
                </div>
              }
            >
              {records.length === 0 ? (
                <EmptyState title="No attendance yet" description="Mark the first attendance above." />
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-sm">
                    <thead className="text-xs text-slate-500">
                      <tr>
                        <th className="px-2 py-2">Date</th>
                        <th className="px-2 py-2">Status</th>
                        <th className="px-2 py-2">Last updated</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y">
                      {records.map((r) => (
                        <tr key={r.date}>
                          <td className="px-2 py-3 font-medium text-slate-900">{r.date}</td>
                          <td className="px-2 py-3">
                            <span
                              className={
                                r.status === "PRESENT"
                                  ? "rounded-full bg-emerald-50 px-2 py-1 text-xs font-semibold text-emerald-700"
                                  : "rounded-full bg-rose-50 px-2 py-1 text-xs font-semibold text-rose-700"
                              }
                            >
                              {r.status === "PRESENT" ? "Present" : "Absent"}
                            </span>
                          </td>
                          <td className="px-2 py-3 text-slate-700">
                            {new Date(r.updatedAt).toLocaleString()}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </Card>
          </div>
        </div>
      )}
    </div>
  );
}


