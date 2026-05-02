"use client";

import { useState } from "react";
import type { ProjectPage } from "../../lib/ocworld";

interface PagesPanelProps {
  pages: ProjectPage[];
  currentPageId: string;
  onSelectPage: (pageId: string) => void;
  onAddPage: (parentId?: string | null) => void;
  onRenamePage: (pageId: string, title: string) => void;
  onDeletePage: (pageId: string) => void;
  onDuplicatePage: (pageId: string) => void;
  onToggleNavigation: (pageId: string) => void;
  onMakeHomePage: (pageId: string) => void;
}

function buildRows(pages: ProjectPage[], parentId: string | null = null, depth = 0): Array<{ page: ProjectPage; depth: number }> {
  return pages
    .filter((page) => (page.parentId ?? null) === parentId)
    .sort((a, b) => a.order - b.order || a.title.localeCompare(b.title))
    .flatMap((page) => [{ page, depth }, ...buildRows(pages, page.id, depth + 1)]);
}

export default function PagesPanel({
  pages,
  currentPageId,
  onSelectPage,
  onAddPage,
  onRenamePage,
  onDeletePage,
  onDuplicatePage,
  onToggleNavigation,
  onMakeHomePage,
}: PagesPanelProps) {
  const [openPageId, setOpenPageId] = useState<string | null>(currentPageId);
  const [editingPageId, setEditingPageId] = useState<string | null>(null);
  const rows = buildRows(pages);

  const actionButtonClass = "rounded-full border border-stone-300 bg-white/70 px-3 py-1.5 text-xs font-semibold text-slate-700 transition hover:bg-white hover:shadow-sm";

  return (
    <div
      data-tutorial="pages-panel"
      className="space-y-4 rounded-[1.5rem] border border-stone-300/70 bg-[#fffdf8]/82 p-4 shadow-sm shadow-stone-300/30 backdrop-blur-sm"
    >
      <div className="flex items-center justify-between gap-3">
        <div>
          <p className="text-xs uppercase tracking-[0.25em] text-stone-500">Pages</p>
          <h2 className="mt-2 font-serif text-xl font-semibold tracking-[-0.03em] text-slate-950">Site structure</h2>
        </div>
        <button
          type="button"
          data-tutorial="add-page-button"
          onClick={() => onAddPage(null)}
          className="inline-flex h-10 w-10 items-center justify-center rounded-xl bg-slate-950 text-lg font-semibold text-white shadow-sm transition hover:-translate-y-0.5 hover:bg-slate-800"
          aria-label="Add page"
        >
          +
        </button>
      </div>

      <div className="space-y-2">
        {rows.map(({ page, depth }) => {
          const isActive = page.id === currentPageId;
          const isOpen = page.id === (openPageId ?? currentPageId);
          const isEditing = page.id === editingPageId;
          return (
            <div key={page.id} className="space-y-2" style={{ marginLeft: `${Math.min(depth, 4) * 18}px` }}>
              <button
                type="button"
                onClick={() => {
                  onSelectPage(page.id);
                  setOpenPageId((current) => (current === page.id ? null : page.id));
                }}
                onDoubleClick={() => setEditingPageId(page.id)}
                className={`flex w-full items-center justify-between gap-3 rounded-xl border px-3 py-3 text-left transition ${
                  isActive ? "border-slate-700 bg-slate-950 text-white shadow-sm" : "border-stone-300/70 bg-white/55 hover:bg-white hover:shadow-sm"
                }`}
              >
                <span className="flex min-w-0 items-center gap-2">
                  <span className={`h-2.5 w-2.5 shrink-0 rounded-full ${isActive ? "bg-stone-200" : "bg-stone-300"}`} />
                  {isEditing ? (
                    <input
                      autoFocus
                      value={page.title}
                      onChange={(event) => onRenamePage(page.id, event.target.value)}
                      onClick={(event) => event.stopPropagation()}
                      onBlur={() => setEditingPageId(null)}
                      onKeyDown={(event) => {
                        if (event.key === "Enter") {
                          event.currentTarget.blur();
                        }
                      }}
                      className="min-w-0 flex-1 rounded-lg border border-stone-300 bg-white px-2 py-1 text-sm font-semibold text-slate-900 outline-none"
                    />
                  ) : (
                    <span className={`truncate text-sm font-semibold ${isActive ? "text-white" : "text-slate-900"}`}>{page.title}</span>
                  )}
                </span>
                <span className={`shrink-0 text-xs font-semibold ${isActive ? "text-stone-300" : "text-stone-400"}`}>
                  {page.showInNavigation ? "" : "Hidden"}
                </span>
              </button>

              {isOpen ? (
                <div className="flex flex-wrap gap-2 rounded-xl border border-stone-300/70 bg-white/65 p-3 shadow-sm shadow-stone-200/60">
                  <button type="button" onClick={() => onDuplicatePage(page.id)} className={actionButtonClass}>
                    Duplicate page
                  </button>
                  <button
                    type="button"
                    onClick={() => onMakeHomePage(page.id)}
                    disabled={page.id === "home"}
                    className={`${actionButtonClass} disabled:opacity-40`}
                  >
                    Make homepage
                  </button>
                  <button type="button" onClick={() => onAddPage(page.id)} className={actionButtonClass}>
                    Add subpage
                  </button>
                  <button type="button" onClick={() => onToggleNavigation(page.id)} className={actionButtonClass}>
                    {page.showInNavigation ? "Hide from navigation" : "Show in navigation"}
                  </button>
                  <button
                    type="button"
                    onClick={() => onDeletePage(page.id)}
                    disabled={page.id === "home"}
                    className="rounded-full border border-rose-200 bg-rose-50 px-3 py-1.5 text-xs font-semibold text-rose-700 transition hover:bg-rose-100 disabled:opacity-40"
                  >
                    Delete
                  </button>
                </div>
              ) : null}
            </div>
          );
        })}
      </div>
    </div>
  );
}
