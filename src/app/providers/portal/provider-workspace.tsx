"use client";

import { useMemo, useState, useTransition } from "react";
import type { ProviderActivity, ProviderService, ProviderTool } from "@/lib/provider-workspace";
import { signOutProvider } from "./actions";
import { generateCatalogDraft, saveCatalogService } from "./workspace-actions";

type Tab = "home" | "catalog" | "tools" | "jobs" | "activity";

type VoiceRecognition = {
  continuous: boolean;
  interimResults: boolean;
  lang: string;
  start(): void;
  stop(): void;
  onresult: (event: { results: ArrayLike<{ 0: { transcript: string } }> }) => void;
  onend: () => void;
  onerror: () => void;
};

type VoiceWindow = Window & {
  SpeechRecognition?: new () => VoiceRecognition;
  webkitSpeechRecognition?: new () => VoiceRecognition;
};

type ServiceDraft = Omit<ProviderService, "id" | "updatedAt"> & { id?: string };

function lines(value: string) {
  return value.split("\n").map((item) => item.trim()).filter(Boolean);
}

export function ProviderWorkspace({
  businessName,
  services: initialServices,
  tools,
  activity,
}: {
  businessName: string;
  services: ProviderService[];
  tools: ProviderTool[];
  activity: ProviderActivity[];
}) {
  const [tab, setTab] = useState<Tab>("home");
  const [services, setServices] = useState(initialServices);
  const [prompt, setPrompt] = useState("");
  const [draft, setDraft] = useState<ServiceDraft | null>(null);
  const [listening, setListening] = useState(false);
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

  function listen() {
    const voiceWindow = window as VoiceWindow;
    const SpeechRecognition =
      voiceWindow.SpeechRecognition || voiceWindow.webkitSpeechRecognition;
    if (!SpeechRecognition) {
      setNotice("Voice input is not available in this browser. You can type the same request.");
      return;
    }
    const recognition = new SpeechRecognition();
    recognition.continuous = false;
    recognition.interimResults = false;
    recognition.lang = "en-US";
    recognition.onresult = (event) => setPrompt(event.results[0][0].transcript);
    recognition.onend = () => setListening(false);
    recognition.onerror = () => {
      setListening(false);
      setNotice("I couldn't hear that. Try again or type your request.");
    };
    setListening(true);
    recognition.start();
  }

  function buildDraft() {
    if (!prompt.trim()) return;
    startTransition(async () => {
      try {
        const generated = await generateCatalogDraft(prompt);
        setDraft(generated);
        setNotice("AI draft ready. Review the structured details before saving.");
      } catch (error) {
        setNotice(error instanceof Error ? error.message : "The AI could not build that draft.");
      }
    });
  }

  function save(status: "draft" | "published") {
    if (!draft) return;
    startTransition(async () => {
      try {
        const saved = await saveCatalogService({ ...draft, status });
        setServices((current) => [saved, ...current.filter((item) => item.id !== saved.id)]);
        setDraft(null);
        setPrompt("");
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
    <div className="min-h-[calc(100vh-4rem)] bg-slate-50 pb-24 lg:pb-8">
      <div className="border-b border-slate-200 bg-white">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-4 sm:px-6">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.2em] text-teal-700">Provider workspace</p>
            <h1 className="mt-1 text-xl font-semibold text-slate-950">{title}</h1>
          </div>
          <div className="flex items-center gap-2">
            <div className="rounded-full bg-emerald-50 px-3 py-1 text-xs font-semibold text-emerald-700">{published} live</div>
            <form action={signOutProvider}><button className="hidden rounded-lg px-3 py-2 text-xs font-semibold text-slate-500 hover:bg-slate-100 sm:block">Sign out</button></form>
          </div>
        </div>
      </div>

      <div className="mx-auto grid max-w-7xl gap-8 px-4 py-6 sm:px-6 lg:grid-cols-[220px_1fr]">
        <aside className="hidden lg:block">
          <nav className="space-y-1 rounded-2xl border border-slate-200 bg-white p-2">
            {navigation.map((item) => (
              <button key={item.id} onClick={() => setTab(item.id)}
                className={`flex w-full items-center gap-3 rounded-xl px-3 py-3 text-left text-sm font-medium ${tab === item.id ? "bg-teal-700 text-white" : "text-slate-600 hover:bg-slate-50"}`}>
                <span>{item.icon}</span>{item.label}
              </button>
            ))}
          </nav>
        </aside>

        <main>
          {notice && <div className="mb-4 rounded-xl border border-teal-200 bg-teal-50 px-4 py-3 text-sm text-teal-900">{notice}</div>}

          {tab === "home" && (
            <div className="space-y-5">
              <section className="overflow-hidden rounded-3xl bg-gradient-to-br from-teal-900 via-teal-800 to-cyan-700 p-5 text-white shadow-lg sm:p-8">
                <p className="text-sm text-teal-100">Tell Baseline what you need to build or manage.</p>
                <h2 className="mt-2 max-w-2xl text-2xl font-semibold sm:text-3xl">What are we working on?</h2>
                <div className="mt-6 rounded-2xl bg-white p-2 shadow-xl">
                  <textarea value={prompt} onChange={(event) => setPrompt(event.target.value)}
                    placeholder="Try: Add a water heater installation service starting at $1,500..."
                    className="min-h-28 w-full resize-none rounded-xl px-3 py-3 text-base text-slate-900 outline-none placeholder:text-slate-400" />
                  <div className="flex items-center justify-between gap-2 px-1 pb-1">
                    <button onClick={listen} type="button"
                      className={`flex h-12 w-12 items-center justify-center rounded-full text-xl ${listening ? "animate-pulse bg-red-500 text-white" : "bg-slate-100 text-slate-700"}`}
                      aria-label="Speak your request">●</button>
                    <button onClick={buildDraft} disabled={!prompt.trim() || pending}
                      className="rounded-xl bg-teal-700 px-5 py-3 text-sm font-semibold text-white disabled:bg-slate-300">
                      {pending ? "Building…" : "Build with AI"}
                    </button>
                  </div>
                </div>
                <p className="mt-3 text-xs text-teal-100">Nothing changes until you review and approve it.</p>
              </section>

              <div className="grid gap-3 sm:grid-cols-3">
                {[
                  ["Build a service", "Create scope, intake, photos, and pricing.", "catalog"],
                  ["Create a business tool", "Start a checklist, form, or calculator.", "tools"],
                  ["Manage today’s work", "Review customers, jobs, and next actions.", "jobs"],
                ].map(([heading, body, target]) => (
                  <button key={heading} onClick={() => target === "catalog" ? setPrompt("Add a new service for ") : setTab(target as Tab)}
                    className="rounded-2xl border border-slate-200 bg-white p-5 text-left shadow-sm hover:border-teal-300">
                    <h3 className="font-semibold text-slate-900">{heading}</h3>
                    <p className="mt-1 text-sm text-slate-500">{body}</p>
                  </button>
                ))}
              </div>
            </div>
          )}

          {tab === "catalog" && (
            <section>
              <div className="flex items-center justify-between">
                <p className="text-sm text-slate-500">{services.length} services · {published} published</p>
                <button onClick={() => { setTab("home"); setPrompt("Add a new service for "); }}
                  className="rounded-xl bg-teal-700 px-4 py-2.5 text-sm font-semibold text-white">+ Build service</button>
              </div>
              <div className="mt-4 grid gap-4 xl:grid-cols-2">
                {services.map((service) => (
                  <button key={service.id} onClick={() => setDraft({ ...service })}
                    className="rounded-2xl border border-slate-200 bg-white p-5 text-left shadow-sm">
                    <div className="flex justify-between gap-3">
                      <div><h3 className="font-semibold text-slate-900">{service.name}</h3>
                        <p className="mt-1 line-clamp-2 text-sm text-slate-500">{service.description}</p></div>
                      <span className={`h-fit rounded-full px-2.5 py-1 text-xs font-semibold ${service.status === "published" ? "bg-emerald-50 text-emerald-700" : "bg-amber-50 text-amber-700"}`}>{service.status}</span>
                    </div>
                    <div className="mt-4 flex gap-4 text-xs text-slate-500">
                      <span>{service.scopeItems.length} scope items</span><span>{service.requiredInfo.length} intake questions</span>
                    </div>
                  </button>
                ))}
                {services.length === 0 && <div className="rounded-2xl border border-dashed border-slate-300 bg-white p-10 text-center text-sm text-slate-500">Your first AI-built service will appear here.</div>}
              </div>
            </section>
          )}

          {tab === "tools" && <EmptyState title="Build tools around your work" body="Create mobile checklists, customer forms, calculators, inventory trackers, and follow-up workflows. The tool builder is the next module connected to this workspace." items={tools.map((tool) => tool.name)} />}
          {tab === "jobs" && <EmptyState title="Jobs will start from your catalog" body="Customer requests, photos, estimates, milestones, and payments will be managed here from the same mobile workspace." items={[]} />}
          {tab === "activity" && (
            <div className="space-y-3">
              {activity.map((item) => <div key={item.id} className="rounded-2xl border border-slate-200 bg-white p-4">
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
  return <section className="rounded-3xl border border-slate-200 bg-white p-6 sm:p-10">
    <h2 className="text-xl font-semibold text-slate-900">{title}</h2><p className="mt-2 max-w-xl text-sm text-slate-500">{body}</p>
    {items.length > 0 && <ul className="mt-5 space-y-2">{items.map((item) => <li key={item} className="rounded-xl bg-slate-50 p-3 text-sm">{item}</li>)}</ul>}
  </section>;
}

function ServiceEditor({ draft, setDraft, pending, onSave, onClose }: {
  draft: ServiceDraft;
  setDraft: React.Dispatch<React.SetStateAction<ServiceDraft | null>>;
  pending: boolean; onSave: (status: "draft" | "published") => void; onClose: () => void;
}) {
  const update = <K extends keyof typeof draft>(key: K, value: (typeof draft)[K]) => setDraft((current) => current ? { ...current, [key]: value } : null);
  return <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-950/50 p-0 sm:p-6">
    <div className="ml-auto min-h-full w-full max-w-2xl bg-white p-5 shadow-2xl sm:min-h-0 sm:rounded-3xl sm:p-8">
      <div className="flex items-center justify-between"><div><p className="text-xs font-bold uppercase tracking-wider text-teal-700">Review before applying</p><h2 className="mt-1 text-xl font-semibold">Service draft</h2></div>
        <button onClick={onClose} className="h-10 w-10 rounded-full bg-slate-100 text-xl">×</button></div>
      <div className="mt-6 space-y-5">
        <Field label="Service name"><input value={draft.name} onChange={(e) => update("name", e.target.value)} className="input" /></Field>
        <Field label="Customer-facing description"><textarea value={draft.description} onChange={(e) => update("description", e.target.value)} className="input min-h-24" /></Field>
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Starting price"><input type="number" value={draft.priceAmount ?? ""} onChange={(e) => update("priceAmount", e.target.value ? Number(e.target.value) : null)} className="input" /></Field>
          <Field label="Pricing method"><select value={draft.priceType} onChange={(e) => update("priceType", e.target.value as typeof draft.priceType)} className="input"><option value="starting_at">Starting at</option><option value="fixed">Fixed</option><option value="estimate">Estimate</option><option value="hourly">Hourly</option><option value="custom">Custom quote</option></select></Field>
        </div>
        <Field label="What’s included (one per line)"><textarea value={draft.scopeItems.join("\n")} onChange={(e) => update("scopeItems", lines(e.target.value))} className="input min-h-28" /></Field>
        <Field label="What’s excluded (one per line)"><textarea value={draft.exclusions.join("\n")} onChange={(e) => update("exclusions", lines(e.target.value))} className="input min-h-20" /></Field>
        <Field label="Customer information required"><textarea value={draft.requiredInfo.join("\n")} onChange={(e) => update("requiredInfo", lines(e.target.value))} className="input min-h-24" /></Field>
        <Field label="Required photos"><textarea value={draft.requiredPhotos.join("\n")} onChange={(e) => update("requiredPhotos", lines(e.target.value))} className="input min-h-24" /></Field>
        <Field label="Expected duration"><input value={draft.duration} onChange={(e) => update("duration", e.target.value)} className="input" /></Field>
      </div>
      <div className="sticky bottom-0 mt-8 flex gap-3 border-t border-slate-200 bg-white py-4">
        <button disabled={pending || !draft.name.trim()} onClick={() => onSave("draft")} className="flex-1 rounded-xl border border-slate-300 px-4 py-3 text-sm font-semibold disabled:opacity-50">Save draft</button>
        <button disabled={pending || !draft.name.trim()} onClick={() => onSave("published")} className="flex-1 rounded-xl bg-teal-700 px-4 py-3 text-sm font-semibold text-white disabled:opacity-50">{pending ? "Saving…" : "Approve & publish"}</button>
      </div>
    </div>
  </div>;
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return <label className="block"><span className="mb-1.5 block text-sm font-semibold text-slate-700">{label}</span>{children}</label>;
}
