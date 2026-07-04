import Link from "next/link";

const nav = [
  { href: "/services", label: "Services" },
  { href: "/methodology", label: "How We Price" },
  { href: "/quote", label: "Get a Quote" },
  { href: "/dashboard", label: "My Projects" },
  { href: "/providers", label: "For Providers" },
  { href: "/staff/login", label: "Staff Sign In" },
];

export function SiteHeader() {
  return (
    <header className="sticky top-0 z-40 border-b border-slate-200 bg-white/90 backdrop-blur">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        <Link href="/" className="flex items-center gap-2.5">
          <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-teal-700 text-sm font-bold text-white">
            B
          </span>
          <span className="text-lg font-semibold tracking-tight text-slate-900">Baseline</span>
        </Link>
        <nav className="hidden items-center gap-1 md:flex">
          {nav.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="rounded-md px-3 py-2 text-sm font-medium text-slate-600 transition-colors hover:bg-slate-50 hover:text-slate-900"
            >
              {item.label}
            </Link>
          ))}
        </nav>
        <div className="flex items-center gap-3">
          <Link
            href="/quote"
            className="rounded-lg bg-teal-700 px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-teal-800"
          >
            Get a Quote
          </Link>
        </div>
      </div>
    </header>
  );
}
