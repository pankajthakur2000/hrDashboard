import React from "react";
import { Link, NavLink } from "react-router-dom";

export function classNames(...xs: Array<string | false | null | undefined>) {
  return xs.filter(Boolean).join(" ");
}

export function PageShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen">
      <header className="sticky top-0 z-10 border-b bg-white/80 backdrop-blur">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3">
          <Link to="/" className="text-sm font-semibold tracking-tight text-slate-900">
            HRMS Lite
          </Link>
          <nav className="flex items-center gap-2 text-sm">
            <TopNav to="/" label="Dashboard" />
            <TopNav to="/employees" label="Employees" />
          </nav>
        </div>
      </header>
      <main className="mx-auto max-w-6xl px-4 py-6">{children}</main>
      <footer className="border-t bg-white">
        <div className="mx-auto max-w-6xl px-4 py-4 text-xs text-slate-500">
          Internal tool • HRMS Lite
        </div>
      </footer>
    </div>
  );
}

function TopNav({ to, label }: { to: string; label: string }) {
  return (
    <NavLink
      to={to}
      className={({ isActive }) =>
        classNames(
          "rounded-md px-3 py-1.5 font-medium",
          isActive ? "bg-slate-900 text-white" : "text-slate-700 hover:bg-slate-100"
        )
      }
      end={to === "/"}
    >
      {label}
    </NavLink>
  );
}

export function Card({
  title,
  children,
  right
}: {
  title?: string;
  right?: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <section className="rounded-xl border bg-white shadow-sm">
      {(title || right) && (
        <div className="flex items-center justify-between border-b px-4 py-3">
          <h2 className="text-sm font-semibold text-slate-900">{title}</h2>
          {right}
        </div>
      )}
      <div className="px-4 py-4">{children}</div>
    </section>
  );
}

export function Button({
  variant = "primary",
  ...props
}: React.ButtonHTMLAttributes<HTMLButtonElement> & { variant?: "primary" | "danger" | "ghost" }) {
  return (
    <button
      {...props}
      className={classNames(
        "inline-flex items-center justify-center rounded-md px-3 py-2 text-sm font-medium transition disabled:cursor-not-allowed disabled:opacity-50",
        variant === "primary" && "bg-slate-900 text-white hover:bg-slate-800",
        variant === "danger" && "bg-rose-600 text-white hover:bg-rose-500",
        variant === "ghost" && "bg-transparent text-slate-700 hover:bg-slate-100",
        props.className
      )}
    />
  );
}

export function Input({
  label,
  ...props
}: React.InputHTMLAttributes<HTMLInputElement> & { label: string }) {
  return (
    <label className="block">
      <span className="mb-1 block text-xs font-medium text-slate-700">{label}</span>
      <input
        {...props}
        className={classNames(
          "w-full rounded-md border px-3 py-2 text-sm outline-none ring-slate-900/10 focus:ring-2",
          props.className
        )}
      />
    </label>
  );
}

export function Select({
  label,
  children,
  ...props
}: React.SelectHTMLAttributes<HTMLSelectElement> & { label: string; children: React.ReactNode }) {
  return (
    <label className="block">
      <span className="mb-1 block text-xs font-medium text-slate-700">{label}</span>
      <select
        {...props}
        className={classNames(
          "w-full rounded-md border px-3 py-2 text-sm outline-none ring-slate-900/10 focus:ring-2",
          props.className
        )}
      >
        {children}
      </select>
    </label>
  );
}

export function Alert({ tone = "info", children }: { tone?: "info" | "error"; children: React.ReactNode }) {
  return (
    <div
      className={classNames(
        "rounded-md border px-3 py-2 text-sm",
        tone === "info" && "border-slate-200 bg-slate-50 text-slate-700",
        tone === "error" && "border-rose-200 bg-rose-50 text-rose-700"
      )}
    >
      {children}
    </div>
  );
}

export function EmptyState({
  title,
  description,
  action
}: {
  title: string;
  description?: string;
  action?: React.ReactNode;
}) {
  return (
    <div className="rounded-xl border bg-white px-6 py-10 text-center shadow-sm">
      <div className="mx-auto max-w-md">
        <p className="text-sm font-semibold text-slate-900">{title}</p>
        {description && <p className="mt-1 text-sm text-slate-600">{description}</p>}
        {action && <div className="mt-4 flex justify-center">{action}</div>}
      </div>
    </div>
  );
}


