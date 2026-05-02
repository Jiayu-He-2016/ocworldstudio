"use client";

import { useState, type DragEvent } from "react";
import type { ProjectVibeData } from "../../lib/ocworld";
import { vibeBackgroundChoices } from "../../lib/ocworld";

interface VibeStudioPanelProps {
  pageVibe?: ProjectVibeData;
  musicVibe?: ProjectVibeData;
  pageTitle?: string;
  onPageChange: (vibe: ProjectVibeData) => void;
  onMusicChange: (vibe: ProjectVibeData) => void;
}

function readFileAsDataUrl(file: File): Promise<string> {
  return new Promise((resolve) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.readAsDataURL(file);
  });
}

function readImageSize(url: string): Promise<{ width: number; height: number }> {
  return new Promise((resolve) => {
    const image = new Image();
    image.onload = () => resolve({ width: image.naturalWidth || 1, height: image.naturalHeight || 1 });
    image.onerror = () => resolve({ width: 1, height: 1 });
    image.src = url;
  });
}

export default function VibeStudioPanel({ pageVibe, musicVibe, pageTitle, onPageChange, onMusicChange }: VibeStudioPanelProps) {
  const [dropActive, setDropActive] = useState(false);
  const [backgroundChoicesOpen, setBackgroundChoicesOpen] = useState(false);
  const currentChoice = vibeBackgroundChoices.find((choice) => choice.id === pageVibe?.backgroundChoiceId) ?? vibeBackgroundChoices[0];
  const uploadedAspectRatio = pageVibe?.backgroundImageWidth && pageVibe.backgroundImageHeight ? pageVibe.backgroundImageWidth / pageVibe.backgroundImageHeight : undefined;
  const isScrollableTallImage = Boolean(uploadedAspectRatio && uploadedAspectRatio <= 0.5);

  const updateMusic = async (file: File) => {
    if (!file.type.includes("audio") && !file.name.toLowerCase().endsWith(".mp3")) return;
    const musicUrl = await readFileAsDataUrl(file);
    onMusicChange({ ...musicVibe, musicUrl, musicName: file.name });
  };

  const updateBackgroundImage = async (file: File) => {
    if (!file.type.startsWith("image/")) return;
    const backgroundImageUrl = await readFileAsDataUrl(file);
    const size = await readImageSize(backgroundImageUrl);
    onPageChange({
      ...pageVibe,
      backgroundImageUrl,
      backgroundImageWidth: size.width,
      backgroundImageHeight: size.height,
      backgroundImageOffsetY: 50,
    });
  };

  const handleDrop = async (event: DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    setDropActive(false);
    const files = Array.from(event.dataTransfer.files);
    const audioFile = files.find((file) => file.type.includes("audio") || file.name.toLowerCase().endsWith(".mp3"));
    const imageFile = files.find((file) => file.type.startsWith("image/"));
    if (audioFile) await updateMusic(audioFile);
    if (imageFile) await updateBackgroundImage(imageFile);
  };

  return (
    <div
      data-tutorial="vibe-studio"
      className={`space-y-5 rounded-[1.5rem] border bg-[#fffdf8]/82 p-5 shadow-sm shadow-stone-300/30 backdrop-blur-sm transition ${dropActive ? "border-slate-500 ring-4 ring-stone-300/40" : "border-stone-300/70"}`}
      onDragOver={(event) => {
        event.preventDefault();
        setDropActive(true);
      }}
      onDragLeave={() => setDropActive(false)}
      onDrop={handleDrop}
    >
      <div>
        <p className="text-xs uppercase tracking-[0.25em] text-stone-500">Vibe Studio</p>
        <h2 className="mt-2 font-serif text-xl font-semibold tracking-[-0.03em] text-slate-950">Set this page&apos;s atmosphere.</h2>
        <p className="mt-2 text-xs font-semibold text-stone-500">{pageTitle ?? "Current page"} background can be different from other pages.</p>
      </div>

      <div className="rounded-[1.15rem] border border-stone-300/70 bg-white/58 p-3">
        <button
          type="button"
          onClick={() => setBackgroundChoicesOpen((current) => !current)}
          aria-expanded={backgroundChoicesOpen}
          className="flex w-full items-center justify-between gap-3 rounded-xl px-2 py-2 text-left transition hover:bg-stone-50"
        >
          <span className="flex min-w-0 items-center gap-3">
            <span className="h-10 w-10 shrink-0 rounded-xl border border-white shadow-sm" style={{ backgroundColor: "#f8fafc", backgroundImage: currentChoice.style }} />
            <span className="min-w-0">
              <span className="block text-sm font-semibold text-slate-800">Background vibe</span>
              <span className="block truncate text-xs text-stone-500">
                {pageVibe?.backgroundImageUrl ? "Custom uploaded image" : `${currentChoice.title} · ${currentChoice.description}`}
              </span>
            </span>
          </span>
          <span className="shrink-0 rounded-full border border-stone-300 bg-[#fffdf8] px-3 py-1 text-xs font-semibold text-slate-700">
            {backgroundChoicesOpen ? "Hide" : "Choose"}
          </span>
        </button>
        {backgroundChoicesOpen ? (
          <div className="mt-3 grid gap-2 border-t border-stone-200 pt-3">
            {vibeBackgroundChoices.map((choice) => (
              <button
                key={choice.id}
                type="button"
                onClick={() => {
                  onPageChange({ ...pageVibe, backgroundChoiceId: choice.id, backgroundImageUrl: "", backgroundImageWidth: undefined, backgroundImageHeight: undefined, backgroundImageOffsetY: undefined });
                  setBackgroundChoicesOpen(false);
                }}
                className={`flex items-center gap-3 rounded-[1rem] border p-3 text-left transition hover:-translate-y-0.5 hover:bg-white ${currentChoice.id === choice.id && !pageVibe?.backgroundImageUrl ? "border-slate-700 bg-slate-950 text-white shadow-sm" : "border-stone-300/70 bg-white/60"}`}
              >
                <span className="h-10 w-10 shrink-0 rounded-xl border border-white shadow-sm" style={{ backgroundColor: "#f8fafc", backgroundImage: choice.style }} />
                <span className="min-w-0">
                  <span className={`block text-sm font-semibold ${currentChoice.id === choice.id && !pageVibe?.backgroundImageUrl ? "text-white" : "text-slate-900"}`}>{choice.title}</span>
                  <span className={`block text-xs leading-5 ${currentChoice.id === choice.id && !pageVibe?.backgroundImageUrl ? "text-stone-300" : "text-stone-500"}`}>{choice.description}</span>
                </span>
              </button>
            ))}
          </div>
        ) : null}
      </div>

      <div className="rounded-[1.15rem] border border-dashed border-stone-300 bg-white/55 p-4">
        <p className="text-sm font-semibold text-slate-800">Custom site background</p>
        <p className="mt-1 text-xs leading-5 text-slate-500">Upload or drop an image to use behind the whole exported page.</p>
        <div className="mt-3 flex flex-wrap items-center gap-3">
          <label className="rounded-full border border-stone-300 bg-white/75 px-4 py-2 text-sm font-semibold text-slate-900 transition hover:bg-white">
            Upload image
            <input
              type="file"
              accept="image/*"
              className="hidden"
              onChange={async (event) => {
                const input = event.currentTarget;
                const file = input.files?.[0];
                input.value = "";
                if (file) await updateBackgroundImage(file);
              }}
            />
          </label>
          {pageVibe?.backgroundImageUrl ? (
            <button
              type="button"
              onClick={() => onPageChange({ ...pageVibe, backgroundImageUrl: "", backgroundImageWidth: undefined, backgroundImageHeight: undefined, backgroundImageOffsetY: undefined })}
              className="rounded-full border border-rose-200 bg-rose-50 px-4 py-2 text-sm font-semibold text-rose-700 transition hover:bg-rose-100"
            >
              Remove image
            </button>
          ) : null}
        </div>
        {pageVibe?.backgroundImageUrl ? <div className="mt-4 h-24 rounded-[1rem] bg-cover bg-center" style={{ backgroundImage: `url(${pageVibe.backgroundImageUrl})` }} /> : null}
        {pageVibe?.backgroundImageUrl && isScrollableTallImage ? (
          <p className="mt-4 rounded-[1rem] bg-slate-900 px-3 py-2 text-xs leading-5 text-white">
            Tall background mode: this image scrolls with the page from top to bottom, while your section blocks keep their own normal scroll.
          </p>
        ) : null}
        {pageVibe?.backgroundImageUrl && !isScrollableTallImage ? (
          <label className="mt-4 block text-sm font-semibold text-slate-800">
            Background vertical position
            <input
              type="range"
              min="0"
              max="100"
              value={pageVibe.backgroundImageOffsetY ?? 50}
              onChange={(event) => onPageChange({ ...pageVibe, backgroundImageOffsetY: Number(event.target.value) })}
              className="mt-3 w-full accent-slate-900"
            />
            <span className="mt-1 block text-xs font-normal leading-5 text-slate-500">
              Pan tall images without changing how your section blocks scroll.
            </span>
          </label>
        ) : null}
      </div>

      <div className="rounded-[1.15rem] border border-dashed border-stone-300 bg-white/55 p-4">
        <p className="text-sm font-semibold text-slate-800">Background music</p>
        <p className="mt-1 text-xs leading-5 text-slate-500">Upload or drop an MP3. The exported page will include it with an autoplay attempt and a play button fallback.</p>
        <div className="mt-3 flex flex-wrap items-center gap-3">
          <label className="rounded-full border border-stone-300 bg-white/75 px-4 py-2 text-sm font-semibold text-slate-900 transition hover:bg-white">
            Upload MP3
            <input
              type="file"
              accept="audio/mpeg,.mp3"
              className="hidden"
              onChange={async (event) => {
                const input = event.currentTarget;
                const file = input.files?.[0];
                input.value = "";
                if (file) await updateMusic(file);
              }}
            />
          </label>
          {musicVibe?.musicUrl ? (
            <button
              type="button"
              onClick={() => onMusicChange({ ...musicVibe, musicUrl: "", musicName: "" })}
              className="rounded-full border border-rose-200 bg-rose-50 px-4 py-2 text-sm font-semibold text-rose-700 transition hover:bg-rose-100"
            >
              Remove music
            </button>
          ) : null}
        </div>
        {musicVibe?.musicUrl ? <p className="mt-3 truncate text-xs font-semibold text-slate-600">{musicVibe.musicName || "Background music attached"}</p> : null}
      </div>
    </div>
  );
}
