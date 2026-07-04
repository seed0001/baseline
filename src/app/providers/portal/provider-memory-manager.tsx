"use client";

import { useState, useTransition } from "react";
import {
  providerMemoryCategories,
  type ProviderMemory,
  type ProviderMemoryCategory,
} from "@/lib/provider-memory-types";
import { removeAllMemories, removeMemory, saveMemory } from "./workspace-actions";

type MemoryEditor = {
  id?: string;
  category: ProviderMemoryCategory;
  content: string;
  pinned: boolean;
};

const categoryLabels: Record<ProviderMemoryCategory, string> = {
  business: "Business",
  preferences: "Preferences",
  customers: "Customers",
  pricing: "Pricing",
  other: "Other",
};

function sortMemories(items: ProviderMemory[]) {
  return [...items].sort((a, b) =>
    a.pinned === b.pinned ? b.updatedAt.localeCompare(a.updatedAt) : a.pinned ? -1 : 1,
  );
}

export function ProviderMemoryManager({
  memories,
  onChange,
  onClose,
}: {
  memories: ProviderMemory[];
  onChange: (memories: ProviderMemory[]) => void;
  onClose: () => void;
}) {
  const [editor, setEditor] = useState<MemoryEditor | null>(null);
  const [confirmDelete, setConfirmDelete] = useState<string | null>(null);
  const [notice, setNotice] = useState("");
  const [pending, startTransition] = useTransition();

  function save(input: MemoryEditor) {
    startTransition(async () => {
      const result = await saveMemory(input);
      if (result.ok) {
        onChange(sortMemories([
          result.memory,
          ...memories.filter((item) => item.id !== result.memory.id),
        ]));
        setEditor(null);
        setNotice("");
      } else {
        setNotice(result.error);
      }
    });
  }

  function togglePin(memory: ProviderMemory) {
    save({
      id: memory.id,
      category: memory.category as ProviderMemoryCategory,
      content: memory.content,
      pinned: !memory.pinned,
    });
  }

  function remove(memoryId: string) {
    if (confirmDelete !== memoryId) {
      setConfirmDelete(memoryId);
      return;
    }
    startTransition(async () => {
      const result = memoryId === "all" ? await removeAllMemories() : await removeMemory(memoryId);
      if (result.ok) {
        onChange(memoryId === "all" ? [] : memories.filter((item) => item.id !== memoryId));
        setNotice("");
      } else {
        setNotice(result.error);
      }
      setConfirmDelete(null);
    });
  }

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-950/50 p-3 sm:p-6">
      <div className="mx-auto max-w-2xl rounded-2xl bg-white p-5 text-slate-900 shadow-2xl sm:p-6">
        <div className="flex justify-between gap-4">
          <div>
            <p className="text-xs font-bold uppercase tracking-wider text-teal-700">AI memory</p>
            <h2 className="mt-1 text-xl font-semibold">What your AI team remembers</h2>
            <p className="mt-1.5 max-w-md text-sm text-slate-500">
              These approved notes are shared with all of your specialists on every conversation.
              Pinned memories are always included first. Nothing is saved here without you.
            </p>
          </div>
          <button onClick={onClose} className="h-10 w-10 shrink-0 rounded-full bg-slate-100 text-xl">×</button>
        </div>

        {notice && <div className="mt-4 rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 text-sm text-amber-900">{notice}</div>}

        <div className="mt-4 flex items-center justify-between gap-3">
          <p className="text-sm text-slate-500">{memories.length === 1 ? "1 memory" : `${memories.length} memories`}</p>
          <button
            onClick={() => { setEditor({ category: "business", content: "", pinned: false }); setConfirmDelete(null); }}
            className="rounded-lg bg-teal-700 px-3.5 py-2 text-sm font-semibold text-white"
          >
            + Add memory
          </button>
        </div>

        {editor && !editor.id && (
          <MemoryForm editor={editor} pending={pending} onCancel={() => setEditor(null)} onSave={save} />
        )}

        <div className="mt-3 space-y-2">
          {memories.map((memory) =>
            editor?.id === memory.id ? (
              <MemoryForm key={memory.id} editor={editor} pending={pending} onCancel={() => setEditor(null)} onSave={save} />
            ) : (
              <div key={memory.id} className="rounded-xl border border-slate-200 bg-white p-3">
                <div className="flex items-start justify-between gap-3">
                  <p className="whitespace-pre-wrap text-sm text-slate-700">{memory.content}</p>
                  <button
                    onClick={() => togglePin(memory)}
                    disabled={pending}
                    aria-label={memory.pinned ? "Unpin memory" : "Pin memory"}
                    title={memory.pinned ? "Unpin memory" : "Pin memory"}
                    className={`shrink-0 text-lg leading-none ${memory.pinned ? "text-amber-500" : "text-slate-300 hover:text-slate-400"}`}
                  >
                    ★
                  </button>
                </div>
                <div className="mt-2.5 flex items-center justify-between gap-3">
                  <span className="rounded-full bg-slate-100 px-2.5 py-1 text-[11px] font-semibold text-slate-600">
                    {categoryLabels[memory.category as ProviderMemoryCategory] ?? memory.category}
                  </span>
                  <div className="flex gap-2 text-xs font-semibold">
                    <button
                      onClick={() => {
                        setEditor({
                          id: memory.id,
                          category: (providerMemoryCategories as readonly string[]).includes(memory.category)
                            ? (memory.category as ProviderMemoryCategory)
                            : "other",
                          content: memory.content,
                          pinned: memory.pinned,
                        });
                        setConfirmDelete(null);
                      }}
                      className="rounded-lg border border-slate-200 px-3 py-1.5 text-slate-600 hover:bg-slate-50"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => remove(memory.id)}
                      disabled={pending}
                      className={`rounded-lg px-3 py-1.5 ${confirmDelete === memory.id ? "bg-red-600 text-white" : "border border-slate-200 text-red-600 hover:bg-red-50"}`}
                    >
                      {confirmDelete === memory.id ? (pending ? "Deleting…" : "Confirm delete") : "Delete"}
                    </button>
                  </div>
                </div>
              </div>
            ),
          )}
          {memories.length === 0 && !editor && (
            <div className="rounded-xl border border-dashed border-slate-300 bg-slate-50 p-6 text-center text-sm text-slate-500">
              No memories yet. Add facts about your business, preferences, or customers that your AI
              team should always keep in mind.
            </div>
          )}
        </div>

        {memories.length > 0 && (
          <div className="mt-5 flex items-center justify-between gap-3 border-t border-slate-200 pt-4">
            <p className="text-xs text-slate-400">Your specialists read your pinned memories first, then the most recent.</p>
            <button
              onClick={() => remove("all")}
              disabled={pending}
              className={`shrink-0 rounded-lg px-3 py-2 text-xs font-semibold ${confirmDelete === "all" ? "bg-red-600 text-white" : "border border-slate-200 text-red-600 hover:bg-red-50"}`}
            >
              {confirmDelete === "all" ? (pending ? "Deleting…" : "Confirm delete all") : "Delete all memories"}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

function MemoryForm({
  editor,
  pending,
  onCancel,
  onSave,
}: {
  editor: MemoryEditor;
  pending: boolean;
  onCancel: () => void;
  onSave: (editor: MemoryEditor) => void;
}) {
  const [category, setCategory] = useState(editor.category);
  const [content, setContent] = useState(editor.content);
  return (
    <div className="mt-3 rounded-xl border border-teal-200 bg-teal-50/50 p-3">
      <label className="block">
        <span className="mb-1.5 block text-sm font-semibold text-slate-700">Memory</span>
        <textarea
          value={content}
          onChange={(event) => setContent(event.target.value)}
          maxLength={600}
          placeholder="Example: We only take jobs within 25 miles of Springfield, and weekends are reserved for emergencies."
          className="input min-h-20 bg-white"
        />
      </label>
      <div className="mt-3 flex flex-wrap items-center justify-between gap-3">
        <label className="block">
          <span className="mb-1.5 block text-sm font-semibold text-slate-700">Category</span>
          <select
            value={category}
            onChange={(event) => setCategory(event.target.value as ProviderMemoryCategory)}
            className="input bg-white"
          >
            {providerMemoryCategories.map((key) => (
              <option key={key} value={key}>{categoryLabels[key]}</option>
            ))}
          </select>
        </label>
        <div className="flex gap-2">
          <button onClick={onCancel} className="rounded-lg border border-slate-300 px-4 py-2.5 text-sm font-semibold">Cancel</button>
          <button
            onClick={() => onSave({ ...editor, category, content })}
            disabled={pending || content.trim().length < 2}
            className="rounded-lg bg-teal-700 px-4 py-2.5 text-sm font-semibold text-white disabled:opacity-50"
          >
            {pending ? "Saving…" : "Save memory"}
          </button>
        </div>
      </div>
    </div>
  );
}
