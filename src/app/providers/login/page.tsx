import Link from "next/link";
import { redirect } from "next/navigation";
import { getCurrentProvider } from "@/lib/provider-auth";
import { ProviderLoginForm } from "./login-form";

export const metadata = { title: "Provider Sign In — Baseline" };
export const dynamic = "force-dynamic";

export default async function ProviderLoginPage() {
  if (await getCurrentProvider()) redirect("/providers/portal");

  return (
    <div className="mx-auto flex min-h-[70vh] max-w-md items-center px-4 py-12">
      <section className="w-full rounded-2xl border border-slate-200 bg-white p-7 shadow-sm">
        <div className="flex items-center gap-2.5">
          <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-teal-700 font-bold text-white">B</span>
          <div>
            <h1 className="font-semibold text-slate-900">Provider Portal</h1>
            <p className="text-xs text-slate-500">For screened Baseline providers</p>
          </div>
        </div>
        <ProviderLoginForm />
        <p className="mt-5 border-t border-slate-100 pt-4 text-xs text-slate-500">
          Portal accounts are issued when your application is approved. Haven&apos;t applied yet?{" "}
          <Link href="/providers" className="font-medium text-teal-700 hover:text-teal-800">
            Apply to become a provider
          </Link>
          .
        </p>
      </section>
    </div>
  );
}
