import Link from "next/link";

const badgeStyles: Record<string, string> = {
  // status → tailwind classes
  "Complete": "bg-emerald-50 text-emerald-700 ring-emerald-600/20",
  "Done": "bg-emerald-50 text-emerald-700 ring-emerald-600/20",
  "Paid": "bg-emerald-50 text-emerald-700 ring-emerald-600/20",
  "Approved": "bg-emerald-50 text-emerald-700 ring-emerald-600/20",
  "Accepted": "bg-emerald-50 text-emerald-700 ring-emerald-600/20",
  "In Progress": "bg-blue-50 text-blue-700 ring-blue-600/20",
  "In Escrow": "bg-blue-50 text-blue-700 ring-blue-600/20",
  "Quoted": "bg-blue-50 text-blue-700 ring-blue-600/20",
  "In Screening": "bg-amber-50 text-amber-700 ring-amber-600/20",
  "Under Review": "bg-amber-50 text-amber-700 ring-amber-600/20",
  "Pending Review": "bg-amber-50 text-amber-700 ring-amber-600/20",
  "Awaiting Approval": "bg-amber-50 text-amber-700 ring-amber-600/20",
  "Due": "bg-amber-50 text-amber-700 ring-amber-600/20",
  "Submitted": "bg-slate-100 text-slate-600 ring-slate-500/20",
  "Not Started": "bg-slate-100 text-slate-600 ring-slate-500/20",
  "Not Due": "bg-slate-100 text-slate-600 ring-slate-500/20",
  "To Do": "bg-slate-100 text-slate-600 ring-slate-500/20",
  "Planning": "bg-violet-50 text-violet-700 ring-violet-600/20",
  "Declined": "bg-red-50 text-red-700 ring-red-600/20",
  "Suspended": "bg-red-50 text-red-700 ring-red-600/20",
  "Expired": "bg-red-50 text-red-700 ring-red-600/20",
  "Emergency": "bg-red-50 text-red-700 ring-red-600/20",
  "Priority": "bg-amber-50 text-amber-700 ring-amber-600/20",
  "Standard": "bg-slate-100 text-slate-600 ring-slate-500/20",
};

export function Badge({ label }: { label: string }) {
  const style = badgeStyles[label] ?? "bg-slate-100 text-slate-600 ring-slate-500/20";
  return (
    <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ring-1 ring-inset whitespace-nowrap ${style}`}>
      {label}
    </span>
  );
}

export function ProgressBar({ value }: { value: number }) {
  return (
    <div className="h-2 w-full rounded-full bg-slate-100">
      <div
        className="h-2 rounded-full bg-teal-600 transition-all"
        style={{ width: `${Math.min(100, Math.max(0, value))}%` }}
      />
    </div>
  );
}

export function StatCard({ label, value, sub }: { label: string; value: string; sub?: string }) {
  return (
    <div className="rounded-xl border border-slate-200 bg-white p-5">
      <p className="text-sm text-slate-500">{label}</p>
      <p className="mt-1 text-2xl font-semibold tracking-tight text-slate-900">{value}</p>
      {sub && <p className="mt-1 text-xs text-slate-400">{sub}</p>}
    </div>
  );
}

export function SectionHeading({
  eyebrow,
  title,
  description,
}: {
  eyebrow?: string;
  title: string;
  description?: string;
}) {
  return (
    <div className="max-w-2xl">
      {eyebrow && <p className="text-sm font-semibold uppercase tracking-wide text-teal-700">{eyebrow}</p>}
      <h2 className="mt-2 text-3xl font-semibold tracking-tight text-slate-900">{title}</h2>
      {description && <p className="mt-3 text-base text-slate-600">{description}</p>}
    </div>
  );
}

export function PageHeader({
  title,
  description,
  action,
}: {
  title: string;
  description?: string;
  action?: React.ReactNode;
}) {
  return (
    <div className="flex flex-wrap items-end justify-between gap-4 border-b border-slate-200 pb-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight text-slate-900">{title}</h1>
        {description && <p className="mt-1 max-w-2xl text-sm text-slate-600">{description}</p>}
      </div>
      {action}
    </div>
  );
}

export function ButtonLink({
  href,
  children,
  variant = "primary",
}: {
  href: string;
  children: React.ReactNode;
  variant?: "primary" | "secondary" | "ghost";
}) {
  const styles = {
    primary: "bg-teal-700 text-white hover:bg-teal-800",
    secondary: "bg-white text-slate-900 ring-1 ring-inset ring-slate-300 hover:bg-slate-50",
    ghost: "text-teal-700 hover:text-teal-800 hover:bg-teal-50",
  }[variant];
  return (
    <Link
      href={href}
      className={`inline-flex items-center justify-center rounded-lg px-4 py-2.5 text-sm font-semibold transition-colors ${styles}`}
    >
      {children}
    </Link>
  );
}
