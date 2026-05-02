"use client";

import type { ReactNode } from "react";
import { blockPalette, type BlockType } from "../../lib/ocworld";
import { translations } from "../../lib/translations";

interface BlockPaletteProps {
  onAddBlock: (type: BlockType) => void;
}

function BlockIcon({ type }: { type: BlockType }) {
  const paths: Record<BlockType, ReactNode> = {
    hero: (
      <>
        <path d="M4 18.5V5.5h16v13H4Z" />
        <path d="M7.25 9h5.5" />
        <path d="M7.25 12h9.5" />
        <path d="M7.25 15h4" />
      </>
    ),
    imageText: (
      <>
        <path d="M4.5 5.5h6v6h-6v-6Z" />
        <path d="M13.5 7h6" />
        <path d="M13.5 10h5" />
        <path d="M4.5 15h15" />
        <path d="M4.5 18h10" />
      </>
    ),
    gallery: (
      <>
        <path d="M4 6.5h6v5H4v-5Z" />
        <path d="M14 6.5h6v5h-6v-5Z" />
        <path d="M4 15h6v3.5H4V15Z" />
        <path d="M14 15h6v3.5h-6V15Z" />
      </>
    ),
    character: (
      <>
        <path d="M8.25 8.5a3.75 3.75 0 1 1 7.5 0 3.75 3.75 0 0 1-7.5 0Z" />
        <path d="M5.5 20c.8-3.45 3.1-5.25 6.5-5.25s5.7 1.8 6.5 5.25" />
      </>
    ),
    relationship: (
      <>
        <path d="M7 9.25a3 3 0 1 0 0-6 3 3 0 0 0 0 6Z" />
        <path d="M17 20.75a3 3 0 1 0 0-6 3 3 0 0 0 0 6Z" />
        <path d="M9.35 10.75 14.65 13.25" />
        <path d="m13.75 10.95 1.3 2.5-2.65.9" />
      </>
    ),
    timeline: (
      <>
        <path d="M5 12h14" />
        <path d="M7 12a2 2 0 1 0 0-4 2 2 0 0 0 0 4Z" />
        <path d="M17 16a2 2 0 1 0 0-4 2 2 0 0 0 0 4Z" />
        <path d="M7 12v5" />
        <path d="M17 7v5" />
      </>
    ),
    lore: (
      <>
        <path d="M6 4.75h10.5a1.5 1.5 0 0 1 1.5 1.5v13H7.5A1.5 1.5 0 0 1 6 17.75v-13Z" />
        <path d="M9 8h6" />
        <path d="M9 11h5" />
        <path d="M9 14h6" />
      </>
    ),
    divider: (
      <>
        <path d="M4 12h16" />
        <path d="M7 8.5h10" />
        <path d="M7 15.5h10" />
      </>
    ),
  };

  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" className="h-5 w-5 shrink-0" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.7">
      {paths[type]}
    </svg>
  );
}

export default function BlockPalette({ onAddBlock }: BlockPaletteProps) {
  const strings = translations.en.editor;

  return (
    <div
      data-tutorial="section-library"
      className="space-y-4 rounded-[1.5rem] border border-stone-300/70 bg-[#fffdf8]/82 p-4 shadow-sm shadow-stone-300/30 backdrop-blur-sm"
    >
      <div>
        <p className="text-xs uppercase tracking-[0.25em] text-stone-500">{strings.paletteTitle}</p>
        <h2 className="mt-2 font-serif text-xl font-semibold tracking-[-0.03em] text-slate-950">{strings.canvasHint}</h2>
      </div>

      <div className="grid gap-3">
        {blockPalette.map((item) => (
          <button
            key={item.type}
            type="button"
            draggable
            onDragStart={(event) => {
              event.dataTransfer.setData("application/x-ocworld-block", item.type);
              event.dataTransfer.effectAllowed = "copy";
            }}
            onClick={() => onAddBlock(item.type)}
            className="group flex flex-col gap-3 rounded-[1.1rem] border border-stone-300/70 bg-white/60 p-4 text-left shadow-sm transition hover:-translate-y-0.5 hover:border-stone-400 hover:bg-white hover:shadow-md"
          >
            <div className="flex items-center justify-between gap-4">
              <span className="flex min-w-0 items-center gap-2 text-sm font-semibold text-slate-900">
                <span className="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border border-stone-300 bg-[#fffdf8] text-slate-800 shadow-sm">
                  <BlockIcon type={item.type} />
                </span>
                <span className="truncate">{item.title}</span>
              </span>
              <span className="inline-flex h-8 w-8 items-center justify-center rounded-full bg-slate-950 text-white shadow-sm transition group-hover:scale-105">+</span>
            </div>
            <p className="text-sm leading-6 text-stone-600">{item.description}</p>
            <span className="text-xs uppercase tracking-[0.22em] text-stone-400">Drag or tap</span>
          </button>
        ))}
      </div>
    </div>
  );
}
