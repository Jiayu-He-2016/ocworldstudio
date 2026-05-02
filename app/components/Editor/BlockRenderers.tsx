"use client";

import { useCallback, useEffect, useMemo, useRef, useState, type CSSProperties, type MouseEvent, type PointerEvent, type ReactNode } from "react";
import { EditorContent, useEditor } from "@tiptap/react";
import type {
  ProjectBlock,
  CharacterBreakLine,
  CharacterData,
  CharacterTag,
  CharacterTextHolder,
  HeroBlockData,
  ImageTextBlockData,
  GalleryBlockData,
  GalleryImage,
  CharacterBlockData,
  RelationshipBlockData,
  RelationshipConnection,
  RelationshipNode,
  TimelineTextHolder,
  TimelineBlockData,
  LoreBlockData,
  ImageTextItem,
  HeroTextItem,
  TimelineEvent,
  TimelineImageHolder,
  TimelineBreakLine,
  LoreTextHolder,
  LoreBreakLine,
  BlockLink,
  ProjectPage,
} from "../../lib/ocworld";
import { createCharacterCard, createTimelineEvent, fitImageTextWorkspaceHeight, fitLoreWorkspaceHeight, heroBackgroundChoices, isDividerVisible, normalizeCharacters, normalizeImageTextData, normalizeTimelineEvents } from "../../lib/ocworld";
import { moveCanvasRect, resizeCanvasRect, type CanvasResizeHandle } from "../../lib/canvasGeometry";
import { PageLinkProvider, RichTextToolbar, richTextExtensions, usePageLinkPages } from "./RichTextEditor";

interface BlockRendererProps {
  block: ProjectBlock;
  pages?: ProjectPage[];
  previewMode?: boolean;
  onUpdate?: (block: ProjectBlock) => void;
}

function createUniqueId() {
  return `${Math.random().toString(36).slice(2, 10)}-${Date.now()}`;
}

function readFileAsDataUrl(file: File) {
  return new Promise<string>((resolve) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.readAsDataURL(file);
  });
}

type ResizeHandle = CanvasResizeHandle;

export default function BlockRenderer({ block, pages = [], previewMode, onUpdate }: BlockRendererProps) {
  let rendered: ReactNode = null;
  switch (block.type) {
    case "hero":
      rendered = <HeroBlock block={block} previewMode={previewMode} onUpdate={onUpdate} />;
      break;
    case "imageText":
      rendered = <ImageTextBlock block={block} previewMode={previewMode} onUpdate={onUpdate} />;
      break;
    case "gallery":
      rendered = <GalleryBlock block={block} previewMode={previewMode} onUpdate={onUpdate} />;
      break;
    case "character":
      rendered = <CharacterBlock block={block} previewMode={previewMode} onUpdate={onUpdate} />;
      break;
    case "relationship":
      rendered = <RelationshipBlock block={block} previewMode={previewMode} onUpdate={onUpdate} />;
      break;
    case "timeline":
      rendered = <TimelineBlock block={block} previewMode={previewMode} onUpdate={onUpdate} />;
      break;
    case "lore":
      rendered = <LoreBlock block={block} previewMode={previewMode} onUpdate={onUpdate} />;
      break;
    case "divider":
      rendered = <DividerBlock block={block} />;
      break;
  }
  return <PageLinkProvider pages={pages}>{rendered}</PageLinkProvider>;
}

function HeroBlock({
  block,
  previewMode,
  onUpdate,
}: {
  block: ProjectBlock & { type: "hero"; data: HeroBlockData };
  previewMode?: boolean;
  onUpdate?: (block: ProjectBlock) => void;
}) {
  const textItems = useMemo<HeroTextItem[]>(() => {
    if (Array.isArray(block.data.textItems)) {
      return block.data.textItems;
    }

    return [
      ...(block.data.titleVisible === false
        ? []
        : [
            {
              id: `${block.id}-title`,
              text: block.data.title || "<h1>Start your story title</h1>",
              x: 12,
              y: 28,
              width: 76,
              height: 18,
              align: block.data.titleAlign,
              fontSize: block.data.titleSize,
              color: block.data.titleColor,
            } satisfies HeroTextItem,
          ]),
      ...(block.data.subtitleVisible === false
        ? []
        : [
            {
              id: `${block.id}-subtitle`,
              text: block.data.subtitle || "<p>Start your story subtitle</p>",
              x: 22,
              y: 50,
              width: 56,
              height: 14,
              align: block.data.subtitleAlign,
              fontSize: block.data.subtitleSize,
              color: block.data.subtitleColor,
            } satisfies HeroTextItem,
          ]),
    ];
  }, [block]);
  const [selectedItemId, setSelectedItemId] = useState<string | null>(null);
  const [dragState, setDragState] = useState<
    | {
        id: string;
        startX: number;
        startY: number;
        originX: number;
        originY: number;
        originWidth: number;
        originHeight: number;
      }
    | null
  >(null);
  const [resizeState, setResizeState] = useState<
    | {
        id: string;
        handle: ResizeHandle;
        startX: number;
        startY: number;
        originX: number;
        originY: number;
        originWidth: number;
        originHeight: number;
      }
    | null
  >(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const update = useCallback((patch: Partial<HeroBlockData>) => {
    onUpdate?.({ ...block, data: { ...block.data, ...patch } });
  }, [block, onUpdate]);

  const updateTextItem = useCallback(
    (id: string, patch: Partial<HeroTextItem>) => {
      update({
        textItems: textItems.map((item) => (item.id === id ? { ...item, ...patch } : item)),
      });
    },
    [textItems, update]
  );

  const removeTextItem = (id: string) => {
    update({ textItems: textItems.filter((item) => item.id !== id) });
    setSelectedItemId((current) => (current === id ? null : current));
  };

  const startDrag = (id: string, event: PointerEvent<HTMLElement>) => {
    if (previewMode || !containerRef.current) return;
    const item = textItems.find((item) => item.id === id);
    if (!item) return;
    event.preventDefault();
    event.stopPropagation();
    setSelectedItemId(id);
    setDragState({
      id,
      startX: event.clientX,
      startY: event.clientY,
      originX: item.x,
      originY: item.y,
      originWidth: item.width,
      originHeight: item.height,
    });
  };

  const startResize = (id: string, handle: ResizeHandle, event: PointerEvent<HTMLDivElement>) => {
    if (previewMode || !containerRef.current) return;
    const item = textItems.find((item) => item.id === id);
    if (!item) return;
    event.preventDefault();
    event.stopPropagation();
    setSelectedItemId(id);
    setResizeState({
      id,
      handle,
      startX: event.clientX,
      startY: event.clientY,
      originX: item.x,
      originY: item.y,
      originWidth: item.width,
      originHeight: item.height,
    });
  };

  useEffect(() => {
    if (!dragState || !containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    if (!rect.width || !rect.height) return;

    const handlePointerMove = (event: globalThis.PointerEvent) => {
      const xDelta = ((event.clientX - dragState.startX) / rect.width) * 100;
      const yDelta = ((event.clientY - dragState.startY) / rect.height) * 100;
      const nextRect = moveCanvasRect(
        {
          x: dragState.originX,
          y: dragState.originY,
          width: dragState.originWidth,
          height: dragState.originHeight,
        },
        xDelta,
        yDelta
      );
      updateTextItem(dragState.id, { x: nextRect.x, y: nextRect.y });
    };

    const handlePointerUp = () => {
      setDragState(null);
    };

    window.addEventListener("pointermove", handlePointerMove);
    window.addEventListener("pointerup", handlePointerUp);

    return () => {
      window.removeEventListener("pointermove", handlePointerMove);
      window.removeEventListener("pointerup", handlePointerUp);
    };
  }, [dragState, updateTextItem]);

  useEffect(() => {
    if (!resizeState || !containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    if (!rect.width || !rect.height) return;

    const handlePointerMove = (event: globalThis.PointerEvent) => {
      const xDelta = ((event.clientX - resizeState.startX) / rect.width) * 100;
      const yDelta = ((event.clientY - resizeState.startY) / rect.height) * 100;
      updateTextItem(
        resizeState.id,
        resizeCanvasRect(
          {
            x: resizeState.originX,
            y: resizeState.originY,
            width: resizeState.originWidth,
            height: resizeState.originHeight,
          },
          resizeState.handle,
          xDelta,
          yDelta
        )
      );
    };

    const handlePointerUp = () => {
      setResizeState(null);
    };

    window.addEventListener("pointermove", handlePointerMove);
    window.addEventListener("pointerup", handlePointerUp);

    return () => {
      window.removeEventListener("pointermove", handlePointerMove);
      window.removeEventListener("pointerup", handlePointerUp);
    };
  }, [resizeState, updateTextItem]);

  const heroBackgroundStyle = block.data.backgroundUrl ? "" : block.data.backgroundStyle ?? heroBackgroundChoices[0].style;
  const heroBackgroundIsColor = heroBackgroundStyle.trim().startsWith("#");

  return (
    <div className="relative rounded-[1.75rem] bg-slate-950/5">
      <div
        ref={containerRef}
        className="relative min-h-[420px] overflow-visible rounded-[1.75rem] bg-cover bg-center"
        data-testid="hero-workspace"
        onPointerDown={(event) => {
          if (event.target === event.currentTarget) {
            setSelectedItemId(null);
          }
        }}
        style={{
          backgroundColor: heroBackgroundIsColor ? heroBackgroundStyle : "#0f172a",
          backgroundImage: block.data.backgroundUrl ? `url(${block.data.backgroundUrl})` : heroBackgroundIsColor ? undefined : heroBackgroundStyle,
          backgroundSize: block.data.backgroundSize ?? "cover",
          backgroundPosition: block.data.backgroundPosition ?? "center",
        }}
      >
        <div className="pointer-events-none absolute inset-0 rounded-[1.75rem] bg-slate-950/20" />
        {textItems.map((item) => (
          <HeroTextBox
            key={item.id}
            item={item}
            previewMode={previewMode}
            isSelected={selectedItemId === item.id}
            isMoving={dragState?.id === item.id}
            onSelect={setSelectedItemId}
            onChange={(text) => updateTextItem(item.id, { text })}
            onDelete={() => removeTextItem(item.id)}
            onMoveStart={startDrag}
            onResizeStart={startResize}
          />
        ))}
      </div>
    </div>
  );
}

function HeroTextBox({
  item,
  previewMode,
  isSelected,
  isMoving,
  onSelect,
  onChange,
  onDelete,
  onMoveStart,
  onResizeStart,
}: {
  item: HeroTextItem;
  previewMode?: boolean;
  isSelected: boolean;
  isMoving: boolean;
  onSelect: (id: string | null) => void;
  onChange: (value: string) => void;
  onDelete: () => void;
  onMoveStart: (id: string, event: PointerEvent<HTMLElement>) => void;
  onResizeStart: (id: string, handle: ResizeHandle, event: PointerEvent<HTMLDivElement>) => void;
}) {
  const editor = useEditor({
    extensions: richTextExtensions,
    content: item.text || "<p>Start typing here.</p>",
    editable: !previewMode,
    immediatelyRender: false,
    editorProps: {
      attributes: {
        class: "rich-text-content h-full min-h-full max-w-full overflow-auto p-3 focus:outline-none",
      },
      handleDOMEvents: {
        focus: () => {
          onSelect(item.id);
          return false;
        },
      },
    },
    onUpdate: ({ editor }) => {
      onChange(editor.getHTML());
    },
  });

  useEffect(() => {
    if (!editor) return;
    editor.setEditable(!previewMode);
  }, [editor, previewMode]);

  useEffect(() => {
    if (!editor) return;
    const nextContent = item.text || "<p>Start typing here.</p>";
    if (nextContent !== editor.getHTML()) {
      editor.commands.setContent(nextContent);
    }
  }, [editor, item.text]);

  const boxStyle = {
    top: `${item.y}%`,
    left: `${item.x}%`,
    width: `${item.width}%`,
    height: `${item.height}%`,
    color: item.color,
    fontSize: item.fontSize,
    textAlign: item.align,
  } satisfies CSSProperties;

  if (previewMode) {
    return (
      <div
        className="hero-inline-text absolute overflow-auto drop-shadow-[0_1px_18px_rgba(15,23,42,0.35)]"
        style={boxStyle}
        dangerouslySetInnerHTML={{ __html: item.text }}
      />
    );
  }

  return (
    <div
      className={`hero-inline-text absolute rounded-[1rem] drop-shadow-[0_1px_18px_rgba(15,23,42,0.35)] transition ${isSelected ? "ring-2 ring-sky-300" : "hover:ring-1 hover:ring-white/70"} ${isMoving ? "shadow-xl shadow-sky-900/30" : ""}`}
      data-testid="hero-text-box"
      style={{ ...boxStyle, touchAction: "none", zIndex: isSelected ? 30 : undefined }}
      onClick={(event) => {
        event.stopPropagation();
        onSelect(item.id);
      }}
      onPointerDown={(event) => {
        event.stopPropagation();
        onSelect(item.id);
      }}
    >
      {isSelected ? (
        <div
          className="absolute bottom-full left-0 z-40 mb-3 flex max-w-[min(680px,calc(100vw-3rem))] flex-wrap items-center gap-2 rounded-[1rem] border border-stone-200 bg-white p-1 shadow-xl shadow-slate-900/20"
          onClick={(event) => event.stopPropagation()}
          onPointerDown={(event) => event.stopPropagation()}
        >
          <RichTextToolbar editor={editor} compact allowImages={false} />
          <button
            type="button"
            className="cursor-move rounded-full border border-slate-300 bg-white px-3 py-1.5 text-xs font-semibold text-slate-800 hover:bg-slate-50"
            onPointerDown={(event) => onMoveStart(item.id, event)}
          >
            Move
          </button>
          <button
            type="button"
            onClick={onDelete}
            className="rounded-full border border-rose-200 bg-rose-50 px-3 py-1.5 text-xs font-semibold text-rose-700 hover:bg-rose-100"
          >
            Delete
          </button>
        </div>
      ) : null}

      {editor ? <EditorContent editor={editor} className="h-full" /> : null}

      {isSelected ? (
        <>
          <div
            className="absolute left-0 top-0 h-4 w-4 -translate-x-1/2 -translate-y-1/2 cursor-nwse-resize rounded-full border border-white bg-slate-900/80"
            onPointerDown={(event) => onResizeStart(item.id, "tl", event)}
          />
          <div
            className="absolute right-0 top-0 h-4 w-4 -translate-y-1/2 translate-x-1/2 cursor-nesw-resize rounded-full border border-white bg-slate-900/80"
            onPointerDown={(event) => onResizeStart(item.id, "tr", event)}
          />
          <div
            className="absolute bottom-0 left-0 h-4 w-4 -translate-x-1/2 translate-y-1/2 cursor-nesw-resize rounded-full border border-white bg-slate-900/80"
            onPointerDown={(event) => onResizeStart(item.id, "bl", event)}
          />
          <div
            className="absolute bottom-0 right-0 h-4 w-4 translate-x-1/2 translate-y-1/2 cursor-nwse-resize rounded-full border border-white bg-slate-900/80"
            onPointerDown={(event) => onResizeStart(item.id, "br", event)}
          />
        </>
      ) : null}
    </div>
  );
}
function ImageTextBlock({
  block,
  previewMode,
  onUpdate,
}: {
  block: ProjectBlock & { type: "imageText"; data: ImageTextBlockData };
  previewMode?: boolean;
  onUpdate?: (block: ProjectBlock) => void;
}) {
  const imageTextData = useMemo(() => normalizeImageTextData(block.data), [block.data]);
  const items = useMemo(() => imageTextData.items, [imageTextData.items]);
  const [selectedItemId, setSelectedItemId] = useState<string | null>(null);
  const [dragState, setDragState] = useState<
    | {
        id: string;
        startX: number;
        startY: number;
        originX: number;
        originY: number;
        originWidth: number;
        originHeight: number;
      }
    | null
  >(null);
  const [resizeState, setResizeState] = useState<
    | {
        id: string;
        handle: ResizeHandle;
        startX: number;
        startY: number;
        originX: number;
        originY: number;
        originWidth: number;
        originHeight: number;
      }
    | null
  >(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const updateImageText = useCallback(
    (patch: Partial<ImageTextBlockData>) => {
      onUpdate?.({
        ...block,
        data: fitImageTextWorkspaceHeight({ ...imageTextData, ...patch }, imageTextData.height ?? 560),
      });
    },
    [block, imageTextData, onUpdate]
  );

  const updateItem = useCallback(
    (id: string, patch: Partial<ImageTextItem>) => {
      updateImageText({ items: items.map((item) => (item.id === id ? { ...item, ...patch } : item)) });
    },
    [items, updateImageText]
  );

  const removeItem = (id: string) => {
    onUpdate?.({
      ...block,
      data: fitImageTextWorkspaceHeight({ ...imageTextData, items: items.filter((item) => item.id !== id) }, imageTextData.height ?? 560),
    });
    setSelectedItemId((current) => (current === id ? null : current));
  };

  const updateImage = async (id: string, file: File) => {
    const url = await readFileAsDataUrl(file);
    updateItem(id, { imageUrl: url });
  };

  const selectItem = (id: string) => {
    setSelectedItemId(id);
  };

  const startDrag = (id: string, event: PointerEvent<HTMLElement>) => {
    if (previewMode || !containerRef.current) return;
    const item = items.find((item) => item.id === id);
    if (!item) return;
    event.preventDefault();
    event.stopPropagation();
    setSelectedItemId(id);
    setDragState({
      id,
      startX: event.clientX,
      startY: event.clientY,
      originX: item.x,
      originY: item.y,
      originWidth: item.width,
      originHeight: item.height,
    });
  };

  const startResize = (id: string, handle: ResizeHandle, event: PointerEvent<HTMLDivElement>) => {
    if (previewMode || !containerRef.current) return;
    const item = items.find((item) => item.id === id);
    if (!item) return;
    event.preventDefault();
    event.stopPropagation();
    setSelectedItemId(id);
    setResizeState({
      id,
      handle,
      startX: event.clientX,
      startY: event.clientY,
      originX: item.x,
      originY: item.y,
      originWidth: item.width,
      originHeight: item.height,
    });
  };

  useEffect(() => {
    if (!dragState || !containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    if (!rect.width || !rect.height) return;

    const handlePointerMove = (event: globalThis.PointerEvent) => {
      const xDelta = ((event.clientX - dragState.startX) / rect.width) * 100;
      const yDelta = ((event.clientY - dragState.startY) / rect.height) * 100;
      const nextRect = moveCanvasRect(
        {
          x: dragState.originX,
          y: dragState.originY,
          width: dragState.originWidth,
          height: dragState.originHeight,
        },
        xDelta,
        yDelta
      );
      updateItem(dragState.id, { x: nextRect.x, y: nextRect.y });
    };

    const handlePointerUp = () => {
      setDragState(null);
    };

    window.addEventListener("pointermove", handlePointerMove);
    window.addEventListener("pointerup", handlePointerUp);

    return () => {
      window.removeEventListener("pointermove", handlePointerMove);
      window.removeEventListener("pointerup", handlePointerUp);
    };
  }, [dragState, updateItem]);

  useEffect(() => {
    if (!resizeState || !containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    if (!rect.width || !rect.height) return;

    const handlePointerMove = (event: globalThis.PointerEvent) => {
      const xDelta = ((event.clientX - resizeState.startX) / rect.width) * 100;
      const yDelta = ((event.clientY - resizeState.startY) / rect.height) * 100;
      updateItem(
        resizeState.id,
        resizeCanvasRect(
          {
            x: resizeState.originX,
            y: resizeState.originY,
            width: resizeState.originWidth,
            height: resizeState.originHeight,
          },
          resizeState.handle,
          xDelta,
          yDelta
        )
      );
    };

    const handlePointerUp = () => {
      setResizeState(null);
    };

    window.addEventListener("pointermove", handlePointerMove);
    window.addEventListener("pointerup", handlePointerUp);

    return () => {
      window.removeEventListener("pointermove", handlePointerMove);
      window.removeEventListener("pointerup", handlePointerUp);
    };
  }, [resizeState, updateItem]);

  return (
    <div className="space-y-6">
      <div className="relative p-0">
        <div
          ref={containerRef}
          className={`relative rounded-[1.5rem] ${previewMode ? "" : "border border-dashed bg-transparent"}`}
          data-testid="image-text-workspace"
          onPointerDown={(event) => {
            if (event.target === event.currentTarget) {
              setSelectedItemId(null);
            }
          }}
          style={{
            height: `${imageTextData.height ?? 560}px`,
            borderColor: previewMode ? undefined : "var(--oc-page-line, rgba(15,23,42,0.24))",
            backgroundImage: previewMode
              ? undefined
              : `linear-gradient(var(--oc-page-grid, rgba(15,23,42,0.14)) 1px, transparent 1px), linear-gradient(90deg, var(--oc-page-grid, rgba(15,23,42,0.14)) 1px, transparent 1px)`,
            backgroundSize: previewMode ? undefined : "40px 40px",
          }}
        >
          {items.length === 0 ? (
            <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center text-center text-slate-400">
              <p className="text-lg font-semibold">Blank canvas ready</p>
              <p className="mt-2 max-w-md text-sm leading-6">Add text and image boxes from the settings panel.</p>
            </div>
          ) : null}

          {items.map((item) => (
            <ImageTextCanvasItem
              key={item.id}
              item={item}
              previewMode={previewMode}
              isSelected={selectedItemId === item.id}
              isMoving={dragState?.id === item.id}
              onSelect={selectItem}
              onRemove={removeItem}
              onImageUpdate={updateImage}
              onTextChange={(id, text) => updateItem(id, { text })}
              onLinkChange={(id, link) => updateItem(id, { link })}
              onMoveStart={startDrag}
              onResizeStart={startResize}
            />
          ))}
        </div>
      </div>
    </div>
  );
}

function ImageTextCanvasItem({
  item,
  previewMode,
  isSelected,
  isMoving,
  onSelect,
  onRemove,
  onImageUpdate,
  onTextChange,
  onLinkChange,
  onMoveStart,
  onResizeStart,
}: {
  item: ImageTextItem;
  previewMode?: boolean;
  isSelected: boolean;
  isMoving: boolean;
  onSelect: (id: string) => void;
  onRemove: (id: string) => void;
  onImageUpdate: (id: string, file: File) => Promise<void>;
  onTextChange: (id: string, text: string) => void;
  onLinkChange: (id: string, link: BlockLink) => void;
  onMoveStart: (id: string, event: PointerEvent<HTMLElement>) => void;
  onResizeStart: (id: string, handle: ResizeHandle, event: PointerEvent<HTMLDivElement>) => void;
}) {
  return (
    <div
      className={`absolute rounded-[1rem] ${isSelected ? "ring-2 ring-sky-400" : "ring-1 ring-slate-200/80"} ${isMoving ? "shadow-xl shadow-sky-200/60" : ""}`}
      data-testid={`image-text-${item.type}-box`}
      style={{
        top: `${item.y}%`,
        left: `${item.x}%`,
        width: `${item.width}%`,
        height: `${item.height}%`,
        touchAction: "none",
        zIndex: isSelected ? 30 : undefined,
      }}
      onClick={(event) => {
        event.stopPropagation();
        onSelect(item.id);
      }}
      onDoubleClick={(event) => {
        event.stopPropagation();
        onSelect(item.id);
      }}
      {...pageLinkAttributes(item.link)}
    >
      <div
        className={`relative h-full w-full rounded-[1rem] shadow-sm ${item.type === "text" ? "border border-white/10 bg-white/5 backdrop-blur-[2px]" : "bg-white"}`}
        style={{ cursor: previewMode ? "default" : undefined }}
      >
        {item.type === "text" ? (
          <ImageTextInlineEditor
            item={item}
            previewMode={previewMode}
            isSelected={isSelected}
            onSelect={onSelect}
            onChange={(text) => onTextChange(item.id, text)}
          />
        ) : (
          <div
            className="relative h-full w-full overflow-hidden rounded-[1rem]"
            onPointerDown={!previewMode ? (event) => onMoveStart(item.id, event) : undefined}
          >
            {item.imageUrl ? (
              <img src={item.imageUrl} alt={item.caption || "Image block"} className="h-full w-full object-cover" />
            ) : (
              <div className="flex h-full items-center justify-center p-4 text-center text-sm text-slate-500">Upload an image from the selected box controls.</div>
            )}
          </div>
        )}

        {!previewMode && isSelected ? (
          <div className="pointer-events-none absolute inset-x-0 bottom-0 flex items-center justify-between gap-2 rounded-b-[1rem] bg-white/85 p-2 text-xs text-slate-700 backdrop-blur-sm">
            <button
              type="button"
              className="pointer-events-auto cursor-move rounded-full border border-slate-300 bg-white px-3 py-1 text-xs font-semibold text-slate-800 hover:bg-slate-50"
              onPointerDown={(event) => onMoveStart(item.id, event)}
            >
              Move
            </button>
            <div className="pointer-events-auto flex items-center gap-2">
              {item.type === "image" ? (
                <>
                  <ImageLinkControl link={item.link} onChange={(link) => onLinkChange(item.id, link)} />
                  <label className="rounded-full border border-slate-300 bg-white px-3 py-1 text-xs font-semibold text-slate-900 hover:bg-slate-50">
                    Image
                    <input
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={async (event) => {
                        const input = event.currentTarget;
                        const file = input.files?.[0];
                        if (file) {
                          await onImageUpdate(item.id, file);
                        }
                        input.value = "";
                      }}
                    />
                  </label>
                </>
              ) : null}
              <button
                type="button"
                onClick={(event) => {
                  event.stopPropagation();
                  onRemove(item.id);
                }}
                className="pointer-events-auto rounded-full border border-rose-200 bg-rose-50 px-3 py-1 text-xs font-semibold text-rose-700 hover:bg-rose-100"
              >
                Delete
              </button>
            </div>
          </div>
        ) : null}

        {!previewMode && isSelected ? (
          <>
            <div
              className="absolute left-0 top-0 h-4 w-4 -translate-x-1/2 -translate-y-1/2 cursor-nwse-resize rounded-full border border-white bg-slate-900/80"
              onPointerDown={(event) => onResizeStart(item.id, "tl", event)}
            />
            <div
              className="absolute right-0 top-0 h-4 w-4 -translate-y-1/2 translate-x-1/2 cursor-nesw-resize rounded-full border border-white bg-slate-900/80"
              onPointerDown={(event) => onResizeStart(item.id, "tr", event)}
            />
            <div
              className="absolute bottom-0 left-0 h-4 w-4 -translate-x-1/2 translate-y-1/2 cursor-nesw-resize rounded-full border border-white bg-slate-900/80"
              onPointerDown={(event) => onResizeStart(item.id, "bl", event)}
            />
            <div
              className="absolute bottom-0 right-0 h-4 w-4 translate-x-1/2 translate-y-1/2 cursor-nwse-resize rounded-full border border-white bg-slate-900/80"
              onPointerDown={(event) => onResizeStart(item.id, "br", event)}
            />
          </>
        ) : null}
      </div>
    </div>
  );
}

function ImageTextInlineEditor({
  item,
  previewMode,
  isSelected,
  onSelect,
  onChange,
}: {
  item: ImageTextItem;
  previewMode?: boolean;
  isSelected: boolean;
  onSelect: (id: string) => void;
  onChange: (value: string) => void;
}) {
  const editor = useEditor({
    extensions: richTextExtensions,
    content: item.text || "<p>Start typing here.</p>",
    editable: !previewMode,
    immediatelyRender: false,
    editorProps: {
      attributes: {
        class: "rich-text-content h-full min-h-full max-w-full overflow-auto p-3 focus:outline-none",
      },
      handleDOMEvents: {
        focus: () => {
          onSelect(item.id);
          return false;
        },
      },
    },
    onUpdate: ({ editor }) => {
      onChange(editor.getHTML());
    },
  });

  useEffect(() => {
    if (!editor) return;
    editor.setEditable(!previewMode);
  }, [editor, previewMode]);

  useEffect(() => {
    if (!editor) return;
    const nextContent = item.text || "<p>Start typing here.</p>";
    if (nextContent !== editor.getHTML()) {
      editor.commands.setContent(nextContent);
    }
  }, [editor, item.text]);

  if (previewMode) {
    return (
      <div
        className="rich-text-content h-full overflow-auto p-3"
        style={{ textAlign: item.align, fontSize: item.fontSize, color: item.color }}
        dangerouslySetInnerHTML={{ __html: item.text || "" }}
      />
    );
  }

  return (
    <div
      className="relative h-full"
      style={{ textAlign: item.align, fontSize: item.fontSize, color: item.color }}
      onPointerDown={(event) => {
        event.stopPropagation();
        onSelect(item.id);
      }}
    >
      {isSelected ? (
        <div
          className="absolute bottom-full left-0 z-40 mb-2 max-w-[min(560px,calc(100vw-3rem))] rounded-[1rem] border border-stone-200 bg-white shadow-xl shadow-slate-200/70"
          onClick={(event) => event.stopPropagation()}
          onPointerDown={(event) => event.stopPropagation()}
        >
          <RichTextToolbar editor={editor} compact allowImages={false} />
        </div>
      ) : null}
      {editor ? <EditorContent editor={editor} className="h-full" /> : null}
    </div>
  );
}

function GalleryBlock({
  block,
  previewMode,
  onUpdate,
}: {
  block: ProjectBlock & { type: "gallery"; data: GalleryBlockData };
  previewMode?: boolean;
  onUpdate?: (block: ProjectBlock) => void;
}) {
  const viewportRef = useRef<HTMLDivElement | null>(null);
  const resumeTimerRef = useRef<number | null>(null);
  const justDraggedRef = useRef(false);
  const activeIndexRef = useRef(0);
  const images = useMemo(() => {
    const savedImages = Array.isArray(block.data.images) ? block.data.images : [];
    if (savedImages.length) {
      return savedImages;
    }
    return [
      { id: `${block.id}-blank-1`, url: "", caption: "", width: "medium" as const },
      { id: `${block.id}-blank-2`, url: "", caption: "", width: "medium" as const },
      { id: `${block.id}-blank-3`, url: "", caption: "", width: "medium" as const },
    ];
  }, [block.data.images, block.id]);
  const [activeIndex, setActiveIndex] = useState(0);
  const [virtualIndex, setVirtualIndex] = useState(images.length > 1 ? 1 : 0);
  const [dragOffset, setDragOffset] = useState(0);
  const [transitionEnabled, setTransitionEnabled] = useState(true);
  const [isHovering, setIsHovering] = useState(false);
  const [isUserPaused, setIsUserPaused] = useState(false);
  const [dragState, setDragState] = useState<{
    pointerId: number;
    startX: number;
    width: number;
  } | null>(null);
  const imageCount = images.length;
  const autoPlay = block.data.autoPlay ?? true;
  const interval = Math.max(1500, Number(block.data.interval ?? 4000));
  const showIndicators = block.data.showIndicators ?? true;
  const showArrows = block.data.showArrows ?? true;
  const loop = block.data.loop ?? true;
  const canNavigate = imageCount > 1;
  const safeActiveIndex = imageCount ? ((activeIndex % imageCount) + imageCount) % imageCount : 0;
  const renderedImages = useMemo(() => {
    if (!loop || imageCount <= 1) {
      return images;
    }
    return [images[imageCount - 1], ...images, images[0]];
  }, [imageCount, images, loop]);
  const slideIndex = loop && imageCount > 1 ? virtualIndex : safeActiveIndex;

  const pauseForInteraction = useCallback(() => {
    setIsUserPaused(true);
    if (resumeTimerRef.current) {
      window.clearTimeout(resumeTimerRef.current);
    }
    resumeTimerRef.current = window.setTimeout(() => {
      setIsUserPaused(false);
    }, Math.max(2500, interval));
  }, [interval]);

  const jumpTo = useCallback(
    (targetIndex: number, userInitiated = true) => {
      if (!imageCount) return;
      const boundedIndex = loop ? ((targetIndex % imageCount) + imageCount) % imageCount : Math.min(Math.max(targetIndex, 0), imageCount - 1);
      if (userInitiated) {
        pauseForInteraction();
      }
      setTransitionEnabled(true);
      setDragOffset(0);
      activeIndexRef.current = boundedIndex;
      setActiveIndex(boundedIndex);
      setVirtualIndex(loop && imageCount > 1 ? boundedIndex + 1 : boundedIndex);
    },
    [imageCount, loop, pauseForInteraction]
  );

  const moveBy = useCallback(
    (delta: number, userInitiated = true) => {
      if (!canNavigate) return;
      if (userInitiated) {
        pauseForInteraction();
      }
      const nextIndex = loop ? (safeActiveIndex + delta + imageCount) % imageCount : Math.min(Math.max(safeActiveIndex + delta, 0), imageCount - 1);
      if (nextIndex === safeActiveIndex && !loop) return;
      setTransitionEnabled(true);
      setDragOffset(0);
      activeIndexRef.current = nextIndex;
      setActiveIndex(nextIndex);
      setVirtualIndex((current) => (loop && imageCount > 1 ? current + delta : nextIndex));
    },
    [canNavigate, imageCount, loop, pauseForInteraction, safeActiveIndex]
  );

  useEffect(() => {
    if (!imageCount) return;
    const nextIndex = Math.min(activeIndexRef.current, imageCount - 1);
    const frame = window.requestAnimationFrame(() => {
      activeIndexRef.current = nextIndex;
      setActiveIndex(nextIndex);
      setVirtualIndex(loop && imageCount > 1 ? nextIndex + 1 : nextIndex);
    });
    return () => window.cancelAnimationFrame(frame);
  }, [imageCount, loop]);

  useEffect(() => {
    activeIndexRef.current = safeActiveIndex;
  }, [safeActiveIndex]);

  useEffect(() => {
    return () => {
      if (resumeTimerRef.current) {
        window.clearTimeout(resumeTimerRef.current);
      }
    };
  }, []);

  useEffect(() => {
    if (!previewMode || !autoPlay || !canNavigate || isHovering || isUserPaused || dragState) return;
    const timer = window.setInterval(() => {
      moveBy(1, false);
    }, interval);
    return () => window.clearInterval(timer);
  }, [autoPlay, canNavigate, dragState, interval, isHovering, isUserPaused, moveBy, previewMode]);

  const updateImage = async (index: number, file: File) => {
    const url = await readFileAsDataUrl(file);
    const nextImages = images.map((item, idx) => (idx === index ? { ...item, url } : item));
    onUpdate?.({ ...block, data: { ...block.data, images: nextImages } });
  };

  const handleTransitionEnd = () => {
    if (!loop || imageCount <= 1) return;
    if (virtualIndex === 0) {
      setTransitionEnabled(false);
      setVirtualIndex(imageCount);
      window.requestAnimationFrame(() => {
        window.requestAnimationFrame(() => setTransitionEnabled(true));
      });
    } else if (virtualIndex === imageCount + 1) {
      setTransitionEnabled(false);
      setVirtualIndex(1);
      window.requestAnimationFrame(() => {
        window.requestAnimationFrame(() => setTransitionEnabled(true));
      });
    }
  };

  const handlePointerDown = (event: PointerEvent<HTMLDivElement>) => {
    if (!canNavigate || (event.pointerType === "mouse" && event.button !== 0)) return;
    const target = event.target;
    if (target instanceof HTMLElement && target.closest("button,input,label,[data-gallery-upload-target]")) return;
    pauseForInteraction();
    setTransitionEnabled(false);
    setDragState({
      pointerId: event.pointerId,
      startX: event.clientX,
      width: viewportRef.current?.clientWidth ?? event.currentTarget.clientWidth,
    });
    event.currentTarget.setPointerCapture(event.pointerId);
  };

  const handlePointerMove = (event: PointerEvent<HTMLDivElement>) => {
    if (!dragState || dragState.pointerId !== event.pointerId) return;
    const offset = event.clientX - dragState.startX;
    if (Math.abs(offset) > 4) {
      justDraggedRef.current = true;
    }
    setDragOffset(offset);
  };

  const finishDrag = (event: PointerEvent<HTMLDivElement>) => {
    if (!dragState || dragState.pointerId !== event.pointerId) return;
    const offset = event.clientX - dragState.startX;
    const threshold = Math.min(120, dragState.width * 0.18);
    setDragState(null);
    setTransitionEnabled(true);
    if (Math.abs(offset) > threshold) {
      moveBy(offset < 0 ? 1 : -1);
    } else {
      setDragOffset(0);
    }
    if (event.currentTarget.hasPointerCapture(event.pointerId)) {
      event.currentTarget.releasePointerCapture(event.pointerId);
    }
    window.setTimeout(() => {
      justDraggedRef.current = false;
    }, 0);
  };

  const handleClickCapture = (event: MouseEvent<HTMLDivElement>) => {
    if (!justDraggedRef.current) return;
    event.preventDefault();
    event.stopPropagation();
  };

  return (
    <div
      className="group/gallery rounded-[1.75rem] border border-white/10 bg-white/5 shadow-sm shadow-slate-900/10 backdrop-blur-[2px]"
      role="region"
      aria-roledescription="carousel"
      aria-label="Gallery image carousel"
      tabIndex={previewMode ? 0 : -1}
      onKeyDown={(event) => {
        if (event.key === "ArrowLeft") {
          event.preventDefault();
          moveBy(-1);
        } else if (event.key === "ArrowRight") {
          event.preventDefault();
          moveBy(1);
        }
      }}
      onMouseEnter={() => setIsHovering(true)}
      onMouseLeave={() => setIsHovering(false)}
    >
      <p className="sr-only" aria-live="polite">
        Image {safeActiveIndex + 1} of {imageCount}
      </p>
      <div
        ref={viewportRef}
        className="relative touch-pan-y overflow-hidden rounded-[1.75rem]"
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={finishDrag}
        onPointerCancel={finishDrag}
        onClickCapture={handleClickCapture}
      >
        <div
          className={`flex ${transitionEnabled ? "transition-transform duration-500 ease-in-out" : ""}`}
          style={{ transform: `translate3d(calc(-${slideIndex * 100}% + ${dragOffset}px), 0, 0)` }}
          onTransitionEnd={handleTransitionEnd}
        >
          {renderedImages.map((image, renderedIndex) => {
            const imageIndex = loop && imageCount > 1 ? (renderedIndex + imageCount - 1) % imageCount : renderedIndex;
            const isActive = imageIndex === safeActiveIndex;
            return (
            <figure
              key={`${image.id}-${renderedIndex}`}
              className="m-0 aspect-[16/9] min-w-full overflow-hidden bg-white/5"
              aria-hidden={!isActive}
            >
              {previewMode ? (
                <GallerySlide image={image} loading={isActive ? "eager" : "lazy"} />
              ) : (
                <label
                  className="relative block h-full w-full cursor-pointer"
                  data-gallery-upload-target
                  onClick={(event) => event.stopPropagation()}
                  onPointerDown={(event) => event.stopPropagation()}
                >
                  <GallerySlide image={image} loading={isActive ? "eager" : "lazy"} />
                  <div className={`pointer-events-none absolute inset-x-4 bottom-4 z-30 flex justify-center transition ${image.url ? "opacity-0 group-hover/gallery:opacity-100" : "opacity-100"}`}>
                    <span className="rounded-full bg-slate-950/60 px-3 py-1.5 text-xs font-semibold text-white shadow-lg shadow-slate-950/20 backdrop-blur">
                      Click image to upload
                    </span>
                  </div>
                  <input
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={async (event) => {
                      const input = event.currentTarget;
                      const file = input.files?.[0];
                      if (file) {
                        await updateImage(imageIndex, file);
                      }
                      input.value = "";
                    }}
                  />
                </label>
              )}
            </figure>
            );
          })}
        </div>

        {showArrows && canNavigate ? (
          <>
            <button
              type="button"
              aria-label="Previous image"
              className="absolute left-3 top-1/2 inline-flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full bg-slate-950/45 text-white opacity-100 shadow-lg shadow-slate-950/20 backdrop-blur transition hover:bg-slate-950/65 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white md:opacity-0 md:group-hover/gallery:opacity-100 md:focus-visible:opacity-100"
              onClick={(event) => {
                event.stopPropagation();
                moveBy(-1);
              }}
            >
              <svg aria-hidden="true" viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="2.4">
                <path d="M15 18l-6-6 6-6" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </button>
            <button
              type="button"
              aria-label="Next image"
              className="absolute right-3 top-1/2 inline-flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full bg-slate-950/45 text-white opacity-100 shadow-lg shadow-slate-950/20 backdrop-blur transition hover:bg-slate-950/65 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white md:opacity-0 md:group-hover/gallery:opacity-100 md:focus-visible:opacity-100"
              onClick={(event) => {
                event.stopPropagation();
                moveBy(1);
              }}
            >
              <svg aria-hidden="true" viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="2.4">
                <path d="M9 6l6 6-6 6" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </button>
          </>
        ) : null}

        {showIndicators && canNavigate ? (
          <div className="absolute inset-x-0 bottom-3 flex justify-center gap-2 px-4">
            {images.map((image, index) => (
              <button
                key={image.id}
                type="button"
                aria-label={`Show image ${index + 1}`}
                aria-current={index === safeActiveIndex}
                className={`h-2 rounded-full bg-white shadow-sm shadow-slate-950/20 transition-all duration-300 ${
                  index === safeActiveIndex ? "w-8 opacity-100" : "w-2 opacity-60 hover:opacity-90"
                }`}
                onClick={(event) => {
                  event.stopPropagation();
                  jumpTo(index);
                }}
              />
            ))}
          </div>
        ) : null}
      </div>
    </div>
  );
}

function GallerySlide({ image, loading }: { image: GalleryImage; loading: "eager" | "lazy" }) {
  if (image.url) {
    return <img src={image.url} alt={image.caption || "Gallery image"} className="h-full w-full object-cover" loading={loading} draggable={false} />;
  }

  return (
    <div className="flex h-full items-center justify-center bg-gradient-to-br from-slate-50 to-slate-200 text-sm font-semibold text-slate-500">
      Blank image
    </div>
  );
}

function isRichTextEmpty(value: string) {
  return !value
    .replace(/<[^>]*>/g, "")
    .replace(/&nbsp;/g, " ")
    .trim();
}

type CharacterEditorTarget = {
  characterId: string;
  kind: "text" | "tag";
  id: string;
} | null;

type CharacterDragTarget = {
  characterId: string;
  kind: "text" | "line" | "portrait" | "copy";
  id?: string;
  startX: number;
  startY: number;
  originX: number;
  originY: number;
  width: number;
  height: number;
  stageRect: DOMRect;
  cardRect?: DOMRect;
} | null;

function getRelationshipPairKey(source: string, target: string) {
  return [source, target].sort().join("::");
}

function getRelationshipLineGeometry(connection: RelationshipConnection, nodes: RelationshipNode[], connections: RelationshipConnection[]) {
  const source = nodes.find((node) => node.id === connection.source);
  const target = nodes.find((node) => node.id === connection.target);
  if (!source || !target) return null;

  const pairKey = getRelationshipPairKey(connection.source, connection.target);
  const pairConnections = connections.filter((item) => getRelationshipPairKey(item.source, item.target) === pairKey);
  const pairIndex = Math.max(0, pairConnections.findIndex((item) => item.id === connection.id));
  const offset = (pairIndex - (pairConnections.length - 1) / 2) * 4.6;
  const [firstId, secondId] = [connection.source, connection.target].sort();
  const first = nodes.find((node) => node.id === firstId);
  const second = nodes.find((node) => node.id === secondId);
  const baseDx = (second?.x ?? target.x) - (first?.x ?? source.x);
  const baseDy = (second?.y ?? target.y) - (first?.y ?? source.y);
  const baseLength = Math.hypot(baseDx, baseDy) || 1;
  const offsetX = (-baseDy / baseLength) * offset;
  const offsetY = (baseDx / baseLength) * offset;
  const dx = target.x - source.x;
  const dy = target.y - source.y;
  const length = Math.hypot(dx, dy) || 1;
  const unitX = dx / length;
  const unitY = dy / length;

  return {
    source,
    target,
    startX: source.x + unitX * 5 + offsetX,
    startY: source.y + unitY * 5 + offsetY,
    endX: target.x - unitX * 6 + offsetX,
    endY: target.y - unitY * 6 + offsetY,
    labelX: (source.x + target.x) / 2 + offsetX,
    labelY: (source.y + target.y) / 2 + offsetY,
  };
}

function renderRelationshipMarkerShape(arrowHead: RelationshipConnection["arrowHead"], color: string) {
  switch (arrowHead ?? "arrow") {
    case "circle":
      return <circle cx="2.5" cy="2.5" r="1.45" fill="#ffffff" stroke={color} strokeWidth="0.7" />;
    case "solidCircle":
      return <circle cx="2.5" cy="2.5" r="1.5" fill={color} />;
    case "square":
      return <rect x="1" y="1" width="3" height="3" fill="#ffffff" stroke={color} strokeWidth="0.7" />;
    case "solidSquare":
      return <rect x="1" y="1" width="3" height="3" fill={color} />;
    case "rhombus":
      return <path d="M2.5,0.8 L4.2,2.5 L2.5,4.2 L0.8,2.5 Z" fill="#ffffff" stroke={color} strokeWidth="0.7" />;
    case "solidRhombus":
      return <path d="M2.5,0.8 L4.2,2.5 L2.5,4.2 L0.8,2.5 Z" fill={color} />;
    default:
      return <path d="M0.6,0.8 L4.2,2.5 L0.6,4.2 Z" fill={color} />;
  }
}

function getCharacterEditorKey(target: NonNullable<CharacterEditorTarget>) {
  return `${target.characterId}-${target.kind}-${target.id}`;
}

function clampPercent(value: number, min: number, max: number) {
  return Math.min(Math.max(value, min), max);
}

function isInternalPageLink(link?: BlockLink) {
  return link?.type === "internal" && Boolean(link.pageId);
}

function pageLinkAttributes(link?: BlockLink) {
  return isInternalPageLink(link) ? { "data-page-link": link?.pageId } : {};
}

function ImageLinkControl({
  link,
  onChange,
}: {
  link?: BlockLink;
  onChange: (link: BlockLink) => void;
}) {
  const pages = usePageLinkPages();
  return (
    <select
      value={link?.type === "internal" ? link.pageId ?? "" : ""}
      title="Link image"
      onPointerDown={(event) => event.stopPropagation()}
      onClick={(event) => event.stopPropagation()}
      onChange={(event) => {
        const pageId = event.target.value;
        onChange(pageId ? { type: "internal", pageId } : { type: "none" });
      }}
      className="rounded-full border border-slate-300 bg-white px-3 py-1 text-xs font-semibold text-slate-800 outline-none hover:bg-slate-50"
    >
      <option value="">Link</option>
      {pages.map((page) => (
        <option key={page.id} value={page.id}>
          {page.title}
          {page.showInNavigation ? "" : " (hidden)"}
        </option>
      ))}
    </select>
  );
}

function CharacterBlock({
  block,
  previewMode,
  onUpdate,
}: {
  block: ProjectBlock & { type: "character"; data: CharacterBlockData };
  previewMode?: boolean;
  onUpdate?: (block: ProjectBlock) => void;
}) {
  const [activeEditor, setActiveEditor] = useState<CharacterEditorTarget>(null);
  const [dragTarget, setDragTarget] = useState<CharacterDragTarget>(null);
  const characters = useMemo(() => normalizeCharacters(block.data.characters), [block.data.characters]);
  const activeCharacterId = characters.some((character) => character.id === block.data.activeCharacterId)
    ? block.data.activeCharacterId
    : characters[0]?.id;
  const activeEditorKey = activeEditor ? getCharacterEditorKey(activeEditor) : null;

  const syncCharacters = useCallback((nextCharacters: CharacterData[], nextActiveCharacterId = activeCharacterId) => {
    onUpdate?.({
      ...block,
      data: {
        ...block.data,
        characters: nextCharacters,
        activeCharacterId: nextActiveCharacterId,
      },
    });
  }, [activeCharacterId, block, onUpdate]);

  const selectCharacter = (characterId: string) => {
    if (previewMode || !onUpdate || characterId === activeCharacterId) return;
    syncCharacters(characters, characterId);
  };

  const updateCharacter = useCallback((characterId: string, patch: Partial<CharacterData>) => {
    const nextCharacters = characters.map((character) => (character.id === characterId ? { ...character, ...patch } : character));
    syncCharacters(nextCharacters, characterId);
  }, [characters, syncCharacters]);

  useEffect(() => {
    if (!activeEditor || previewMode) return;

    const handlePointerDown = (event: globalThis.PointerEvent) => {
      const target = event.target as HTMLElement | null;
      if (target?.closest(`[data-character-editor-key="${getCharacterEditorKey(activeEditor)}"]`)) {
        return;
      }
      setActiveEditor(null);
    };

    document.addEventListener("pointerdown", handlePointerDown);
    return () => document.removeEventListener("pointerdown", handlePointerDown);
  }, [activeEditor, previewMode]);

  useEffect(() => {
    if (!dragTarget || previewMode) return;

    const handlePointerMove = (event: globalThis.PointerEvent) => {
      if (dragTarget.kind === "portrait") {
        const character = characters.find((item) => item.id === dragTarget.characterId);
        if (!character || !dragTarget.cardRect) return;
        const nextWidth = clampPercent(
          dragTarget.width + ((event.clientX - dragTarget.startX) / dragTarget.cardRect.width) * 100,
          24,
          50
        );
        const nextHeight = Math.max(220, Math.round(dragTarget.height + event.clientY - dragTarget.startY));
        updateCharacter(dragTarget.characterId, {
          portraitWidth: nextWidth,
          portraitHeight: nextHeight,
        });
        return;
      }
      if (dragTarget.kind === "copy") {
        updateCharacter(dragTarget.characterId, {
          copyHeight: Math.max(120, Math.round(dragTarget.height + event.clientY - dragTarget.startY)),
        });
        return;
      }

      const nextX = clampPercent(
        dragTarget.originX + ((event.clientX - dragTarget.startX) / dragTarget.stageRect.width) * 100,
        0,
        100 - dragTarget.width
      );
      const nextY = clampPercent(
        dragTarget.originY + ((event.clientY - dragTarget.startY) / dragTarget.stageRect.height) * 100,
        0,
        100 - dragTarget.height
      );
      const character = characters.find((item) => item.id === dragTarget.characterId);
      if (!character) return;

      if (dragTarget.kind === "text") {
        updateCharacter(dragTarget.characterId, {
          textHolders: character.textHolders.map((holder) =>
            holder.id === dragTarget.id ? { ...holder, x: nextX, y: nextY } : holder
          ),
        });
        return;
      }

      updateCharacter(dragTarget.characterId, {
        breakLines: character.breakLines.map((line) =>
          line.id === dragTarget.id ? { ...line, x: nextX, y: nextY } : line
        ),
      });
    };

    const handlePointerUp = () => setDragTarget(null);

    window.addEventListener("pointermove", handlePointerMove);
    window.addEventListener("pointerup", handlePointerUp, { once: true });
    return () => {
      window.removeEventListener("pointermove", handlePointerMove);
      window.removeEventListener("pointerup", handlePointerUp);
    };
  }, [characters, dragTarget, previewMode, updateCharacter]);

  const updatePortrait = async (characterId: string, file: File) => {
    const url = await readFileAsDataUrl(file);
    updateCharacter(characterId, { portraitUrl: url });
  };

  const addCharacter = () => {
    const character = createCharacterCard();
    syncCharacters([...characters, character], character.id);
    setActiveEditor(null);
  };

  const removeCharacter = (characterId: string) => {
    const nextCharacters = characters.filter((character) => character.id !== characterId);
    if (nextCharacters.length) {
      syncCharacters(nextCharacters, nextCharacters[0].id);
      return;
    }
    const character = createCharacterCard();
    syncCharacters([character], character.id);
  };

  const updateTextHolder = (characterId: string, holderId: string, content: string) => {
    const character = characters.find((item) => item.id === characterId);
    if (!character) return;
    updateCharacter(characterId, {
      textHolders: character.textHolders.map((holder) => (holder.id === holderId ? { ...holder, content } : holder)),
    });
  };

  const removeTextHolder = (characterId: string, holderId: string) => {
    const character = characters.find((item) => item.id === characterId);
    if (!character) return;
    setActiveEditor(null);
    updateCharacter(characterId, {
      textHolders: character.textHolders.filter((holder) => holder.id !== holderId),
    });
  };

  const moveTextHolderStart = (characterId: string, holder: CharacterTextHolder, event: PointerEvent<HTMLElement>) => {
    const stage = (event.currentTarget.closest("[data-character-stage]") as HTMLElement | null);
    if (!stage) return;
    event.preventDefault();
    event.stopPropagation();
    selectCharacter(characterId);
    setActiveEditor(null);
    setDragTarget({
      characterId,
      kind: "text",
      id: holder.id,
      startX: event.clientX,
      startY: event.clientY,
      originX: holder.x,
      originY: holder.y,
      width: holder.width,
      height: holder.height,
      stageRect: stage.getBoundingClientRect(),
    });
  };

  const moveBreakLineStart = (characterId: string, line: CharacterBreakLine, event: PointerEvent<HTMLElement>) => {
    const stage = (event.currentTarget.closest("[data-character-stage]") as HTMLElement | null);
    if (!stage) return;
    event.preventDefault();
    event.stopPropagation();
    selectCharacter(characterId);
    setActiveEditor(null);
    setDragTarget({
      characterId,
      kind: "line",
      id: line.id,
      startX: event.clientX,
      startY: event.clientY,
      originX: line.x,
      originY: line.y,
      width: line.width,
      height: 2,
      stageRect: stage.getBoundingClientRect(),
    });
  };

  const resizePortraitStart = (characterId: string, character: CharacterData, event: PointerEvent<HTMLElement>) => {
    const card = event.currentTarget.closest("[data-character-card]") as HTMLElement | null;
    const portrait = event.currentTarget.closest("[data-character-portrait]") as HTMLElement | null;
    if (!card || !portrait) return;
    event.preventDefault();
    event.stopPropagation();
    selectCharacter(characterId);
    setActiveEditor(null);
    setDragTarget({
      characterId,
      kind: "portrait",
      startX: event.clientX,
      startY: event.clientY,
      originX: 0,
      originY: 0,
      width: character.portraitWidth,
      height: character.portraitHeight,
      stageRect: portrait.getBoundingClientRect(),
      cardRect: card.getBoundingClientRect(),
    });
  };

  const resizeCopyStart = (characterId: string, character: CharacterData, event: PointerEvent<HTMLElement>) => {
    const stage = event.currentTarget.closest("[data-character-stage]") as HTMLElement | null;
    if (!stage) return;
    event.preventDefault();
    event.stopPropagation();
    selectCharacter(characterId);
    setActiveEditor(null);
    setDragTarget({
      characterId,
      kind: "copy",
      startX: event.clientX,
      startY: event.clientY,
      originX: 0,
      originY: 0,
      width: 100,
      height: character.copyHeight,
      stageRect: stage.getBoundingClientRect(),
    });
  };

  const removeBreakLine = (characterId: string, lineId: string) => {
    const character = characters.find((item) => item.id === characterId);
    if (!character) return;
    updateCharacter(characterId, {
      breakLines: character.breakLines.filter((line) => line.id !== lineId),
    });
  };

  const updateTag = (characterId: string, tagId: string, content: string) => {
    const character = characters.find((item) => item.id === characterId);
    if (!character) return;
    updateCharacter(characterId, {
      tags: character.tags.map((tag) => (tag.id === tagId ? { ...tag, content } : tag)),
    });
  };

  const removeTag = (characterId: string, tagId: string) => {
    const character = characters.find((item) => item.id === characterId);
    if (!character) return;
    setActiveEditor(null);
    updateCharacter(characterId, {
      tags: character.tags.filter((tag) => tag.id !== tagId),
    });
  };

  return (
    <div className="space-y-6" onDragStart={(event) => event.preventDefault()}>
      {characters.map((character) => {
        const copyBaseHeight = Math.max(character.copyHeight, 120);
        const stageHeight = Math.max(
          copyBaseHeight,
          ...character.textHolders.map((holder) => ((holder.y + holder.height) / 100) * copyBaseHeight),
          ...character.breakLines.map((line) => (line.y / 100) * copyBaseHeight + 24)
        );

        return (
        <div
          key={character.id}
          data-character-card
          className={`grid gap-4 rounded-[1rem] border bg-white/5 p-4 shadow-sm shadow-slate-900/10 backdrop-blur-[2px] transition ${
            !previewMode && activeCharacterId === character.id ? "border-sky-300/70 ring-2 ring-sky-100/70" : "border-white/10"
          }`}
          style={{ gridTemplateColumns: `minmax(160px, ${character.portraitWidth}%) minmax(0, 1fr)` }}
          onClick={() => selectCharacter(character.id)}
        >
          <div
            data-character-portrait
            className="group/portrait relative overflow-hidden rounded-[0.85rem] bg-slate-100"
            style={{ height: `${character.portraitHeight}px`, minHeight: 220 }}
            {...pageLinkAttributes(character.link)}
          >
            <label className={`block h-full ${previewMode ? "" : "cursor-pointer"}`}>
              {character.portraitUrl ? (
                <img src={character.portraitUrl} alt="Character portrait" className="h-full w-full object-cover" />
              ) : (
                <span className="flex h-full items-center justify-center border border-dashed border-slate-300 bg-slate-50 text-sm font-medium text-slate-500">
                  Portrait
                </span>
              )}
              {!previewMode ? (
                <input
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={async (event) => {
                    const input = event.currentTarget;
                    const file = input.files?.[0];
                    if (file) await updatePortrait(character.id, file);
                    input.value = "";
                  }}
                />
              ) : null}
            </label>
            {!previewMode ? (
              <>
                <div className="absolute left-2 top-2 z-20 opacity-0 transition hover:opacity-100 group-hover/portrait:opacity-100">
                  <ImageLinkControl link={character.link} onChange={(link) => updateCharacter(character.id, { link })} />
                </div>
                <button
                  type="button"
                  aria-label="Resize portrait"
                  onPointerDown={(event) => resizePortraitStart(character.id, character, event)}
                  className="absolute bottom-2 right-2 z-20 h-6 w-6 cursor-nwse-resize touch-none rounded-md border border-white bg-slate-900/70 shadow-sm shadow-slate-900/30"
                >
                  <span className="absolute bottom-1 right-1 h-3 w-3 border-b-2 border-r-2 border-white/90" />
                </button>
              </>
            ) : null}

            {character.tags.length ? (
              <div className="absolute inset-x-3 bottom-3 flex flex-wrap gap-2">
                {character.tags.map((tag) => (
                  <CharacterEditableTag
                    key={tag.id}
                    tag={tag}
                    editorKey={getCharacterEditorKey({ characterId: character.id, kind: "tag", id: tag.id })}
                    previewMode={previewMode}
                    isActive={activeEditorKey === getCharacterEditorKey({ characterId: character.id, kind: "tag", id: tag.id })}
                    onFocus={() => {
                      selectCharacter(character.id);
                      setActiveEditor({ characterId: character.id, kind: "tag", id: tag.id });
                    }}
                    onExit={() => setActiveEditor(null)}
                    onChange={(content) => updateTag(character.id, tag.id, content)}
                    onDelete={() => removeTag(character.id, tag.id)}
                  />
                ))}
              </div>
            ) : null}
          </div>

          <div
            data-character-stage
            className="relative overflow-visible rounded-[0.85rem] bg-transparent"
            style={{ height: `${stageHeight}px`, minHeight: 120 }}
            onPointerDown={(event) => {
              event.stopPropagation();
              selectCharacter(character.id);
            }}
          >
            {character.breakLines.map((line) => (
              <div
                key={line.id}
                className={`group absolute z-10 h-5 -translate-y-1/2 cursor-move touch-none ${
                  dragTarget?.kind === "line" && dragTarget.id === line.id ? "opacity-100" : "opacity-80 hover:opacity-100"
                }`}
                style={{ left: `${line.x}%`, top: `${line.y}%`, width: `${line.width}%` }}
                onPointerDown={(event) => moveBreakLineStart(character.id, line, event)}
              >
                <div className="absolute left-0 top-1/2 h-px w-full -translate-y-1/2 bg-slate-400" />
                {!previewMode ? (
                  <button
                    type="button"
                    aria-label="Delete break line"
                    onPointerDown={(event) => event.stopPropagation()}
                    onClick={(event) => {
                      event.stopPropagation();
                      removeBreakLine(character.id, line.id);
                    }}
                    className="absolute right-0 top-1/2 z-20 flex h-6 w-6 -translate-y-1/2 translate-x-full items-center justify-center rounded-full border border-stone-200 bg-white text-xs font-semibold text-slate-500 opacity-0 shadow-sm shadow-slate-200 transition hover:border-rose-200 hover:bg-rose-50 hover:text-rose-700 group-hover:opacity-100 focus:opacity-100"
                  >
                    x
                  </button>
                ) : null}
              </div>
            ))}
            {character.textHolders.map((holder) => (
              <CharacterTextHolderEditor
                key={holder.id}
                holder={holder}
                editorKey={getCharacterEditorKey({ characterId: character.id, kind: "text", id: holder.id })}
                previewMode={previewMode}
                isActive={activeEditorKey === getCharacterEditorKey({ characterId: character.id, kind: "text", id: holder.id })}
                onFocus={() => {
                  selectCharacter(character.id);
                  setActiveEditor({ characterId: character.id, kind: "text", id: holder.id });
                }}
                onExit={() => setActiveEditor(null)}
                onChange={(content) => updateTextHolder(character.id, holder.id, content)}
                onDelete={() => removeTextHolder(character.id, holder.id)}
                onMoveStart={(event) => moveTextHolderStart(character.id, holder, event)}
              />
            ))}
            {!previewMode ? (
              <>
                <button
                  type="button"
                  aria-label="Resize character text area"
                  onPointerDown={(event) => resizeCopyStart(character.id, character, event)}
                  className="absolute bottom-2 right-2 z-30 h-6 w-6 cursor-ns-resize touch-none rounded-md border border-white bg-slate-900/70 shadow-sm shadow-slate-900/30"
                >
                  <span className="absolute bottom-1 right-1 h-3 w-3 border-b-2 border-r-2 border-white/90" />
                </button>
                <button
                  type="button"
                  onClick={(event) => {
                    event.stopPropagation();
                    removeCharacter(character.id);
                  }}
                  className="rounded-full border border-rose-200 bg-rose-50 px-4 py-2 text-xs font-semibold text-rose-700 hover:bg-rose-100"
                >
                  Remove character
                </button>
              </>
            ) : null}
          </div>
        </div>
        );
      })}
      {!previewMode ? (
        <button
          type="button"
          onClick={addCharacter}
          className="w-full rounded-[1rem] border border-dashed border-white/20 bg-white/5 px-5 py-5 text-sm font-semibold text-slate-700 backdrop-blur-[2px] hover:border-sky-400 hover:bg-sky-50/60"
        >
          Add character
        </button>
      ) : null}
    </div>
  );
}

function CharacterTextHolderEditor({
  holder,
  editorKey,
  previewMode,
  isActive,
  onFocus,
  onExit,
  onChange,
  onDelete,
  onMoveStart,
}: {
  holder: CharacterTextHolder;
  editorKey: string;
  previewMode?: boolean;
  isActive: boolean;
  onFocus: () => void;
  onExit: () => void;
  onChange: (value: string) => void;
  onDelete: () => void;
  onMoveStart: (event: PointerEvent<HTMLElement>) => void;
}) {
  const editor = useEditor({
    extensions: richTextExtensions,
    content: holder.content || "",
    editable: !previewMode,
    immediatelyRender: false,
    editorProps: {
      attributes: {
        class: "rich-text-content h-full min-h-full max-w-full overflow-auto p-2 pr-10 text-slate-900 focus:outline-none",
      },
      handleDOMEvents: {
        focus: () => {
          onFocus();
          return false;
        },
        keydown: (_view, event) => {
          if (event.key === "Enter") {
            event.preventDefault();
            (_view.dom as HTMLElement).blur();
            onExit();
            return true;
          }
          return false;
        },
      },
    },
    onUpdate: ({ editor }) => {
      onChange(editor.getHTML());
    },
  });

  useEffect(() => {
    if (!editor) return;
    editor.setEditable(!previewMode);
  }, [editor, previewMode]);

  useEffect(() => {
    if (!editor) return;
    if ((holder.content || "") !== editor.getHTML()) {
      editor.commands.setContent(holder.content || "");
    }
  }, [editor, holder.content]);

  if (previewMode) {
    return (
      <div
        className="rich-text-content absolute overflow-auto p-2 text-slate-900"
        style={{
          left: `${holder.x}%`,
          top: `${holder.y}%`,
          width: `${holder.width}%`,
          minHeight: `${holder.height}%`,
        }}
        dangerouslySetInnerHTML={{ __html: holder.content || `<p>${holder.placeholder}</p>` }}
      />
    );
  }

  return (
    <div
      data-character-editor-key={editorKey}
      className={`group absolute rounded-[0.6rem] bg-transparent transition ${
        isActive ? "z-50" : "z-20 hover:bg-white/5"
      }`}
      style={{
        left: `${holder.x}%`,
        top: `${holder.y}%`,
        width: `${holder.width}%`,
        minHeight: `${holder.height}%`,
      }}
      onClick={(event) => {
        event.stopPropagation();
        onFocus();
      }}
      onPointerDown={(event) => {
        event.stopPropagation();
      }}
    >
      {isActive ? (
        <div
          data-character-editor-key={editorKey}
          className="absolute bottom-full left-0 z-[100] mb-2 max-w-[min(560px,calc(100vw-3rem))] rounded-[1rem] border border-stone-200 bg-white shadow-xl shadow-slate-900/20"
          onClick={(event) => event.stopPropagation()}
          onPointerDown={(event) => event.stopPropagation()}
        >
          <RichTextToolbar editor={editor} compact allowImages={false} />
        </div>
      ) : null}
      <button
        type="button"
        aria-label="Move text holder"
        onPointerDown={onMoveStart}
        className="absolute -left-8 top-1 z-10 flex h-7 w-6 cursor-move touch-none items-center justify-center rounded-md bg-white/90 opacity-0 shadow-sm shadow-slate-200 transition group-hover:opacity-100 focus:opacity-100"
      >
        <span className="h-4 w-3 rounded-sm border-y border-slate-400" />
      </button>
      {isRichTextEmpty(holder.content || "") ? (
        <span className="pointer-events-none absolute left-2 top-2 text-sm text-slate-400">{holder.placeholder}</span>
      ) : null}
      <button
        type="button"
        aria-label="Delete text holder"
        onClick={(event) => {
          event.stopPropagation();
          onDelete();
        }}
        className="absolute right-1 top-1 z-10 flex h-7 w-7 items-center justify-center rounded-full border border-stone-200 bg-white text-sm font-semibold text-slate-500 opacity-0 transition hover:border-rose-200 hover:bg-rose-50 hover:text-rose-700 group-hover:opacity-100 focus:opacity-100"
      >
        x
      </button>
      {editor ? <EditorContent editor={editor} /> : null}
    </div>
  );
}

function CharacterEditableTag({
  tag,
  editorKey,
  previewMode,
  isActive,
  onFocus,
  onExit,
  onChange,
  onDelete,
}: {
  tag: CharacterTag;
  editorKey: string;
  previewMode?: boolean;
  isActive: boolean;
  onFocus: () => void;
  onExit: () => void;
  onChange: (value: string) => void;
  onDelete: () => void;
}) {
  const editor = useEditor({
    extensions: richTextExtensions,
    content: tag.content || "",
    editable: !previewMode,
    immediatelyRender: false,
    editorProps: {
      attributes: {
        class: "rich-text-content character-tag-editor min-w-12 max-w-40 px-3 py-1.5 pr-7 text-xs font-semibold text-slate-900 focus:outline-none",
      },
      handleDOMEvents: {
        focus: () => {
          onFocus();
          return false;
        },
        keydown: (_view, event) => {
          if (event.key === "Enter") {
            event.preventDefault();
            (_view.dom as HTMLElement).blur();
            onExit();
            return true;
          }
          return false;
        },
      },
    },
    onUpdate: ({ editor }) => {
      onChange(editor.getHTML());
    },
  });

  useEffect(() => {
    if (!editor) return;
    editor.setEditable(!previewMode);
  }, [editor, previewMode]);

  useEffect(() => {
    if (!editor) return;
    if ((tag.content || "") !== editor.getHTML()) {
      editor.commands.setContent(tag.content || "");
    }
  }, [editor, tag.content]);

  if (previewMode) {
    return (
      <div
        className="rich-text-content inline-flex max-w-full rounded-full border border-white/10 bg-white/5 px-3 py-1.5 text-xs font-semibold text-slate-900 shadow-sm shadow-slate-900/10 backdrop-blur-[2px]"
        dangerouslySetInnerHTML={{ __html: tag.content || tag.placeholder }}
      />
    );
  }

  return (
    <div
      data-character-editor-key={editorKey}
      className="relative inline-flex max-w-full rounded-full border border-white/10 bg-white/5 shadow-sm shadow-slate-900/10 backdrop-blur-[2px]"
      onClick={(event) => {
        event.stopPropagation();
        onFocus();
      }}
      onPointerDown={(event) => event.stopPropagation()}
    >
      {isActive ? (
        <div
          data-character-editor-key={editorKey}
          className="absolute bottom-full left-0 z-[100] mb-2 max-w-[min(420px,calc(100vw-3rem))] rounded-[1rem] border border-stone-200 bg-white shadow-xl shadow-slate-900/20"
          onClick={(event) => event.stopPropagation()}
          onPointerDown={(event) => event.stopPropagation()}
        >
          <RichTextToolbar editor={editor} compact allowImages={false} />
        </div>
      ) : null}
      {isRichTextEmpty(tag.content || "") ? (
        <span className="pointer-events-none absolute left-3 top-1.5 text-xs font-semibold text-slate-400">{tag.placeholder}</span>
      ) : null}
      <button
        type="button"
        aria-label="Delete tag"
        onClick={(event) => {
          event.stopPropagation();
          onDelete();
        }}
        className="absolute right-1 top-1 z-10 flex h-5 w-5 items-center justify-center rounded-full bg-slate-100 text-[10px] font-bold text-slate-500 hover:bg-rose-50 hover:text-rose-700"
      >
        x
      </button>
      {editor ? <EditorContent editor={editor} /> : null}
    </div>
  );
}

function RelationshipBlock({
  block,
  previewMode,
  onUpdate,
}: {
  block: ProjectBlock & { type: "relationship"; data: RelationshipBlockData };
  previewMode?: boolean;
  onUpdate?: (block: ProjectBlock) => void;
}) {
  const canvasRef = useRef<HTMLDivElement | null>(null);
  const dragMovedRef = useRef(false);
  const [activeSource, setActiveSource] = useState<string | null>(null);
  const [activeTextEditor, setActiveTextEditor] = useState<string | null>(null);
  const [nodeDrag, setNodeDrag] = useState<{
    id: string;
    startX: number;
    startY: number;
    originX: number;
    originY: number;
    rect: DOMRect;
  } | null>(null);
  const nodes = useMemo(() => (Array.isArray(block.data.nodes) ? block.data.nodes : []), [block.data.nodes]);
  const connections = useMemo(
    () =>
      Array.isArray(block.data.connections)
        ? block.data.connections.map((connection) => ({ ...connection, color: connection.color || "#0f766e", arrowHead: connection.arrowHead ?? "arrow" }))
        : [],
    [block.data.connections]
  );
  const relationshipTitle = block.data.title ?? "";
  const nodeEditor = block.data.nodeEditor ?? { open: false };

  const patchData = useCallback((patch: Partial<RelationshipBlockData>) => {
    onUpdate?.({
      ...block,
      data: {
        ...block.data,
        ...patch,
      },
    });
  }, [block, onUpdate]);

  const selectNode = useCallback((nodeId: string) => {
    if (!onUpdate) return;
    if (!activeSource || activeSource === nodeId) {
      setActiveSource(nodeId === activeSource ? null : nodeId);
      return;
    }

    const nextConnection: RelationshipConnection = {
      id: createUniqueId(),
      source: activeSource,
      target: nodeId,
      label: "<p>Relationship</p>",
      color: "#0f766e",
      arrowHead: "arrow",
    };
    patchData({
      connections: [...connections, nextConnection],
    });
    setActiveTextEditor(`connection-${nextConnection.id}`);
    setActiveSource(null);
  }, [activeSource, connections, onUpdate, patchData]);

  const startNodeDrag = (nodeId: string, event: PointerEvent<HTMLElement>) => {
    if (previewMode || !canvasRef.current) return;
    event.preventDefault();
    event.stopPropagation();
    const node = nodes.find((item) => item.id === nodeId);
    if (!node) return;
    dragMovedRef.current = false;
    setNodeDrag({
      id: nodeId,
      startX: event.clientX,
      startY: event.clientY,
      originX: node.x,
      originY: node.y,
      rect: canvasRef.current.getBoundingClientRect(),
    });
  };

  useEffect(() => {
    if (!nodeDrag || previewMode) return;

    const handlePointerMove = (event: globalThis.PointerEvent) => {
      const deltaX = event.clientX - nodeDrag.startX;
      const deltaY = event.clientY - nodeDrag.startY;
      if (Math.abs(deltaX) > 3 || Math.abs(deltaY) > 3) {
        dragMovedRef.current = true;
      }
      const nextX = clampPercent(nodeDrag.originX + (deltaX / nodeDrag.rect.width) * 100, 6, 94);
      const nextY = clampPercent(nodeDrag.originY + (deltaY / nodeDrag.rect.height) * 100, 9, 91);
      patchData({
        nodes: nodes.map((node) => (node.id === nodeDrag.id ? { ...node, x: nextX, y: nextY } : node)),
      });
    };

    const handlePointerUp = () => {
      if (!dragMovedRef.current) {
        selectNode(nodeDrag.id);
      }
      setNodeDrag(null);
    };

    window.addEventListener("pointermove", handlePointerMove);
    window.addEventListener("pointerup", handlePointerUp, { once: true });
    return () => {
      window.removeEventListener("pointermove", handlePointerMove);
      window.removeEventListener("pointerup", handlePointerUp);
    };
  }, [nodeDrag, nodes, patchData, previewMode, selectNode]);

  useEffect(() => {
    if (!activeTextEditor || previewMode) return;
    const handlePointerDown = (event: globalThis.PointerEvent) => {
      const target = event.target as HTMLElement | null;
      if (target?.closest(`[data-relationship-editor-key="${activeTextEditor}"]`)) {
        return;
      }
      setActiveTextEditor(null);
    };
    document.addEventListener("pointerdown", handlePointerDown);
    return () => document.removeEventListener("pointerdown", handlePointerDown);
  }, [activeTextEditor, previewMode]);

  const updateConnection = (id: string, patch: Partial<RelationshipConnection>) => {
    patchData({
      connections: connections.map((connection) => (connection.id === id ? { ...connection, ...patch } : connection)),
    });
  };

  const updateNode = (id: string, patch: Partial<RelationshipNode>) => {
    patchData({
      nodes: nodes.map((node) => (node.id === id ? { ...node, ...patch } : node)),
    });
  };

  const openNodeEditor = (editingNodeId?: string) => {
    if (previewMode) return;
    patchData({ nodeEditor: { open: true, editingNodeId } });
  };

  const closeNodeEditor = () => {
    patchData({ nodeEditor: { open: false } });
  };

  const saveNode = (node: { id?: string; name: string; imageUrl: string }) => {
    if (node.id) {
      patchData({
        nodes: nodes.map((item) => (item.id === node.id ? { ...item, name: node.name, imageUrl: node.imageUrl } : item)),
        nodeEditor: { open: false },
      });
      return;
    }
    patchData({
      nodes: [
        ...nodes,
        {
          id: createUniqueId(),
          name: node.name || "<p>Name</p>",
          imageUrl: node.imageUrl,
          x: 50,
          y: 50,
        },
      ],
      nodeEditor: { open: false },
    });
  };

  const removeNode = (nodeId: string) => {
    patchData({
      nodes: nodes.filter((node) => node.id !== nodeId),
      connections: connections.filter((connection) => connection.source !== nodeId && connection.target !== nodeId),
    });
    if (activeSource === nodeId) setActiveSource(null);
  };

  return (
    <div className="space-y-4 rounded-[1rem] border border-white/10 bg-white/5 p-5 shadow-sm shadow-slate-900/10 backdrop-blur-[2px]">
      <RelationshipRichText
        value={relationshipTitle}
        editorKey="relationship-title"
        previewMode={previewMode}
        isActive={activeTextEditor === "relationship-title"}
        className="relative min-h-10 text-xl font-semibold text-slate-900"
        placeholder=""
        onFocus={() => setActiveTextEditor("relationship-title")}
        onExit={() => setActiveTextEditor(null)}
        onChange={(title) => patchData({ title })}
      />
      <div
        ref={canvasRef}
        className="relative min-h-[520px] overflow-visible rounded-[1rem] border border-white/10 bg-white/5 backdrop-blur-[2px]"
        onPointerDown={(event) => {
          event.stopPropagation();
          setActiveSource(null);
        }}
      >
        <svg className="absolute inset-0 h-full w-full" viewBox="0 0 100 100" preserveAspectRatio="none" style={{ pointerEvents: "none" }}>
          <defs>
            {connections.map((connection) => (
              <marker key={connection.id} id={`relationship-arrow-${connection.id}`} markerWidth="5" markerHeight="5" refX="2.5" refY="2.5" orient="auto" markerUnits="strokeWidth">
                {renderRelationshipMarkerShape(connection.arrowHead, connection.color)}
              </marker>
            ))}
          </defs>
          {connections.map((connection) => {
            const geometry = getRelationshipLineGeometry(connection, nodes, connections);
            if (!geometry) return null;
            return (
              <g key={connection.id}>
                <line
                  x1={geometry.startX}
                  y1={geometry.startY}
                  x2={geometry.endX}
                  y2={geometry.endY}
                  stroke={connection.color}
                  strokeWidth="1.25"
                  strokeDasharray="4 4"
                  vectorEffect="non-scaling-stroke"
                  markerEnd={`url(#relationship-arrow-${connection.id})`}
                />
              </g>
            );
          })}
        </svg>

        {connections.map((connection) => {
          const geometry = getRelationshipLineGeometry(connection, nodes, connections);
          if (!geometry) return null;
          const editorKey = `connection-${connection.id}`;
          return (
            <RelationshipRichText
              key={connection.id}
              value={connection.label}
              editorKey={editorKey}
              previewMode={previewMode}
              isActive={activeTextEditor === editorKey}
              className="absolute z-40 max-w-44 -translate-x-1/2 -translate-y-1/2 rounded-full bg-white/95 px-3 py-1.5 text-xs font-semibold text-slate-900 shadow-sm shadow-slate-900/10"
              style={{ left: `${geometry.labelX}%`, top: `${geometry.labelY}%` }}
              placeholder="<p>Relationship</p>"
              color={connection.color}
              arrowHead={connection.arrowHead}
              onFocus={() => setActiveTextEditor(editorKey)}
              onExit={() => setActiveTextEditor(null)}
              onChange={(label) => updateConnection(connection.id, { label })}
              onColorChange={(color) => updateConnection(connection.id, { color })}
              onArrowHeadChange={(arrowHead) => updateConnection(connection.id, { arrowHead })}
            />
          );
        })}

        {nodes.map((node) => (
          <div
            key={node.id}
            className={`group absolute z-30 flex w-24 -translate-x-1/2 -translate-y-1/2 cursor-move touch-none flex-col items-center text-center text-xs text-slate-900 transition ${
              activeSource === node.id ? "scale-105" : ""
            }`}
            style={{ left: `${node.x}%`, top: `${node.y}%` }}
            onPointerDown={(event) => startNodeDrag(node.id, event)}
            {...pageLinkAttributes(node.link)}
          >
            {!previewMode ? (
              <>
                <div className="absolute -left-1 -top-8 z-20 opacity-0 transition group-hover:opacity-100">
                  <ImageLinkControl link={node.link} onChange={(link) => updateNode(node.id, { link })} />
                </div>
                <button
                  type="button"
                  aria-label="Edit character"
                  onPointerDown={(event) => event.stopPropagation()}
                  onClick={(event) => {
                    event.stopPropagation();
                    openNodeEditor(node.id);
                  }}
                  className="absolute left-1 top-1 z-20 flex h-6 w-6 items-center justify-center rounded-full bg-white text-[10px] font-bold text-slate-600 opacity-0 shadow-sm transition hover:bg-slate-100 group-hover:opacity-100 focus:opacity-100"
                >
                  edit
                </button>
                <button
                  type="button"
                  aria-label="Delete character"
                  onPointerDown={(event) => event.stopPropagation()}
                  onClick={(event) => {
                    event.stopPropagation();
                    removeNode(node.id);
                  }}
                  className="absolute right-1 top-1 z-20 flex h-6 w-6 items-center justify-center rounded-full bg-white text-xs font-bold text-rose-600 opacity-0 shadow-sm transition hover:bg-rose-50 group-hover:opacity-100 focus:opacity-100"
                >
                  x
                </button>
              </>
            ) : null}
            <div className={`h-16 w-16 overflow-hidden rounded-full border-2 bg-slate-200 shadow-sm transition ${activeSource === node.id ? "border-teal-500 ring-4 ring-teal-100" : "border-white"}`}>
              {node.imageUrl ? <img src={node.imageUrl} alt="Character portrait" className="h-full w-full object-cover" /> : <div className="flex h-full items-center justify-center text-[10px] text-slate-500">Portrait</div>}
            </div>
            <div className="rich-text-content mt-1 w-full rounded-full border border-white/10 bg-white/5 px-2 py-1 text-[11px] font-semibold shadow-sm shadow-slate-900/10 backdrop-blur-[2px]" dangerouslySetInnerHTML={{ __html: node.name || "<p>Name</p>" }} />
          </div>
        ))}
      </div>
      {nodeEditor.open ? (
        <RelationshipNodeEditorModal
          key={nodeEditor.editingNodeId ?? "new-relationship-node"}
          node={nodes.find((node) => node.id === nodeEditor.editingNodeId) ?? null}
          onClose={closeNodeEditor}
          onSave={saveNode}
        />
      ) : null}
    </div>
  );
}

function RelationshipRichText({
  value,
  editorKey,
  previewMode,
  isActive,
  className,
  style,
  placeholder,
  color,
  arrowHead,
  onFocus,
  onExit,
  onChange,
  onColorChange,
  onArrowHeadChange,
}: {
  value: string;
  editorKey: string;
  previewMode?: boolean;
  isActive: boolean;
  className: string;
  style?: CSSProperties;
  placeholder: string;
  color?: string;
  arrowHead?: RelationshipConnection["arrowHead"];
  onFocus: () => void;
  onExit: () => void;
  onChange: (value: string) => void;
  onColorChange?: (color: string) => void;
  onArrowHeadChange?: (arrowHead: NonNullable<RelationshipConnection["arrowHead"]>) => void;
}) {
  const editor = useEditor({
    extensions: richTextExtensions,
    content: value || "",
    editable: !previewMode,
    immediatelyRender: false,
    editorProps: {
      attributes: {
        class: "rich-text-content max-w-full focus:outline-none",
      },
      handleDOMEvents: {
        focus: () => {
          onFocus();
          return false;
        },
        keydown: (_view, event) => {
          if (event.key === "Enter") {
            event.preventDefault();
            (_view.dom as HTMLElement).blur();
            onExit();
            return true;
          }
          return false;
        },
      },
    },
    onUpdate: ({ editor }) => {
      onChange(editor.getHTML());
    },
  });

  useEffect(() => {
    if (!editor) return;
    editor.setEditable(!previewMode);
  }, [editor, previewMode]);

  useEffect(() => {
    if (!editor) return;
    const nextContent = value ?? "";
    if (nextContent !== editor.getHTML()) {
      editor.commands.setContent(nextContent);
    }
  }, [editor, placeholder, value]);

  if (previewMode) {
    return <div className={className} style={style} dangerouslySetInnerHTML={{ __html: value || placeholder }} />;
  }

  return (
    <div
      data-relationship-editor-key={editorKey}
      className={className}
      style={style}
      onClick={(event) => {
        event.stopPropagation();
        onFocus();
      }}
      onPointerDown={(event) => event.stopPropagation()}
    >
      {isActive ? (
        <div
          data-relationship-editor-key={editorKey}
          className="absolute bottom-full left-0 z-[120] mb-2 flex max-w-[min(390px,calc(100vw-3rem))] origin-bottom-left scale-90 flex-wrap items-center gap-1 rounded-[0.85rem] border border-stone-200 bg-white p-1 shadow-xl shadow-slate-900/20"
          onClick={(event) => event.stopPropagation()}
          onPointerDown={(event) => event.stopPropagation()}
        >
          <RichTextToolbar editor={editor} compact allowImages={false} />
          {onColorChange ? (
            <>
              <label className="flex h-8 w-8 cursor-pointer items-center justify-center rounded-full border border-stone-200 bg-white" title="Arrow color">
                <input
                  type="color"
                  value={color ?? "#0f766e"}
                  onChange={(event) => onColorChange(event.target.value)}
                  className="h-5 w-5 cursor-pointer border-0 bg-transparent p-0"
                />
              </label>
              {onArrowHeadChange ? (
                <select
                  value={arrowHead ?? "arrow"}
                  onChange={(event) => onArrowHeadChange(event.target.value as NonNullable<RelationshipConnection["arrowHead"]>)}
                  className="h-8 max-w-32 rounded-full border border-stone-200 bg-white px-2 text-xs font-semibold text-slate-700 outline-none"
                  title="Arrow head"
                >
                  <option value="arrow">Arrow</option>
                  <option value="circle">Circle</option>
                  <option value="solidCircle">Solid circle</option>
                  <option value="square">Square</option>
                  <option value="solidSquare">Solid square</option>
                  <option value="rhombus">Rhombus</option>
                  <option value="solidRhombus">Solid rhombus</option>
                </select>
              ) : null}
            </>
          ) : null}
        </div>
      ) : null}
      {isRichTextEmpty(value || "") ? (
        <span className="pointer-events-none absolute left-3 top-1.5 text-xs text-slate-400" dangerouslySetInnerHTML={{ __html: placeholder }} />
      ) : null}
      {editor ? <EditorContent editor={editor} /> : null}
    </div>
  );
}

function RelationshipNodeEditorModal({
  node,
  onClose,
  onSave,
}: {
  node: RelationshipNode | null;
  onClose: () => void;
  onSave: (node: { id?: string; name: string; imageUrl: string }) => void;
}) {
  const [name, setName] = useState(node?.name || "<p>Name</p>");
  const [imageUrl, setImageUrl] = useState(node?.imageUrl || "");

  const editor = useEditor({
    extensions: richTextExtensions,
    content: name,
    immediatelyRender: false,
    editorProps: {
      attributes: {
        class: "rich-text-content min-h-12 rounded-[0.85rem] bg-slate-50 p-3 text-slate-900 focus:outline-none",
      },
    },
    onUpdate: ({ editor }) => {
      setName(editor.getHTML());
    },
  });

  useEffect(() => {
    if (!editor) return;
    if (name !== editor.getHTML()) {
      editor.commands.setContent(name);
    }
  }, [editor, name]);

  return (
    <div className="fixed inset-0 z-[80] flex items-center justify-center bg-slate-950/55 px-4 py-8" onPointerDown={(event) => event.stopPropagation()}>
      <div className="w-full max-w-md rounded-[1.25rem] border border-stone-200 bg-white p-5 shadow-2xl shadow-slate-950/30">
        <div className="flex items-center justify-between gap-4">
          <h3 className="text-lg font-semibold text-slate-900">{node ? "Edit character" : "Add character"}</h3>
          <button
            type="button"
            onClick={onClose}
            className="flex h-8 w-8 items-center justify-center rounded-full border border-stone-200 bg-white text-sm font-semibold text-slate-500 hover:bg-slate-50"
          >
            x
          </button>
        </div>

        <div className="mt-5 grid gap-4">
          <label className="block cursor-pointer">
            <div className="mx-auto flex h-28 w-28 items-center justify-center overflow-hidden rounded-full border border-dashed border-stone-300 bg-slate-50 text-sm font-medium text-slate-500">
              {imageUrl ? <img src={imageUrl} alt="Character portrait" className="h-full w-full object-cover" /> : "Portrait"}
            </div>
            <input
              type="file"
              accept="image/*"
              className="hidden"
              onChange={async (event) => {
                const input = event.currentTarget;
                const file = input.files?.[0];
                if (file) {
                  setImageUrl(await readFileAsDataUrl(file));
                }
                input.value = "";
              }}
            />
          </label>

          <div className="rounded-[1rem] border border-stone-200 bg-white shadow-sm">
            <RichTextToolbar editor={editor} compact allowImages={false} />
            <div className="p-2">{editor ? <EditorContent editor={editor} /> : null}</div>
          </div>

          <button
            type="button"
            onClick={() => onSave({ id: node?.id, name, imageUrl })}
            className="rounded-full bg-slate-900 px-4 py-3 text-sm font-semibold text-white hover:bg-slate-800"
          >
            {node ? "Save" : "Add"}
          </button>
        </div>
      </div>
    </div>
  );
}

function TimelineBlock({
  block,
  previewMode,
  onUpdate,
}: {
  block: ProjectBlock & { type: "timeline"; data: TimelineBlockData };
  previewMode?: boolean;
  onUpdate?: (block: ProjectBlock) => void;
}) {
  const [activeEditor, setActiveEditor] = useState<string | null>(null);
  const [dragTarget, setDragTarget] = useState<{
    eventId: string;
    kind: "text" | "image" | "line";
    id: string;
    startX: number;
    startY: number;
    originX: number;
    originY: number;
    width: number;
    height: number;
    rect: DOMRect;
  } | null>(null);
  const [resizeTarget, setResizeTarget] = useState<{
    eventId: string;
    startX: number;
    startY: number;
    width: number;
    height: number;
    minWidth: number;
    minHeight: number;
    textHolders: TimelineTextHolder[];
    imageHolders: TimelineImageHolder[];
    breakLines: TimelineBreakLine[];
  } | null>(null);
  const [lineResizeTarget, setLineResizeTarget] = useState<{
    eventId: string;
    lineId: string;
    startX: number;
    width: number;
    x: number;
    rect: DOMRect;
  } | null>(null);
  const [imageResizeTarget, setImageResizeTarget] = useState<{
    eventId: string;
    holderId: string;
    startX: number;
    startY: number;
    x: number;
    y: number;
    width: number;
    height: number;
    rect: DOMRect;
  } | null>(null);
  const [eventSideDrag, setEventSideDrag] = useState<{
    eventId: string;
    startX: number;
    startY: number;
    rect: DOMRect;
  } | null>(null);
  const events = useMemo(() => normalizeTimelineEvents(block.data.events), [block.data.events]);
  const activeEventId = events.some((event) => event.id === block.data.activeEventId) ? block.data.activeEventId : events[0]?.id;

  const updateTimeline = useCallback((patch: Partial<TimelineBlockData>) => {
    onUpdate?.({ ...block, data: { ...block.data, ...patch } });
  }, [block, onUpdate]);

  const syncEvents = useCallback((nextEvents: TimelineEvent[], nextActiveEventId = activeEventId) => {
    updateTimeline({ events: nextEvents, activeEventId: nextActiveEventId });
  }, [activeEventId, updateTimeline]);

  const selectEvent = (eventId: string) => {
    if (previewMode) return;
    syncEvents(events, eventId);
  };

  const updateEvent = useCallback((eventId: string, patch: Partial<TimelineEvent>) => {
    syncEvents(events.map((event) => (event.id === eventId ? { ...event, ...patch } : event)), eventId);
  }, [events, syncEvents]);

  useEffect(() => {
    if ((!dragTarget && !resizeTarget && !lineResizeTarget && !imageResizeTarget && !eventSideDrag) || previewMode) return;

    const handlePointerMove = (event: globalThis.PointerEvent) => {
      if (eventSideDrag) {
        const timelineEvent = events.find((item) => item.id === eventSideDrag.eventId);
        if (!timelineEvent) return;
        const moved = Math.abs(event.clientX - eventSideDrag.startX) > 5 || Math.abs(event.clientY - eventSideDrag.startY) > 5;
        if (!moved) return;
        const nextSide =
          block.data.direction === "vertical"
            ? event.clientX < eventSideDrag.rect.left + eventSideDrag.rect.width / 2
              ? "before"
              : "after"
            : event.clientY < eventSideDrag.rect.top + eventSideDrag.rect.height / 2
              ? "before"
              : "after";
        if (timelineEvent.side !== nextSide) {
          updateEvent(eventSideDrag.eventId, { side: nextSide });
        }
        return;
      }

      if (lineResizeTarget) {
        const timelineEvent = events.find((item) => item.id === lineResizeTarget.eventId);
        if (!timelineEvent) return;
        const nextWidth = clampPercent(
          lineResizeTarget.width + ((event.clientX - lineResizeTarget.startX) / lineResizeTarget.rect.width) * 100,
          8,
          100 - lineResizeTarget.x
        );
        updateEvent(lineResizeTarget.eventId, {
          breakLines: timelineEvent.breakLines.map((line) =>
            line.id === lineResizeTarget.lineId ? { ...line, width: nextWidth } : line
          ),
        });
        return;
      }

      if (imageResizeTarget) {
        const timelineEvent = events.find((item) => item.id === imageResizeTarget.eventId);
        if (!timelineEvent) return;
        const nextWidth = clampPercent(
          imageResizeTarget.width + ((event.clientX - imageResizeTarget.startX) / imageResizeTarget.rect.width) * 100,
          6,
          100 - imageResizeTarget.x
        );
        const nextHeight = clampPercent(
          imageResizeTarget.height + ((event.clientY - imageResizeTarget.startY) / imageResizeTarget.rect.height) * 100,
          6,
          100 - imageResizeTarget.y
        );
        updateEvent(imageResizeTarget.eventId, {
          imageHolders: timelineEvent.imageHolders.map((holder) =>
            holder.id === imageResizeTarget.holderId ? { ...holder, width: nextWidth, height: nextHeight } : holder
          ),
        });
        return;
      }

      if (resizeTarget) {
        const nextWidth = Math.max(
          resizeTarget.minWidth,
          Math.round(resizeTarget.width + event.clientX - resizeTarget.startX)
        );
        const nextHeight = Math.max(
          resizeTarget.minHeight,
          Math.round(resizeTarget.height + event.clientY - resizeTarget.startY)
        );
        updateEvent(resizeTarget.eventId, {
          width: nextWidth,
          height: nextHeight,
          textHolders: resizeTarget.textHolders.map((holder) => ({
            ...holder,
            x: ((holder.x / 100) * resizeTarget.width / nextWidth) * 100,
            y: ((holder.y / 100) * resizeTarget.height / nextHeight) * 100,
            width: ((holder.width / 100) * resizeTarget.width / nextWidth) * 100,
            height: ((holder.height / 100) * resizeTarget.height / nextHeight) * 100,
          })),
          imageHolders: resizeTarget.imageHolders.map((holder) => ({
            ...holder,
            x: ((holder.x / 100) * resizeTarget.width / nextWidth) * 100,
            y: ((holder.y / 100) * resizeTarget.height / nextHeight) * 100,
            width: ((holder.width / 100) * resizeTarget.width / nextWidth) * 100,
            height: ((holder.height / 100) * resizeTarget.height / nextHeight) * 100,
          })),
          breakLines: resizeTarget.breakLines.map((line) => ({
            ...line,
            x: ((line.x / 100) * resizeTarget.width / nextWidth) * 100,
            y: ((line.y / 100) * resizeTarget.height / nextHeight) * 100,
            width: ((line.width / 100) * resizeTarget.width / nextWidth) * 100,
          })),
        });
        return;
      }

      if (!dragTarget) return;
      const nextX = clampPercent(
        dragTarget.originX + ((event.clientX - dragTarget.startX) / dragTarget.rect.width) * 100,
        0,
        100 - dragTarget.width
      );
      const nextY = clampPercent(
        dragTarget.originY + ((event.clientY - dragTarget.startY) / dragTarget.rect.height) * 100,
        0,
        100 - dragTarget.height
      );
      const timelineEvent = events.find((item) => item.id === dragTarget.eventId);
      if (!timelineEvent) return;

      if (dragTarget.kind === "text") {
        updateEvent(dragTarget.eventId, {
          textHolders: timelineEvent.textHolders.map((holder) =>
            holder.id === dragTarget.id ? { ...holder, x: nextX, y: nextY } : holder
          ),
        });
        return;
      }
      if (dragTarget.kind === "image") {
        updateEvent(dragTarget.eventId, {
          imageHolders: timelineEvent.imageHolders.map((holder) =>
            holder.id === dragTarget.id ? { ...holder, x: nextX, y: nextY } : holder
          ),
        });
        return;
      }
      updateEvent(dragTarget.eventId, {
        breakLines: timelineEvent.breakLines.map((line) =>
          line.id === dragTarget.id ? { ...line, x: nextX, y: nextY } : line
        ),
      });
    };

    const handlePointerUp = () => {
      setDragTarget(null);
      setResizeTarget(null);
      setLineResizeTarget(null);
      setImageResizeTarget(null);
      setEventSideDrag(null);
    };

    window.addEventListener("pointermove", handlePointerMove);
    window.addEventListener("pointerup", handlePointerUp, { once: true });
    return () => {
      window.removeEventListener("pointermove", handlePointerMove);
      window.removeEventListener("pointerup", handlePointerUp);
    };
  }, [block.data.direction, dragTarget, eventSideDrag, events, imageResizeTarget, lineResizeTarget, previewMode, resizeTarget, updateEvent]);

  useEffect(() => {
    if (!activeEditor || previewMode) return;
    const handlePointerDown = (event: globalThis.PointerEvent) => {
      const target = event.target as HTMLElement | null;
      if (target?.closest(`[data-timeline-editor-key="${activeEditor}"]`)) return;
      setActiveEditor(null);
    };
    document.addEventListener("pointerdown", handlePointerDown);
    return () => document.removeEventListener("pointerdown", handlePointerDown);
  }, [activeEditor, previewMode]);

  const addEvent = () => {
    const event = createTimelineEvent();
    syncEvents([...events, event], event.id);
  };

  const updateImage = async (eventId: string, holderId: string, file: File) => {
    const timelineEvent = events.find((item) => item.id === eventId);
    if (!timelineEvent) return;
    const imageUrl = await readFileAsDataUrl(file);
    updateEvent(eventId, {
      imageHolders: timelineEvent.imageHolders.map((holder) => (holder.id === holderId ? { ...holder, imageUrl } : holder)),
    });
  };

  const removeTextHolder = (eventId: string, holderId: string) => {
    const event = events.find((item) => item.id === eventId);
    if (!event) return;
    setActiveEditor(null);
    updateEvent(eventId, { textHolders: event.textHolders.filter((holder) => holder.id !== holderId) });
  };

  const removeImageHolder = (eventId: string, holderId: string) => {
    const event = events.find((item) => item.id === eventId);
    if (!event) return;
    updateEvent(eventId, { imageHolders: event.imageHolders.filter((holder) => holder.id !== holderId) });
  };

  const removeBreakLine = (eventId: string, lineId: string) => {
    const event = events.find((item) => item.id === eventId);
    if (!event) return;
    updateEvent(eventId, { breakLines: event.breakLines.filter((line) => line.id !== lineId) });
  };

  const startTimelineItemDrag = (
    eventId: string,
    kind: "text" | "image" | "line",
    item: TimelineTextHolder | TimelineImageHolder | TimelineBreakLine,
    pointerEvent: PointerEvent<HTMLElement>
  ) => {
    const card = pointerEvent.currentTarget.closest("[data-timeline-event-card]") as HTMLElement | null;
    if (!card) return;
    pointerEvent.preventDefault();
    pointerEvent.stopPropagation();
    selectEvent(eventId);
    setActiveEditor(null);
    setDragTarget({
      eventId,
      kind,
      id: item.id,
      startX: pointerEvent.clientX,
      startY: pointerEvent.clientY,
      originX: item.x,
      originY: item.y,
      width: item.width,
      height: "height" in item ? item.height : 2,
      rect: card.getBoundingClientRect(),
    });
  };

  const startTimelineResize = (event: TimelineEvent, pointerEvent: PointerEvent<HTMLButtonElement>) => {
    pointerEvent.preventDefault();
    pointerEvent.stopPropagation();
    selectEvent(event.id);
    setActiveEditor(null);
    const maxRight = Math.max(
      0,
      ...event.textHolders.map((holder) => ((holder.x + holder.width) / 100) * event.width),
      ...event.imageHolders.map((holder) => ((holder.x + holder.width) / 100) * event.width),
      ...event.breakLines.map((line) => ((line.x + line.width) / 100) * event.width)
    );
    const maxBottom = Math.max(
      0,
      ...event.textHolders.map((holder) => ((holder.y + holder.height) / 100) * event.height),
      ...event.imageHolders.map((holder) => ((holder.y + holder.height) / 100) * event.height),
      ...event.breakLines.map((line) => (line.y / 100) * event.height)
    );
    setResizeTarget({
      eventId: event.id,
      startX: pointerEvent.clientX,
      startY: pointerEvent.clientY,
      width: event.width,
      height: event.height,
      minWidth: Math.max(220, Math.ceil(maxRight + 8)),
      minHeight: Math.max(240, Math.ceil(maxBottom + 8)),
      textHolders: event.textHolders,
      imageHolders: event.imageHolders,
      breakLines: event.breakLines,
    });
  };

  const startTimelineEventSideDrag = (event: TimelineEvent, pointerEvent: PointerEvent<HTMLElement>) => {
    if (previewMode) return;
    const target = pointerEvent.target as HTMLElement | null;
    if (target?.closest("button,label,input,select,[contenteditable='true'],.ProseMirror,[data-timeline-editor-key]")) {
      return;
    }
    const track = pointerEvent.currentTarget.closest("[data-timeline-track]") as HTMLElement | null;
    if (!track) return;
    pointerEvent.stopPropagation();
    selectEvent(event.id);
    setActiveEditor(null);
    setEventSideDrag({
      eventId: event.id,
      startX: pointerEvent.clientX,
      startY: pointerEvent.clientY,
      rect: track.getBoundingClientRect(),
    });
  };

  const startTimelineLineResize = (eventId: string, line: TimelineBreakLine, pointerEvent: PointerEvent<HTMLElement>) => {
    const card = pointerEvent.currentTarget.closest("[data-timeline-event-card]") as HTMLElement | null;
    if (!card) return;
    pointerEvent.preventDefault();
    pointerEvent.stopPropagation();
    selectEvent(eventId);
    setActiveEditor(null);
    setLineResizeTarget({
      eventId,
      lineId: line.id,
      startX: pointerEvent.clientX,
      width: line.width,
      x: line.x,
      rect: card.getBoundingClientRect(),
    });
  };

  const startTimelineImageResize = (eventId: string, holder: TimelineImageHolder, pointerEvent: PointerEvent<HTMLElement>) => {
    const card = pointerEvent.currentTarget.closest("[data-timeline-event-card]") as HTMLElement | null;
    if (!card) return;
    pointerEvent.preventDefault();
    pointerEvent.stopPropagation();
    selectEvent(eventId);
    setActiveEditor(null);
    setImageResizeTarget({
      eventId,
      holderId: holder.id,
      startX: pointerEvent.clientX,
      startY: pointerEvent.clientY,
      x: holder.x,
      y: holder.y,
      width: holder.width,
      height: holder.height,
      rect: card.getBoundingClientRect(),
    });
  };

  const maxEventWidth = events.length ? Math.max(...events.map((event) => event.width)) : 300;
  const maxEventHeight = events.length ? Math.max(...events.map((event) => event.height)) : 340;
  const timelineTrackStyle = block.data.direction === "horizontal"
    ? {
        minWidth: `${events.reduce((total, event) => total + event.width, 0) + Math.max(0, events.length - 1) * 32}px`,
        paddingTop: `${maxEventHeight + 56}px`,
      }
    : { minWidth: `${maxEventWidth * 2 + 120}px` };

  return (
    <div className="space-y-6 rounded-[1rem] border border-white/10 bg-white/5 p-5 shadow-sm shadow-slate-900/10 backdrop-blur-[2px]">
      <TimelineRichText
        value={block.data.title ?? ""}
        editorKey="timeline-title"
        previewMode={previewMode}
        isActive={activeEditor === "timeline-title"}
        className="relative mx-auto min-h-10 w-fit min-w-24 text-center text-xl font-semibold text-slate-900"
        placeholder=""
        onFocus={() => setActiveEditor("timeline-title")}
        onExit={() => setActiveEditor(null)}
        onChange={(title) => updateTimeline({ title })}
      />

      <div className="relative overflow-x-auto overflow-y-visible rounded-[1rem] border border-white/10 bg-white/5 p-6 backdrop-blur-[2px]" onPointerDown={(event) => event.stopPropagation()}>
        <div
          data-timeline-track
          className={`relative ${block.data.direction === "vertical" ? "grid gap-8" : "flex gap-8"}`}
          style={timelineTrackStyle}
        >
          <div
            className={`absolute bg-slate-900 before:absolute before:h-3 before:w-3 before:rounded-full before:border-2 before:border-slate-900 before:bg-white after:absolute after:h-3 after:w-3 after:rounded-full after:border-2 after:border-slate-900 after:bg-white ${
              block.data.direction === "vertical"
                ? "bottom-0 left-1/2 top-0 w-0.5 -translate-x-1/2 before:left-1/2 before:top-0 before:-translate-x-1/2 before:-translate-y-1/2 after:bottom-0 after:left-1/2 after:-translate-x-1/2 after:translate-y-1/2"
                : "left-0 right-0 h-0.5 before:left-0 before:top-1/2 before:-translate-x-1/2 before:-translate-y-1/2 after:right-0 after:top-1/2 after:-translate-y-1/2 after:translate-x-1/2"
            }`}
            style={block.data.direction === "horizontal" ? { top: `${maxEventHeight + 24}px` } : undefined}
          />
          {events.map((event) => {
            const eventSide = event.side ?? "after";
            const verticalBefore = block.data.direction === "vertical" && eventSide === "before";
            const horizontalBefore = block.data.direction === "horizontal" && eventSide === "before";
            return (
            <article
              key={event.id}
              data-timeline-event-card
              className={`group relative z-10 shrink-0 rounded-[1rem] border border-dashed bg-white/5 shadow-sm shadow-slate-900/10 backdrop-blur-[2px] ${
                activeEventId === event.id ? "border-sky-300/70 ring-2 ring-sky-100/70" : "border-white/20"
              }`}
              style={{
                width: `${event.width}px`,
                height: `${event.height}px`,
                justifySelf: verticalBefore ? "end" : block.data.direction === "vertical" ? "start" : undefined,
                marginLeft: block.data.direction === "vertical" ? (verticalBefore ? "0" : `calc(50% + 28px)`) : undefined,
                marginRight: verticalBefore ? `calc(50% + 28px)` : undefined,
                marginTop: horizontalBefore ? `-${event.height + 64}px` : block.data.direction === "horizontal" ? "0" : undefined,
              }}
              onPointerDown={(pointerEvent) => {
                pointerEvent.stopPropagation();
                selectEvent(event.id);
                startTimelineEventSideDrag(event, pointerEvent);
              }}
            >
              <div
                className={`absolute border-slate-400 border-dashed ${
                  block.data.direction === "vertical"
                    ? verticalBefore
                      ? "-right-8 top-10 w-8 border-t"
                      : "-left-8 top-10 w-8 border-t"
                    : horizontalBefore
                      ? "-bottom-6 left-1/2 h-6 border-l"
                      : "-top-6 left-1/2 h-6 border-l"
                }`}
              />

              {event.imageHolders.map((holder) => (
                <TimelineImageHolderEditor
                  key={holder.id}
                  holder={holder}
                  eventId={event.id}
                  previewMode={previewMode}
                  onUpload={updateImage}
                  onLinkChange={(link) =>
                    updateEvent(event.id, {
                      imageHolders: event.imageHolders.map((item) => (item.id === holder.id ? { ...item, link } : item)),
                    })
                  }
                  onDelete={removeImageHolder}
                  onMoveStart={(pointerEvent) => startTimelineItemDrag(event.id, "image", holder, pointerEvent)}
                  onResizeStart={(pointerEvent) => startTimelineImageResize(event.id, holder, pointerEvent)}
                />
              ))}
              {event.breakLines.map((line) => (
                <TimelineBreakLineEditor
                  key={line.id}
                  line={line}
                  previewMode={previewMode}
                  onDelete={() => removeBreakLine(event.id, line.id)}
                  onMoveStart={(pointerEvent) => startTimelineItemDrag(event.id, "line", line, pointerEvent)}
                  onResizeStart={(pointerEvent) => startTimelineLineResize(event.id, line, pointerEvent)}
                />
              ))}
              {event.textHolders.map((holder) => {
                const editorKey = `timeline-${event.id}-${holder.id}`;
                return (
                  <TimelineTextHolderEditor
                    key={holder.id}
                    holder={holder}
                    editorKey={editorKey}
                    previewMode={previewMode}
                    isActive={activeEditor === editorKey}
                    onFocus={() => {
                      selectEvent(event.id);
                      setActiveEditor(editorKey);
                    }}
                    onExit={() => setActiveEditor(null)}
                    onChange={(content) =>
                      updateEvent(event.id, {
                        textHolders: event.textHolders.map((item) => (item.id === holder.id ? { ...item, content } : item)),
                      })
                    }
                    onDelete={() => removeTextHolder(event.id, holder.id)}
                    onMoveStart={(pointerEvent) => startTimelineItemDrag(event.id, "text", holder, pointerEvent)}
                  />
                );
              })}
              {!previewMode ? (
                <button
                  type="button"
                  aria-label="Resize timeline event"
                  onPointerDown={(pointerEvent) => startTimelineResize(event, pointerEvent)}
                  className="absolute bottom-2 right-2 z-30 h-6 w-6 cursor-nwse-resize touch-none rounded-md border border-white bg-slate-900/70 shadow-sm"
                >
                  <span className="absolute bottom-1 right-1 h-3 w-3 border-b-2 border-r-2 border-white/90" />
                </button>
              ) : null}
            </article>
          )})}
          {!previewMode ? (
            <button
              type="button"
              onClick={addEvent}
              className={block.data.direction === "vertical" ? "w-72 rounded-full border border-dashed border-white/20 bg-white/5 px-5 py-3 text-sm font-semibold text-slate-700 backdrop-blur-[2px] hover:border-sky-400 hover:bg-sky-50/60" : "h-12 self-start rounded-full border border-dashed border-white/20 bg-white/5 px-5 text-sm font-semibold text-slate-700 backdrop-blur-[2px] hover:border-sky-400 hover:bg-sky-50/60"}
            >
              Add event
            </button>
          ) : null}
        </div>
      </div>
    </div>
  );
}

function TimelineRichText({
  value,
  editorKey,
  previewMode,
  isActive,
  className,
  placeholder,
  onFocus,
  onExit,
  onChange,
}: {
  value: string;
  editorKey: string;
  previewMode?: boolean;
  isActive: boolean;
  className: string;
  placeholder: string;
  onFocus: () => void;
  onExit: () => void;
  onChange: (value: string) => void;
}) {
  const editor = useEditor({
    extensions: richTextExtensions,
    content: value || placeholder,
    editable: !previewMode,
    immediatelyRender: false,
    editorProps: {
      attributes: { class: "rich-text-content max-w-full focus:outline-none" },
      handleDOMEvents: {
        focus: () => {
          onFocus();
          return false;
        },
        keydown: (_view, event) => {
          if (event.key === "Enter") {
            event.preventDefault();
            (_view.dom as HTMLElement).blur();
            onExit();
            return true;
          }
          return false;
        },
      },
    },
    onUpdate: ({ editor }) => onChange(editor.getHTML()),
  });

  useEffect(() => {
    if (!editor) return;
    editor.setEditable(!previewMode);
  }, [editor, previewMode]);

  useEffect(() => {
    if (!editor) return;
    const nextContent = value || "";
    if (nextContent !== editor.getHTML()) {
      editor.commands.setContent(nextContent);
    }
  }, [editor, placeholder, value]);

  if (previewMode) {
    return <div className={className} dangerouslySetInnerHTML={{ __html: value || placeholder }} />;
  }

  return (
    <div
      data-timeline-editor-key={editorKey}
      className={className}
      onClick={(event) => {
        event.stopPropagation();
        onFocus();
      }}
      onPointerDown={(event) => event.stopPropagation()}
    >
      {isActive ? (
        <div
          data-timeline-editor-key={editorKey}
          className="absolute bottom-full left-0 z-[120] mb-2 max-w-[min(520px,calc(100vw-3rem))] rounded-[0.85rem] border border-stone-200 bg-white p-1 shadow-xl shadow-slate-900/20"
          onClick={(event) => event.stopPropagation()}
          onPointerDown={(event) => event.stopPropagation()}
        >
          <RichTextToolbar editor={editor} compact allowImages={false} />
        </div>
      ) : null}
      {isRichTextEmpty(value || "") ? (
        <span className="pointer-events-none absolute left-3 top-2 text-sm text-slate-400" dangerouslySetInnerHTML={{ __html: placeholder }} />
      ) : null}
      {editor ? <EditorContent editor={editor} /> : null}
    </div>
  );
}

function TimelineTextHolderEditor({
  holder,
  editorKey,
  previewMode,
  isActive,
  onFocus,
  onExit,
  onChange,
  onDelete,
  onMoveStart,
}: {
  holder: TimelineTextHolder;
  editorKey: string;
  previewMode?: boolean;
  isActive: boolean;
  onFocus: () => void;
  onExit: () => void;
  onChange: (value: string) => void;
  onDelete: () => void;
  onMoveStart: (event: PointerEvent<HTMLElement>) => void;
}) {
  return (
    <div
      className="group absolute"
      style={{ left: `${holder.x}%`, top: `${holder.y}%`, width: `${holder.width}%`, minHeight: `${holder.height}%` }}
    >
      <TimelineRichText
        value={holder.content}
        editorKey={editorKey}
        previewMode={previewMode}
        isActive={isActive}
        className="relative min-h-10 rounded-[0.75rem] bg-transparent p-2 pr-9 text-sm text-slate-900 hover:bg-white/55"
        placeholder={`<p>${holder.placeholder}</p>`}
        onFocus={onFocus}
        onExit={onExit}
        onChange={onChange}
      />
      {!previewMode ? (
        <>
          <button
            type="button"
            aria-label="Move text holder"
            onPointerDown={onMoveStart}
            className="absolute -left-7 top-1 z-10 flex h-6 w-5 cursor-move touch-none items-center justify-center rounded-md bg-white/90 opacity-0 shadow-sm transition group-hover:opacity-100 focus:opacity-100"
          >
            <span className="h-3 w-2 rounded-sm border-y border-slate-400" />
          </button>
          <button
            type="button"
            aria-label="Delete text holder"
            onClick={(event) => {
              event.stopPropagation();
              onDelete();
            }}
            className="absolute right-1 top-1 z-10 flex h-7 w-7 items-center justify-center rounded-full bg-white text-sm font-semibold text-rose-600 opacity-0 shadow-sm transition hover:bg-rose-50 group-hover:opacity-100 focus:opacity-100"
          >
            x
          </button>
        </>
      ) : null}
    </div>
  );
}

function TimelineImageHolderEditor({
  holder,
  eventId,
  previewMode,
  onUpload,
  onLinkChange,
  onDelete,
  onMoveStart,
  onResizeStart,
}: {
  holder: TimelineImageHolder;
  eventId: string;
  previewMode?: boolean;
  onUpload: (eventId: string, holderId: string, file: File) => Promise<void>;
  onLinkChange: (link: BlockLink) => void;
  onDelete: (eventId: string, holderId: string) => void;
  onMoveStart: (event: PointerEvent<HTMLElement>) => void;
  onResizeStart: (event: PointerEvent<HTMLElement>) => void;
}) {
  return (
    <label
      className={`group/image absolute block overflow-hidden rounded-[0.85rem] bg-slate-100 ${previewMode ? "" : "cursor-pointer"}`}
      style={{ left: `${holder.x}%`, top: `${holder.y}%`, width: `${holder.width}%`, height: `${holder.height}%` }}
      onPointerDown={(event) => event.stopPropagation()}
      {...pageLinkAttributes(holder.link)}
    >
      <div className="flex h-full items-center justify-center border border-dashed border-slate-300 text-sm font-medium text-slate-500">
        {holder.imageUrl ? <img src={holder.imageUrl} alt="Timeline event image" className="h-full w-full object-cover" /> : "Image holder"}
      </div>
      {!previewMode ? (
        <>
          <input
            type="file"
            accept="image/*"
            className="hidden"
            onChange={async (event) => {
              const input = event.currentTarget;
              const file = input.files?.[0];
              if (file) await onUpload(eventId, holder.id, file);
              input.value = "";
            }}
          />
          <button
            type="button"
            aria-label="Move image holder"
            onPointerDown={onMoveStart}
            className="absolute left-2 top-2 z-10 flex h-7 w-7 cursor-move touch-none items-center justify-center rounded-full border border-white/80 bg-slate-950/70 text-white shadow-sm shadow-slate-900/20 transition hover:bg-slate-900 focus:outline-none focus:ring-2 focus:ring-white/80"
          >
            <span className="h-3.5 w-3 rounded-sm border-y border-white/90" />
          </button>
          <div className="absolute left-11 top-2 z-10 opacity-0 transition group-hover/image:opacity-100">
            <ImageLinkControl link={holder.link} onChange={onLinkChange} />
          </div>
          <button
            type="button"
            aria-label="Delete image holder"
            onClick={(event) => {
              event.preventDefault();
              event.stopPropagation();
              onDelete(eventId, holder.id);
            }}
            className="absolute right-2 top-2 z-10 flex h-7 w-7 items-center justify-center rounded-full bg-white text-sm font-semibold text-rose-600 opacity-0 shadow-sm transition hover:bg-rose-50 group-hover/image:opacity-100 focus:opacity-100"
          >
            x
          </button>
          <button
            type="button"
            aria-label="Resize image holder"
            onPointerDown={onResizeStart}
            onClick={(event) => {
              event.preventDefault();
              event.stopPropagation();
            }}
            className="absolute bottom-2 right-2 z-10 h-6 w-6 cursor-nwse-resize touch-none rounded-md border border-white bg-slate-900/75 shadow-sm shadow-slate-900/30 transition hover:bg-slate-900 focus:outline-none focus:ring-2 focus:ring-white/80"
          >
            <span className="absolute bottom-1 right-1 h-3 w-3 border-b-2 border-r-2 border-white/90" />
          </button>
        </>
      ) : null}
    </label>
  );
}

function TimelineBreakLineEditor({
  line,
  previewMode,
  onDelete,
  onMoveStart,
  onResizeStart,
}: {
  line: TimelineBreakLine;
  previewMode?: boolean;
  onDelete: () => void;
  onMoveStart: (event: PointerEvent<HTMLElement>) => void;
  onResizeStart: (event: PointerEvent<HTMLElement>) => void;
}) {
  return (
    <div
      className="group/line absolute z-10 h-5 -translate-y-1/2 cursor-move touch-none"
      style={{ left: `${line.x}%`, top: `${line.y}%`, width: `${line.width}%` }}
      onPointerDown={!previewMode ? onMoveStart : undefined}
    >
      <div className="absolute left-0 top-1/2 h-px w-full -translate-y-1/2 bg-slate-400" />
      {!previewMode ? (
        <>
          <button
            type="button"
            aria-label="Resize break line"
            onPointerDown={onResizeStart}
            className="absolute right-0 top-1/2 z-20 h-4 w-4 -translate-y-1/2 translate-x-1/2 cursor-ew-resize rounded-full border border-white bg-slate-700 opacity-0 shadow-sm transition group-hover/line:opacity-100 focus:opacity-100"
          />
          <button
            type="button"
            aria-label="Delete break line"
            onPointerDown={(event) => event.stopPropagation()}
            onClick={(event) => {
              event.stopPropagation();
              onDelete();
            }}
            className="absolute right-0 top-1/2 z-20 flex h-6 w-6 -translate-y-1/2 translate-x-[150%] items-center justify-center rounded-full border border-stone-200 bg-white text-xs font-semibold text-rose-600 opacity-0 shadow-sm transition hover:bg-rose-50 group-hover/line:opacity-100 focus:opacity-100"
          >
            x
          </button>
        </>
      ) : null}
    </div>
  );
}
function LoreBlock({
  block,
  previewMode,
  onUpdate,
}: {
  block: ProjectBlock & { type: "lore"; data: LoreBlockData };
  previewMode?: boolean;
  onUpdate?: (block: ProjectBlock) => void;
}) {
  const [activeEditor, setActiveEditor] = useState<string | null>(null);
  const [dragTarget, setDragTarget] = useState<{
    kind: "text" | "line";
    id: string;
    startX: number;
    startY: number;
    originX: number;
    originY: number;
    width: number;
    height: number;
    rect: DOMRect;
  } | null>(null);
  const [resizeTarget, setResizeTarget] = useState<{
    kind: "text" | "line";
    id: string;
    startX: number;
    startY: number;
    width: number;
    height: number;
    x: number;
    y: number;
    rect: DOMRect;
  } | null>(null);
  const loreData = useMemo(() => fitLoreWorkspaceHeight(block.data, block.data.height ?? 360), [block.data]);
  const textHolders = useMemo(() => loreData.textHolders ?? [], [loreData.textHolders]);
  const breakLines = useMemo(() => loreData.breakLines ?? [], [loreData.breakLines]);

  const updateLore = useCallback((patch: Partial<LoreBlockData>) => {
    onUpdate?.({ ...block, data: fitLoreWorkspaceHeight({ ...loreData, ...patch }, loreData.height ?? 360) });
  }, [block, loreData, onUpdate]);

  useEffect(() => {
    if ((!dragTarget && !resizeTarget) || previewMode) return;

    const handlePointerMove = (event: globalThis.PointerEvent) => {
      if (resizeTarget) {
        if (resizeTarget.kind === "text") {
          const nextWidth = clampPercent(
            resizeTarget.width + ((event.clientX - resizeTarget.startX) / resizeTarget.rect.width) * 100,
            12,
            100 - resizeTarget.x
          );
          const nextHeight = Math.max(
            8,
            resizeTarget.height + ((event.clientY - resizeTarget.startY) / resizeTarget.rect.height) * 100
          );
          updateLore({
            textHolders: textHolders.map((holder) =>
              holder.id === resizeTarget.id ? { ...holder, width: nextWidth, height: nextHeight } : holder
            ),
            height: Math.max(loreData.height ?? 360, Math.round(((resizeTarget.y + nextHeight) / 100) * (loreData.height ?? 360) + 40)),
          });
          return;
        }

        const nextWidth = clampPercent(
          resizeTarget.width + ((event.clientX - resizeTarget.startX) / resizeTarget.rect.width) * 100,
          8,
          100 - resizeTarget.x
        );
        updateLore({
          breakLines: breakLines.map((line) => (line.id === resizeTarget.id ? { ...line, width: nextWidth } : line)),
        });
        return;
      }

      if (!dragTarget) return;
      const nextX = clampPercent(
        dragTarget.originX + ((event.clientX - dragTarget.startX) / dragTarget.rect.width) * 100,
        0,
        100 - dragTarget.width
      );
      const nextY = clampPercent(
        dragTarget.originY + ((event.clientY - dragTarget.startY) / dragTarget.rect.height) * 100,
        0,
        100 - dragTarget.height
      );
      if (dragTarget.kind === "text") {
        updateLore({
          textHolders: textHolders.map((holder) => (holder.id === dragTarget.id ? { ...holder, x: nextX, y: nextY } : holder)),
          height: Math.max(loreData.height ?? 360, Math.round(((nextY + dragTarget.height) / 100) * (loreData.height ?? 360) + 40)),
        });
        return;
      }
      updateLore({
        breakLines: breakLines.map((line) => (line.id === dragTarget.id ? { ...line, x: nextX, y: nextY } : line)),
      });
    };

    const handlePointerUp = () => {
      setDragTarget(null);
      setResizeTarget(null);
    };

    window.addEventListener("pointermove", handlePointerMove);
    window.addEventListener("pointerup", handlePointerUp, { once: true });
    return () => {
      window.removeEventListener("pointermove", handlePointerMove);
      window.removeEventListener("pointerup", handlePointerUp);
    };
  }, [breakLines, dragTarget, loreData.height, previewMode, resizeTarget, textHolders, updateLore]);

  useEffect(() => {
    if (!activeEditor || previewMode) return;
    const handlePointerDown = (event: globalThis.PointerEvent) => {
      const target = event.target as HTMLElement | null;
      if (target?.closest(`[data-lore-editor-key="${activeEditor}"], [data-timeline-editor-key="${activeEditor}"]`)) return;
      setActiveEditor(null);
    };
    document.addEventListener("pointerdown", handlePointerDown);
    return () => document.removeEventListener("pointerdown", handlePointerDown);
  }, [activeEditor, previewMode]);

  const startDrag = (kind: "text" | "line", item: LoreTextHolder | LoreBreakLine, event: PointerEvent<HTMLElement>) => {
    const canvas = event.currentTarget.closest("[data-lore-canvas]") as HTMLElement | null;
    if (!canvas) return;
    event.preventDefault();
    event.stopPropagation();
    setActiveEditor(null);
    updateLore({ activeItemId: item.id });
    setDragTarget({
      kind,
      id: item.id,
      startX: event.clientX,
      startY: event.clientY,
      originX: item.x,
      originY: item.y,
      width: item.width,
      height: "height" in item ? item.height : 2,
      rect: canvas.getBoundingClientRect(),
    });
  };

  const startResize = (kind: "text" | "line", item: LoreTextHolder | LoreBreakLine, event: PointerEvent<HTMLElement>) => {
    const canvas = event.currentTarget.closest("[data-lore-canvas]") as HTMLElement | null;
    if (!canvas) return;
    event.preventDefault();
    event.stopPropagation();
    setActiveEditor(null);
    updateLore({ activeItemId: item.id });
    setResizeTarget({
      kind,
      id: item.id,
      startX: event.clientX,
      startY: event.clientY,
      width: item.width,
      height: "height" in item ? item.height : 2,
      x: item.x,
      y: item.y,
      rect: canvas.getBoundingClientRect(),
    });
  };

  const removeTextHolder = (id: string) => {
    setActiveEditor(null);
    updateLore({ textHolders: textHolders.filter((holder) => holder.id !== id) });
  };

  const removeBreakLine = (id: string) => {
    updateLore({ breakLines: breakLines.filter((line) => line.id !== id) });
  };

  return (
    <div className="rounded-[1rem] border border-white/10 bg-white/5 p-5 shadow-sm shadow-slate-900/10 backdrop-blur-[2px]">
      <div
        data-lore-canvas
        className="relative overflow-visible rounded-[1rem] border border-dashed border-white/20 bg-white/5 backdrop-blur-[2px]"
        style={{ height: `${loreData.height ?? 360}px` }}
        onPointerDown={(event) => event.stopPropagation()}
      >
        {breakLines.map((line) => (
          <LoreBreakLineEditor
            key={line.id}
            line={line}
            previewMode={previewMode}
            onMoveStart={(event) => startDrag("line", line, event)}
            onResizeStart={(event) => startResize("line", line, event)}
            onDelete={() => removeBreakLine(line.id)}
          />
        ))}
        {textHolders.map((holder) => {
          const editorKey = `lore-${holder.id}`;
          return (
            <LoreTextHolderEditor
              key={holder.id}
              holder={holder}
              editorKey={editorKey}
              previewMode={previewMode}
              isActive={activeEditor === editorKey}
              onFocus={() => {
                updateLore({ activeItemId: holder.id });
                setActiveEditor(editorKey);
              }}
              onExit={() => setActiveEditor(null)}
              onChange={(content) =>
                updateLore({ textHolders: textHolders.map((item) => (item.id === holder.id ? { ...item, content } : item)) })
              }
              onMoveStart={(event) => startDrag("text", holder, event)}
              onResizeStart={(event) => startResize("text", holder, event)}
              onDelete={() => removeTextHolder(holder.id)}
            />
          );
        })}
      </div>
    </div>
  );
}

function LoreTextHolderEditor({
  holder,
  editorKey,
  previewMode,
  isActive,
  onFocus,
  onExit,
  onChange,
  onMoveStart,
  onResizeStart,
  onDelete,
}: {
  holder: LoreTextHolder;
  editorKey: string;
  previewMode?: boolean;
  isActive: boolean;
  onFocus: () => void;
  onExit: () => void;
  onChange: (value: string) => void;
  onMoveStart: (event: PointerEvent<HTMLElement>) => void;
  onResizeStart: (event: PointerEvent<HTMLElement>) => void;
  onDelete: () => void;
}) {
  return (
    <div
      className="group absolute"
      style={{ left: `${holder.x}%`, top: `${holder.y}%`, width: `${holder.width}%`, minHeight: `${holder.height}%` }}
    >
      <TimelineRichText
        value={holder.content}
        editorKey={editorKey}
        previewMode={previewMode}
        isActive={isActive}
        className={`relative min-h-full rounded-[0.75rem] bg-transparent p-2 pr-10 text-slate-900 hover:bg-white/55 ${holder.kind === "title" ? "text-xl font-semibold" : "text-sm leading-6"}`}
        placeholder={`<p>${holder.placeholder}</p>`}
        onFocus={onFocus}
        onExit={onExit}
        onChange={onChange}
      />
      {!previewMode ? (
        <>
          <button
            type="button"
            aria-label="Move text holder"
            onPointerDown={onMoveStart}
            className="absolute -left-7 top-1 z-10 flex h-6 w-5 cursor-move touch-none items-center justify-center rounded-md bg-white/90 opacity-0 shadow-sm transition group-hover:opacity-100 focus:opacity-100"
          >
            <span className="h-3 w-2 rounded-sm border-y border-slate-400" />
          </button>
          <button
            type="button"
            aria-label="Resize text holder"
            onPointerDown={onResizeStart}
            className="absolute bottom-1 right-1 z-10 h-5 w-5 cursor-nwse-resize rounded-md bg-slate-800/75 opacity-0 shadow-sm transition group-hover:opacity-100 focus:opacity-100"
          >
            <span className="absolute bottom-1 right-1 h-2.5 w-2.5 border-b-2 border-r-2 border-white/90" />
          </button>
          <button
            type="button"
            aria-label="Delete text holder"
            onClick={(event) => {
              event.stopPropagation();
              onDelete();
            }}
            className="absolute right-1 top-1 z-10 flex h-7 w-7 items-center justify-center rounded-full bg-white text-sm font-semibold text-rose-600 opacity-0 shadow-sm transition hover:bg-rose-50 group-hover:opacity-100 focus:opacity-100"
          >
            x
          </button>
        </>
      ) : null}
    </div>
  );
}

function LoreBreakLineEditor({
  line,
  previewMode,
  onMoveStart,
  onResizeStart,
  onDelete,
}: {
  line: LoreBreakLine;
  previewMode?: boolean;
  onMoveStart: (event: PointerEvent<HTMLElement>) => void;
  onResizeStart: (event: PointerEvent<HTMLElement>) => void;
  onDelete: () => void;
}) {
  return (
    <div
      className="group/line absolute z-10 h-5 -translate-y-1/2 cursor-move touch-none"
      style={{ left: `${line.x}%`, top: `${line.y}%`, width: `${line.width}%` }}
      onPointerDown={!previewMode ? onMoveStart : undefined}
    >
      <div className="absolute left-0 top-1/2 h-px w-full -translate-y-1/2 bg-slate-400" />
      {!previewMode ? (
        <>
          <button
            type="button"
            aria-label="Resize break line"
            onPointerDown={onResizeStart}
            className="absolute right-0 top-1/2 z-20 h-4 w-4 -translate-y-1/2 translate-x-1/2 cursor-ew-resize rounded-full border border-white bg-slate-700 opacity-0 shadow-sm transition group-hover/line:opacity-100 focus:opacity-100"
          />
          <button
            type="button"
            aria-label="Delete break line"
            onPointerDown={(event) => event.stopPropagation()}
            onClick={(event) => {
              event.stopPropagation();
              onDelete();
            }}
            className="absolute right-0 top-1/2 z-20 flex h-6 w-6 -translate-y-1/2 translate-x-[150%] items-center justify-center rounded-full border border-stone-200 bg-white text-xs font-semibold text-rose-600 opacity-0 shadow-sm transition hover:bg-rose-50 group-hover/line:opacity-100 focus:opacity-100"
          >
            x
          </button>
        </>
      ) : null}
    </div>
  );
}

function DividerBlock({ block }: {
  block: ProjectBlock & { type: "divider"; data: { visible: boolean } };
}) {
  if (!isDividerVisible(block.data)) {
    return <div className="h-16" aria-hidden="true" />;
  }

  return (
    <div className="flex h-16 items-center" aria-label="Divider">
      <div className="h-px w-full bg-stone-300" />
    </div>
  );
}
