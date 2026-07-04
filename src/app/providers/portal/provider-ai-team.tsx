"use client";

import { useState, useTransition } from "react";
import type { ChatMessage } from "@/lib/ai";
import type { ProviderPersona, ProviderPersonaKey } from "@/lib/provider-personas";
import type { ProviderService } from "@/lib/provider-workspace";
import {
  generateCatalogDraft,
  sendPersonaMessage,
  updatePersonaSettings,
} from "./workspace-actions";

type ServiceDraft = Omit<ProviderService, "id" | "updatedAt"> & { id?: string };
type Mode = "chat" | "build";
type VoiceRecognition = {
  continuous: boolean;
  interimResults: boolean;
  lang: string;
  start(): void;
  onresult: (event: { results: ArrayLike<{ 0: { transcript: string } }> }) => void;
  onend: () => void;
  onerror: () => void;
};
type VoiceWindow = Window & {
  SpeechRecognition?: new () => VoiceRecognition;
  webkitSpeechRecognition?: new () => VoiceRecognition;
};

export function ProviderAiTeam({
  initialPersonas,
  initialHistories,
  initialMode = "chat",
  onDraft,
}: {
  initialPersonas: ProviderPersona[];
  initialHistories: Record<ProviderPersonaKey, ChatMessage[]>;
  initialMode?: Mode;
  onDraft: (draft: ServiceDraft) => void;
}) {
  const [personas, setPersonas] = useState(initialPersonas);
  const [histories, setHistories] = useState(initialHistories);
  const [selectedKey, setSelectedKey] = useState<ProviderPersonaKey>("manager");
  const [mode, setMode] = useState<Mode>(initialMode);
  const [prompt, setPrompt] = useState("");
  const [notice, setNotice] = useState("");
  const [listening, setListening] = useState(false);
  const [editing, setEditing] = useState<ProviderPersona | null>(null);
  const [pending, startTransition] = useTransition();
  const persona = personas.find((item) => item.key === selectedKey) ?? personas[0];
  const messages = histories[selectedKey] ?? [];

  function listen() {
    const voiceWindow = window as VoiceWindow;
    const Recognition = voiceWindow.SpeechRecognition || voiceWindow.webkitSpeechRecognition;
    if (!Recognition) {
      setNotice("Voice input is unavailable in this browser. You can type the same request.");
      return;
    }
    const recognition = new Recognition();
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

  function submit() {
    const message = prompt.trim();
    if (!message || pending) return;
    setNotice("");
    if (mode === "build") {
      startTransition(async () => {
        try {
          const draft = await generateCatalogDraft(message);
          onDraft(draft);
          setPrompt("");
        } catch {
          setNotice("The service draft could not be created. Add more service detail and try again.");
        }
      });
      return;
    }

    setPrompt("");
    setHistories((current) => ({
      ...current,
      [selectedKey]: [...(current[selectedKey] ?? []), { role: "user", content: message }],
    }));
    startTransition(async () => {
      const result = await sendPersonaMessage(selectedKey, message);
      if (result.ok) {
        setHistories((current) => ({
          ...current,
          [selectedKey]: [...(current[selectedKey] ?? []), { role: "assistant", content: result.reply }],
        }));
      } else {
        setNotice(result.error);
      }
    });
  }

  return (
    <div className="space-y-3">
      {notice && <div className="rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 text-sm text-amber-900">{notice}</div>}
      <section className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
        <div className="flex items-center justify-between gap-3">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.18em] text-teal-700">Your AI team</p>
            <h2 className="mt-0.5 text-lg font-semibold text-slate-950">Who do you want to work with?</h2>
          </div>
          <button onClick={() => setEditing(persona)} className="rounded-xl border border-slate-200 px-3 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-50">
            Adjust persona
          </button>
        </div>
        <div className="mt-3 grid grid-cols-2 gap-2 lg:grid-cols-4">
          {personas.map((item) => (
            <button
              key={item.key}
              onClick={() => { setSelectedKey(item.key); setMode("chat"); setNotice(""); }}
              className={`rounded-xl border p-2.5 text-left transition ${selectedKey === item.key ? "border-teal-600 bg-teal-50 ring-1 ring-teal-600" : "border-slate-200 hover:border-slate-300"}`}
            >
              <div className="flex items-center gap-2">
                <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-white text-sm shadow-sm">{item.key === "manager" ? "◎" : item.key === "finance" ? "$" : item.key === "marketing" ? "◇" : "↗"}</span>
                <p className="text-sm font-semibold leading-tight text-slate-900">{item.displayName}</p>
              </div>
              <p className="mt-1.5 line-clamp-1 text-[11px] text-slate-500">{item.description}</p>
            </button>
          ))}
        </div>
      </section>

      <section className="overflow-hidden rounded-2xl bg-gradient-to-br from-teal-900 via-teal-800 to-cyan-700 text-white shadow-md">
        <div className="flex items-start justify-between gap-3 border-b border-white/15 px-4 py-3.5 sm:px-5">
          <div>
            <p className="font-semibold">{persona.displayName}</p>
            <p className="mt-0.5 text-xs text-teal-100">{persona.title}</p>
          </div>
          <div className="flex rounded-xl bg-black/15 p-1 text-xs font-semibold">
            <button onClick={() => setMode("chat")} className={`rounded-lg px-3 py-1.5 ${mode === "chat" ? "bg-white text-teal-900" : "text-teal-50"}`}>Conversation</button>
            <button onClick={() => setMode("build")} className={`rounded-lg px-3 py-1.5 ${mode === "build" ? "bg-white text-teal-900" : "text-teal-50"}`}>Build service</button>
          </div>
        </div>
        <div className="max-h-80 min-h-44 space-y-2.5 overflow-y-auto bg-slate-50 p-3 sm:p-4">
          {messages.length === 0 && (
            <div className="rounded-xl bg-white p-3 text-sm text-slate-600 shadow-sm">
              {mode === "chat"
                ? `I'm ${persona.displayName}. ${persona.description} What would you like to work through?`
                : "Describe a service you offer. I’ll create a structured draft for you to review."}
            </div>
          )}
          {messages.map((message, index) => (
            <div key={`${index}-${message.content.slice(0, 12)}`} className={message.role === "user" ? "flex justify-end" : "flex justify-start"}>
              <div className={`max-w-[88%] whitespace-pre-wrap rounded-xl px-3 py-2 text-sm ${message.role === "user" ? "rounded-br-sm bg-teal-700 text-white" : "rounded-bl-sm bg-white text-slate-700 shadow-sm"}`}>
                {message.content}
              </div>
            </div>
          ))}
          {pending && mode === "chat" && <div className="flex justify-start"><div className="rounded-xl bg-white px-3 py-2 text-sm text-slate-400 shadow-sm">Thinking…</div></div>}
        </div>
        <div className="bg-white p-2">
          <textarea
            value={prompt}
            onChange={(event) => setPrompt(event.target.value)}
            onKeyDown={(event) => {
              if (event.key === "Enter" && !event.shiftKey) {
                event.preventDefault();
                submit();
              }
            }}
            placeholder={mode === "chat" ? `Message ${persona.displayName}…` : "Describe the service, scope, and pricing you know…"}
            className="min-h-14 w-full resize-none rounded-lg px-3 py-2 text-sm text-slate-900 outline-none placeholder:text-slate-400"
          />
          <div className="flex items-center justify-between px-1 pb-1">
            <button onClick={listen} type="button" aria-label="Speak your message" className={`flex h-10 w-10 items-center justify-center rounded-full text-base ${listening ? "animate-pulse bg-red-500 text-white" : "bg-slate-100 text-slate-700"}`}>●</button>
            <button onClick={submit} disabled={pending || !prompt.trim()} className="rounded-lg bg-teal-700 px-4 py-2.5 text-sm font-semibold text-white disabled:bg-slate-300">
              {pending ? "Working…" : mode === "chat" ? "Send" : "Create draft"}
            </button>
          </div>
        </div>
        <p className="px-4 py-2 text-[11px] text-teal-100 sm:px-5">Conversation is separate from actions. Nothing is published or sent without approval.</p>
      </section>

      {editing && (
        <PersonaEditor
          persona={editing}
          pending={pending}
          onClose={() => setEditing(null)}
          onSave={(updated) => startTransition(async () => {
            const result = await updatePersonaSettings(updated);
            if (result.ok) {
              setPersonas((current) => current.map((item) => item.key === updated.key ? { ...item, ...updated } : item));
              setEditing(null);
              setNotice("Persona updated.");
            } else {
              setNotice(result.error);
            }
          })}
        />
      )}
    </div>
  );
}

function PersonaEditor({
  persona,
  pending,
  onClose,
  onSave,
}: {
  persona: ProviderPersona;
  pending: boolean;
  onClose: () => void;
  onSave: (persona: Pick<ProviderPersona, "key" | "displayName" | "communicationStyle" | "customInstructions">) => void;
}) {
  const [displayName, setDisplayName] = useState(persona.displayName);
  const [communicationStyle, setCommunicationStyle] = useState(persona.communicationStyle);
  const [customInstructions, setCustomInstructions] = useState(persona.customInstructions);
  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-950/50 p-3 sm:p-6">
      <div className="mx-auto max-w-xl rounded-2xl bg-white p-5 text-slate-900 shadow-2xl sm:p-6">
        <div className="flex justify-between gap-4">
          <div><p className="text-xs font-bold uppercase tracking-wider text-teal-700">Adjust persona</p><h2 className="mt-1 text-xl font-semibold">{persona.title}</h2></div>
          <button onClick={onClose} className="h-10 w-10 rounded-full bg-slate-100 text-xl">×</button>
        </div>
        <div className="mt-5 space-y-4">
          <label className="block"><span className="mb-1.5 block text-sm font-semibold">Specialist name</span><input className="input" value={displayName} onChange={(event) => setDisplayName(event.target.value)} /></label>
          <label className="block"><span className="mb-1.5 block text-sm font-semibold">Communication style</span><textarea className="input min-h-24" value={communicationStyle} onChange={(event) => setCommunicationStyle(event.target.value)} /></label>
          <label className="block"><span className="mb-1.5 block text-sm font-semibold">Additional instructions</span><textarea className="input min-h-32" value={customInstructions} onChange={(event) => setCustomInstructions(event.target.value)} placeholder="Example: Keep answers short and finish with the next three actions." /></label>
        </div>
        <div className="mt-5 flex gap-3">
          <button onClick={onClose} className="flex-1 rounded-lg border border-slate-300 px-4 py-2.5 text-sm font-semibold">Cancel</button>
          <button disabled={pending || displayName.trim().length < 2} onClick={() => onSave({ key: persona.key, displayName, communicationStyle, customInstructions })} className="flex-1 rounded-lg bg-teal-700 px-4 py-2.5 text-sm font-semibold text-white disabled:opacity-50">{pending ? "Saving…" : "Save persona"}</button>
        </div>
      </div>
    </div>
  );
}
