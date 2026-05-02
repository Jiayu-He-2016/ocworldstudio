"use client";

import { useState } from "react";
import { createCharacterBreakLine, createCharacterTag, createCharacterTextHolder, createLoreBreakLine, createLoreTextHolder, createTimelineBreakLine, createTimelineImageHolder, createTimelineTextHolder, fitImageTextWorkspaceHeight, fitLoreWorkspaceHeight, heroBackgroundChoices, isDividerVisible, normalizeCharacters, normalizeImageTextData, normalizeTimelineEvents } from "../../lib/ocworld";
import type {
  ProjectBlock,
  GalleryImage,
  HeroTextItem,
  ImageTextBlockData,
  LoreBlockData,
} from "../../lib/ocworld";
import { translations } from "../../lib/translations";

interface SettingsPanelProps {
  selectedBlock: ProjectBlock | null;
  onUpdateBlock: (block: ProjectBlock) => void;
}

function readFileAsDataUrl(file: File): Promise<string> {
  return new Promise((resolve) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.readAsDataURL(file);
  });
}

export default function SettingsPanel({
  selectedBlock,
  onUpdateBlock,
}: SettingsPanelProps) {
  const strings = translations.en.editor;
  const [heroBackgroundsOpen, setHeroBackgroundsOpen] = useState(false);

  const updateField = (field: string, value: string | boolean | number) => {
    if (!selectedBlock) return;
    onUpdateBlock({
      ...selectedBlock,
      data: { ...(selectedBlock.data as unknown as Record<string, unknown>), [field]: value },
    } as unknown as ProjectBlock);
  };

  const openRelationshipNodeEditor = () => {
    if (!selectedBlock || selectedBlock.type !== "relationship") return;
    onUpdateBlock({
      ...selectedBlock,
      data: {
        ...selectedBlock.data,
        nodeEditor: { open: true },
      },
    });
  };

  const addGalleryImage = () => {
    if (!selectedBlock || selectedBlock.type !== "gallery") return;
    const images = Array.isArray(selectedBlock.data.images) ? selectedBlock.data.images : [];
    const baseImages: GalleryImage[] = images.length
      ? images
      : [
          { id: `${selectedBlock.id}-blank-1`, url: "", caption: "", width: "medium" },
          { id: `${selectedBlock.id}-blank-2`, url: "", caption: "", width: "medium" },
          { id: `${selectedBlock.id}-blank-3`, url: "", caption: "", width: "medium" },
        ];
    onUpdateBlock({
      ...selectedBlock,
      data: {
        ...selectedBlock.data,
        images: [
          ...baseImages,
          {
            id: `${selectedBlock.id}-gallery-image-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
            url: "",
            caption: "",
            width: "medium",
          },
        ],
      },
    });
  };

  const createImageTextItemId = () => `${selectedBlock?.id ?? "imageText"}-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;

  const getImageTextBottom = (data: ImageTextBlockData) => {
    const height = data.height ?? 560;
    return Math.max(0, ...data.items.map((item) => ((item.y + item.height) / 100) * height));
  };

  const addImageTextText = () => {
    if (!selectedBlock || selectedBlock.type !== "imageText") return;
    const imageText = normalizeImageTextData(selectedBlock.data);
    const height = imageText.height ?? 560;
    const top = getImageTextBottom(imageText) + 24;
    const itemHeight = 150;
    const item = {
      id: createImageTextItemId(),
      type: "text" as const,
      text: "Start typing here.",
      x: 10,
      y: (top / height) * 100,
      width: 40,
      height: (itemHeight / height) * 100,
      align: "left" as const,
      fontSize: "1rem",
      color: "#0f172a",
    };
    onUpdateBlock({
      ...selectedBlock,
      data: fitImageTextWorkspaceHeight({ ...imageText, items: [...imageText.items, item] }, height),
    });
  };

  const addImageTextImage = () => {
    if (!selectedBlock || selectedBlock.type !== "imageText") return;
    const imageText = normalizeImageTextData(selectedBlock.data);
    const height = imageText.height ?? 560;
    const top = getImageTextBottom(imageText) + 24;
    const itemHeight = 180;
    const item = {
      id: createImageTextItemId(),
      type: "image" as const,
      imageUrl: "",
      caption: "",
      link: { type: "none" as const },
      x: 50,
      y: (top / height) * 100,
      width: 35,
      height: (itemHeight / height) * 100,
      align: "center" as const,
      fontSize: "1rem",
      color: "#0f172a",
    };
    onUpdateBlock({
      ...selectedBlock,
      data: fitImageTextWorkspaceHeight({ ...imageText, items: [...imageText.items, item] }, height),
    });
  };

  const addCharacterTextHolder = () => {
    if (!selectedBlock || selectedBlock.type !== "character") return;
    const characters = normalizeCharacters(selectedBlock.data.characters);
    const activeCharacterId = characters.some((character) => character.id === selectedBlock.data.activeCharacterId)
      ? selectedBlock.data.activeCharacterId
      : characters[0]?.id;
    if (!activeCharacterId) return;
    onUpdateBlock({
      ...selectedBlock,
      data: {
        ...selectedBlock.data,
        activeCharacterId,
        characters: characters.map((character) =>
          character.id === activeCharacterId
            ? {
                ...character,
                textHolders: [
                  ...character.textHolders,
                  createCharacterTextHolder(
                    "Text holder",
                    Math.min(
                      78,
                      Math.max(
                        7,
                        ...character.textHolders.map((holder) => holder.y + holder.height + 5),
                        ...character.breakLines.map((line) => line.y + 6)
                      )
                    )
                  ),
                ],
              }
            : character
        ),
      },
    });
  };

  const addCharacterBreakLine = () => {
    if (!selectedBlock || selectedBlock.type !== "character") return;
    const characters = normalizeCharacters(selectedBlock.data.characters);
    const activeCharacterId = characters.some((character) => character.id === selectedBlock.data.activeCharacterId)
      ? selectedBlock.data.activeCharacterId
      : characters[0]?.id;
    if (!activeCharacterId) return;
    onUpdateBlock({
      ...selectedBlock,
      data: {
        ...selectedBlock.data,
        activeCharacterId,
        characters: characters.map((character) => {
          if (character.id !== activeCharacterId) return character;
          const referenceHolder = character.textHolders[character.textHolders.length - 1];
          const y = Math.min(
            95,
            Math.max(
              18,
              referenceHolder ? referenceHolder.y + referenceHolder.height + 3 : 18,
              ...character.breakLines.map((line) => line.y + 8)
            )
          );
          return {
            ...character,
            breakLines: [
              ...character.breakLines,
              {
                ...createCharacterBreakLine(y),
                x: referenceHolder?.x ?? 4,
                width: referenceHolder?.width ?? 92,
              },
            ],
          };
        }),
      },
    });
  };

  const addCharacterTag = () => {
    if (!selectedBlock || selectedBlock.type !== "character") return;
    const characters = normalizeCharacters(selectedBlock.data.characters);
    const activeCharacterId = characters.some((character) => character.id === selectedBlock.data.activeCharacterId)
      ? selectedBlock.data.activeCharacterId
      : characters[0]?.id;
    if (!activeCharacterId) return;
    onUpdateBlock({
      ...selectedBlock,
      data: {
        ...selectedBlock.data,
        activeCharacterId,
        characters: characters.map((character) =>
          character.id === activeCharacterId
            ? {
                ...character,
                tags: [...character.tags, createCharacterTag()],
              }
            : character
        ),
      },
    });
  };

  const getActiveTimelineEventId = () => {
    if (!selectedBlock || selectedBlock.type !== "timeline") return "";
    const events = normalizeTimelineEvents(selectedBlock.data.events);
    return events.some((event) => event.id === selectedBlock.data.activeEventId)
      ? selectedBlock.data.activeEventId ?? ""
      : events[0]?.id ?? "";
  };

  const addTimelineImage = () => {
    if (!selectedBlock || selectedBlock.type !== "timeline") return;
    const events = normalizeTimelineEvents(selectedBlock.data.events);
    const activeEventId = getActiveTimelineEventId();
    if (!activeEventId) return;
    onUpdateBlock({
      ...selectedBlock,
      data: {
        ...selectedBlock.data,
        activeEventId,
        events: events.map((event) =>
          event.id === activeEventId
            ? {
                ...event,
                imageHolders: [
                  ...event.imageHolders,
                  createTimelineImageHolder(Math.min(62, 8 + event.imageHolders.length * 8)),
                ],
              }
            : event
        ),
      },
    });
  };

  const addTimelineText = () => {
    if (!selectedBlock || selectedBlock.type !== "timeline") return;
    const events = normalizeTimelineEvents(selectedBlock.data.events);
    const activeEventId = getActiveTimelineEventId();
    if (!activeEventId) return;
    onUpdateBlock({
      ...selectedBlock,
      data: {
        ...selectedBlock.data,
        activeEventId,
        events: events.map((event) =>
          event.id === activeEventId
            ? { ...event, textHolders: [...event.textHolders, createTimelineTextHolder("Text", Math.min(86, 46 + event.textHolders.length * 12))] }
            : event
        ),
      },
    });
  };

  const addTimelineBreakLine = () => {
    if (!selectedBlock || selectedBlock.type !== "timeline") return;
    const events = normalizeTimelineEvents(selectedBlock.data.events);
    const activeEventId = getActiveTimelineEventId();
    if (!activeEventId) return;
    onUpdateBlock({
      ...selectedBlock,
      data: {
        ...selectedBlock.data,
        activeEventId,
        events: events.map((event) =>
          event.id === activeEventId
            ? { ...event, breakLines: [...event.breakLines, createTimelineBreakLine(Math.min(96, 58 + event.breakLines.length * 10))] }
            : event
        ),
      },
    });
  };

  const getLoreBottom = (lore: LoreBlockData) => {
    const height = lore.height ?? 360;
    const textBottoms = (lore.textHolders ?? []).map((holder) => ((holder.y + holder.height) / 100) * height);
    const lineBottoms = (lore.breakLines ?? []).map((line) => (line.y / 100) * height + 16);
    return Math.max(36, ...textBottoms, ...lineBottoms);
  };

  const addLoreItem = (kind: "title" | "text") => {
    if (!selectedBlock || selectedBlock.type !== "lore") return;
    const lore = fitLoreWorkspaceHeight(selectedBlock.data, selectedBlock.data.height ?? 360);
    const height = lore.height ?? 360;
    const itemHeight = kind === "title" ? 48 : 80;
    const top = getLoreBottom(lore) + 24;
    const holder = createLoreTextHolder(kind, (top / height) * 100);
    holder.height = (itemHeight / height) * 100;
    onUpdateBlock({
      ...selectedBlock,
      data: fitLoreWorkspaceHeight({
        ...lore,
        textHolders: [...(lore.textHolders ?? []), holder],
        activeItemId: holder.id,
      }, height),
    });
  };

  const addLoreBreakLine = () => {
    if (!selectedBlock || selectedBlock.type !== "lore") return;
    const lore = fitLoreWorkspaceHeight(selectedBlock.data, selectedBlock.data.height ?? 360);
    const height = lore.height ?? 360;
    const top = getLoreBottom(lore) + 18;
    const line = createLoreBreakLine((top / height) * 100);
    onUpdateBlock({
      ...selectedBlock,
      data: fitLoreWorkspaceHeight({
        ...lore,
        breakLines: [...(lore.breakLines ?? []), line],
        activeItemId: line.id,
      }, height),
    });
  };

  const addHeroText = () => {
    if (!selectedBlock || selectedBlock.type !== "hero") return;
    const items = Array.isArray(selectedBlock.data.textItems)
      ? selectedBlock.data.textItems
      : [
          ...(selectedBlock.data.titleVisible === false
            ? []
            : [
                {
                  id: `${selectedBlock.id}-title`,
                  text: selectedBlock.data.title || "<h1>Start your story title</h1>",
                  x: 12,
                  y: 28,
                  width: 76,
                  height: 18,
                  align: selectedBlock.data.titleAlign,
                  fontSize: selectedBlock.data.titleSize,
                  color: selectedBlock.data.titleColor,
                } satisfies HeroTextItem,
              ]),
          ...(selectedBlock.data.subtitleVisible === false
            ? []
            : [
                {
                  id: `${selectedBlock.id}-subtitle`,
                  text: selectedBlock.data.subtitle || "<p>Start your story subtitle</p>",
                  x: 22,
                  y: 50,
                  width: 56,
                  height: 14,
                  align: selectedBlock.data.subtitleAlign,
                  fontSize: selectedBlock.data.subtitleSize,
                  color: selectedBlock.data.subtitleColor,
                } satisfies HeroTextItem,
              ]),
        ];
    const offset = (items.length % 5) * 5;
    onUpdateBlock({
      ...selectedBlock,
      data: {
        ...selectedBlock.data,
        textItems: [
          ...items,
          {
            id: `${selectedBlock.id}-hero-text-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
            text: "<p>Start typing here.</p>",
            x: 20 + offset,
            y: 22 + offset,
            width: 44,
            height: 16,
            align: "center",
            fontSize: "1.5rem",
            color: "#ffffff",
          },
        ],
      },
    });
  };

  const updateHeroBackground = (choice: (typeof heroBackgroundChoices)[number]) => {
    if (!selectedBlock || selectedBlock.type !== "hero") return;
    onUpdateBlock({
      ...selectedBlock,
      data: {
        ...selectedBlock.data,
        backgroundUrl: "",
        backgroundStyle: choice.style,
        backgroundSize: choice.backgroundSize ?? "cover",
        backgroundPosition: choice.backgroundPosition ?? "center",
      },
    });
  };

  const updateHeroSolidBackground = (backgroundStyle: string) => {
    if (!selectedBlock || selectedBlock.type !== "hero") return;
    onUpdateBlock({
      ...selectedBlock,
      data: {
        ...selectedBlock.data,
        backgroundUrl: "",
        backgroundStyle,
        backgroundSize: "cover",
        backgroundPosition: "center",
      },
    });
  };

  const uploadHeroBackground = async (file: File) => {
    if (!selectedBlock || selectedBlock.type !== "hero") return;
    const url = await readFileAsDataUrl(file);
    onUpdateBlock({
      ...selectedBlock,
      data: {
        ...selectedBlock.data,
        backgroundUrl: url,
        backgroundSize: "cover",
        backgroundPosition: "center",
      },
    });
  };

  return (
    <div
      data-tutorial="studio-settings"
      className="space-y-5 rounded-[1.5rem] border border-stone-300/70 bg-[#fffdf8]/82 p-5 shadow-sm shadow-stone-300/30 backdrop-blur-sm"
    >
      <div className="flex items-center justify-between gap-4">
        <div>
          <p className="text-xs uppercase tracking-[0.25em] text-stone-500">{strings.generalTitle}</p>
          <h2 className="mt-2 font-serif text-xl font-semibold tracking-[-0.03em] text-slate-950">{strings.settingsTitle}</h2>
        </div>
      </div>

      {selectedBlock ? (
        <div className="space-y-4 rounded-[1.15rem] border border-stone-300/70 bg-white/58 p-4 shadow-inner shadow-stone-200/50">
          <p className="text-xs uppercase tracking-[0.25em] text-stone-500">{selectedBlock.title}</p>

          {selectedBlock.type === "hero" && (
            <div className="space-y-4">
              <button
                type="button"
                onClick={addHeroText}
                className="w-full rounded-full border border-slate-300 bg-white px-4 py-3 text-sm font-semibold text-slate-900 transition hover:bg-slate-50"
              >
                Add text
              </button>
              <div className="rounded-[1rem] border border-stone-300/70 bg-white/65 p-3">
                <button
                  type="button"
                  onClick={() => setHeroBackgroundsOpen((current) => !current)}
                  aria-expanded={heroBackgroundsOpen}
                  className="flex w-full items-center justify-between gap-3 rounded-xl px-2 py-2 text-left transition hover:bg-stone-50"
                >
                  <span>
                    <span className="block text-sm font-semibold text-slate-800">Background image</span>
                    <span className="mt-1 block text-xs text-stone-500">Upload a cover or choose an art preset.</span>
                  </span>
                  <span className="shrink-0 rounded-full border border-stone-300 bg-[#fffdf8] px-3 py-1 text-xs font-semibold text-slate-700">
                    {heroBackgroundsOpen ? "Hide" : "Choose"}
                  </span>
                </button>
                {heroBackgroundsOpen ? (
                  <div className="mt-3 border-t border-stone-200 pt-3">
                    <input
                      type="file"
                      accept="image/*"
                      onChange={async (event) => {
                        const input = event.currentTarget;
                        const file = input.files?.[0];
                        input.value = "";
                        if (file) {
                          await uploadHeroBackground(file);
                        }
                      }}
                      className="w-full rounded-3xl border border-stone-300 bg-white px-4 py-3 text-slate-900 outline-none"
                    />
                    <div className="mt-4 grid grid-cols-2 gap-3">
                      {heroBackgroundChoices.map((choice) => (
                        <button
                          key={choice.id}
                          type="button"
                          onClick={() => updateHeroBackground(choice)}
                          className="h-20 rounded-[1rem] border border-stone-300 p-2 text-left text-xs font-semibold text-slate-900 shadow-sm transition hover:-translate-y-0.5 hover:border-stone-500"
                          style={{
                            backgroundColor: choice.style.startsWith("#") ? choice.style : "#f8fafc",
                            backgroundImage: choice.style.startsWith("#") ? undefined : choice.style,
                            backgroundSize: choice.backgroundSize,
                            backgroundPosition: choice.backgroundPosition,
                          }}
                        >
                          <span className="rounded-full bg-white/85 px-2 py-1">{choice.title}</span>
                        </button>
                      ))}
                    </div>
                  </div>
                ) : null}
                <label className="mt-4 block text-sm font-medium text-slate-700">
                  Solid color
                  <input
                    type="color"
                    value={
                      selectedBlock.data.backgroundStyle?.startsWith("#")
                        ? selectedBlock.data.backgroundStyle
                        : "#475569"
                    }
                    onChange={(event) => updateHeroSolidBackground(event.target.value)}
                    className="mt-2 h-12 w-full rounded-2xl border border-stone-300 bg-white p-1"
                  />
                </label>
              </div>
            </div>
          )}

          {selectedBlock.type === "imageText" && (
            <div className="space-y-4">
              <div className="flex flex-wrap gap-3">
                <button
                  type="button"
                  onClick={addImageTextText}
                  className="rounded-full border border-slate-300 bg-white px-4 py-3 text-sm font-semibold text-slate-900 hover:bg-slate-50"
                >
                  Add text
                </button>
                <button
                  type="button"
                  onClick={addImageTextImage}
                  className="rounded-full border border-slate-300 bg-white px-4 py-3 text-sm font-semibold text-slate-900 hover:bg-slate-50"
                >
                  Add image
                </button>
              </div>
              <p className="text-sm text-slate-500">Add new boxes here, then move and resize them directly on the canvas.</p>
            </div>
          )}

          {selectedBlock.type === "character" && (
            <div className="space-y-4">
              <div className="grid gap-3">
                <button
                  type="button"
                  onClick={addCharacterTextHolder}
                  className="w-full rounded-full border border-slate-300 bg-white px-4 py-3 text-sm font-semibold text-slate-900 transition hover:bg-slate-50"
                >
                  Add text holder
                </button>
                <button
                  type="button"
                  onClick={addCharacterBreakLine}
                  className="w-full rounded-full border border-slate-300 bg-white px-4 py-3 text-sm font-semibold text-slate-900 transition hover:bg-slate-50"
                >
                  Add break line
                </button>
                <button
                  type="button"
                  onClick={addCharacterTag}
                  className="w-full rounded-full border border-slate-300 bg-white px-4 py-3 text-sm font-semibold text-slate-900 transition hover:bg-slate-50"
                >
                  Add tag
                </button>
              </div>
              <p className="text-sm leading-6 text-slate-500">
                These controls apply to the character card currently active on the canvas.
              </p>
            </div>
          )}

          {selectedBlock.type === "relationship" && (
            <div className="space-y-4">
              <button
                type="button"
                onClick={openRelationshipNodeEditor}
                className="w-full rounded-full border border-slate-300 bg-white px-4 py-3 text-sm font-semibold text-slate-900 transition hover:bg-slate-50"
              >
                Add character
              </button>
              <p className="text-sm leading-6 text-slate-500">
                Click two portraits on the canvas to draw a directed relationship arrow between them.
              </p>
            </div>
          )}

          {selectedBlock.type === "timeline" && (
            <div className="space-y-4">
              <label className="block text-sm font-medium text-slate-700">
                Direction
                <select
                  value={selectedBlock.data.direction}
                  onChange={(event) => updateField("direction", event.target.value)}
                  className="mt-2 w-full rounded-3xl border border-stone-300 bg-white px-4 py-3 text-sm text-slate-900 outline-none"
                >
                  <option value="horizontal">Horizontal</option>
                  <option value="vertical">Vertical</option>
                </select>
              </label>
              <div className="grid gap-3">
                <button
                  type="button"
                  onClick={addTimelineImage}
                  className="w-full rounded-full border border-slate-300 bg-white px-4 py-3 text-sm font-semibold text-slate-900 transition hover:bg-slate-50"
                >
                  Add image
                </button>
                <button
                  type="button"
                  onClick={addTimelineText}
                  className="w-full rounded-full border border-slate-300 bg-white px-4 py-3 text-sm font-semibold text-slate-900 transition hover:bg-slate-50"
                >
                  Add text
                </button>
                <button
                  type="button"
                  onClick={addTimelineBreakLine}
                  className="w-full rounded-full border border-slate-300 bg-white px-4 py-3 text-sm font-semibold text-slate-900 transition hover:bg-slate-50"
                >
                  Add break line
                </button>
              </div>
              <p className="text-sm leading-6 text-slate-500">
                These controls apply to the active event card on the timeline.
              </p>
            </div>
          )}

          {selectedBlock.type === "gallery" && (() => {
            return (
              <div className="space-y-4">
                <button
                  type="button"
                  onClick={addGalleryImage}
                  className="inline-flex cursor-pointer items-center gap-2 rounded-full border border-slate-300 bg-white px-4 py-3 text-sm font-semibold text-slate-900 hover:bg-slate-50"
                >
                  Add image
                </button>
                <div className="space-y-3 rounded-3xl border border-stone-200 bg-white p-4">
                  <label className="flex items-center justify-between gap-4 text-sm font-medium text-slate-700">
                    Auto-play
                    <input
                      type="checkbox"
                      checked={selectedBlock.data.autoPlay ?? true}
                      onChange={(event) => updateField("autoPlay", event.target.checked)}
                      className="h-5 w-5 rounded border border-stone-300 bg-white"
                    />
                  </label>
                  <label className="block text-sm font-medium text-slate-700">
                    Interval
                    <input
                      type="number"
                      min={1500}
                      step={500}
                      value={selectedBlock.data.interval ?? 4000}
                      onChange={(event) => updateField("interval", Math.max(1500, Number(event.target.value) || 4000))}
                      className="mt-2 w-full rounded-3xl border border-stone-300 bg-slate-50 px-4 py-3 text-sm text-slate-900 outline-none"
                    />
                  </label>
                  <label className="flex items-center justify-between gap-4 text-sm font-medium text-slate-700">
                    Show arrows
                    <input
                      type="checkbox"
                      checked={selectedBlock.data.showArrows ?? true}
                      onChange={(event) => updateField("showArrows", event.target.checked)}
                      className="h-5 w-5 rounded border border-stone-300 bg-white"
                    />
                  </label>
                  <label className="flex items-center justify-between gap-4 text-sm font-medium text-slate-700">
                    Show indicators
                    <input
                      type="checkbox"
                      checked={selectedBlock.data.showIndicators ?? true}
                      onChange={(event) => updateField("showIndicators", event.target.checked)}
                      className="h-5 w-5 rounded border border-stone-300 bg-white"
                    />
                  </label>
                  <label className="flex items-center justify-between gap-4 text-sm font-medium text-slate-700">
                    Loop navigation
                    <input
                      type="checkbox"
                      checked={selectedBlock.data.loop ?? true}
                      onChange={(event) => updateField("loop", event.target.checked)}
                      className="h-5 w-5 rounded border border-stone-300 bg-white"
                    />
                  </label>
                </div>
              </div>
            );
          })()}

          {selectedBlock.type === "lore" && (
            <div className="space-y-4">
              <div className="grid gap-3">
                <button
                  type="button"
                  onClick={() => addLoreItem("title")}
                  className="w-full rounded-full border border-slate-300 bg-white px-4 py-3 text-sm font-semibold text-slate-900 transition hover:bg-slate-50"
                >
                  Add title
                </button>
                <button
                  type="button"
                  onClick={() => addLoreItem("text")}
                  className="w-full rounded-full border border-slate-300 bg-white px-4 py-3 text-sm font-semibold text-slate-900 transition hover:bg-slate-50"
                >
                  Add text
                </button>
                <button
                  type="button"
                  onClick={addLoreBreakLine}
                  className="w-full rounded-full border border-slate-300 bg-white px-4 py-3 text-sm font-semibold text-slate-900 transition hover:bg-slate-50"
                >
                  Add breakline
                </button>
              </div>
              <p className="text-sm leading-6 text-slate-500">
                Add items here, then move and resize them directly inside the lore workspace.
              </p>
            </div>
          )}

          {selectedBlock.type === "divider" && (
            <div className="space-y-4">
              <label className="flex items-center gap-3 text-sm font-medium text-slate-700">
	                <input
	                  type="checkbox"
	                  checked={isDividerVisible(selectedBlock.data)}
	                  onChange={(event) => updateField("visible", event.target.checked)}
	                  className="h-5 w-5 rounded border border-stone-300 bg-white"
	                />
                Show divider
              </label>
            </div>
          )}

        </div>
      ) : (
        <div className="rounded-[1.15rem] border border-dashed border-stone-300 bg-white/55 p-5 text-stone-500">
          <p>Select a section to reveal editing controls here. The sidebar adapts to your active page section.</p>
        </div>
      )}
    </div>
  );
}
