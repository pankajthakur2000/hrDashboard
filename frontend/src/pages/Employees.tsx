import React from "react";
import { Link } from "react-router-dom";
import { api, getErrorMessage } from "../lib/api";
import { Alert, Button, Card, EmptyState, Input } from "../components/ui";

type EmployeeRow = {
  employeeId: string;
  fullName: string;
  email: string;
  department: string;
  createdAt: string;
  totalPresentDays: number;
};

export default function Employees() {
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);
  const [rows, setRows] = React.useState<EmployeeRow[]>([]);

  const [creating, setCreating] = React.useState(false);
  const [form, setForm] = React.useState({ employeeId: "", fullName: "", email: "", department: "" });
  const [formError, setFormError] = React.useState<string | null>(null);

  async function load() {
    try {
      setLoading(true);
      setError(null);
      const res = await api.get("/api/employees");
      setRows(res.data.data);
    } catch (e) {
      setError(getErrorMessage(e));
    } finally {
      setLoading(false);
    }
  }

  React.useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function onCreate(e: React.FormEvent) {
    e.preventDefault();
    try {
      setCreating(true);
      setFormError(null);
      await api.post("/api/employees", form);
      setForm({ employeeId: "", fullName: "", email: "", department: "" });
      await load();
    } catch (err) {
      setFormError(getErrorMessage(err));
    } finally {
      setCreating(false);
    }
  }

  async function onDelete(employeeId: string) {
    const ok = window.confirm(`Delete employee ${employeeId}? This will also delete attendance records.`);
    if (!ok) return;
    try {
      await api.delete(`/api/employees/${encodeURIComponent(employeeId)}`);
      await load();
    } catch (e) {
      alert(getErrorMessage(e));
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-lg font-semibold text-slate-900">Employees</h1>
          <p className="text-sm text-slate-600">Manage employee records and open attendance per employee.</p>
        </div>
        <Button variant="ghost" onClick={load} disabled={loading}>
          Refresh
        </Button>
      </div>

      <Card title="Add employee">
        <form onSubmit={onCreate} className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          <Input
            label="Employee ID"
            value={form.employeeId}
            onChange={(e) => setForm((f) => ({ ...f, employeeId: e.target.value }))}
            placeholder="EMP-001"
            required
          />
          <Input
            label="Full name"
            value={form.fullName}
            onChange={(e) => setForm((f) => ({ ...f, fullName: e.target.value }))}
            placeholder="Jane Doe"
            required
          />
          <Input
            label="Email"
            type="email"
            value={form.email}
            onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))}
            placeholder="jane@company.com"
            required
          />
          <Input
            label="Department"
            value={form.department}
            onChange={(e) => setForm((f) => ({ ...f, department: e.target.value }))}
            placeholder="Engineering"
            required
          />
          <div className="sm:col-span-2 lg:col-span-4">
            <div className="flex items-center gap-3">
              <Button type="submit" disabled={creating}>
                {creating ? "Saving…" : "Add employee"}
              </Button>
              {formError && <Alert tone="error">{formError}</Alert>}
            </div>
          </div>
        </form>
      </Card>

      {loading ? (
        <Card title="Employee list">Loading…</Card>
      ) : error ? (
        <Card title="Employee list">
          <Alert tone="error">{error}</Alert>
        </Card>
      ) : rows.length === 0 ? (
        <EmptyState title="No employees yet" description="Add your first employee above to get started." />
      ) : (
        <Card title="Employee list">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="text-xs text-slate-500">
                <tr>
                  <th className="px-2 py-2">Employee ID</th>
                  <th className="px-2 py-2">Name</th>
                  <th className="px-2 py-2">Email</th>
                  <th className="px-2 py-2">Department</th>
                  <th className="px-2 py-2">Present days</th>
                  <th className="px-2 py-2"></th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {rows.map((r) => (
                  <tr key={r.employeeId} className="align-top">
                    <td className="px-2 py-3 font-medium text-slate-900">{r.employeeId}</td>
                    <td className="px-2 py-3">
                      <Link
                        to={`/employees/${encodeURIComponent(r.employeeId)}`}
                        className="font-medium text-slate-900 underline decoration-slate-200 underline-offset-4 hover:decoration-slate-400"
                      >
                        {r.fullName}
                      </Link>
                    </td>
                    <td className="px-2 py-3 text-slate-700">{r.email}</td>
                    <td className="px-2 py-3 text-slate-700">{r.department}</td>
                    <td className="px-2 py-3 text-slate-700">{r.totalPresentDays}</td>
                    <td className="px-2 py-3">
                      <div className="flex justify-end gap-2">
                        <Link to={`/employees/${encodeURIComponent(r.employeeId)}`}>
                          <Button variant="ghost" type="button">
                            Attendance
                          </Button>
                        </Link>
                        <Button variant="danger" type="button" onClick={() => onDelete(r.employeeId)}>
                          Delete
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      )}
    </div>
  );
}


