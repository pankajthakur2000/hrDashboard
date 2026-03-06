import { Navigate, Route, Routes } from "react-router-dom";
import { PageShell } from "./components/ui";
import Dashboard from "./pages/Dashboard";
import Employees from "./pages/Employees";
import EmployeeAttendance from "./pages/EmployeeAttendance";

export default function App() {
  return (
    <PageShell>
      <Routes>
        <Route path="/" element={<Dashboard />} />
        <Route path="/employees" element={<Employees />} />
        <Route path="/employees/:employeeId" element={<EmployeeAttendance />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </PageShell>
  );
}


