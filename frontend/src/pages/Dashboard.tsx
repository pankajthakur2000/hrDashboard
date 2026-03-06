import React from "react";
import { api, getErrorMessage } from "../lib/api";
import { Alert, Card, EmptyState } from "../components/ui";

type Summary = {
  today: string;
  employeeCount: number;
  presentToday: number;
  absentToday: number;
};

export default function Dashboard() {
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);
  const [summary, setSummary] = React.useState<Summary | null>(null);

  React.useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        setLoading(true);
        setError(null);
        const res = await api.get("/api/summary");
        if (!cancelled) setSummary(res.data.data);
      } catch (e) {
        if (!cancelled) setError(getErrorMessage(e));
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  if (loading) {
    return <Card title="Dashboard">Loading…</Card>;
  }

  if (error) {
    return (
      <Card title="Dashboard">
        <Alert tone="error">{error}</Alert>
      </Card>
    );
  }

  if (!summary) {
    return <EmptyState title="No data yet" description="Try refreshing." />;
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-lg font-semibold text-slate-900">Dashboard</h1>
          <p className="text-sm text-slate-600">Daily overview for {summary.today} (UTC)</p>
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <StatCard label="Employees" value={summary.employeeCount} />
        <StatCard label="Present today" value={summary.presentToday} />
        <StatCard label="Absent today" value={summary.absentToday} />
      </div>

      <Card title="Next steps">
        <ul className="list-disc space-y-1 pl-5 text-sm text-slate-700">
          <li>Add employees in the Employees section</li>
          <li>Open an employee to mark and review attendance</li>
        </ul>
      </Card>
    </div>
  );
}

function StatCard({ label, value }: { label: string; value: number }) {
  return (
    <div className="rounded-xl border bg-white p-4 shadow-sm">
      <p className="text-xs font-medium text-slate-600">{label}</p>
      <p className="mt-1 text-2xl font-semibold tracking-tight text-slate-900">{value}</p>
    </div>
  );
}


