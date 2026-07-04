import { redirect } from "next/navigation";
import { getCurrentEmployee } from "@/lib/employee-auth";
import { LoginForm } from "./login-form";

export const metadata = { title: "Staff Sign In — Baseline" };
export const dynamic = "force-dynamic";

export default async function StaffLoginPage() {
  if (await getCurrentEmployee()) redirect("/admin");

  return (
    <div className="mx-auto flex min-h-[70vh] max-w-md items-center px-4 py-12">
      <section className="w-full rounded-2xl border border-slate-200 bg-white p-7 shadow-sm">
        <div className="flex items-center gap-2.5">
          <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-teal-700 font-bold text-white">B</span>
          <div>
            <h1 className="font-semibold text-slate-900">Baseline Operations</h1>
            <p className="text-xs text-slate-500">Authorized employees only</p>
          </div>
        </div>
        <LoginForm />
      </section>
    </div>
  );
}
