import Link from "next/link";

export function SiteFooter() {
  return (
    <footer className="mt-auto border-t border-slate-200 bg-white">
      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="grid gap-10 md:grid-cols-4">
          <div>
            <div className="flex items-center gap-2.5">
              <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-teal-700 text-sm font-bold text-white">
                B
              </span>
              <span className="text-lg font-semibold tracking-tight text-slate-900">Baseline</span>
            </div>
            <p className="mt-3 max-w-xs text-sm text-slate-500">
              Transparent pricing and managed projects across every service — trades, software,
              creative, professional, and events.
            </p>
          </div>
          <div>
            <h3 className="text-sm font-semibold text-slate-900">Customers</h3>
            <ul className="mt-3 space-y-2 text-sm text-slate-600">
              <li><Link href="/services" className="hover:text-teal-700">Browse Services</Link></li>
              <li><Link href="/quote" className="hover:text-teal-700">Request a Quote</Link></li>
              <li><Link href="/custom-request" className="hover:text-teal-700">Custom Requests</Link></li>
              <li><Link href="/dashboard" className="hover:text-teal-700">Customer Dashboard</Link></li>
            </ul>
          </div>
          <div>
            <h3 className="text-sm font-semibold text-slate-900">Providers</h3>
            <ul className="mt-3 space-y-2 text-sm text-slate-600">
              <li><Link href="/providers" className="hover:text-teal-700">Apply to Join</Link></li>
              <li><Link href="/providers/portal" className="hover:text-teal-700">Provider Portal</Link></li>
              <li><Link href="/providers#screening" className="hover:text-teal-700">Screening Requirements</Link></li>
            </ul>
          </div>
          <div>
            <h3 className="text-sm font-semibold text-slate-900">Company</h3>
            <ul className="mt-3 space-y-2 text-sm text-slate-600">
              <li><Link href="/#how-it-works" className="hover:text-teal-700">How It Works</Link></li>
              <li><Link href="/methodology" className="hover:text-teal-700">How We Price</Link></li>
              <li><Link href="/staff/login" className="hover:text-teal-700">Staff Sign In</Link></li>
            </ul>
          </div>
        </div>
        <p className="mt-10 border-t border-slate-100 pt-6 text-xs text-slate-400">
          © {new Date().getFullYear()} Baseline Services, Inc. All rights reserved.
        </p>
      </div>
    </footer>
  );
}
