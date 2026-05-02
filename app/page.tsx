"use client";

import Link from "next/link";
import type { ReactNode } from "react";
import { OCWorldBrand } from "./components/Brand/OCWorldLogo";

const STORAGE_KEY = "ocworld-studio-project";

const valuePoints = [
  {
    title: "Characters stay close",
    body: "Portraits, roles, relationships, and notes live together instead of scattering across files.",
  },
  {
    title: "Worlds become pages",
    body: "Build pages for lore, timelines, galleries, maps, scenes, or quiet little details.",
  },
  {
    title: "Export when ready",
    body: "Turn your studio draft into a simple static website with navigation, backgrounds, and music.",
  },
];

const steps = [
  ["1", "Choose a block", "Start with a character card, timeline, gallery, lore note, divider, or free image-text layout."],
  ["2", "Shape the page", "Edit directly on the canvas, add subpages, and tune the mood page by page."],
  ["3", "Share the world", "Preview the site, then export the finished pages as a portable HTML website."],
];

const benefits = ["Page navigation", "Character cards", "Timelines", "Relationship maps", "Per-page vibes", "Static export"];

function StartBuildingLink({ className = "" }: { className?: string }) {
  return (
    <Link
      href="/editor"
      onClick={() => window.localStorage.removeItem(STORAGE_KEY)}
      className={`inline-flex items-center justify-center rounded-full bg-slate-950 px-6 py-3 text-sm font-semibold text-white shadow-[0_14px_30px_rgba(15,23,42,0.18)] transition duration-200 hover:-translate-y-0.5 hover:bg-slate-800 ${className}`}
    >
      Start Building
    </Link>
  );
}

function SectionLabel({ children }: { children: ReactNode }) {
  return <p className="text-xs font-semibold uppercase tracking-[0.28em] text-stone-500">{children}</p>;
}

function EditorPreview() {
  return (
    <div className="relative mx-auto w-full max-w-xl">
      <div className="absolute -left-4 top-8 h-full w-full rotate-[-2deg] rounded-[1.5rem] border border-stone-200 bg-[#eee8dc]" />
      <div className="relative overflow-hidden rounded-[1.5rem] border border-stone-300 bg-[#fbfaf7] p-4 shadow-[0_24px_70px_rgba(74,63,48,0.16)]">
        <div className="mb-4 flex items-center justify-between border-b border-stone-200 pb-3">
          <div>
            <div className="h-2 w-24 rounded-full bg-stone-300" />
            <div className="mt-2 h-2 w-14 rounded-full bg-stone-200" />
          </div>
          <div className="flex gap-1.5">
            <span className="h-2.5 w-2.5 rounded-full bg-stone-300" />
            <span className="h-2.5 w-2.5 rounded-full bg-stone-300" />
            <span className="h-2.5 w-2.5 rounded-full bg-stone-300" />
          </div>
        </div>

        <div className="grid gap-4 md:grid-cols-[0.34fr_0.66fr]">
          <div className="space-y-2 rounded-[1rem] border border-stone-200 bg-white/75 p-3">
            {["Home", "Characters", "Lore"].map((item, index) => (
              <div
                key={item}
                className={`rounded-xl px-3 py-2 text-xs font-semibold ${
                  index === 1 ? "bg-slate-950 text-white" : "bg-stone-100 text-stone-600"
                }`}
              >
                {item}
              </div>
            ))}
          </div>

          <div className="space-y-3">
            <div className="rounded-[1.1rem] border border-stone-200 bg-white p-3">
              <div className="h-24 rounded-xl bg-[linear-gradient(135deg,#d7cbb8,#f6efe2_54%,#b8c4bd)]" />
              <div className="mt-3 space-y-2">
                <div className="h-2.5 w-2/3 rounded-full bg-slate-300" />
                <div className="h-2 w-1/2 rounded-full bg-stone-300" />
              </div>
            </div>

            <div className="grid gap-3 sm:grid-cols-2">
              <div className="rounded-[1rem] border border-stone-200 bg-[#f8f4ec] p-3">
                <div className="h-20 rounded-xl bg-stone-300" />
                <div className="mt-3 h-2 w-3/4 rounded-full bg-stone-400/60" />
              </div>
              <div className="rounded-[1rem] border border-stone-200 bg-white p-3">
                <div className="mb-2 h-px w-full bg-stone-300" />
                <div className="space-y-2">
                  <div className="h-2 rounded-full bg-stone-300" />
                  <div className="h-2 w-5/6 rounded-full bg-stone-200" />
                  <div className="h-2 w-2/3 rounded-full bg-stone-200" />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function Home() {
  return (
    <main className="min-h-screen overflow-hidden bg-[#f5f0e7] text-slate-950">
      <div
        className="pointer-events-none fixed inset-0 opacity-[0.42]"
        style={{
          backgroundImage:
            "linear-gradient(rgba(90,80,66,0.12) 1px, transparent 1px), linear-gradient(90deg, rgba(90,80,66,0.12) 1px, transparent 1px)",
          backgroundSize: "28px 28px",
        }}
      />
      <div className="pointer-events-none fixed inset-0 bg-[radial-gradient(circle_at_18%_12%,rgba(197,164,109,0.22),transparent_28%),radial-gradient(circle_at_78%_20%,rgba(118,138,127,0.18),transparent_30%)]" />

      <div className="relative mx-auto max-w-6xl px-5 py-5 sm:px-8 lg:px-10">
        <header className="flex items-center justify-between gap-4 rounded-full border border-stone-300/70 bg-[#fffdf8]/75 px-4 py-3 shadow-sm backdrop-blur-xl">
          <Link href="/" className="transition hover:-translate-y-0.5" aria-label="OCWorld Studio home">
            <OCWorldBrand />
          </Link>
          <StartBuildingLink className="px-5 py-2.5" />
        </header>

        <section className="grid gap-12 pb-20 pt-20 lg:grid-cols-[0.92fr_1.08fr] lg:items-center lg:pb-24 lg:pt-24">
          <div className="max-w-2xl">
            <SectionLabel>Digital sketchbook for OC worlds</SectionLabel>
            <h1 className="mt-5 font-serif text-5xl font-semibold leading-[0.98] tracking-[-0.045em] text-slate-950 sm:text-6xl lg:text-7xl">
              Build a home for your characters.
            </h1>
            <p className="mt-6 max-w-xl text-base leading-8 text-slate-700 sm:text-lg">
              OCWorld is a calm page builder for original characters, story notes, lore, timelines, and the small details that make a world feel alive.
            </p>
            <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:items-center">
              <StartBuildingLink />
              <a
                href="#how"
                className="inline-flex items-center justify-center rounded-full border border-stone-300 bg-[#fffdf8]/75 px-6 py-3 text-sm font-semibold text-slate-800 transition hover:-translate-y-0.5 hover:bg-white"
              >
                See how it works
              </a>
            </div>
          </div>

          <EditorPreview />
        </section>

        <section className="grid gap-4 md:grid-cols-3">
          {valuePoints.map((point) => (
            <article key={point.title} className="rounded-[1.25rem] border border-stone-300/70 bg-[#fffdf8]/80 p-6 shadow-sm backdrop-blur-sm transition hover:-translate-y-1 hover:bg-white">
              <h2 className="font-serif text-2xl font-semibold tracking-[-0.03em] text-slate-950">{point.title}</h2>
              <p className="mt-3 text-sm leading-7 text-slate-700">{point.body}</p>
            </article>
          ))}
        </section>

        <section id="how" className="py-20">
          <div className="mb-8 max-w-2xl">
            <SectionLabel>How it works</SectionLabel>
            <h2 className="mt-3 font-serif text-4xl font-semibold tracking-[-0.04em] text-slate-950 sm:text-5xl">
              From loose notes to a browsable world.
            </h2>
          </div>
          <div className="grid gap-4 md:grid-cols-3">
            {steps.map(([number, title, body]) => (
              <article key={title} className="relative rounded-[1.25rem] border border-stone-300/70 bg-[#fffdf8]/80 p-6 shadow-sm">
                <span className="inline-flex h-9 w-9 items-center justify-center rounded-full bg-slate-950 text-sm font-semibold text-white">
                  {number}
                </span>
                <h3 className="mt-5 text-lg font-semibold text-slate-950">{title}</h3>
                <p className="mt-3 text-sm leading-7 text-slate-700">{body}</p>
              </article>
            ))}
          </div>
        </section>

        <section className="rounded-[1.5rem] border border-stone-300/70 bg-[#fffdf8]/80 p-6 shadow-sm backdrop-blur-sm sm:p-8">
          <div className="grid gap-8 lg:grid-cols-[0.8fr_1.2fr] lg:items-center">
            <div>
              <SectionLabel>Inside the studio</SectionLabel>
              <h2 className="mt-3 font-serif text-4xl font-semibold tracking-[-0.04em] text-slate-950">
                A quieter toolkit for messy creative worlds.
              </h2>
            </div>
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {benefits.map((benefit) => (
                <div key={benefit} className="rounded-2xl border border-stone-200 bg-white/70 px-4 py-3 text-sm font-semibold text-slate-700">
                  {benefit}
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="py-20">
          <div className="relative overflow-hidden rounded-[1.5rem] border border-stone-300 bg-slate-950 p-8 text-white shadow-[0_24px_70px_rgba(15,23,42,0.2)] sm:p-10">
            <div className="absolute inset-0 opacity-20" style={{ backgroundImage: "linear-gradient(rgba(255,255,255,0.18) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.18) 1px, transparent 1px)", backgroundSize: "30px 30px" }} />
            <div className="relative max-w-2xl">
              <SectionLabel>Begin the draft</SectionLabel>
              <h2 className="mt-4 font-serif text-4xl font-semibold tracking-[-0.04em] sm:text-5xl">
                Open the studio and start arranging the world.
              </h2>
              <p className="mt-4 text-sm leading-7 text-slate-300 sm:text-base">
                No polished pitch required. Bring a character, a fragment, a timeline, or a mood.
              </p>
              <StartBuildingLink className="mt-7 bg-white text-slate-950 hover:bg-stone-100" />
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}
