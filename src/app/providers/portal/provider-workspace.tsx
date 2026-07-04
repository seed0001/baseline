"use client";

import { useMemo, useState, useTransition } from "react";
import type { ProviderActivity, ProviderService, ProviderTool } from "@/lib/provider-workspace";
import type { ChatMessage } from "@/lib/ai";
import type { ProviderPersona, ProviderPersonaKey } from "@/lib/provider-personas";
import { signOutProvider } from "./actions";
import { saveCatalogService } from "./workspace-actions";
import { ProviderAiTeam } from "./provider-ai-team";

type Tab = "home" | "catalog" | "tools" | "jobs" | "activity";

type ServiceDraft = Omit<ProviderService, "id" | "updatedAt"> & { id?: string };

function lines(value: string) {
  return value.split("\n").map((item) => item.trim()).filter(Boolean);
}

export function ProviderWorkspace({
  businessName,
  services: initialServices,
  tools,
  activity,
  personas,
  initialHistories,
}: {
  businessName: string;
  services: ProviderService[];
  tools: ProviderTool[];
  activity: ProviderActivity[];
  personas: ProviderPersona[];
  initialHistories: Record<ProviderPersonaKey, ChatMessage[]>;
}) {
  const [tab, setTab] = useState<Tab>("home");
  const [services, setServices] = useState(initialServices);
  const [draft, setDraft] = useState<ServiceDraft | null>(null);
  const [notice, setNotice] = useState("");
  const [pending, startTransition] = useTransition();
  const published = services.filter((service) => service.status === "published").length;

  const navigation: { id: Tab; label: string; icon: string }[] = [
    { id: "home", label: "AI", icon: "✦" },
    { id: "catalog", label: "Catalog", icon: "▦" },
    { id: "tools", label: "Tools", icon: "⌁" },
    { id: "jobs", label: "Jobs", icon: "✓" },
    { id: "activity", label: "Activity", icon: "◷" },
  ];

  function save(status: "draft" | "published") {
    if (!draft) return;
    startTransition(async () => {
      try {
        const saved = await saveCatalogService({ ...draft, status });
        setServices((current) => [saved, ...current.filter((item) => item.id !== saved.id)]);
        setDraft(null);
        setNotice(status === "published" ? "Service published to your catalog." : "Draft saved.");
        setTab("catalog");
      } catch (error) {
        setNotice(error instanceof Error ? error.message : "The service could not be saved.");
      }
    });
  }

  const title = useMemo(() => ({
    home: `Good to see you, ${businessName}`,
    catalog: "Your service catalog",
    tools: "Business tools",
    jobs: "Customers and jobs",
    activity: "Workspace activity",
  }[tab]), [tab, businessName]);

  return (
    <div className="min-h-[calc(100vh-4rem)] bg-slate-50 pb-20 lg:pb-5">
      <div className="border-b border-slate-200 bg-white">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3 sm:px-5">
          <div>
            <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-teal-700">Provider workspace</p>
            <h1 className="mt-0.5 text-lg font-semibold text-slate-950">{title}</h1>
          </div>
          <div className="flex items-center gap-2">
            <div className="rounded-full bg-emerald-50 px-3 py-1 text-xs font-semibold text-emerald-700">{published} live</div>
            <form action={signOutProvider}><button className="hidden rounded-lg px-3 py-2 text-xs font-semibold text-slate-500 hover:bg-slate-100 sm:block">Sign out</button></form>
          </div>
        </div>
      </div>

      <div className="mx-auto grid max-w-6xl gap-5 px-4 py-4 sm:px-5 lg:grid-cols-[190px_1fr]">
        <aside className="hidden lg:block">
          <nav className="space-y-1 rounded-xl border border-slate-200 bg-white p-1.5">
            {navigation.map((item) => (
              <button key={item.id} onClick={() => setTab(item.id)}
                className={`flex w-full items-center gap-2.5 rounded-lg px-3 py-2.5 text-left text-sm font-medium ${tab === item.id ? "bg-teal-700 text-white" : "text-slate-600 hover:bg-slate-50"}`}>
                <span>{item.icon}</span>{item.label}
              </button>
            ))}
          </nav>
        </aside>

        <main>
          {notice && <div className="mb-3 rounded-lg border border-teal-200 bg-teal-50 px-3 py-2 text-sm text-teal-900">{notice}</div>}

          {tab === "home" && (
            <ProviderAiTeam
              initialPersonas={personas}
              initialHistories={initialHistories}
              onDraft={(generated) => {
                setDraft(generated);
                setNotice("AI draft ready. Review the structured details before saving.");
              }}
            />
          )}

          {tab === "catalog" && (
            <section>
              <div className="flex items-center justify-between">
                <p className="text-sm text-slate-500">{services.length} services · {published} published</p>
                <button onClick={() => setTab("home")}
                  className="rounded-lg bg-teal-700 px-3.5 py-2 text-sm font-semibold text-white">+ Build service</button>
              </div>
              <div className="mt-3 grid gap-3 xl:grid-cols-2">
                {services.map((service) => (
                  <button key={service.id} onClick={() => setDraft({ ...service })}
                    className="rounded-xl border border-slate-200 bg-white p-4 text-left shadow-sm">
                    <div className="flex justify-between gap-3">
                      <div><h3 className="font-semibold text-slate-900">{service.name}</h3>
                        <p className="mt-1 line-clamp-2 text-sm text-slate-500">{service.description}</p></div>
                      <span className={`h-fit rounded-full px-2.5 py-1 text-xs font-semibold ${service.status === "published" ? "bg-emerald-50 text-emerald-700" : "bg-amber-50 text-amber-700"}`}>{service.status}</span>
                    </div>
                    <div className="mt-3 flex gap-4 text-xs text-slate-500">
                      <span>{service.scopeItems.length} scope items</span><span>{service.requiredInfo.length} intake questions</span>
                    </div>
                  </button>
                ))}
                {services.length === 0 && <div className="rounded-xl border border-dashed border-slate-300 bg-white p-7 text-center text-sm text-slate-500">Your first AI-built service will appear here.</div>}
              </div>
            </section>
          )}

          {tab === "tools" && <EmptyState title="Build tools around your work" body="Create mobile checklists, customer forms, calculators, inventory trackers, and follow-up workflows. The tool builder is the next module connected to this workspace." items={tools.map((tool) => tool.name)} />}
          {tab === "jobs" && <EmptyState title="Jobs will start from your catalog" body="Customer requests, photos, estimates, milestones, and payments will be managed here from the same mobile workspace." items={[]} />}
          {tab === "activity" && (
            <div className="space-y-2">
              {activity.map((item) => <div key={item.id} className="rounded-xl border border-slate-200 bg-white p-3">
                <div className="flex justify-between gap-4"><p className="font-medium text-slate-900">{item.action}</p><time className="text-xs text-slate-400">{new Date(item.createdAt).toLocaleDateString()}</time></div>
                <p className="mt-1 text-sm text-slate-600">{item.subject}</p></div>)}
              {activity.length === 0 && <EmptyState title="No activity yet" body="Drafts, publications, and AI-approved changes will be recorded here." items={[]} />}
            </div>
          )}
        </main>
      </div>

      {draft && <ServiceEditor draft={draft} setDraft={setDraft} pending={pending} onSave={save} onClose={() => setDraft(null)} />}

      <nav className="fixed inset-x-0 bottom-0 z-30 grid grid-cols-5 border-t border-slate-200 bg-white px-1 pb-[max(.4rem,env(safe-area-inset-bottom))] pt-2 shadow-2xl lg:hidden">
        {navigation.map((item) => <button key={item.id} onClick={() => setTab(item.id)}
          className={`flex flex-col items-center gap-1 py-1 text-[11px] font-medium ${tab === item.id ? "text-teal-700" : "text-slate-400"}`}>
          <span className="text-lg">{item.icon}</span>{item.label}</button>)}
      </nav>
    </div>
  );
}

function EmptyState({ title, body, items }: { title: string; body: string; items: string[] }) {
  return <section className="rounded-2xl border border-slate-200 bg-white p-5 sm:p-6">
    <h2 className="text-lg font-semibold text-slate-900">{title}</h2><p className="mt-1.5 max-w-xl text-sm text-slate-500">{body}</p>
    {items.length > 0 && <ul className="mt-4 space-y-2">{items.map((item) => <li key={item} className="rounded-lg bg-slate-50 p-2.5 text-sm">{item}</li>)}</ul>}
  </section>;
}

function ServiceEditor({ draft, setDraft, pending, onSave, onClose }: {
  draft: ServiceDraft;
  setDraft: React.Dispatch<React.SetStateAction<ServiceDraft | null>>;
  pending: boolean; onSave: (status: "draft" | "published") => void; onClose: () => void;
}) {
  const update = <K extends keyof typeof draft>(key: K, value: (typeof draft)[K]) => setDraft((current) => current ? { ...current, [key]: value } : null);
  return <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-950/50 p-0 sm:p-4">
    <div className="ml-auto min-h-full w-full max-w-2xl bg-white p-4 shadow-2xl sm:min-h-0 sm:rounded-2xl sm:p-6">
      <div className="flex items-center justify-between"><div><p className="text-xs font-bold uppercase tracking-wider text-teal-700">Review before applying</p><h2 className="mt-1 text-xl font-semibold">Service draft</h2></div>
        <button onClick={onClose} className="h-10 w-10 rounded-full bg-slate-100 text-xl">×</button></div>
      <div className="mt-4 space-y-4">
        <Field label="Service name"><input value={draft.name} onChange={(e) => update("name", e.target.value)} className="input" /></Field>
        <Field label="Customer-facing description"><textarea value={draft.description} onChange={(e) => update("description", e.target.value)} className="input min-h-20" /></Field>
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Starting price"><input type="number" value={draft.priceAmount ?? ""} onChange={(e) => update("priceAmount", e.target.value ? Number(e.target.value) : null)} className="input" /></Field>
          <Field label="Pricing method"><select value={draft.priceType} onChange={(e) => update("priceType", e.target.value as typeof draft.priceType)} className="input"><option value="starting_at">Starting at</option><option value="fixed">Fixed</option><option value="estimate">Estimate</option><option value="hourly">Hourly</option><option value="custom">Custom quote</option></select></Field>
        </div>
        <Field label="What’s included (one per line)"><textarea value={draft.scopeItems.join("\n")} onChange={(e) => update("scopeItems", lines(e.target.value))} className="input min-h-20" /></Field>
        <Field label="What’s excluded (one per line)"><textarea value={draft.exclusions.join("\n")} onChange={(e) => update("exclusions", lines(e.target.value))} className="input min-h-20" /></Field>
        <Field label="Customer information required"><textarea value={draft.requiredInfo.join("\n")} onChange={(e) => update("requiredInfo", lines(e.target.value))} className="input min-h-20" /></Field>
        <Field label="Required photos"><textarea value={draft.requiredPhotos.join("\n")} onChange={(e) => update("requiredPhotos", lines(e.target.value))} className="input min-h-20" /></Field>
        <Field label="Expected duration"><input value={draft.duration} onChange={(e) => update("duration", e.target.value)} className="input" /></Field>
      </div>
      <div className="sticky bottom-0 mt-5 flex gap-3 border-t border-slate-200 bg-white py-3">
        <button disabled={pending || !draft.name.trim()} onClick={() => onSave("draft")} className="flex-1 rounded-lg border border-slate-300 px-4 py-2.5 text-sm font-semibold disabled:opacity-50">Save draft</button>
        <button disabled={pending || !draft.name.trim()} onClick={() => onSave("published")} className="flex-1 rounded-lg bg-teal-700 px-4 py-2.5 text-sm font-semibold text-white disabled:opacity-50">{pending ? "Saving…" : "Approve & publish"}</button>
      </div>
    </div>
  </div>;
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return <label className="block"><span className="mb-1.5 block text-sm font-semibold text-slate-700">{label}</span>{children}</label>;
}
