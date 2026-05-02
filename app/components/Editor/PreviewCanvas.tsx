"use client";

import { useEffect, useRef, useState, type CSSProperties, type DragEvent, type MouseEvent } from "react";
import type { BlockType, ProjectBlock, ProjectPage, ProjectVibeData, TemplateSpec } from "../../lib/ocworld";
import { getPageAncestors, getProjectVibeSurface, isPageVisibleInNavigation } from "../../lib/ocworld";
import { translations } from "../../lib/translations";
import BlockRenderer from "./BlockRenderers";

interface PreviewCanvasProps {
  blocks: ProjectBlock[];
  pages?: ProjectPage[];
  currentPageId?: string;
  hiddenBackPageId?: string | null;
  onNavigatePage?: (pageId: string) => void;
  onBackFromHiddenPage?: () => void;
  template: TemplateSpec;
  vibe?: ProjectVibeData;
  selectedBlockId: string | null;
  onSelectBlock: (id: string) => void;
  onDropBlock: (type: BlockType) => void;
  onDuplicateBlock: (block: ProjectBlock) => void;
  onRemoveBlock: (id: string) => void;
  onUpdateBlock: (block: ProjectBlock) => void;
  onMoveBlock: (sourceId: string, targetId: string) => void;
  previewMode?: boolean;
}

export default function PreviewCanvas({
  blocks,
  pages = [],
  currentPageId,
  hiddenBackPageId,
  onNavigatePage,
  onBackFromHiddenPage,
  vibe,
  selectedBlockId,
  onSelectBlock,
  onDropBlock,
  onDuplicateBlock,
  onRemoveBlock,
  onUpdateBlock,
  onMoveBlock,
  previewMode = false,
}: PreviewCanvasProps) {
  const strings = translations.en.editor;
  const vibeSurface = getProjectVibeSurface(vibe);
  const isDarkTone = vibeSurface.tone === "dark";
  const canvasTheme = {
    shell:
      isDarkTone
        ? "oc-theme-dark border-slate-100/15 bg-slate-950 text-slate-50 shadow-[0_24px_70px_rgba(0,0,0,0.34)]"
        : "oc-theme-light border-stone-300/70 bg-[#fffdf8] text-slate-900 shadow-[0_24px_70px_rgba(74,63,48,0.14)]",
    workspace:
      isDarkTone
        ? "border-slate-100/15 bg-slate-950/54 shadow-inner shadow-black/30"
        : "border-stone-300/60 bg-[#fffdf8]/72 shadow-inner shadow-stone-200/60",
    navPanel:
      isDarkTone
        ? "border-slate-100/15 bg-slate-950/62 shadow-sm shadow-black/20"
        : "border-stone-300/70 bg-[#fffdf8]/88 shadow-sm shadow-stone-300/40",
    navTitle: isDarkTone ? "text-slate-50" : "text-slate-950",
    navDivider: isDarkTone ? "border-slate-100/15" : "border-stone-200/80",
    navActive: isDarkTone ? "bg-slate-50 text-slate-950 shadow-sm" : "bg-slate-950 text-white shadow-sm",
    navInactive: isDarkTone ? "text-slate-200 hover:bg-white/10" : "text-stone-700 hover:bg-stone-100",
    nestedInactive: isDarkTone ? "bg-white/10 text-slate-200 hover:bg-white/15" : "bg-white/75 text-stone-700 hover:bg-stone-100",
    empty:
      isDarkTone
        ? "border-slate-100/25 bg-slate-950/42 text-slate-300"
        : "border-stone-400/70 bg-[#f8f4ec]/75 text-stone-500",
    emptyLine: isDarkTone ? "bg-slate-200/40" : "bg-stone-300",
    emptyTitle: isDarkTone ? "text-slate-50" : "text-slate-800",
    selectedRing: isDarkTone ? "ring-slate-50/35 ring-offset-slate-950" : "ring-slate-900/25 ring-offset-[#fffdf8]",
    actionButton: isDarkTone ? "border-slate-100/15 bg-slate-950/70 text-slate-100 hover:bg-slate-900" : "border-stone-300 bg-white/75 text-stone-600 hover:bg-white",
    backButton: isDarkTone ? "bg-slate-50 text-slate-950 hover:bg-slate-200" : "bg-slate-950 text-white hover:bg-slate-700",
  };
  const vibeStyle = {
    backgroundColor: vibeSurface.backgroundColor,
    "--oc-page-text": vibeSurface.textColor,
    "--oc-page-muted": vibeSurface.mutedTextColor,
    "--oc-page-panel": vibeSurface.panelBackground,
    "--oc-page-panel-strong": vibeSurface.panelStrongBackground,
    "--oc-page-border": vibeSurface.panelBorder,
    "--oc-page-line": vibeSurface.lineColor,
    "--oc-page-grid": isDarkTone ? "rgba(248,250,252,0.18)" : "rgba(15,23,42,0.14)",
  } as CSSProperties;
  const [visibleSectionIds, setVisibleSectionIds] = useState<Set<string>>(new Set());
  const shellRef = useRef<HTMLDivElement | null>(null);
  const [backgroundScroll, setBackgroundScroll] = useState({
    isTallCustomImage: false,
    imageHeight: 0,
    translateY: 0,
  });
  const activePage = pages.find((page) => page.id === currentPageId);
  const visiblePages = pages.filter((page) => isPageVisibleInNavigation(page, pages));
  const ancestors = activePage ? getPageAncestors(activePage.id, pages) : [];
  const activePageIsVisible = activePage ? isPageVisibleInNavigation(activePage, pages) : false;
  const topLevelPages = visiblePages.filter((page) => (page.parentId ?? null) === null);
  const activeTopPage = activePage
    ? ancestors.find((page) => (page.parentId ?? null) === null) ?? (activePage.parentId ? pages.find((page) => page.id === activePage.parentId) : activePage)
    : null;
  const spreadSubpages = activeTopPage
    ? visiblePages
        .filter((page) => page.parentId === activeTopPage.id)
        .sort((a, b) => a.order - b.order || a.title.localeCompare(b.title))
    : [];
  const listSubpages = activePage && activePage.id !== activeTopPage?.id
    ? visiblePages
        .filter((page) => page.parentId === activePage.id)
        .sort((a, b) => a.order - b.order || a.title.localeCompare(b.title))
    : [];

  const renderNavigationItems = (items: ProjectPage[]) =>
    items
      .sort((a, b) => a.order - b.order || a.title.localeCompare(b.title))
      .map((page) => (
        <button
          key={page.id}
          type="button"
          onClick={(event) => {
            event.stopPropagation();
            onNavigatePage?.(page.id);
          }}
          className={`rounded-full px-3 py-2 text-sm font-semibold transition ${
            page.id === currentPageId || page.id === activeTopPage?.id || ancestors.some((ancestor) => ancestor.id === page.id) ? canvasTheme.navActive : canvasTheme.navInactive
          }`}
        >
          {page.title}
        </button>
      ));

  useEffect(() => {
    if (!previewMode) {
      return;
    }
    if (typeof IntersectionObserver === "undefined") {
      const fallbackTimer = window.setTimeout(() => {
        setVisibleSectionIds(new Set(blocks.map((block) => block.id)));
      }, 0);
      return () => window.clearTimeout(fallbackTimer);
    }

    const nodes = document.querySelectorAll<HTMLElement>("[data-preview-section-id]");
    if (!nodes.length) {
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        setVisibleSectionIds((current) => {
          const next = new Set(current);
          entries.forEach((entry) => {
            const id = (entry.target as HTMLElement).dataset.previewSectionId;
            if (entry.isIntersecting && id) {
              next.add(id);
            }
          });
          return next;
        });
      },
      { threshold: 0.12, rootMargin: "0px 0px -8% 0px" }
    );

    nodes.forEach((node) => observer.observe(node));
    return () => {
      observer.disconnect();
    };
  }, [blocks, previewMode]);

  useEffect(() => {
    const shell = shellRef.current;
    if (!shell || !vibeSurface.isCustomImage || !vibeSurface.imageAspectRatio) {
      setBackgroundScroll({ isTallCustomImage: false, imageHeight: 0, translateY: 0 });
      return;
    }

    const getScrollContainer = () => {
      let parent = shell.parentElement;
      while (parent) {
        const style = window.getComputedStyle(parent);
        if (/(auto|scroll)/.test(`${style.overflowY}${style.overflow}`)) {
          return parent;
        }
        parent = parent.parentElement;
      }
      return null;
    };

    const scrollContainer = getScrollContainer();
    let frame = 0;
    const syncBackground = () => {
      window.cancelAnimationFrame(frame);
      frame = window.requestAnimationFrame(() => {
        const viewportHeight = scrollContainer?.clientHeight ?? window.innerHeight;
        const currentScrollY = scrollContainer?.scrollTop ?? window.scrollY;
        const contentScrollableDistance = Math.max(
          0,
          (scrollContainer?.scrollHeight ?? document.documentElement.scrollHeight) - viewportHeight
        );
        const imageHeight = shell.getBoundingClientRect().width / vibeSurface.imageAspectRatio!;
        const imageScrollableDistance = Math.max(0, imageHeight - viewportHeight);
        if (imageScrollableDistance <= 1 || contentScrollableDistance <= 1) {
          setBackgroundScroll({ isTallCustomImage: false, imageHeight, translateY: 0 });
          return;
        }
        const scrollProgress = Math.min(1, Math.max(0, currentScrollY / contentScrollableDistance));
        const backgroundOffsetY = Math.min(imageScrollableDistance, scrollProgress * imageScrollableDistance);
        setBackgroundScroll({
          isTallCustomImage: true,
          imageHeight,
          translateY: currentScrollY - backgroundOffsetY,
        });
      });
    };

    const resizeObserver = new ResizeObserver(syncBackground);
    resizeObserver.observe(shell);
    scrollContainer?.addEventListener("scroll", syncBackground, { passive: true });
    window.addEventListener("scroll", syncBackground, { passive: true });
    window.addEventListener("resize", syncBackground);
    syncBackground();

    return () => {
      window.cancelAnimationFrame(frame);
      resizeObserver.disconnect();
      scrollContainer?.removeEventListener("scroll", syncBackground);
      window.removeEventListener("scroll", syncBackground);
      window.removeEventListener("resize", syncBackground);
    };
  }, [blocks, pages.length, previewMode, vibeSurface.imageAspectRatio, vibeSurface.isCustomImage]);

  const handleSectionDrop = (event: DragEvent<HTMLElement>, targetId?: string) => {
    event.preventDefault();
    if (previewMode) {
      return;
    }

    const paletteType = event.dataTransfer.getData("application/x-ocworld-block") as BlockType;
    const sourceId = event.dataTransfer.getData("application/x-ocworld-block-order");

    if (paletteType) {
      onDropBlock(paletteType);
      return;
    }

    if (sourceId && targetId && sourceId !== targetId) {
      onMoveBlock(sourceId, targetId);
    }
  };

  const handleInternalLinkClick = (event: MouseEvent<HTMLElement>) => {
    const target = event.target as HTMLElement | null;
    const pageTarget = target?.closest<HTMLElement>("[data-page-link]");
    const anchor = target?.closest<HTMLAnchorElement>("a[href^='#oc-page:']");
    const pageId = pageTarget?.dataset.pageLink || anchor?.getAttribute("href")?.replace("#oc-page:", "");
    if (!pageId) return;
    event.preventDefault();
    event.stopPropagation();
    onNavigatePage?.(pageId);
  };

  return (
    <div
      ref={shellRef}
      className={`group relative overflow-hidden rounded-[1.5rem] border p-4 ${canvasTheme.shell}`}
      style={vibeStyle}
    >
      {!backgroundScroll.isTallCustomImage ? (
        <div
          className="pointer-events-none absolute inset-0"
          style={{
            backgroundImage: vibeSurface.backgroundImage || undefined,
            backgroundSize: "cover",
            backgroundPosition: vibeSurface.backgroundPosition,
            backgroundRepeat: "no-repeat",
          }}
        />
      ) : null}
      {backgroundScroll.isTallCustomImage ? (
        <div
          className="pointer-events-none absolute left-0 top-0 w-full"
          style={{
            height: `${backgroundScroll.imageHeight}px`,
            backgroundImage: vibeSurface.backgroundImage || undefined,
            backgroundSize: "100% auto",
            backgroundPosition: "top center",
            backgroundRepeat: "no-repeat",
            transform: `translate3d(0, ${backgroundScroll.translateY}px, 0)`,
            willChange: "transform",
          }}
        />
      ) : null}
      <div className="pointer-events-none absolute inset-0" style={{ backgroundColor: vibeSurface.overlay }} />
      <div
        className="pointer-events-none absolute inset-0 opacity-[0.22]"
        style={{
          backgroundImage:
            `linear-gradient(${vibeSurface.gridColor} 1px, transparent 1px), linear-gradient(90deg, ${vibeSurface.gridColor} 1px, transparent 1px)`,
          backgroundSize: "28px 28px",
        }}
      />
      <div
        className={`relative z-10 min-h-[640px] rounded-[1.25rem] border p-5 ${canvasTheme.workspace}`}
        onDragOver={(event) => event.preventDefault()}
        onDrop={(event) => handleSectionDrop(event)}
        onClickCapture={previewMode ? handleInternalLinkClick : undefined}
      >
        {pages.length > 1 ? (
          <div className={`mb-6 rounded-[1.2rem] border p-3 backdrop-blur ${canvasTheme.navPanel}`}>
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div className={`font-serif text-lg font-semibold tracking-[-0.03em] ${canvasTheme.navTitle}`}>{activePage?.title ?? "Page"}</div>
              <div className="flex flex-wrap items-center gap-1">{renderNavigationItems(topLevelPages)}</div>
            </div>
            {spreadSubpages.length ? (
              <div className={`mt-3 flex flex-wrap items-center gap-1 border-t pt-3 ${canvasTheme.navDivider}`}>
                {renderNavigationItems(spreadSubpages)}
              </div>
            ) : null}
            {listSubpages.length ? (
              <div className={`mt-3 grid max-w-xs gap-1 border-t pt-3 ${canvasTheme.navDivider}`}>
                {listSubpages.map((page) => (
                  <button
                    key={page.id}
                    type="button"
                    onClick={(event) => {
                      event.stopPropagation();
                      onNavigatePage?.(page.id);
                    }}
                    className={`rounded-xl px-3 py-2 text-left text-sm font-semibold transition ${
                      page.id === currentPageId ? canvasTheme.navActive : canvasTheme.nestedInactive
                    }`}
                  >
                    {page.title}
                  </button>
                ))}
              </div>
            ) : null}
            {!activePageIsVisible && activePage ? (
              <div className={`mt-3 border-t pt-3 ${canvasTheme.navDivider}`}>
                <button
                  type="button"
                  onClick={(event) => {
                    event.stopPropagation();
                    if (onBackFromHiddenPage) {
                      onBackFromHiddenPage();
                    } else if (hiddenBackPageId) {
                      onNavigatePage?.(hiddenBackPageId);
                    } else {
                      onNavigatePage?.(visiblePages[0]?.id ?? pages[0]?.id ?? "");
                    }
                  }}
                  className={`rounded-full px-3 py-2 text-sm font-semibold ${canvasTheme.backButton}`}
                >
                  Back
                </button>
              </div>
            ) : null}
          </div>
        ) : null}

        {blocks.length === 0 ? (
          <div className={`flex min-h-[480px] flex-col items-center justify-center gap-4 rounded-[1.25rem] border border-dashed p-10 text-center ${canvasTheme.empty}`}>
            <div className={`h-px w-20 ${canvasTheme.emptyLine}`} />
            <p className={`max-w-md font-serif text-2xl font-semibold tracking-[-0.03em] ${canvasTheme.emptyTitle}`}>A blank page is ready.</p>
            <p className="max-w-md text-sm leading-7">{strings.emptyCanvas}</p>
          </div>
        ) : (
          <div className="space-y-6">
            {blocks.map((block) => (
              <section
                key={block.id}
                data-preview-section={previewMode ? "true" : undefined}
                data-preview-section-id={previewMode ? block.id : undefined}
                draggable={!previewMode && block.type !== "imageText" && block.type !== "hero" && block.type !== "gallery" && block.type !== "character" && block.type !== "relationship" && block.type !== "timeline" && block.type !== "lore"}
                onDragStart={!previewMode && block.type !== "imageText" && block.type !== "hero" && block.type !== "gallery" && block.type !== "character" && block.type !== "relationship" && block.type !== "timeline" && block.type !== "lore" ? (event) => {
                  event.dataTransfer.setData("application/x-ocworld-block-order", block.id);
                  event.dataTransfer.effectAllowed = "move";
                } : undefined}
                onDragOver={(event) => event.preventDefault()}
                onDrop={(event) => handleSectionDrop(event, block.id)}
                onClick={!previewMode ? () => onSelectBlock(block.id) : undefined}
                className={`rounded-[1.35rem] transition ${previewMode ? `section-reveal bg-transparent ${visibleSectionIds.has(block.id) ? "is-visible" : ""}` : "cursor-pointer"} ${selectedBlockId === block.id && !previewMode ? `ring-2 ring-offset-4 ${canvasTheme.selectedRing}` : ""}`}
              >
                {!previewMode ? (
                  <div className="mb-4 flex flex-wrap gap-2 text-sm text-stone-500">
                    <button
                      type="button"
                      onClick={(event) => {
                        event.stopPropagation();
                        onDuplicateBlock(block);
                      }}
                      className={`rounded-full border px-3 py-2 font-semibold transition ${canvasTheme.actionButton}`}
                    >
                      {strings.duplicateButton}
                    </button>
                    <button
                      type="button"
                      onClick={(event) => {
                        event.stopPropagation();
                        onRemoveBlock(block.id);
                      }}
                      className="rounded-full border border-rose-200 bg-rose-50 px-3 py-2 font-semibold text-rose-700 transition hover:bg-rose-100"
                    >
                      {strings.removeButton}
                    </button>
                  </div>
                ) : null}

                <div className="mt-0">
                  <BlockRenderer block={block} pages={pages} previewMode={previewMode} onUpdate={!previewMode ? onUpdateBlock : undefined} />
                </div>
              </section>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
