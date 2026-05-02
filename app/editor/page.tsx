"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import {
  buildStaticSiteFiles,
  clonePageSections,
  createBlock,
  createPageId,
  createProjectPage,
  defaultProject,
  getCurrentPage,
  getTemplate,
  isPageVisibleInNavigation,
  normalizeProject,
  rebuildProjectPageSlugs,
  type BlockType,
  type ProjectBlock,
  type ProjectData,
  type ProjectPage,
  type ProjectVibeData,
} from "../lib/ocworld";
import BlockPalette from "../components/Editor/BlockPalette";
import { OCWorldBrand } from "../components/Brand/OCWorldLogo";
import PagesPanel from "../components/Editor/PagesPanel";
import ProjectDashboard, { type LocalProjectRecord } from "../components/Editor/ProjectDashboard";
import PreviewCanvas from "../components/Editor/PreviewCanvas";
import SettingsPanel from "../components/Editor/SettingsPanel";
import TutorialOverlay, { type TutorialStep } from "../components/Editor/TutorialOverlay";
import VibeStudioPanel from "../components/Editor/VibeStudioPanel";

const LEGACY_STORAGE_KEY = "ocworld-studio-project";
const PROJECTS_STORAGE_KEY = "ocworld_projects";
const ACTIVE_PROJECT_STORAGE_KEY = "ocworld_active_project_id";
const PROJECTS_STORAGE_MODE_KEY = "ocworld_projects_storage_mode";
const TUTORIAL_STORAGE_KEY = "ocworld-studio-tutorial-seen";
const PROJECTS_DB_NAME = "ocworld_studio_projects";
const PROJECTS_DB_VERSION = 1;
const PROJECTS_STORE_NAME = "project_library";
const PROJECTS_LIBRARY_ID = "library";

type ProjectStorageMode = "localStorage" | "indexedDB";

const tutorialSteps: TutorialStep[] = [
  {
    target: "add-page-button",
    text: "Start here to manage your story pages. Add new pages for characters, lore, galleries, or hidden detail pages.",
  },
  {
    target: "section-library",
    text: "This is your main building toolkit. Add headers, images, notes, galleries, character blocks, timelines, and more to shape your page.",
  },
  {
    target: "main-canvas",
    text: "This is your canvas. Everything you add and edit will appear here as your story page takes shape.",
  },
  {
    target: "studio-settings",
    text: "Click any block on the canvas, then use Studio Settings to customize text, images, layout, links, and details.",
  },
  {
    target: "vibe-studio",
    text: "Set the atmosphere of your page here. Choose a background, upload your own image, and add background music if you want.",
  },
  {
    target: "studio-notes",
    text: "Use Studio Notes for gentle tips while you build. Think of it as a small creative reminder space.",
  },
  {
    target: "preview-button",
    text: "Preview your page before exporting. This lets you see what visitors will experience.",
  },
  {
    target: "export-button",
    text: "When your page feels ready, export it as an HTML file you can save or share.",
  },
  {
    target: "tutorial-button",
    text: "You can bring this guide back anytime from here.",
  },
];

function slugifyFileName(value: string) {
  const slug = value
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
  return slug || "ocworld";
}

function cloneProject(project: ProjectData): ProjectData {
  return normalizeProject(JSON.parse(JSON.stringify(project)) as Partial<ProjectData>);
}

function createLocalProjectRecord(project: ProjectData = defaultProject, name = project.name): LocalProjectRecord {
  const now = new Date().toISOString();
  const normalizedProject = normalizeProject({ ...cloneProject(project), name: name.trim() || "Untitled OCWorld" });
  return {
    id: createPageId(),
    name: normalizedProject.name,
    createdAt: now,
    updatedAt: now,
    project: normalizedProject,
  };
}

function isQuotaExceededError(error: unknown) {
  return (
    error instanceof DOMException &&
    (error.name === "QuotaExceededError" ||
      error.name === "NS_ERROR_DOM_QUOTA_REACHED" ||
      error.code === 22 ||
      error.code === 1014)
  );
}

function openProjectDatabase() {
  return new Promise<IDBDatabase>((resolve, reject) => {
    if (typeof indexedDB === "undefined") {
      reject(new Error("IndexedDB is not available."));
      return;
    }
    const request = indexedDB.open(PROJECTS_DB_NAME, PROJECTS_DB_VERSION);
    request.onupgradeneeded = () => {
      const database = request.result;
      if (!database.objectStoreNames.contains(PROJECTS_STORE_NAME)) {
        database.createObjectStore(PROJECTS_STORE_NAME);
      }
    };
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error ?? new Error("Could not open project storage."));
  });
}

function readProjectLibraryFromIndexedDb() {
  return new Promise<{ records: LocalProjectRecord[]; activeProjectId: string } | null>((resolve) => {
    void openProjectDatabase()
      .then((database) => {
        const transaction = database.transaction(PROJECTS_STORE_NAME, "readonly");
        const store = transaction.objectStore(PROJECTS_STORE_NAME);
        const request = store.get(PROJECTS_LIBRARY_ID);
        request.onsuccess = () => {
          database.close();
          resolve((request.result as { records: LocalProjectRecord[]; activeProjectId: string } | undefined) ?? null);
        };
        request.onerror = () => {
          database.close();
          resolve(null);
        };
      })
      .catch(() => resolve(null));
  });
}

async function saveProjectLibraryToIndexedDb(records: LocalProjectRecord[], activeProjectId: string) {
  const database = await openProjectDatabase();
  await new Promise<void>((resolve, reject) => {
    const transaction = database.transaction(PROJECTS_STORE_NAME, "readwrite");
    const store = transaction.objectStore(PROJECTS_STORE_NAME);
    store.put({ records, activeProjectId }, PROJECTS_LIBRARY_ID);
    transaction.oncomplete = () => resolve();
    transaction.onerror = () => reject(transaction.error ?? new Error("Could not save project library."));
    transaction.onabort = () => reject(transaction.error ?? new Error("Project library save was aborted."));
  }).finally(() => database.close());
}

function normalizeStoredProjectLibrary(library: { records: LocalProjectRecord[]; activeProjectId: string }) {
  const records = library.records
    .filter((record) => record?.id && record.project)
    .map((record) => {
      const project = normalizeProject(record.project);
      return {
        id: String(record.id),
        name: String(record.name || project.name || "Untitled OCWorld"),
        createdAt: String(record.createdAt || new Date().toISOString()),
        updatedAt: String(record.updatedAt || record.createdAt || new Date().toISOString()),
        project: { ...project, name: String(record.name || project.name || "Untitled OCWorld") },
      };
    });
  if (!records.length) return null;
  const activeProjectId = records.some((record) => record.id === library.activeProjectId)
    ? library.activeProjectId
    : records[0].id;
  return { records, activeProjectId };
}

async function readProjectLibrary() {
  if (typeof window === "undefined") {
    const record = createLocalProjectRecord(defaultProject, "Untitled OCWorld");
    return { records: [record], activeProjectId: record.id, storageMode: "localStorage" as ProjectStorageMode };
  }

  if (window.localStorage.getItem(PROJECTS_STORAGE_MODE_KEY) === "indexedDB") {
    const indexedLibrary = await readProjectLibraryFromIndexedDb();
    const normalizedIndexedLibrary = indexedLibrary ? normalizeStoredProjectLibrary(indexedLibrary) : null;
    if (normalizedIndexedLibrary) {
      return { ...normalizedIndexedLibrary, storageMode: "indexedDB" as ProjectStorageMode };
    }
  }

  const rawProjects = window.localStorage.getItem(PROJECTS_STORAGE_KEY);
  if (rawProjects) {
    try {
      const parsed = JSON.parse(rawProjects) as Partial<LocalProjectRecord>[];
      const normalizedLibrary = normalizeStoredProjectLibrary({
        records: parsed as LocalProjectRecord[],
        activeProjectId: window.localStorage.getItem(ACTIVE_PROJECT_STORAGE_KEY) ?? "",
      });
      if (normalizedLibrary) {
        const storedActiveId = window.localStorage.getItem(ACTIVE_PROJECT_STORAGE_KEY);
        return {
          ...normalizedLibrary,
          activeProjectId: normalizedLibrary.records.some((record) => record.id === storedActiveId)
            ? storedActiveId ?? normalizedLibrary.records[0].id
            : normalizedLibrary.activeProjectId,
          storageMode: "localStorage" as ProjectStorageMode,
        };
      }
    } catch {
      // Fall through to legacy/default project creation.
    }
  }

  const indexedLibrary = await readProjectLibraryFromIndexedDb();
  const normalizedIndexedLibrary = indexedLibrary ? normalizeStoredProjectLibrary(indexedLibrary) : null;
  if (normalizedIndexedLibrary) {
    return { ...normalizedIndexedLibrary, storageMode: "indexedDB" as ProjectStorageMode };
  }

  const legacyRaw = window.localStorage.getItem(LEGACY_STORAGE_KEY);
  if (legacyRaw) {
    try {
      const legacyProject = normalizeProject(JSON.parse(legacyRaw) as Partial<ProjectData>);
      const record = createLocalProjectRecord(legacyProject, legacyProject.name || "Untitled OCWorld");
      return { records: [record], activeProjectId: record.id, storageMode: "localStorage" as ProjectStorageMode };
    } catch {
      // Fall through to a fresh local project.
    }
  }

  const record = createLocalProjectRecord(defaultProject, "Untitled OCWorld");
  return { records: [record], activeProjectId: record.id, storageMode: "localStorage" as ProjectStorageMode };
}

async function saveProjectLibrary(records: LocalProjectRecord[], activeProjectId: string): Promise<ProjectStorageMode> {
  const payload = JSON.stringify(records);
  try {
    window.localStorage.setItem(PROJECTS_STORAGE_KEY, payload);
    window.localStorage.setItem(ACTIVE_PROJECT_STORAGE_KEY, activeProjectId);
    window.localStorage.setItem(PROJECTS_STORAGE_MODE_KEY, "localStorage");
    void saveProjectLibraryToIndexedDb(records, activeProjectId);
    return "localStorage";
  } catch (error) {
    if (!isQuotaExceededError(error)) {
      throw error;
    }
    await saveProjectLibraryToIndexedDb(records, activeProjectId);
    try {
      window.localStorage.removeItem(PROJECTS_STORAGE_KEY);
      window.localStorage.setItem(ACTIVE_PROJECT_STORAGE_KEY, activeProjectId);
      window.localStorage.setItem(PROJECTS_STORAGE_MODE_KEY, "indexedDB");
    } catch {
      // IndexedDB now holds the editable project. localStorage may be entirely full.
    }
    return "indexedDB";
  }
}

function ToolbarIcon({ name }: { name: "projects" | "tutorial" | "preview" | "export" }) {
  const paths = {
    projects: (
      <>
        <path d="M3.5 6.75h6.1l1.25 1.5h9.65v8.9a2.1 2.1 0 0 1-2.1 2.1H5.6a2.1 2.1 0 0 1-2.1-2.1V6.75Z" />
        <path d="M3.5 6.75V5.9a2.1 2.1 0 0 1 2.1-2.1h3.25l1.3 1.55h4.45a2.1 2.1 0 0 1 2.1 2.1v.8" />
      </>
    ),
    tutorial: (
      <>
        <path d="M12 18.25h.01" />
        <path d="M9.1 9.2a3.1 3.1 0 1 1 5.18 2.3c-1.28 1.06-2.28 1.8-2.28 3.25" />
        <path d="M4.75 5.6A9 9 0 0 1 12 2.75a9 9 0 0 1 7.25 14.35A9 9 0 0 1 12 21.25a9 9 0 0 1-7.25-15.65Z" />
      </>
    ),
    preview: (
      <>
        <path d="M2.75 12s3.35-6.25 9.25-6.25S21.25 12 21.25 12 17.9 18.25 12 18.25 2.75 12 2.75 12Z" />
        <path d="M12 15.25a3.25 3.25 0 1 0 0-6.5 3.25 3.25 0 0 0 0 6.5Z" />
      </>
    ),
    export: (
      <>
        <path d="M12 3.75v11" />
        <path d="m7.75 8 4.25-4.25L16.25 8" />
        <path d="M5.25 13.5v4.25a2.5 2.5 0 0 0 2.5 2.5h8.5a2.5 2.5 0 0 0 2.5-2.5V13.5" />
      </>
    ),
  };

  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" className="h-4 w-4 shrink-0" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.8">
      {paths[name]}
    </svg>
  );
}

function downloadBlob(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  link.remove();
  URL.revokeObjectURL(url);
}

export default function EditorPage() {
  const [project, setProject] = useState<ProjectData>(defaultProject);
  const [projectRecords, setProjectRecords] = useState<LocalProjectRecord[]>([]);
  const [activeProjectId, setActiveProjectId] = useState("");
  const [selectedBlockId, setSelectedBlockId] = useState<string>("");
  const [hiddenPageBackId, setHiddenPageBackId] = useState<string | null>(null);
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);
  const [isProjectsOpen, setIsProjectsOpen] = useState(false);
  const [isTutorialOpen, setIsTutorialOpen] = useState(false);
  const [tutorialRunId, setTutorialRunId] = useState(0);
  const [saveStatus, setSaveStatus] = useState<"idle" | "saving" | "saved" | "error">("idle");
  const [projectStorageMode, setProjectStorageMode] = useState<ProjectStorageMode>("localStorage");
  const [lastSavedAt, setLastSavedAt] = useState<string>("");
  const [saveTick, setSaveTick] = useState(0);
  const [hasLoadedProject, setHasLoadedProject] = useState(false);
  const projectRecordsRef = useRef<LocalProjectRecord[]>([]);
  const activeProjectIdRef = useRef("");

  useEffect(() => {
    projectRecordsRef.current = projectRecords;
  }, [projectRecords]);

  useEffect(() => {
    activeProjectIdRef.current = activeProjectId;
  }, [activeProjectId]);

  useEffect(() => {
    if (typeof window === "undefined") {
      return;
    }

    const loadTimer = window.setTimeout(() => {
      void (async () => {
        const library = await readProjectLibrary();
        const activeRecord = library.records.find((record) => record.id === library.activeProjectId) ?? library.records[0];
        const normalizedProject = normalizeProject({
          ...activeRecord.project,
          vibe: { ...defaultProject.vibe, ...activeRecord.project.vibe },
        });
        const activePage = getCurrentPage(normalizedProject);
        setProjectRecords(library.records);
        setActiveProjectId(activeRecord.id);
        setProject(normalizedProject);
        setLastSavedAt(activeRecord.updatedAt);
        setSaveStatus("saved");
        setProjectStorageMode(library.storageMode);
        if (activePage.sections.length) {
          setSelectedBlockId(activePage.sections[0].id);
        }
        setHasLoadedProject(true);
        try {
          const mode = await saveProjectLibrary(library.records, activeRecord.id);
          setProjectStorageMode(mode);
        } catch {
          setSaveStatus("error");
        }
      })();
    }, 0);
    return () => window.clearTimeout(loadTimer);
  }, []);

  useEffect(() => {
    if (!hasLoadedProject || !activeProjectId || typeof window === "undefined") return;
    const statusTimer = window.setTimeout(() => setSaveStatus("saving"), 0);
    const saveTimer = window.setTimeout(() => {
      void (async () => {
        const now = new Date().toISOString();
        const nextRecords = projectRecordsRef.current.map((record) =>
          record.id === activeProjectId
            ? {
                ...record,
                name: project.name.trim() || "Untitled OCWorld",
                updatedAt: now,
                project: cloneProject(project),
              }
            : record
        );
        setProjectRecords(nextRecords);
        try {
          const mode = await saveProjectLibrary(nextRecords, activeProjectId);
          setProjectStorageMode(mode);
          setLastSavedAt(now);
          setSaveStatus("saved");
        } catch {
          setSaveStatus("error");
        }
      })();
    }, 700);
    return () => {
      window.clearTimeout(statusTimer);
      window.clearTimeout(saveTimer);
    };
  }, [activeProjectId, hasLoadedProject, project]);

  useEffect(() => {
    if (!lastSavedAt) return;
    const syncTimer = window.setTimeout(() => setSaveTick(Date.now()), 0);
    const timer = window.setInterval(() => setSaveTick(Date.now()), 30000);
    return () => {
      window.clearTimeout(syncTimer);
      window.clearInterval(timer);
    };
  }, [lastSavedAt]);

  useEffect(() => {
    if (!hasLoadedProject || typeof window === "undefined") return;
    if (window.localStorage.getItem(TUTORIAL_STORAGE_KEY) === "true") return;
    const timer = window.setTimeout(() => {
      setTutorialRunId((current) => current + 1);
      setIsTutorialOpen(true);
    }, 450);
    return () => window.clearTimeout(timer);
  }, [hasLoadedProject]);

  const template = useMemo(() => getTemplate(project.templateId), [project.templateId]);
  const activePage = useMemo(() => getCurrentPage(project), [project]);
  const activeBlocks = activePage.sections;
  const activePageVibe = useMemo(
    () => ({ ...defaultProject.vibe, ...activePage.vibe }),
    [activePage.vibe]
  );

  const updateActivePageSections = (updater: (sections: ProjectBlock[]) => ProjectBlock[]) => {
    setProject((current) => ({
      ...current,
      pages: current.pages.map((page) =>
        page.id === current.currentPageId
          ? {
              ...page,
              sections: updater(page.sections),
            }
          : page
      ),
    }));
  };

  const updateBlock = (block: ProjectBlock) => {
    updateActivePageSections((sections) => sections.map((item) => (item.id === block.id ? block : item)));
  };

  const moveBlock = (sourceId: string, targetId: string) => {
    setProject((current) => {
      const page = getCurrentPage(current);
      const sourceIndex = page.sections.findIndex((block) => block.id === sourceId);
      const targetIndex = page.sections.findIndex((block) => block.id === targetId);
      if (sourceIndex === -1 || targetIndex === -1 || sourceIndex === targetIndex) {
        return current;
      }
      const nextBlocks = [...page.sections];
      const [moved] = nextBlocks.splice(sourceIndex, 1);
      nextBlocks.splice(targetIndex, 0, moved);
      return {
        ...current,
        pages: current.pages.map((item) => (item.id === page.id ? { ...item, sections: nextBlocks } : item)),
      };
    });
  };

  const addBlock = (type: BlockType) => {
    const newBlock = createBlock(type);
    if (newBlock) {
      updateActivePageSections((sections) => [...sections, newBlock]);
      setSelectedBlockId(newBlock.id);
    }
  };

  const duplicateBlock = (block: ProjectBlock) => {
    const clone = { ...block, id: `${block.id}-${Date.now()}` } as ProjectBlock;
    updateActivePageSections((sections) => [...sections, clone]);
    setSelectedBlockId(clone.id);
  };

  const removeBlock = (id: string) => {
    setProject((current) => {
      const page = getCurrentPage(current);
      const nextBlocks = page.sections.filter((block) => block.id !== id);
      if (selectedBlockId === id) {
        setSelectedBlockId(nextBlocks[0]?.id ?? "");
      }
      return {
        ...current,
        pages: current.pages.map((item) => (item.id === page.id ? { ...item, sections: nextBlocks } : item)),
      };
    });
  };

  const selectPage = (pageId: string) => {
    setProject((current) => {
      const page = current.pages.find((item) => item.id === pageId);
      if (page) {
        setHiddenPageBackId(isPageVisibleInNavigation(page, current.pages) ? null : current.currentPageId);
      }
      setSelectedBlockId(page?.sections[0]?.id ?? "");
      return { ...current, currentPageId: pageId };
    });
  };

  const backFromHiddenPage = () => {
    setProject((current) => {
      const fallbackPage = current.pages.find((page) => page.id === hiddenPageBackId) ?? current.pages.find((page) => page.showInNavigation) ?? current.pages[0];
      setSelectedBlockId(fallbackPage?.sections[0]?.id ?? "");
      setHiddenPageBackId(null);
      return fallbackPage ? { ...current, currentPageId: fallbackPage.id } : current;
    });
  };

  const addPage = (parentId: string | null = null) => {
    setProject((current) => {
      const page = createProjectPage("New page", current.pages, parentId);
      setSelectedBlockId("");
      return {
        ...current,
        pages: rebuildProjectPageSlugs([...current.pages, page]),
        currentPageId: page.id,
      };
    });
  };

  const renamePage = (pageId: string, title: string) => {
    setProject((current) => ({
      ...current,
      pages: rebuildProjectPageSlugs(
        current.pages.map((page) => (page.id === pageId ? { ...page, title: title || "Untitled page" } : page))
      ),
    }));
  };

  const deletePage = (pageId: string) => {
    if (pageId === "home") return;
    setProject((current) => {
      const children = current.pages.filter((page) => page.parentId === pageId);
      if (children.length && !window.confirm("Delete this page and its child pages? Internal links to them will be cleared.")) {
        return current;
      }
      const deleteIds = new Set<string>([pageId]);
      let changed = true;
      while (changed) {
        changed = false;
        current.pages.forEach((page) => {
          if (page.parentId && deleteIds.has(page.parentId) && !deleteIds.has(page.id)) {
            deleteIds.add(page.id);
            changed = true;
          }
        });
      }
      const clearBrokenLinks = (value: unknown): unknown => {
        if (Array.isArray(value)) return value.map(clearBrokenLinks);
        if (value && typeof value === "object") {
          const source = value as Record<string, unknown>;
          if (source.type === "internal" && typeof source.pageId === "string" && deleteIds.has(source.pageId)) {
            return { type: "none" };
          }
          return Object.fromEntries(
            Object.entries(source).map(([key, item]) => {
              if (typeof item === "string") {
                let next = item;
                deleteIds.forEach((id) => {
                  next = next.replaceAll(`href="#oc-page:${id}"`, `href="#"`);
                });
                return [key, next];
              }
              return [key, clearBrokenLinks(item)];
            })
          );
        }
        return value;
      };
      const pages = current.pages
        .filter((page) => !deleteIds.has(page.id))
        .map((page) => ({ ...page, sections: clearBrokenLinks(page.sections) as ProjectBlock[] }));
      const nextCurrentPageId = deleteIds.has(current.currentPageId) ? pages[0]?.id ?? "home" : current.currentPageId;
      const nextCurrentPage = pages.find((page) => page.id === nextCurrentPageId);
      setSelectedBlockId(nextCurrentPage?.sections[0]?.id ?? "");
      return {
        ...current,
        pages: rebuildProjectPageSlugs(pages),
        currentPageId: nextCurrentPageId,
      };
    });
  };

  const duplicatePage = (pageId: string) => {
    setProject((current) => {
      const source = current.pages.find((page) => page.id === pageId);
      if (!source) return current;
      const copy: ProjectPage = {
        ...createProjectPage(`${source.title} copy`, current.pages, source.parentId ?? null),
        showInNavigation: source.showInNavigation,
        vibe: source.vibe ? { ...source.vibe } : {},
        sections: clonePageSections(source.sections),
      };
      setSelectedBlockId(copy.sections[0]?.id ?? "");
      return {
        ...current,
        pages: rebuildProjectPageSlugs([...current.pages, copy]),
        currentPageId: copy.id,
      };
    });
  };

  const togglePageNavigation = (pageId: string) => {
    setProject((current) => ({
      ...current,
      pages: current.pages.map((page) =>
        page.id === pageId ? { ...page, showInNavigation: !page.showInNavigation } : page
      ),
    }));
  };

  const makeHomePage = (pageId: string) => {
    if (pageId === "home") return;
    setProject((current) => {
      const selected = current.pages.find((page) => page.id === pageId);
      const currentHome = current.pages.find((page) => page.id === "home");
      if (!selected || !currentHome) return current;
      const oldHomeId = createPageId();
      const rewriteStoredPageIds = (value: unknown): unknown => {
        if (Array.isArray(value)) return value.map(rewriteStoredPageIds);
        if (value && typeof value === "object") {
          return Object.fromEntries(
            Object.entries(value as Record<string, unknown>).map(([key, item]) => {
              if (key === "pageId" && item === pageId) return [key, "home"];
              if (key === "pageId" && item === "home") return [key, oldHomeId];
              if (typeof item === "string") {
                const newHomePlaceholder = "__OCWORLD_NEW_HOME__";
                return [
                  key,
                  item
                    .replaceAll(`#oc-page:${pageId}`, newHomePlaceholder)
                    .replaceAll("#oc-page:home", `#oc-page:${oldHomeId}`)
                    .replaceAll(newHomePlaceholder, "#oc-page:home"),
                ];
              }
              return [key, rewriteStoredPageIds(item)];
            })
          );
        }
        return value;
      };
      const rewritePageLinks = (sections: ProjectBlock[]) => rewriteStoredPageIds(sections) as ProjectBlock[];
      const pages = current.pages.map((page) => {
        if (page.id === pageId) {
          return { ...page, id: "home", parentId: null, order: 0, slug: "/", sections: rewritePageLinks(page.sections) };
        }
        if (page.id === "home") {
          return { ...page, id: oldHomeId, parentId: null, order: 1, sections: rewritePageLinks(page.sections) };
        }
        const parentId = page.parentId === pageId ? "home" : page.parentId === "home" ? oldHomeId : page.parentId;
        return { ...page, parentId, sections: rewritePageLinks(page.sections) };
      });
      const nextCurrentPageId = current.currentPageId === pageId ? "home" : current.currentPageId === "home" ? oldHomeId : current.currentPageId;
      return {
        ...current,
        pages: rebuildProjectPageSlugs(pages),
        currentPageId: nextCurrentPageId,
      };
    });
  };

  const exportStaticSite = async () => {
    const fileBaseName = slugifyFileName(project.name);
    try {
      const JSZip = (await import("jszip")).default;
      const zip = new JSZip();
      buildStaticSiteFiles(project, template).forEach((file) => {
        zip.file(file.path, file.html);
      });
      zip.file(`${fileBaseName}-project.json`, JSON.stringify(project, null, 2));
      const content = await zip.generateAsync({ type: "blob" });
      downloadBlob(content, `${fileBaseName}.zip`);
    } catch {
      const firstFile = buildStaticSiteFiles(project, template)[0];
      const html = firstFile?.html ?? "";
      downloadBlob(new Blob([html], { type: "text/html" }), `${fileBaseName}.html`);
    }
  };

  const updateVibe = (vibe: ProjectVibeData) => {
    setProject((current) => ({ ...current, vibe }));
  };

  const updateProjectName = (name: string) => {
    setProject((current) => ({ ...current, name }));
  };

  const getRecordsWithCurrentProject = (timestamp = new Date().toISOString()) => {
    const currentActiveId = activeProjectIdRef.current;
    return projectRecordsRef.current.map((record) =>
      record.id === currentActiveId
        ? {
            ...record,
            name: project.name.trim() || "Untitled OCWorld",
            updatedAt: timestamp,
            project: cloneProject(project),
          }
        : record
    );
  };

  const commitProjectRecords = (records: LocalProjectRecord[], nextActiveProjectId = activeProjectIdRef.current, savedAt = new Date().toISOString()) => {
    setProjectRecords(records);
    setActiveProjectId(nextActiveProjectId);
    setSaveStatus("saving");
    void saveProjectLibrary(records, nextActiveProjectId)
      .then((mode) => {
        setProjectStorageMode(mode);
        setLastSavedAt(savedAt);
        setSaveStatus("saved");
      })
      .catch(() => setSaveStatus("error"));
  };

  const openProject = (projectId: string) => {
    const now = new Date().toISOString();
    const records = getRecordsWithCurrentProject(now);
    const record = records.find((item) => item.id === projectId);
    if (!record) return;
    const nextProject = normalizeProject(record.project);
    setProject(nextProject);
    setSelectedBlockId(getCurrentPage(nextProject).sections[0]?.id ?? "");
    setHiddenPageBackId(null);
    commitProjectRecords(records, projectId, now);
    setIsProjectsOpen(false);
  };

  const createProject = () => {
    const now = new Date().toISOString();
    const records = getRecordsWithCurrentProject(now);
    const record = createLocalProjectRecord(defaultProject, "Untitled OCWorld");
    const nextProject = normalizeProject(record.project);
    setProject(nextProject);
    setSelectedBlockId("");
    setHiddenPageBackId(null);
    commitProjectRecords([...records, record], record.id, now);
  };

  const renameProject = (projectId: string, name: string) => {
    const now = new Date().toISOString();
    const baseRecords = projectId === activeProjectIdRef.current ? getRecordsWithCurrentProject(now) : projectRecordsRef.current;
    const records = baseRecords.map((record) =>
      record.id === projectId
        ? {
            ...record,
            name,
            updatedAt: now,
            project: { ...record.project, name },
          }
        : record
    );
    if (projectId === activeProjectIdRef.current) {
      setProject((current) => ({ ...current, name }));
    }
    commitProjectRecords(records, activeProjectIdRef.current, now);
  };

  const duplicateProject = (projectId: string) => {
    const now = new Date().toISOString();
    const records = getRecordsWithCurrentProject(now);
    const source = records.find((record) => record.id === projectId);
    if (!source) return;
    const copy = createLocalProjectRecord(source.project, `${source.name || "Untitled OCWorld"} copy`);
    const nextProject = normalizeProject(copy.project);
    setProject(nextProject);
    setSelectedBlockId(getCurrentPage(nextProject).sections[0]?.id ?? "");
    setHiddenPageBackId(null);
    commitProjectRecords([...records, copy], copy.id, now);
  };

  const deleteProject = (projectId: string) => {
    if (projectRecordsRef.current.length <= 1) return;
    const record = projectRecordsRef.current.find((item) => item.id === projectId);
    if (!record || !window.confirm(`Delete "${record.name || "Untitled OCWorld"}"? This only removes the local copy in this browser.`)) {
      return;
    }
    const now = new Date().toISOString();
    const records = getRecordsWithCurrentProject(now).filter((item) => item.id !== projectId);
    const nextActiveId = projectId === activeProjectIdRef.current ? records[0]?.id ?? "" : activeProjectIdRef.current;
    const nextRecord = records.find((item) => item.id === nextActiveId);
    if (nextRecord && projectId === activeProjectIdRef.current) {
      const nextProject = normalizeProject(nextRecord.project);
      setProject(nextProject);
      setSelectedBlockId(getCurrentPage(nextProject).sections[0]?.id ?? "");
      setHiddenPageBackId(null);
    }
    commitProjectRecords(records, nextActiveId, now);
  };

  const exportProjectJson = (projectId: string) => {
    const records = getRecordsWithCurrentProject(new Date().toISOString());
    const record = records.find((item) => item.id === projectId);
    if (!record) return;
    const editableProject = { ...cloneProject(record.project), name: record.name || record.project.name || "Untitled OCWorld" };
    downloadBlob(
      new Blob([JSON.stringify(editableProject, null, 2)], { type: "application/json" }),
      `${slugifyFileName(editableProject.name)}-project.json`
    );
  };

  const importProjectJson = async (file: File) => {
    try {
      const raw = JSON.parse(await file.text()) as unknown;
      const sourceProject =
        raw && typeof raw === "object" && "project" in raw
          ? (raw as { project?: Partial<ProjectData> }).project
          : (raw as Partial<ProjectData>);
      const importedProject = normalizeProject(sourceProject);
      const record = createLocalProjectRecord(importedProject, importedProject.name || file.name.replace(/\.json$/i, ""));
      const now = new Date().toISOString();
      const records = [...getRecordsWithCurrentProject(now), record];
      const nextProject = normalizeProject(record.project);
      setProject(nextProject);
      setSelectedBlockId(getCurrentPage(nextProject).sections[0]?.id ?? "");
      setHiddenPageBackId(null);
      commitProjectRecords(records, record.id, now);
    } catch {
      window.alert("This JSON file does not look like an OCWorld project.");
    }
  };

  const saveStatusText = useMemo(() => {
    void saveTick;
    if (saveStatus === "saving") return "Saving...";
    if (saveStatus === "error") return "Browser storage is full. Export a project JSON, then delete old projects or remove large media.";
    if (projectStorageMode === "indexedDB") return "Saved with expanded browser storage";
    if (!lastSavedAt) return "Saved";
    const currentTime = saveTick || new Date(lastSavedAt).getTime();
    const minutes = Math.floor((currentTime - new Date(lastSavedAt).getTime()) / 60000);
    if (minutes < 1) return "Saved";
    return `Saved ${minutes} min ago`;
  }, [lastSavedAt, projectStorageMode, saveStatus, saveTick]);

  const finishTutorial = () => {
    if (typeof window !== "undefined") {
      window.localStorage.setItem(TUTORIAL_STORAGE_KEY, "true");
    }
    setIsTutorialOpen(false);
  };

  const restartTutorial = () => {
    setIsPreviewOpen(false);
    setIsTutorialOpen(false);
    setTutorialRunId((current) => current + 1);
    window.setTimeout(() => setIsTutorialOpen(true), 0);
  };

  return (
    <div className="relative min-h-screen overflow-hidden bg-[#f5f0e7] text-slate-900">
      <div
        className="pointer-events-none fixed inset-0 opacity-[0.4]"
        style={{
          backgroundImage:
            "linear-gradient(rgba(90,80,66,0.12) 1px, transparent 1px), linear-gradient(90deg, rgba(90,80,66,0.12) 1px, transparent 1px)",
          backgroundSize: "28px 28px",
        }}
      />
      <div className="pointer-events-none fixed inset-0 bg-[radial-gradient(circle_at_16%_8%,rgba(197,164,109,0.2),transparent_28%),radial-gradient(circle_at_82%_16%,rgba(118,138,127,0.18),transparent_30%)]" />
      <div className="sticky top-0 z-30 border-b border-stone-300/70 bg-[#fffdf8]/85 backdrop-blur-xl">
        <div className="mx-auto flex max-w-7xl flex-col gap-4 px-5 py-4 sm:flex-row sm:items-center sm:justify-between sm:px-8 lg:px-10">
          <div>
            <div className="mb-2 flex items-center gap-3">
              <OCWorldBrand compact />
              <span className="hidden text-xs uppercase tracking-[0.3em] text-stone-500 sm:inline">Workspace</span>
            </div>
            <input
              type="text"
              value={project.name}
              onChange={(event) => updateProjectName(event.target.value)}
              aria-label="Website workspace name"
              className="mt-1 w-full max-w-2xl rounded-xl border border-transparent bg-transparent px-0 font-serif text-2xl font-semibold tracking-[-0.04em] text-slate-950 outline-none transition placeholder:text-stone-400 focus:border-stone-300 focus:bg-white/70 focus:px-3 focus:py-1 sm:text-3xl"
              placeholder="Name your OC world"
            />
            <p className="mt-2 max-w-2xl text-sm leading-6 text-stone-600">
              Arrange pages, sections, characters, and notes in a quiet studio canvas.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <button
              type="button"
              onClick={() => setIsProjectsOpen(true)}
              className="inline-flex items-center gap-2 rounded-full border border-stone-300 bg-[#fffdf8]/75 px-4 py-2 text-sm font-semibold text-slate-800 shadow-sm transition hover:-translate-y-0.5 hover:bg-white"
            >
              <ToolbarIcon name="projects" />
              Projects
            </button>
            <button
              type="button"
              data-tutorial="tutorial-button"
              onClick={restartTutorial}
              className="inline-flex items-center gap-2 rounded-full border border-stone-300 bg-[#fffdf8]/75 px-4 py-2 text-sm font-semibold text-slate-800 shadow-sm transition hover:-translate-y-0.5 hover:bg-white"
            >
              <ToolbarIcon name="tutorial" />
              Tutorial
            </button>
            <button
              type="button"
              data-tutorial="preview-button"
              onClick={() => setIsPreviewOpen(true)}
              className="inline-flex items-center gap-2 rounded-full border border-stone-300 bg-[#fffdf8]/75 px-4 py-2 text-sm font-semibold text-slate-800 shadow-sm transition hover:-translate-y-0.5 hover:bg-white"
            >
              <ToolbarIcon name="preview" />
              Preview
            </button>
            <button
              type="button"
              data-tutorial="export-button"
              onClick={exportStaticSite}
              className="inline-flex items-center gap-2 rounded-full bg-slate-950 px-4 py-2 text-sm font-semibold text-white shadow-[0_14px_28px_rgba(15,23,42,0.16)] transition hover:-translate-y-0.5 hover:bg-slate-800"
            >
              <ToolbarIcon name="export" />
              Export
            </button>
            <span className={`text-xs font-semibold ${saveStatus === "error" ? "text-rose-600" : "text-stone-500"}`}>
              {saveStatusText}
            </span>
          </div>
        </div>
      </div>

      <div className="relative mx-auto grid max-w-7xl grid-cols-1 gap-6 px-5 py-8 sm:px-8 lg:px-10 xl:grid-cols-[minmax(270px,23%)_minmax(620px,54%)_minmax(270px,23%)]">
        <aside className="space-y-6 pb-6 xl:sticky xl:top-[6.25rem] xl:h-[calc(100vh-6.25rem)] xl:overflow-y-auto">
          <PagesPanel
            pages={project.pages}
            currentPageId={project.currentPageId}
            onSelectPage={selectPage}
            onAddPage={addPage}
            onRenamePage={renamePage}
            onDeletePage={deletePage}
            onDuplicatePage={duplicatePage}
            onToggleNavigation={togglePageNavigation}
            onMakeHomePage={makeHomePage}
          />
          <BlockPalette onAddBlock={addBlock} />
        </aside>

        <main
          data-tutorial="main-canvas"
          className="min-h-[calc(100vh-5.5rem)] overflow-y-auto pb-6 xl:sticky xl:top-[6.25rem] xl:h-[calc(100vh-6.25rem)] xl:min-h-0 xl:pr-2"
        >
          <div className="mb-4 rounded-[1.1rem] border border-stone-300/70 bg-[#fffdf8]/80 px-5 py-3 text-sm font-semibold text-stone-600 shadow-sm backdrop-blur-sm">
            Editing <span className="font-serif text-base font-semibold text-slate-950">{activePage.title}</span>
            <span className="ml-2 text-xs text-stone-400">{activePage.slug}</span>
          </div>
          <PreviewCanvas
            blocks={activeBlocks}
            pages={project.pages}
            currentPageId={project.currentPageId}
            hiddenBackPageId={hiddenPageBackId}
            onNavigatePage={selectPage}
            onBackFromHiddenPage={backFromHiddenPage}
            template={template}
            vibe={activePageVibe}
            selectedBlockId={selectedBlockId}
            onSelectBlock={setSelectedBlockId}
            onDropBlock={addBlock}
            onDuplicateBlock={duplicateBlock}
            onRemoveBlock={removeBlock}
            onUpdateBlock={updateBlock}
            onMoveBlock={moveBlock}
            previewMode={false}
          />
        </main>

        <aside className="space-y-6 pb-6 xl:sticky xl:top-[6.25rem] xl:h-[calc(100vh-6.25rem)] xl:overflow-y-auto">
          <SettingsPanel
            selectedBlock={activeBlocks.find((block) => block.id === selectedBlockId) ?? null}
            onUpdateBlock={updateBlock}
          />
          <VibeStudioPanel
            pageTitle={activePage.title}
            pageVibe={activePageVibe}
            musicVibe={project.vibe}
            onPageChange={(vibe) => {
              setProject((current) => ({
                ...current,
                pages: current.pages.map((page) => (page.id === current.currentPageId ? { ...page, vibe } : page)),
              }));
            }}
            onMusicChange={updateVibe}
          />
          <div
            data-tutorial="studio-notes"
            className="rounded-[1.5rem] border border-stone-300/70 bg-[#fffdf8]/80 p-5 shadow-sm shadow-stone-300/30 backdrop-blur-sm"
          >
            <p className="text-xs uppercase tracking-[0.25em] text-stone-500">Studio note</p>
            <h2 className="mt-3 font-serif text-xl font-semibold tracking-[-0.03em] text-slate-950">Work in sections.</h2>
            <p className="mt-3 text-sm leading-6 text-stone-600">Keep each page focused. Let the canvas hold the structure while your characters carry the feeling.</p>
          </div>
        </aside>
      </div>

      {isPreviewOpen ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center overflow-hidden bg-slate-950/75 px-4 py-6 backdrop-blur-sm">
          <div className="flex max-h-[calc(100vh-3rem)] w-full max-w-5xl flex-col rounded-[1.5rem] border border-stone-300 bg-[#fffdf8] p-5 shadow-2xl">
            <div className="flex shrink-0 items-center justify-between gap-4 pb-4">
              <div>
                <p className="text-sm text-stone-500">Preview mode</p>
                <h2 className="font-serif text-2xl font-semibold tracking-[-0.03em] text-slate-950">Review the page before export.</h2>
              </div>
              <button
                type="button"
                onClick={() => setIsPreviewOpen(false)}
                className="rounded-full border border-stone-300 bg-white/75 px-4 py-2 text-sm font-semibold text-slate-800 transition hover:bg-white"
              >
                Close
              </button>
            </div>
            <div className="min-h-0 flex-1 overflow-y-auto pr-2">
              <PreviewCanvas
                blocks={activeBlocks}
                pages={project.pages}
                currentPageId={project.currentPageId}
                hiddenBackPageId={hiddenPageBackId}
                onNavigatePage={selectPage}
                onBackFromHiddenPage={backFromHiddenPage}
                template={template}
                vibe={activePageVibe}
                selectedBlockId={selectedBlockId}
                onSelectBlock={() => undefined}
                onDropBlock={() => undefined}
                onDuplicateBlock={() => undefined}
                onRemoveBlock={() => undefined}
                onUpdateBlock={() => undefined}
                onMoveBlock={() => undefined}
                previewMode
              />
            </div>
          </div>
        </div>
      ) : null}

      <TutorialOverlay
        key={tutorialRunId}
        open={isTutorialOpen}
        steps={tutorialSteps}
        onComplete={finishTutorial}
        onSkip={finishTutorial}
      />
      <ProjectDashboard
        open={isProjectsOpen}
        projects={projectRecords}
        activeProjectId={activeProjectId}
        saveStatusText={saveStatusText}
        onClose={() => setIsProjectsOpen(false)}
        onCreateProject={createProject}
        onOpenProject={openProject}
        onRenameProject={renameProject}
        onDuplicateProject={duplicateProject}
        onDeleteProject={deleteProject}
        onExportProject={exportProjectJson}
        onImportProject={importProjectJson}
      />
    </div>
  );
}
