export type BlockType =
  | "hero"
  | "imageText"
  | "gallery"
  | "character"
  | "relationship"
  | "timeline"
  | "lore"
  | "divider";

export interface CharacterTextHolder {
  id: string;
  content: string;
  placeholder: string;
  x: number;
  y: number;
  width: number;
  height: number;
}

export interface CharacterBreakLine {
  id: string;
  x: number;
  y: number;
  width: number;
}

export interface CharacterTag {
  id: string;
  content: string;
  placeholder: string;
}

export interface CharacterData {
  id: string;
  portraitUrl?: string;
  link?: BlockLink;
  portraitWidth: number;
  portraitHeight: number;
  copyHeight: number;
  textHolders: CharacterTextHolder[];
  breakLines: CharacterBreakLine[];
  tags: CharacterTag[];
}

export interface RelationshipNode {
  id: string;
  name: string;
  imageUrl: string;
  link?: BlockLink;
  x: number;
  y: number;
}

export interface RelationshipConnection {
  id: string;
  source: string;
  target: string;
  label: string;
  color: string;
  arrowHead?: "arrow" | "circle" | "solidCircle" | "square" | "solidSquare" | "rhombus" | "solidRhombus";
}

export interface TimelineTextHolder {
  id: string;
  content: string;
  placeholder: string;
  x: number;
  y: number;
  width: number;
  height: number;
}

export interface TimelineImageHolder {
  id: string;
  imageUrl: string;
  link?: BlockLink;
  x: number;
  y: number;
  width: number;
  height: number;
}

export interface TimelineBreakLine {
  id: string;
  x: number;
  y: number;
  width: number;
}

export interface TimelineEvent {
  id: string;
  width: number;
  height: number;
  side?: "before" | "after";
  imageVisible: boolean;
  imageUrl?: string;
  imageHolders: TimelineImageHolder[];
  textHolders: TimelineTextHolder[];
  breakLines: TimelineBreakLine[];
  date?: string;
  title?: string;
  description?: string;
}

export interface GalleryImage {
  id: string;
  url: string;
  caption: string;
  width: "small" | "medium" | "large";
}

export interface ImageTextItem {
  id: string;
  type: "text" | "image";
  text?: string;
  imageUrl?: string;
  caption?: string;
  link?: BlockLink;
  x: number;
  y: number;
  width: number;
  height: number;
  align: "left" | "center" | "right";
  fontSize: string;
  color: string;
}

export interface HeroTextItem {
  id: string;
  text: string;
  x: number;
  y: number;
  width: number;
  height: number;
  align: "left" | "center" | "right";
  fontSize: string;
  color: string;
}

export interface HeroBlockData {
  title: string;
  subtitle: string;
  backgroundUrl: string;
  backgroundStyle?: string;
  backgroundSize?: string;
  backgroundPosition?: string;
  titleVisible?: boolean;
  subtitleVisible?: boolean;
  textItems?: HeroTextItem[];
  titleColor: string;
  subtitleColor: string;
  titleSize: string;
  subtitleSize: string;
  titleAlign: "left" | "center" | "right";
  subtitleAlign: "left" | "center" | "right";
}

export interface ImageTextBlockData {
  items: ImageTextItem[];
  height?: number;
}

export interface GalleryBlockData {
  images: GalleryImage[];
  autoPlay?: boolean;
  interval?: number;
  showIndicators?: boolean;
  showArrows?: boolean;
  loop?: boolean;
}

export interface CharacterBlockData {
  characters: CharacterData[];
  activeCharacterId?: string;
}

export interface TimelineBlockData {
  title: string;
  direction: "vertical" | "horizontal";
  events: TimelineEvent[];
  activeEventId?: string;
}

export interface LoreBlockData {
  title: string;
  content: string;
  titleColor: string;
  contentColor: string;
  titleSize: string;
  contentSize: string;
  align: "left" | "center" | "right";
  height?: number;
  textHolders?: LoreTextHolder[];
  breakLines?: LoreBreakLine[];
  activeItemId?: string;
}

export interface LoreTextHolder {
  id: string;
  kind: "title" | "text";
  content: string;
  placeholder: string;
  x: number;
  y: number;
  width: number;
  height: number;
}

export interface LoreBreakLine {
  id: string;
  x: number;
  y: number;
  width: number;
}

export interface DividerBlockData {
  visible: boolean;
}

export interface RelationshipBlockData {
  title: string;
  nodes: RelationshipNode[];
  connections: RelationshipConnection[];
  nodeEditor?: {
    open: boolean;
    editingNodeId?: string;
  };
}

export type BlockData =
  | HeroBlockData
  | ImageTextBlockData
  | GalleryBlockData
  | CharacterBlockData
  | TimelineBlockData
  | LoreBlockData
  | DividerBlockData
  | RelationshipBlockData;

export type BlockMap = {
  hero: HeroBlockData;
  imageText: ImageTextBlockData;
  gallery: GalleryBlockData;
  character: CharacterBlockData;
  relationship: RelationshipBlockData;
  timeline: TimelineBlockData;
  lore: LoreBlockData;
  divider: DividerBlockData;
};

export type ProjectBlock = {
  [Type in BlockType]: {
    id: string;
    type: Type;
    title: string;
    data: BlockMap[Type];
    link?: BlockLink;
  };
}[BlockType];

export interface BlockLink {
  type: "none" | "external" | "internal";
  url?: string;
  pageId?: string;
}

export interface ProjectPage {
  id: string;
  title: string;
  slug: string;
  parentId?: string | null;
  showInNavigation: boolean;
  order: number;
  vibe?: ProjectVibeData;
  sections: ProjectBlock[];
}

export interface ProjectData {
  name: string;
  templateId: string;
  vibe?: ProjectVibeData;
  pages: ProjectPage[];
  currentPageId: string;
  blocks?: ProjectBlock[];
}

export interface ProjectVibeData {
  musicUrl?: string;
  musicName?: string;
  backgroundImageUrl?: string;
  backgroundImageWidth?: number;
  backgroundImageHeight?: number;
  backgroundImageOffsetY?: number;
  backgroundChoiceId?: string;
}

export interface TemplateSpec {
  id: string;
  title: string;
  description: string;
  accent: string;
  panel: string;
  text: string;
  bg: string;
  card: string;
  glow: string;
}

export interface VibeBackgroundChoice {
  id: string;
  title: string;
  description: string;
  style: string;
  overlay: string;
  tone?: "light" | "dark";
}

export interface HeroBackgroundChoice {
  id: string;
  title: string;
  style: string;
  backgroundSize?: string;
  backgroundPosition?: string;
}

function createId() {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) {
    return crypto.randomUUID();
  }
  return Math.random().toString(36).slice(2, 10);
}

export function createPageId() {
  return createId();
}

export function slugifyPageTitle(value: string) {
  const slug = value
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
  return slug || "page";
}

function normalizeSlugPath(value: string) {
  const trimmed = value.trim();
  if (!trimmed || trimmed === "/") return "/";
  return `/${trimmed.replace(/^\/+|\/+$/g, "")}`;
}

export function ensureUniquePageSlug(slug: string, pages: ProjectPage[], excludeId?: string) {
  const base = normalizeSlugPath(slug);
  if (base === "/") return "/";
  let candidate = base;
  let index = 2;
  const isTaken = (value: string) => pages.some((page) => page.id !== excludeId && page.slug === value);
  while (isTaken(candidate)) {
    candidate = `${base}-${index}`;
    index += 1;
  }
  return candidate;
}

export function buildPageSlug(title: string, parentId: string | null | undefined, pages: ProjectPage[], excludeId?: string) {
  const parent = parentId ? pages.find((page) => page.id === parentId) : null;
  const parentSlug = parent?.slug && parent.slug !== "/" ? parent.slug : "";
  const base = parentSlug ? `${parentSlug}/${slugifyPageTitle(title)}` : `/${slugifyPageTitle(title)}`;
  return ensureUniquePageSlug(base, pages, excludeId);
}

export function createProjectPage(title = "New page", pages: ProjectPage[] = [], parentId: string | null = null): ProjectPage {
  const siblingOrder = pages.filter((page) => (page.parentId ?? null) === parentId).length;
  const pageTitle = title.trim() || "New page";
  return {
    id: createPageId(),
    title: pageTitle,
    slug: buildPageSlug(pageTitle, parentId, pages),
    parentId,
    showInNavigation: true,
    order: siblingOrder,
    vibe: {},
    sections: [],
  };
}

export function rebuildProjectPageSlugs(pages: ProjectPage[]) {
  const next = pages.map((page) => ({ ...page }));
  const byId = new Map(next.map((page) => [page.id, page]));
  const used = new Set<string>();
  const resolved = new Set<string>();
  const resolving = new Set<string>();

  const resolveSlug = (page: ProjectPage): string => {
    if (resolved.has(page.id)) return page.slug;
    if (page.id === "home") {
      used.add("/");
      resolved.add(page.id);
      return "/";
    }
    if (resolving.has(page.id)) {
      return ensureUniquePageSlug(`/${slugifyPageTitle(page.title)}`, next, page.id);
    }
    resolving.add(page.id);
    const parent = page.parentId ? byId.get(page.parentId) : null;
    const parentSlug = parent ? resolveSlug(parent) : "";
    const base = parentSlug && parentSlug !== "/" ? `${parentSlug}/${slugifyPageTitle(page.title)}` : `/${slugifyPageTitle(page.title)}`;
    let candidate = normalizeSlugPath(base);
    let index = 2;
    while (used.has(candidate)) {
      candidate = `${normalizeSlugPath(base)}-${index}`;
      index += 1;
    }
    page.slug = candidate;
    used.add(candidate);
    resolved.add(page.id);
    resolving.delete(page.id);
    return candidate;
  };

  next.forEach(resolveSlug);
  return next;
}

export function createHomePage(sections: ProjectBlock[] = []): ProjectPage {
  return {
    id: "home",
    title: "Home",
    slug: "/",
    parentId: null,
    showInNavigation: true,
    order: 0,
    vibe: {},
    sections,
  };
}

function normalizePage(page: Partial<ProjectPage>, pages: Partial<ProjectPage>[], index: number): ProjectPage {
  const title = page.title?.trim() || (index === 0 ? "Home" : "Untitled page");
  const id = page.id || (index === 0 ? "home" : createPageId());
  const parentId = page.parentId && pages.some((item) => item.id === page.parentId) && page.parentId !== id ? page.parentId : null;
  return {
    id,
    title,
    slug: normalizeSlugPath(page.slug || (index === 0 ? "/" : buildPageSlug(title, parentId, pages as ProjectPage[], id))),
    parentId,
    showInNavigation: page.showInNavigation !== false,
    order: Number.isFinite(page.order) ? Number(page.order) : index,
    vibe: page.vibe ?? {},
    sections: Array.isArray(page.sections) ? page.sections : [],
  };
}

export function normalizeProject(project: Partial<ProjectData> | null | undefined): ProjectData {
  const legacyBlocks = Array.isArray(project?.blocks) ? project.blocks : [];
  const rawPages = Array.isArray(project?.pages) && project.pages.length ? project.pages : [createHomePage(legacyBlocks)];
  let pages = rawPages.map((page, index) => normalizePage(page, rawPages, index));

  if (!pages.some((page) => page.id === "home")) {
    pages = [createHomePage(legacyBlocks), ...pages];
  }

  pages = pages.map((page, index) => ({
    ...page,
    slug: page.id === "home" ? "/" : ensureUniquePageSlug(page.slug || buildPageSlug(page.title, page.parentId, pages, page.id), pages, page.id),
    order: Number.isFinite(page.order) ? page.order : index,
  }));

  const currentPageId = pages.some((page) => page.id === project?.currentPageId)
    ? project?.currentPageId ?? "home"
    : pages[0]?.id ?? "home";

  return {
    name: project?.name || "Untitled OC World",
    templateId: project?.templateId || "minimal",
    vibe: { ...project?.vibe },
    pages,
    currentPageId,
  };
}

export function getCurrentPage(project: ProjectData) {
  return project.pages.find((page) => page.id === project.currentPageId) ?? project.pages[0] ?? createHomePage();
}

export function sortPagesForTree(pages: ProjectPage[]) {
  return [...pages].sort((a, b) => {
    const parentCompare = String(a.parentId ?? "").localeCompare(String(b.parentId ?? ""));
    if (parentCompare !== 0) return parentCompare;
    return a.order - b.order || a.title.localeCompare(b.title);
  });
}

export function getPageAncestors(pageId: string, pages: ProjectPage[]) {
  const ancestors: ProjectPage[] = [];
  let current = pages.find((page) => page.id === pageId);
  const visited = new Set<string>();
  while (current?.parentId && !visited.has(current.parentId)) {
    visited.add(current.parentId);
    const parent = pages.find((page) => page.id === current?.parentId);
    if (!parent) break;
    ancestors.unshift(parent);
    current = parent;
  }
  return ancestors;
}

export function isPageVisibleInNavigation(page: ProjectPage, pages: ProjectPage[]) {
  if (!page.showInNavigation) return false;
  return getPageAncestors(page.id, pages).every((ancestor) => ancestor.showInNavigation);
}

export function clonePageSections(sections: ProjectBlock[]) {
  const cloneWithIds = (value: unknown): unknown => {
    if (Array.isArray(value)) return value.map(cloneWithIds);
    if (value && typeof value === "object") {
      const source = value as Record<string, unknown>;
      return Object.fromEntries(
        Object.entries(source).map(([key, item]) => [
          key,
          key === "id" && typeof item === "string" ? createId() : cloneWithIds(item),
        ])
      );
    }
    return value;
  };
  return cloneWithIds(sections) as ProjectBlock[];
}

function createGalleryPlaceholder(): GalleryImage {
  return {
    id: createId(),
    url: "",
    caption: "",
    width: "medium",
  };
}

export function createCharacterTextHolder(placeholder = "Description", y = 8): CharacterTextHolder {
  return {
    id: createId(),
    content: "",
    placeholder,
    x: 4,
    y,
    width: 92,
    height: placeholder === "Description" ? 24 : 15,
  };
}

export function createCharacterBreakLine(y = 25): CharacterBreakLine {
  return {
    id: createId(),
    x: 4,
    y,
    width: 92,
  };
}

export function createCharacterTag(): CharacterTag {
  return {
    id: createId(),
    content: "",
    placeholder: "Tag",
  };
}

export function createCharacterCard(): CharacterData {
  return {
    id: createId(),
    portraitUrl: "",
    link: { type: "none" as const },
    portraitWidth: 33,
    portraitHeight: 360,
    copyHeight: 320,
    textHolders: [
      createCharacterTextHolder("Name", 7),
      createCharacterTextHolder("Role identity", 27),
      createCharacterTextHolder("Description", 47),
    ],
    breakLines: [
      createCharacterBreakLine(23),
      createCharacterBreakLine(43),
      createCharacterBreakLine(75),
    ],
    tags: [],
  };
}

type LegacyCharacterData = Partial<CharacterData> & {
  id?: string;
  name?: string;
  role?: string;
  description?: string;
};

function normalizeCharacter(character: LegacyCharacterData): CharacterData {
  const textHolders = Array.isArray(character.textHolders) && character.textHolders.length
    ? character.textHolders.map((holder, index) => ({
        id: holder.id ?? createId(),
        content: holder.content ?? "",
        placeholder: holder.placeholder ?? ["Name", "Role identity", "Description"][index] ?? "Text holder",
        x: holder.x ?? 4,
        y: holder.y ?? 7 + index * 20,
        width: holder.width ?? 92,
        height: holder.height ?? (index === 2 ? 24 : 15),
      }))
    : [
        { ...createCharacterTextHolder("Name", 7), content: character.name ?? "" },
        { ...createCharacterTextHolder("Role identity", 27), content: character.role ?? "" },
        { ...createCharacterTextHolder("Description", 47), content: character.description ?? "" },
      ];
  const breakLines = Array.isArray(character.breakLines)
    ? character.breakLines.map((line, index) => ({
        id: line.id ?? createId(),
        x: line.x ?? 4,
        y: line.y ?? 23 + index * 20,
        width: line.width ?? 92,
      }))
    : [
        createCharacterBreakLine(23),
        createCharacterBreakLine(43),
        createCharacterBreakLine(75),
      ];

  return {
    id: character.id ?? createId(),
    portraitUrl: character.portraitUrl ?? "",
    link: character.link ?? { type: "none" },
    portraitWidth: Math.min(Math.max(character.portraitWidth ?? 33, 24), 50),
    portraitHeight: Math.max(character.portraitHeight ?? 360, 220),
    copyHeight: Math.max(character.copyHeight ?? 320, 120),
    textHolders,
    breakLines,
    tags: Array.isArray(character.tags)
      ? character.tags.map((tag) => ({
          id: tag.id ?? createId(),
          content: tag.content ?? "",
          placeholder: tag.placeholder ?? "Tag",
        }))
      : [],
  };
}

export function normalizeCharacters(characters: LegacyCharacterData[] | undefined): CharacterData[] {
  const normalized = Array.isArray(characters) ? characters.map(normalizeCharacter) : [];
  return normalized.length ? normalized : [createCharacterCard()];
}

export function createTimelineTextHolder(placeholder = "Text", y = 46): TimelineTextHolder {
  return {
    id: createId(),
    content: "",
    placeholder,
    x: 6,
    y,
    width: 88,
    height: placeholder === "Description" ? 14 : 10,
  };
}

export function createTimelineImageHolder(y = 8): TimelineImageHolder {
  return {
    id: createId(),
    imageUrl: "",
    link: { type: "none" as const },
    x: 6,
    y,
    width: 88,
    height: 32,
  };
}

export function createTimelineBreakLine(y = 58): TimelineBreakLine {
  return {
    id: createId(),
    x: 6,
    y,
    width: 88,
  };
}

export function createTimelineEvent(): TimelineEvent {
  return {
    id: createId(),
    width: 300,
    height: 340,
    side: "after",
    imageVisible: true,
    imageUrl: "",
    imageHolders: [createTimelineImageHolder(8)],
    textHolders: [
      createTimelineTextHolder("Year", 46),
      createTimelineTextHolder("Event", 62),
      createTimelineTextHolder("Description", 78),
    ],
    breakLines: [
      createTimelineBreakLine(58),
      createTimelineBreakLine(74),
      createTimelineBreakLine(96),
    ],
  };
}

type LegacyTimelineEvent = Partial<TimelineEvent> & {
  id?: string;
  date?: string;
  title?: string;
  description?: string;
};

function normalizeTimelineEvent(event: LegacyTimelineEvent): TimelineEvent {
  const textHolders = Array.isArray(event.textHolders) && event.textHolders.length
    ? event.textHolders.map((holder, index) => {
        const plainContent = (holder.content ?? "").replace(/<[^>]*>/g, "").replace(/&nbsp;/g, " ").trim();
        const placeholderText = holder.placeholder ?? ["Year", "Event", "Description"][index] ?? "Text";
        return {
          id: holder.id ?? createId(),
          content:
            plainContent === placeholderText || plainContent === "Event name" || plainContent === "Start your text here."
              ? ""
              : holder.content ?? "",
          placeholder: placeholderText,
          x: holder.x ?? 6,
          y: holder.y ?? [46, 62, 78][index] ?? 46,
          width: holder.width ?? 88,
          height: holder.height ?? (index === 2 ? 14 : 10),
        };
      })
    : [
        { ...createTimelineTextHolder("Year", 46), content: event.date === "Year" ? "" : event.date ?? "" },
        { ...createTimelineTextHolder("Event", 62), content: event.title === "Event name" ? "" : event.title ?? "" },
        { ...createTimelineTextHolder("Description", 78), content: event.description === "Start your text here." ? "" : event.description ?? "" },
      ];
  const imageHolders = Array.isArray(event.imageHolders)
    ? event.imageHolders.map((holder, index) => ({
        id: holder.id ?? createId(),
        imageUrl: holder.imageUrl ?? "",
        link: holder.link ?? { type: "none" },
        x: holder.x ?? 6,
        y: holder.y ?? 8 + index * 36,
        width: holder.width ?? 88,
        height: holder.height ?? 32,
      }))
    : event.imageVisible === false
      ? []
      : [{ ...createTimelineImageHolder(8), imageUrl: event.imageUrl ?? "" }];
  const breakLines = Array.isArray(event.breakLines)
    ? event.breakLines.map((line, index) => ({
        id: line.id ?? createId(),
        x: line.x ?? 6,
        y: line.y ?? [58, 74, 96][index] ?? 58,
        width: line.width ?? 88,
      }))
    : [
        createTimelineBreakLine(58),
        createTimelineBreakLine(74),
        createTimelineBreakLine(96),
      ];

  return {
    id: event.id ?? createId(),
    width: Math.max(event.width ?? 300, 220),
    height: Math.max(event.height ?? 340, 240),
    side: event.side ?? "after",
    imageVisible: event.imageVisible ?? true,
    imageUrl: event.imageUrl ?? "",
    imageHolders,
    textHolders,
    breakLines,
  };
}

export function normalizeTimelineEvents(events: LegacyTimelineEvent[] | undefined): TimelineEvent[] {
  const normalized = Array.isArray(events) ? events.map(normalizeTimelineEvent) : [];
  return normalized.length ? normalized : [createTimelineEvent()];
}

export function createLoreTextHolder(kind: "title" | "text" = "text", y = 14): LoreTextHolder {
  return {
    id: createId(),
    kind,
    content: "",
    placeholder: kind === "title" ? "Small title" : "Description",
    x: 8,
    y,
    width: 84,
    height: kind === "title" ? 12 : 20,
  };
}

export function createLoreBreakLine(y = 30): LoreBreakLine {
  return {
    id: createId(),
    x: 8,
    y,
    width: 84,
  };
}

function fitPercentCanvasHeight<T>(
  data: T,
  sourceHeight: number,
  desiredHeight: number,
  scaleItems: (ratio: number) => Partial<T>
): T {
  const nextHeight = Math.max(1, Math.round(desiredHeight));
  if (Math.abs(nextHeight - sourceHeight) < 1) {
    return data;
  }
  return {
    ...data,
    ...scaleItems(sourceHeight / nextHeight),
  };
}

export function fitImageTextWorkspaceHeight(data: ImageTextBlockData, sourceHeight = data.height ?? 560): ImageTextBlockData {
  const items = Array.isArray(data.items) ? data.items : [];
  const bottom = items.length
    ? Math.max(...items.map((item) => ((item.y + item.height) / 100) * sourceHeight))
    : 0;
  const height = Math.max(560, Math.ceil(bottom + 64));

  return fitPercentCanvasHeight(
    {
      ...data,
      items,
      height,
    },
    sourceHeight,
    height,
    (ratio) => ({
      items: items.map((item) => ({
        ...item,
        y: item.y * ratio,
        height: item.height * ratio,
      })),
    })
  );
}

export function normalizeImageTextData(data: ImageTextBlockData): ImageTextBlockData {
  return fitImageTextWorkspaceHeight({
    ...data,
    items: Array.isArray(data.items) ? data.items : [],
    height: Math.max(data.height ?? 560, 560),
  });
}

export function normalizeLoreData(data: LoreBlockData): LoreBlockData {
  const textHolders = Array.isArray(data.textHolders) && data.textHolders.length
    ? data.textHolders.map((holder, index) => ({
        id: holder.id ?? createId(),
        kind: holder.kind ?? (index === 0 ? "title" : "text"),
        content: holder.content ?? "",
        placeholder: holder.placeholder ?? (holder.kind === "title" ? "Small title" : "Description"),
        x: holder.x ?? 8,
        y: holder.y ?? 14 + index * 18,
        width: holder.width ?? 84,
        height: holder.height ?? (holder.kind === "title" ? 12 : 20),
      }))
    : [
        { ...createLoreTextHolder("title", 14), content: data.title === "Small title" ? "" : data.title ?? "" },
        { ...createLoreTextHolder("text", 38), content: data.content === "Start your description here." ? "" : data.content ?? "" },
      ];
  const breakLines = Array.isArray(data.breakLines)
    ? data.breakLines.map((line, index) => ({
        id: line.id ?? createId(),
        x: line.x ?? 8,
        y: line.y ?? 30 + index * 18,
        width: line.width ?? 84,
      }))
    : [createLoreBreakLine(32)];

  return {
    ...data,
    title: data.title ?? "",
    content: data.content ?? "",
    height: Math.max(data.height ?? 360, 260),
    textHolders,
    breakLines,
    activeItemId: data.activeItemId ?? textHolders[0]?.id,
  };
}

export function fitLoreWorkspaceHeight(data: LoreBlockData, sourceHeight = data.height ?? 360): LoreBlockData {
  const lore = normalizeLoreData(data);
  const heightBasis = Math.max(sourceHeight, 1);
  const textBottoms = (lore.textHolders ?? []).map((holder) => ((holder.y + holder.height) / 100) * heightBasis);
  const lineBottoms = (lore.breakLines ?? []).map((line) => (line.y / 100) * heightBasis + 16);
  const bottom = Math.max(0, ...textBottoms, ...lineBottoms);
  const height = Math.max(360, Math.ceil(bottom + 64));

  return fitPercentCanvasHeight(
    {
      ...lore,
      height,
    },
    heightBasis,
    height,
    (ratio) => ({
      textHolders: (lore.textHolders ?? []).map((holder) => ({
        ...holder,
        y: holder.y * ratio,
        height: holder.height * ratio,
      })),
      breakLines: (lore.breakLines ?? []).map((line) => ({
        ...line,
        y: line.y * ratio,
      })),
    })
  );
}

export function isDividerVisible(data: DividerBlockData | { visible?: unknown }) {
  return data.visible !== false && data.visible !== "false";
}

export const templates: TemplateSpec[] = [
  {
    id: "minimal",
    title: "Minimal canvas",
    description: "A clean, neutral page style for calm storytelling.",
    accent: "from-slate-400 to-slate-600",
    panel: "bg-white/90 border-stone-200",
    text: "text-slate-900",
    bg: "bg-stone-50",
    card: "bg-white",
    glow: "shadow-sm",
  },
  {
    id: "softPaper",
    title: "Soft paper",
    description: "Warm tones and gentle spacing for editorial stories.",
    accent: "from-amber-300 to-rose-200",
    panel: "bg-slate-50 border-stone-200",
    text: "text-slate-900",
    bg: "bg-amber-50",
    card: "bg-white",
    glow: "shadow-sm",
  },
  {
    id: "studio",
    title: "Studio page",
    description: "A modern editorial layout with soft contrast and clarity.",
    accent: "from-cyan-400 to-slate-500",
    panel: "bg-white/90 border-stone-200",
    text: "text-slate-900",
    bg: "bg-slate-100",
    card: "bg-white",
    glow: "shadow-sm",
  },
];

export const heroBackgroundChoices: HeroBackgroundChoice[] = [
  {
    id: "ivory-sketch",
    title: "Ivory Sketch",
    style:
      "radial-gradient(circle at 18% 16%, rgba(120,104,82,0.08), transparent 24%), radial-gradient(circle at 76% 22%, rgba(184,164,128,0.12), transparent 28%), linear-gradient(rgba(92,80,64,0.06) 1px, transparent 1px), linear-gradient(90deg, rgba(92,80,64,0.05) 1px, transparent 1px), linear-gradient(135deg, #fbf5e9 0%, #fffdf7 48%, #eadfcb 100%)",
    backgroundSize: "auto, auto, 30px 30px, 30px 30px, auto",
  },
  {
    id: "faded-parchment",
    title: "Faded Parchment",
    style:
      "radial-gradient(circle at 12% 18%, rgba(128,82,39,0.16), transparent 30%), radial-gradient(circle at 90% 82%, rgba(96,72,44,0.13), transparent 34%), linear-gradient(90deg, rgba(92,61,31,0.05), transparent 22%, rgba(92,61,31,0.06) 72%, transparent), linear-gradient(140deg, #dfc99e 0%, #f3e7ca 42%, #cdb68b 100%)",
  },
  {
    id: "watercolor-bloom",
    title: "Watercolor Bloom",
    style:
      "radial-gradient(circle at 22% 22%, rgba(244,166,154,0.34), transparent 28%), radial-gradient(circle at 78% 32%, rgba(142,177,155,0.25), transparent 32%), radial-gradient(circle at 50% 84%, rgba(207,169,205,0.22), transparent 30%), linear-gradient(135deg, #fbefe8 0%, #f8f3e8 54%, #e4ead8 100%)",
  },
  {
    id: "dusty-rose-paper",
    title: "Dusty Rose Paper",
    style:
      "radial-gradient(circle at 18% 18%, rgba(151,73,83,0.18), transparent 26%), radial-gradient(circle at 78% 74%, rgba(219,162,136,0.24), transparent 34%), linear-gradient(rgba(92,60,66,0.05) 1px, transparent 1px), linear-gradient(135deg, #ead1cf 0%, #f7e9e4 52%, #d7bbb5 100%)",
    backgroundSize: "auto, auto, 26px 26px, auto",
  },
  {
    id: "misty-sage",
    title: "Misty Sage",
    style:
      "radial-gradient(circle at 18% 78%, rgba(84,111,83,0.22), transparent 30%), radial-gradient(circle at 82% 18%, rgba(178,190,156,0.35), transparent 34%), linear-gradient(120deg, rgba(255,255,255,0.18), transparent 38%, rgba(93,119,88,0.10)), linear-gradient(145deg, #dce2cf 0%, #f3f0e2 48%, #aebd9c 100%)",
  },
  {
    id: "twilight-ink",
    title: "Twilight Ink",
    style:
      "radial-gradient(circle at 70% 18%, rgba(159,177,211,0.18), transparent 26%), radial-gradient(circle at 22% 78%, rgba(88,107,151,0.25), transparent 34%), linear-gradient(115deg, rgba(255,255,255,0.05), transparent 42%), linear-gradient(145deg, #111726 0%, #26314a 50%, #0b1020 100%)",
  },
  {
    id: "moon-veil",
    title: "Moon Veil",
    style:
      "radial-gradient(circle at 74% 20%, rgba(255,255,255,0.46), transparent 14%), radial-gradient(circle at 18% 80%, rgba(118,137,166,0.2), transparent 34%), linear-gradient(135deg, #d8dee8 0%, #eef1f2 48%, #b7c1cf 100%)",
  },
  {
    id: "antique-linen",
    title: "Antique Linen",
    style:
      "repeating-linear-gradient(90deg, rgba(86,67,45,0.035) 0 1px, transparent 1px 7px), repeating-linear-gradient(0deg, rgba(86,67,45,0.035) 0 1px, transparent 1px 8px), radial-gradient(circle at 14% 18%, rgba(174,135,78,0.12), transparent 30%), linear-gradient(135deg, #d8c5a2 0%, #f2e8d4 48%, #c8b895 100%)",
  },
  {
    id: "storybook-blue",
    title: "Storybook Blue",
    style:
      "radial-gradient(circle at 22% 18%, rgba(232,238,236,0.2), transparent 24%), radial-gradient(circle at 82% 82%, rgba(103,136,158,0.28), transparent 36%), linear-gradient(rgba(12,34,52,0.06) 1px, transparent 1px), linear-gradient(140deg, #7f9cac 0%, #d6dedc 50%, #49677a 100%)",
    backgroundSize: "auto, auto, 32px 32px, auto",
  },
  {
    id: "quiet-charcoal",
    title: "Quiet Charcoal",
    style:
      "radial-gradient(circle at 18% 24%, rgba(255,255,255,0.08), transparent 26%), radial-gradient(circle at 82% 76%, rgba(109,91,116,0.18), transparent 32%), linear-gradient(135deg, #171717 0%, #2d2b2b 48%, #0f1115 100%)",
  },
];

export const vibeBackgroundChoices: VibeBackgroundChoice[] = [
  {
    id: "worn-parchment",
    title: "Worn Parchment",
    description: "Archival paper grain for literary, classic story pages.",
    style:
      "radial-gradient(circle at 14% 18%, rgba(130,82,36,0.18), transparent 28%), radial-gradient(circle at 82% 76%, rgba(91,66,38,0.14), transparent 34%), linear-gradient(90deg, rgba(83,58,32,0.045), transparent 22%, rgba(83,58,32,0.055) 74%, transparent), linear-gradient(135deg, #dcc49a 0%, #f4e7c8 46%, #c7ad80 100%)",
    overlay: "rgba(255,255,255,0.38)",
  },
  {
    id: "woodland-hush",
    title: "Woodland Hush",
    description: "Mossy green mist for forest journals and quiet paths.",
    style:
      "radial-gradient(circle at 14% 82%, rgba(47,71,49,0.32), transparent 32%), radial-gradient(circle at 80% 18%, rgba(156,176,134,0.42), transparent 36%), radial-gradient(circle at 48% 46%, rgba(234,237,213,0.24), transparent 40%), linear-gradient(145deg, #cfd8b8 0%, #eef0df 46%, #7d936f 100%)",
    overlay: "rgba(255,255,255,0.34)",
  },
  {
    id: "midnight-ink",
    title: "Midnight Ink",
    description: "Deep blue-black wash with a soft moonlit edge.",
    style:
      "radial-gradient(circle at 72% 18%, rgba(184,205,228,0.22), transparent 22%), radial-gradient(circle at 24% 72%, rgba(69,89,130,0.24), transparent 32%), linear-gradient(115deg, rgba(255,255,255,0.04), transparent 40%), linear-gradient(135deg, #060812 0%, #131a2b 48%, #26334d 100%)",
    overlay: "rgba(2,6,23,0.16)",
    tone: "dark",
  },
  {
    id: "rose-diary",
    title: "Rose Diary",
    description: "Faded blush paper for gentle romantic character pages.",
    style:
      "radial-gradient(circle at 18% 18%, rgba(181,91,110,0.20), transparent 28%), radial-gradient(circle at 82% 72%, rgba(218,159,139,0.25), transparent 34%), linear-gradient(rgba(120,72,78,0.04) 1px, transparent 1px), linear-gradient(135deg, #ead0cf 0%, #f8ebe7 52%, #d7b9b2 100%)",
    overlay: "rgba(255,255,255,0.33)",
  },
  {
    id: "lavender-haze",
    title: "Lavender Haze",
    description: "Dreamy purple-gray wash for tender emotional notes.",
    style:
      "radial-gradient(circle at 16% 24%, rgba(158,133,183,0.24), transparent 28%), radial-gradient(circle at 80% 74%, rgba(206,190,215,0.34), transparent 36%), linear-gradient(135deg, #d9d0df 0%, #f1eaf0 48%, #bbb1c7 100%)",
    overlay: "rgba(255,255,255,0.35)",
  },
  {
    id: "ember-letter",
    title: "Ember Letter",
    description: "Warm red-brown archival glow for ruins and secrets.",
    style:
      "radial-gradient(circle at 20% 25%, rgba(181,74,52,0.26), transparent 26%), radial-gradient(circle at 78% 76%, rgba(199,132,58,0.20), transparent 34%), linear-gradient(140deg, #24110f 0%, #5a2b22 48%, #130f13 100%)",
    overlay: "rgba(15,10,10,0.18)",
    tone: "dark",
  },
  {
    id: "silver-moon",
    title: "Silver Moon",
    description: "Pale cool night paper with faint celestial softness.",
    style:
      "radial-gradient(circle at 72% 18%, rgba(255,255,255,0.45), transparent 14%), radial-gradient(circle at 24% 74%, rgba(127,143,168,0.22), transparent 34%), radial-gradient(circle at 82% 72%, rgba(190,198,208,0.26), transparent 30%), linear-gradient(135deg, #d9dfe7 0%, #f1f2ee 48%, #b5bec9 100%)",
    overlay: "rgba(255,255,255,0.3)",
  },
  {
    id: "dust-and-petals",
    title: "Dust & Petals",
    description: "Muted floral paper for delicate storybook moods.",
    style:
      "radial-gradient(ellipse at 18% 22%, rgba(166,102,110,0.20), transparent 18%), radial-gradient(ellipse at 26% 28%, rgba(119,138,98,0.16), transparent 16%), radial-gradient(ellipse at 82% 70%, rgba(196,134,123,0.18), transparent 20%), radial-gradient(ellipse at 72% 78%, rgba(118,139,101,0.14), transparent 16%), linear-gradient(135deg, #ead9cd 0%, #f7eee5 50%, #d7c2b2 100%)",
    overlay: "rgba(255,255,255,0.34)",
  },
  {
    id: "velvet-dusk",
    title: "Velvet Dusk",
    description: "Darker mauve and ink depth for dramatic pages.",
    style:
      "radial-gradient(circle at 16% 24%, rgba(179,116,153,0.20), transparent 24%), radial-gradient(circle at 80% 76%, rgba(78,72,111,0.24), transparent 34%), linear-gradient(145deg, #17111d 0%, #35293c 52%, #0d0f17 100%)",
    overlay: "rgba(6,6,12,0.14)",
    tone: "dark",
  },
  {
    id: "clouded-ivory",
    title: "Clouded Ivory",
    description: "Pale foggy paper for gentle minimal story pages.",
    style:
      "radial-gradient(circle at 20% 22%, rgba(176,164,141,0.14), transparent 30%), radial-gradient(circle at 78% 68%, rgba(164,174,169,0.18), transparent 34%), linear-gradient(135deg, #eee8dc 0%, #fbf8ef 48%, #ddd5c7 100%)",
    overlay: "rgba(255,255,255,0.36)",
  },
];

export const blockPalette = [
  {
    type: "hero" as const,
    title: "Hero block",
    description: "A bright cover section with title, subtitle, and visual atmosphere.",
  },
  {
    type: "imageText" as const,
    title: "Image + text layout",
    description: "A flexible layout for images and edit-ready text blocks.",
  },
  {
    type: "gallery" as const,
    title: "Gallery block",
    description: "A simple visual grid for images and composition control.",
  },
  {
    type: "character" as const,
    title: "Character block",
    description: "A single-character panel with image and identity fields.",
  },
  {
    type: "relationship" as const,
    title: "Relationship block",
    description: "A canvas for character nodes and relationship connections.",
  },
  {
    type: "timeline" as const,
    title: "Timeline block",
    description: "A sequenced event line with editable cards.",
  },
  {
    type: "lore" as const,
    title: "Lore block",
    description: "A clean note panel for title and descriptive text.",
  },
  {
    type: "divider" as const,
    title: "Divider block",
    description: "A visual divider line or blank spacing section.",
  },
];

export function createBlock(type: BlockType): ProjectBlock {
  const id = createId();
  switch (type) {
    case "hero":
      return {
        id,
        type,
        title: "Hero block",
        data: {
          title: "<h1>Start your story title</h1>",
          subtitle: "<p>Start your story subtitle</p>",
          backgroundUrl: "",
          backgroundStyle: heroBackgroundChoices[0].style,
          titleVisible: true,
          subtitleVisible: true,
          textItems: [
            {
              id: createId(),
              text: "<h1>Start your story title</h1>",
              x: 12,
              y: 28,
              width: 76,
              height: 18,
              align: "center",
              fontSize: "3rem",
              color: "#ffffff",
            },
            {
              id: createId(),
              text: "<p>Start your story subtitle</p>",
              x: 22,
              y: 50,
              width: 56,
              height: 14,
              align: "center",
              fontSize: "1.1rem",
              color: "#f8fafc",
            },
          ],
          titleColor: "#ffffff",
          subtitleColor: "#f8fafc",
          titleSize: "3rem",
          subtitleSize: "1.1rem",
          titleAlign: "center",
          subtitleAlign: "center",
        },
      };
    case "imageText":
      return {
        id,
        type,
        title: "Image + text layout",
        data: {
          items: [],
          height: 560,
        },
      };
    case "gallery":
      return {
        id,
        type,
        title: "Gallery block",
        data: {
          images: [createGalleryPlaceholder(), createGalleryPlaceholder(), createGalleryPlaceholder()],
          autoPlay: true,
          interval: 4000,
          showIndicators: true,
          showArrows: true,
          loop: true,
        },
      };
    case "character":
      const character = createCharacterCard();
      return {
        id,
        type,
        title: "Character block",
        data: {
          characters: [character],
          activeCharacterId: character.id,
        },
      };
    case "relationship":
      return {
        id,
        type,
        title: "Relationship block",
        data: {
          title: "<h2>Relationship</h2>",
          nodes: [],
          connections: [],
          nodeEditor: { open: false },
        },
      };
    case "timeline":
      const timelineEvent = createTimelineEvent();
      return {
        id,
        type,
        title: "Timeline block",
        data: {
          title: "<h2>Timeline</h2>",
          direction: "horizontal",
          events: [timelineEvent],
          activeEventId: timelineEvent.id,
        },
      };
    case "lore":
      const loreTitle = createLoreTextHolder("title", 14);
      const loreText = createLoreTextHolder("text", 38);
      return {
        id,
        type,
        title: "Lore block",
        data: {
          title: "",
          content: "",
          titleColor: "#0f172a",
          contentColor: "#475569",
          titleSize: "1.5rem",
          contentSize: "1rem",
          align: "left",
          height: 360,
          textHolders: [loreTitle, loreText],
          breakLines: [createLoreBreakLine(32)],
          activeItemId: loreTitle.id,
        },
      };
    case "divider":
      return {
        id,
        type,
        title: "Divider block",
        data: {
          visible: true,
        },
      };
    default:
      return {
        id,
        type: "divider",
        title: "Divider block",
        data: {
          visible: true,
        },
      } as ProjectBlock;
  }
}

export const defaultProject: ProjectData = {
  name: "Untitled OC World",
  templateId: "minimal",
  vibe: {
    backgroundChoiceId: "worn-parchment",
  },
  pages: [createHomePage()],
  currentPageId: "home",
};

export function getTemplate(id: string): TemplateSpec {
  return templates.find((item) => item.id === id) ?? templates[0];
}

export function getProjectVibeSurface(vibe?: ProjectVibeData) {
  const choice = vibeBackgroundChoices.find((item) => item.id === vibe?.backgroundChoiceId) ?? vibeBackgroundChoices[0];
  const tone = choice.tone ?? "light";
  const isDark = tone === "dark";
  const theme = isDark
    ? {
        backgroundColor: "#070b14",
        textColor: "#f8fafc",
        mutedTextColor: "#d7deea",
        panelBackground: "rgba(9,13,24,0.62)",
        panelStrongBackground: "rgba(15,23,42,0.74)",
        panelBorder: "rgba(226,232,240,0.18)",
        navBackground: "rgba(8,12,22,0.72)",
        navDropdownBackground: "rgba(8,12,22,0.94)",
        navTextColor: "#e2e8f0",
        navActiveBackground: "rgba(248,250,252,0.94)",
        navActiveTextColor: "#0f172a",
        controlBackground: "rgba(15,23,42,0.72)",
        subtleBackground: "rgba(15,23,42,0.44)",
        placeholderBackground: "rgba(15,23,42,0.62)",
        lineColor: "rgba(226,232,240,0.56)",
        shadowColor: "rgba(0,0,0,0.36)",
        gridColor: "rgba(226,232,240,0.11)",
      }
    : {
        backgroundColor: "#f8f5ef",
        textColor: "#0f172a",
        mutedTextColor: "#475569",
        panelBackground: "rgba(255,253,248,0.76)",
        panelStrongBackground: "rgba(255,255,255,0.88)",
        panelBorder: "rgba(148,163,184,0.24)",
        navBackground: "rgba(255,253,248,0.88)",
        navDropdownBackground: "rgba(255,255,255,0.96)",
        navTextColor: "#334155",
        navActiveBackground: "#0f172a",
        navActiveTextColor: "#ffffff",
        controlBackground: "rgba(255,255,255,0.92)",
        subtleBackground: "rgba(248,244,236,0.75)",
        placeholderBackground: "linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%)",
        lineColor: "rgba(15,23,42,0.32)",
        shadowColor: "rgba(15,23,42,0.12)",
        gridColor: "rgba(90,80,66,0.12)",
      };
  if (vibe?.backgroundImageUrl) {
    const imageAspectRatio = vibe.backgroundImageWidth && vibe.backgroundImageHeight ? vibe.backgroundImageWidth / vibe.backgroundImageHeight : undefined;
    const offsetY = Math.min(100, Math.max(0, vibe.backgroundImageOffsetY ?? 50));
    return {
      ...theme,
      tone,
      isCustomImage: true,
      backgroundColor: theme.backgroundColor,
      backgroundImage: `url("${vibe.backgroundImageUrl}")`,
      backgroundSize: "cover",
      backgroundPosition: `center ${offsetY}%`,
      backgroundRepeat: "no-repeat",
      backgroundAttachment: "fixed",
      overlay: isDark ? "rgba(2,6,23,0.22)" : "rgba(255,255,255,0.38)",
      imageAspectRatio,
      isScrollableImage: Boolean(imageAspectRatio),
    };
  }
  return {
    ...theme,
    tone,
    isCustomImage: false,
    backgroundColor: theme.backgroundColor,
    backgroundImage: choice.style,
    backgroundSize: "cover",
    backgroundPosition: "center",
    backgroundRepeat: "no-repeat",
    backgroundAttachment: "fixed",
    overlay: choice.overlay,
    imageAspectRatio: undefined,
    isScrollableImage: false,
  };
}

function escapeHtmlAttribute(value: string) {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll('"', "&quot;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;");
}

function pageToExportPath(page: ProjectPage) {
  if (page.slug === "/") return "index.html";
  return `${page.slug.replace(/^\/+|\/+$/g, "")}/index.html`;
}

function pageToHref(page: ProjectPage, fromPage?: ProjectPage) {
  const targetPath = pageToExportPath(page);
  if (!fromPage) return targetPath;
  const fromPath = pageToExportPath(fromPage);
  const depth = Math.max(0, fromPath.split("/").length - 1);
  return `${"../".repeat(depth)}${targetPath}`;
}

function buildNavigationMarkup(project: ProjectData, activePage: ProjectPage) {
  if (project.pages.length <= 1) return "";
  const pagesByParent = new Map<string, ProjectPage[]>();
  const visiblePages = project.pages.filter((page) => isPageVisibleInNavigation(page, project.pages));
  visiblePages.forEach((page) => {
      const key = page.parentId ?? "root";
      pagesByParent.set(key, [...(pagesByParent.get(key) ?? []), page]);
    });

  pagesByParent.forEach((items, key) => {
    pagesByParent.set(key, [...items].sort((a, b) => a.order - b.order || a.title.localeCompare(b.title)));
  });

  const ancestors = getPageAncestors(activePage.id, project.pages);
  const activePageIsVisible = isPageVisibleInNavigation(activePage, project.pages);
  const activeTopPage = ancestors.find((page) => (page.parentId ?? null) === null) ?? (activePage.parentId ? project.pages.find((page) => page.id === activePage.parentId) : activePage);
  const renderItems = (items: ProjectPage[]): string =>
    items
      .map((page) => {
        const activeClass = page.id === activePage.id || page.id === activeTopPage?.id || ancestors.some((ancestor) => ancestor.id === page.id) ? " is-active" : "";
        return `<li class="site-nav-item"><a class="site-nav-link${activeClass}" href="${pageToHref(page, activePage)}">${escapeHtmlAttribute(page.title)}</a></li>`;
      })
      .join("");

  const items = renderItems(pagesByParent.get("root") ?? []);
  if (!items) return "";
  const spreadSubnavItems = activePageIsVisible && activeTopPage ? renderItems(pagesByParent.get(activeTopPage.id) ?? []) : "";
  const listSubnavItems = activePageIsVisible && activePage.id !== activeTopPage?.id ? renderItems(pagesByParent.get(activePage.id) ?? []) : "";
  const subnav = spreadSubnavItems ? `<nav class="site-subnav" aria-label="Subpages"><ul>${spreadSubnavItems}</ul></nav>` : "";
  const nestedSubnav = listSubnavItems ? `<nav class="site-nested-subnav" aria-label="Nested subpages"><ul>${listSubnavItems}</ul></nav>` : "";
  const hiddenBack = !activePageIsVisible
    ? `<button class="site-hidden-back" type="button" data-hidden-back>Back</button>`
    : "";

  return `<header class="site-header"><div class="site-brand">${escapeHtmlAttribute(project.name || "OCWorld")}</div><button class="site-menu-button" type="button" aria-expanded="false" data-site-menu-button>Menu</button><nav class="site-nav" data-site-nav><ul>${items}</ul></nav></header>${subnav}${nestedSubnav}${hiddenBack}`;
}

function resolveBlockLink(block: ProjectBlock, project: ProjectData, activePage?: ProjectPage) {
  if (!block.link || block.link.type === "none") return "";
  if (block.link.type === "external") return block.link.url?.trim() ?? "";
  const page = project.pages.find((item) => item.id === block.link?.pageId);
  return page ? pageToHref(page, activePage) : "";
}

function resolveItemLink(link: BlockLink | undefined, project: ProjectData, activePage: ProjectPage) {
  if (!link || link.type === "none") return "";
  if (link.type === "external") return link.url?.trim() ?? "";
  const page = project.pages.find((item) => item.id === link.pageId);
  return page ? pageToHref(page, activePage) : "";
}

function itemLinkAttribute(link: BlockLink | undefined, project: ProjectData, activePage: ProjectPage) {
  const href = resolveItemLink(link, project, activePage);
  return href ? ` data-page-link-href="${escapeHtmlAttribute(href)}"` : "";
}

function rewriteInternalRichTextLinks(markup: string, project: ProjectData, activePage: ProjectPage) {
  return markup.replace(/href=(["'])#oc-page:([^"']+)\1/g, (_match, quote: string, pageId: string) => {
    const page = project.pages.find((item) => item.id === pageId);
    return `href=${quote}${escapeHtmlAttribute(page ? pageToHref(page, activePage) : "#")}${quote}`;
  });
}

function applyStaticSectionLink(markup: string, block: ProjectBlock, project: ProjectData, activePage: ProjectPage) {
  const href = resolveBlockLink(block, project, activePage);
  if (!href) return markup;
  return markup.replace("<section", `<section data-section-link="${escapeHtmlAttribute(href)}"`);
}

export function buildStaticHtml(project: ProjectData, _template: TemplateSpec, pageId?: string) {
  const normalizedProject = normalizeProject(project);
  const activePage = normalizedProject.pages.find((page) => page.id === pageId) ?? getCurrentPage(normalizedProject);
  const siteVibe = normalizedProject.vibe ?? defaultProject.vibe ?? {};
  const vibe = {
    ...siteVibe,
    ...activePage.vibe,
    musicUrl: siteVibe.musicUrl,
    musicName: siteVibe.musicName,
  };
  const vibeSurface = getProjectVibeSurface(vibe);
  const projectName = normalizedProject.name?.trim() || defaultProject.name;
  const pageTitle = activePage.title === "Home" ? projectName : `${activePage.title} | ${projectName}`;
  const bodyBackgroundStyle = `background-color:${vibeSurface.backgroundColor};--site-text:${vibeSurface.textColor};--site-muted:${vibeSurface.mutedTextColor};--site-panel:${vibeSurface.panelBackground};--site-panel-strong:${vibeSurface.panelStrongBackground};--site-panel-border:${vibeSurface.panelBorder};--site-nav-bg:${vibeSurface.navBackground};--site-nav-dropdown:${vibeSurface.navDropdownBackground};--site-nav-text:${vibeSurface.navTextColor};--site-active-bg:${vibeSurface.navActiveBackground};--site-active-text:${vibeSurface.navActiveTextColor};--site-control-bg:${vibeSurface.controlBackground};--site-subtle-bg:${vibeSurface.subtleBackground};--site-placeholder-bg:${vibeSurface.placeholderBackground};--site-line:${vibeSurface.lineColor};--site-shadow:${vibeSurface.shadowColor};--vibe-page-background-image:${vibeSurface.backgroundImage};--vibe-page-background-size:${vibeSurface.backgroundSize};--vibe-page-background-position:${vibeSurface.backgroundPosition};--vibe-page-background-repeat:${vibeSurface.backgroundRepeat};--vibe-page-background-attachment:${vibeSurface.backgroundAttachment};--vibe-page-overlay:${vibeSurface.overlay};--vibe-scroll-background-ratio:${vibeSurface.imageAspectRatio ?? 1};`;
  const musicMarkup = vibe.musicUrl
            ? `<audio id="vibe-audio" src="${escapeHtmlAttribute(vibe.musicUrl)}" loop preload="auto" autoplay></audio><button class="vibe-audio-button" type="button" data-vibe-audio-button hidden>Play music</button>`
    : "";
  const navigationMarkup = buildNavigationMarkup(normalizedProject, activePage);
  const sections = activePage.sections
    .map((block) => {
      let markup = "";
      switch (block.type) {
        case "hero":
          const heroItems = Array.isArray(block.data.textItems)
            ? block.data.textItems
            : [
                ...(block.data.titleVisible === false
                  ? []
                  : [
                      {
                        id: `${block.id}-title`,
                        text: block.data.title,
                        x: 12,
                        y: 28,
                        width: 76,
                        height: 18,
                        align: block.data.titleAlign,
                        fontSize: block.data.titleSize,
                        color: block.data.titleColor,
                      },
                    ]),
                ...(block.data.subtitleVisible === false
                  ? []
                  : [
                      {
                        id: `${block.id}-subtitle`,
                        text: block.data.subtitle,
                        x: 22,
                        y: 50,
                        width: 56,
                        height: 14,
                        align: block.data.subtitleAlign,
                        fontSize: block.data.subtitleSize,
                        color: block.data.subtitleColor,
                      },
                    ]),
              ];
          const heroExportBackgroundStyle = block.data.backgroundUrl ? "" : block.data.backgroundStyle ?? heroBackgroundChoices[0].style;
          const heroExportBackgroundIsColor = heroExportBackgroundStyle.trim().startsWith("#");
          const heroExportBackgroundCss = block.data.backgroundUrl
            ? `background-color:#0f172a;background-image:url('${block.data.backgroundUrl}');`
            : heroExportBackgroundIsColor
              ? `background-color:${heroExportBackgroundStyle};`
              : `background-color:#0f172a;background-image:${heroExportBackgroundStyle};`;
          markup = `<section class="hero-panel" style="${heroExportBackgroundCss}">${heroItems
            .map(
              (item) =>
                `<div class="hero-text-item" style="left:${item.x}%;top:${item.y}%;width:${item.width}%;height:${item.height}%;color:${item.color};font-size:${item.fontSize};text-align:${item.align};">${item.text}</div>`
            )
            .join("")}</section>`;
          break;
        case "imageText":
          const imageTextData = normalizeImageTextData(block.data);
          markup = `<section class="panel image-text"><div class="content-items" style="height:${imageTextData.height}px;">${imageTextData.items
            .map((item) => {
              const style = `left:${item.x}%;top:${item.y}%;width:${item.width}%;height:${item.height}%;`;
              if (item.type === "text") {
                return `<div class="content-item text-item" style="${style}color:${item.color};font-size:${item.fontSize};text-align:${item.align};">${item.text ?? ""}</div>`;
              }
              return `<div class="content-item image-item" style="${style}"${itemLinkAttribute(item.link, normalizedProject, activePage)}><img src="${item.imageUrl ?? ""}" alt="${item.caption ?? "Image block"}" /></div>`;
            })
            .join("")}</div></section>`;
          break;
        case "gallery":
          const galleryImages = block.data.images.length
            ? block.data.images
            : [
                { id: `${block.id}-blank-1`, url: "", caption: "", width: "medium" as const },
                { id: `${block.id}-blank-2`, url: "", caption: "", width: "medium" as const },
                { id: `${block.id}-blank-3`, url: "", caption: "", width: "medium" as const },
              ];
          const galleryLoop = block.data.loop ?? true;
          const gallerySlides = galleryLoop && galleryImages.length > 1 ? [galleryImages[galleryImages.length - 1], ...galleryImages, galleryImages[0]] : galleryImages;
          const galleryAutoPlay = block.data.autoPlay ?? true;
          const galleryInterval = Math.max(1500, Number(block.data.interval ?? 4000));
          const galleryShowArrows = block.data.showArrows ?? true;
          const galleryShowIndicators = block.data.showIndicators ?? true;
          markup = `<section class="panel gallery-panel"><div class="gallery-carousel" data-gallery-carousel data-auto-play="${galleryAutoPlay}" data-interval="${galleryInterval}" data-loop="${galleryLoop}" tabindex="0" role="region" aria-roledescription="carousel" aria-label="Gallery image carousel"><p class="sr-only" data-gallery-status aria-live="polite">Image 1 of ${galleryImages.length}</p><div class="gallery-carousel-viewport"><div class="gallery-carousel-track" style="transform:translate3d(-${galleryLoop && galleryImages.length > 1 ? 100 : 0}%,0,0)">${gallerySlides
            .map((item: GalleryImage, renderedIndex) => {
              const imageIndex = galleryLoop && galleryImages.length > 1 ? (renderedIndex + galleryImages.length - 1) % galleryImages.length : renderedIndex;
              return `<figure class="gallery-slide" data-slide-index="${imageIndex}" aria-hidden="${imageIndex === 0 ? "false" : "true"}">${
                item.url
                  ? `<img src="${escapeHtmlAttribute(item.url)}" alt="${escapeHtmlAttribute(item.caption || "Gallery image")}" loading="${imageIndex === 0 ? "eager" : "lazy"}" draggable="false" />`
                  : `<div class="gallery-placeholder">Blank image</div>`
              }</figure>`;
            })
            .join("")}</div>${
            galleryShowArrows && galleryImages.length > 1
              ? `<button class="gallery-arrow gallery-arrow-prev" type="button" aria-label="Previous image" data-gallery-prev><svg aria-hidden="true" viewBox="0 0 24 24"><path d="M15 18l-6-6 6-6"></path></svg></button><button class="gallery-arrow gallery-arrow-next" type="button" aria-label="Next image" data-gallery-next><svg aria-hidden="true" viewBox="0 0 24 24"><path d="M9 6l6 6-6 6"></path></svg></button>`
              : ""
          }${
            galleryShowIndicators && galleryImages.length > 1
              ? `<div class="gallery-indicators">${galleryImages
                  .map(
                    (item, index) =>
                      `<button type="button" class="gallery-dot${index === 0 ? " is-active" : ""}" aria-label="Show image ${index + 1}" aria-current="${index === 0 ? "true" : "false"}" data-gallery-dot="${index}"></button>`
                  )
                  .join("")}</div>`
              : ""
          }</div></div></section>`;
          break;
        case "character":
          markup = `<section class="panel character-section"><div class="character-stack">${normalizeCharacters(block.data.characters)
            .map((character: CharacterData) => {
              const portrait = character.portraitUrl
                ? `<img src="${escapeHtmlAttribute(character.portraitUrl)}" alt="Character portrait" />`
                : `<div class="portrait-placeholder">Portrait</div>`;
              const tags = character.tags.length
                ? `<div class="character-tags">${character.tags.map((tag) => `<div class="character-tag">${tag.content || tag.placeholder}</div>`).join("")}</div>`
                : "";
              const copyHeight = Math.max(
                character.copyHeight,
                ...character.textHolders.map((item) => ((item.y + item.height) / 100) * character.copyHeight),
                ...character.breakLines.map((line) => (line.y / 100) * character.copyHeight + 24)
              );
              return `<article class="character-card" style="grid-template-columns:minmax(160px,${character.portraitWidth}%) minmax(0,1fr);"><div class="character-portrait" style="height:${character.portraitHeight}px;"${itemLinkAttribute(character.link, normalizedProject, activePage)}>${portrait}${tags}</div><div class="character-copy" style="min-height:${copyHeight}px;">${character.breakLines
                .map((line) => `<div class="character-break-line" style="left:${line.x}%;top:${line.y}%;width:${line.width}%;"></div>`)
                .join("")}${character.textHolders
                .map((item) => `<div class="character-text-holder" style="left:${item.x}%;top:${item.y}%;width:${item.width}%;min-height:${item.height}%;"><div>${item.content || `<p>${item.placeholder}</p>`}</div></div>`)
                .join("")}</div></article>`;
            })
            .join("")}</div></section>`;
          break;
        case "relationship": {
          const markerShape = (connection: RelationshipConnection, color: string) => {
            switch (connection.arrowHead ?? "arrow") {
              case "circle":
                return `<circle cx="2.5" cy="2.5" r="1.45" fill="#ffffff" stroke="${color}" stroke-width="0.7"></circle>`;
              case "solidCircle":
                return `<circle cx="2.5" cy="2.5" r="1.5" fill="${color}"></circle>`;
              case "square":
                return `<rect x="1" y="1" width="3" height="3" fill="#ffffff" stroke="${color}" stroke-width="0.7"></rect>`;
              case "solidSquare":
                return `<rect x="1" y="1" width="3" height="3" fill="${color}"></rect>`;
              case "rhombus":
                return `<path d="M2.5,0.8 L4.2,2.5 L2.5,4.2 L0.8,2.5 Z" fill="#ffffff" stroke="${color}" stroke-width="0.7"></path>`;
              case "solidRhombus":
                return `<path d="M2.5,0.8 L4.2,2.5 L2.5,4.2 L0.8,2.5 Z" fill="${color}"></path>`;
              default:
                return `<path d="M0.6,0.8 L4.2,2.5 L0.6,4.2 Z" fill="${color}"></path>`;
            }
          };
          const relationshipGeometry = (connection: RelationshipConnection) => {
            const source = block.data.nodes.find((node) => node.id === connection.source || node.name === connection.source);
            const target = block.data.nodes.find((node) => node.id === connection.target || node.name === connection.target);
            if (!source || !target) return null;
            const pairKey = [connection.source, connection.target].sort().join("::");
            const pairConnections = block.data.connections.filter((item) => [item.source, item.target].sort().join("::") === pairKey);
            const pairIndex = Math.max(0, pairConnections.findIndex((item) => item.id === connection.id));
            const offset = (pairIndex - (pairConnections.length - 1) / 2) * 4.6;
            const [firstId, secondId] = [connection.source, connection.target].sort();
            const first = block.data.nodes.find((node) => node.id === firstId || node.name === firstId);
            const second = block.data.nodes.find((node) => node.id === secondId || node.name === secondId);
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
              startX: source.x + unitX * 5 + offsetX,
              startY: source.y + unitY * 5 + offsetY,
              endX: target.x - unitX * 6 + offsetX,
              endY: target.y - unitY * 6 + offsetY,
              labelX: (source.x + target.x) / 2 + offsetX,
              labelY: (source.y + target.y) / 2 + offsetY,
            };
          };
          markup = `<section class="panel relationship-section"><div class="relationship-title">${block.data.title ?? ""}</div><div class="relationship-canvas"><svg class="relationship-lines" viewBox="0 0 100 100" preserveAspectRatio="none">${block.data.connections
            .map((connection) => {
              const geometry = relationshipGeometry(connection);
              if (!geometry) return "";
              const color = connection.color || "#0f766e";
              return `<g><line x1="${geometry.startX}" y1="${geometry.startY}" x2="${geometry.endX}" y2="${geometry.endY}" stroke="${color}" stroke-width="0.35" stroke-dasharray="1.4 1.4" vector-effect="non-scaling-stroke" marker-end="url(#arrow-${connection.id})"></line><defs><marker id="arrow-${connection.id}" markerWidth="5" markerHeight="5" refX="2.5" refY="2.5" orient="auto" markerUnits="strokeWidth">${markerShape(connection, color)}</marker></defs></g>`;
            })
            .join("")}</svg>${block.data.connections
            .map((connection) => {
              const geometry = relationshipGeometry(connection);
              if (!geometry) return "";
              return `<div class="relationship-label" style="left:${geometry.labelX}%;top:${geometry.labelY}%;">${connection.label || "<p>Relationship</p>"}</div>`;
            })
            .join("")}${block.data.nodes
            .map(
              (node) => `<div class="relationship-node" style="left:${node.x}%;top:${node.y}%;"${itemLinkAttribute(node.link, normalizedProject, activePage)}>${
                node.imageUrl
                  ? `<img src="${escapeHtmlAttribute(node.imageUrl)}" alt="Character portrait" />`
                  : `<div class="relationship-node-placeholder">Portrait</div>`
              }<div class="relationship-node-name">${node.name || "<p>Name</p>"}</div></div>`
            )
            .join("")}</div></section>`;
          break;
        }
        case "timeline":
          const timelineEvents = normalizeTimelineEvents(block.data.events);
          const maxTimelineEventWidth = timelineEvents.length ? Math.max(...timelineEvents.map((event) => event.width)) : 300;
          const maxTimelineEventHeight = timelineEvents.length ? Math.max(...timelineEvents.map((event) => event.height)) : 340;
          const timelineLayoutStyle =
            block.data.direction === "vertical"
              ? `--timeline-vertical-width:${maxTimelineEventWidth * 2 + 120}px;`
              : `--timeline-horizontal-width:${timelineEvents.reduce((total, event) => total + event.width, 0) + Math.max(0, timelineEvents.length - 1) * 32}px;--timeline-max-event-height:${maxTimelineEventHeight}px;`;
          markup = `<section class="panel timeline-section ${block.data.direction === "vertical" ? "timeline-vertical" : "timeline-horizontal"}"><div class="timeline-title">${block.data.title ?? ""}</div><div class="timeline-layout" style="${timelineLayoutStyle}"><div class="timeline-rail"></div>${timelineEvents
            .map((event: TimelineEvent) => {
              const eventSide = event.side ?? "after";
              return `<article class="timeline-event-card timeline-${eventSide}" style="--event-height:${event.height}px;width:${event.width}px;height:${event.height}px;"><div class="timeline-connector timeline-connector-${eventSide}"></div>${event.imageHolders
              .map((holder) => `<div class="timeline-image-holder" style="left:${holder.x}%;top:${holder.y}%;width:${holder.width}%;height:${holder.height}%;"${itemLinkAttribute(holder.link, normalizedProject, activePage)}>${
                holder.imageUrl
                  ? `<img src="${escapeHtmlAttribute(holder.imageUrl)}" alt="Timeline event image" />`
                  : `<div>Image holder</div>`
              }</div>`)
              .join("")}${event.breakLines
              .map((line) => `<div class="timeline-break-line" style="left:${line.x}%;top:${line.y}%;width:${line.width}%;"></div>`)
              .join("")}${event.textHolders
              .map((holder) => `<div class="timeline-text-holder" style="left:${holder.x}%;top:${holder.y}%;width:${holder.width}%;min-height:${holder.height}%;">${holder.content || `<p>${holder.placeholder}</p>`}</div>`)
              .join("")}</article>`;
            })
            .join("")}</div></section>`;
          break;
        case "lore":
          const loreData = fitLoreWorkspaceHeight(block.data, block.data.height ?? 360);
          markup = `<section class="panel lore"><div class="lore-canvas" style="height:${loreData.height}px;">${(loreData.breakLines ?? [])
            .map((line) => `<div class="lore-break-line" style="left:${line.x}%;top:${line.y}%;width:${line.width}%;"></div>`)
            .join("")}${(loreData.textHolders ?? [])
            .map((holder) => `<div class="lore-text-holder ${holder.kind === "title" ? "lore-title-holder" : ""}" style="left:${holder.x}%;top:${holder.y}%;width:${holder.width}%;min-height:${holder.height}%;">${holder.content || `<p>${holder.placeholder}</p>`}</div>`)
            .join("")}</div></section>`;
          break;
        case "divider":
          markup = isDividerVisible(block.data) ? `<section class="divider-panel"><hr /></section>` : `<section class="divider-panel"></section>`;
          break;
        default:
          markup = "";
      }
      return rewriteInternalRichTextLinks(applyStaticSectionLink(markup, block, normalizedProject, activePage), normalizedProject, activePage);
    })
    .join("");

  return `<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>${escapeHtmlAttribute(pageTitle)}</title>
    <style>
      :root { color-scheme: light dark; color: var(--site-text, #111827); background: #f8f5ef; font-family: Inter, ui-sans-serif, system-ui, sans-serif; }
      body { position: relative; margin: 0; min-height: 100vh; background-color: #f8f5ef; color: var(--site-text, #111827); padding: 2rem; }
      * { box-sizing: border-box; }
      body { display: flex; flex-direction: column; gap: 2rem; }
      .vibe-background-fallback { position: fixed; inset: 0; z-index: 0; background-image: var(--vibe-page-background-image); background-size: cover; background-position: var(--vibe-page-background-position, center); background-repeat: no-repeat; pointer-events: none; }
      .vibe-background-scroll { display: none; position: fixed; left: 0; top: 0; z-index: 0; width: 100vw; aspect-ratio: var(--vibe-scroll-background-ratio, 1); background-image: var(--vibe-page-background-image); background-size: 100% auto; background-position: top center; background-repeat: no-repeat; pointer-events: none; will-change: transform; }
      body::after { content: ""; position: fixed; inset: 0; z-index: 0; background: var(--vibe-page-overlay, rgba(255,255,255,0.45)); pointer-events: none; }
      h1, h2, h3 { margin: 0 0 1rem; }
      h1 { font-size: clamp(2rem, 4vw, 3.5rem); line-height: 1.05; }
      p { margin: 0; line-height: 1.8; color: var(--site-muted, #475569); }
      section { position: relative; z-index: 1; width: min(100%, 980px); margin: 0 auto; padding: 2rem; border-radius: 1.5rem; background: var(--site-panel-strong, #ffffff); color: var(--site-text, #111827); border: 1px solid var(--site-panel-border, rgba(148,163,184,0.2)); box-shadow: 0 16px 50px var(--site-shadow, rgba(15,23,42,0.08)); }
      .reveal-section { opacity: 0; transform: translateY(24px) scale(0.985); filter: blur(8px); transition: opacity 720ms cubic-bezier(0.22, 1, 0.36, 1), transform 720ms cubic-bezier(0.22, 1, 0.36, 1), filter 720ms cubic-bezier(0.22, 1, 0.36, 1); }
      .reveal-section.is-visible { opacity: 1; transform: translateY(0) scale(1); filter: blur(0); }
      @media (prefers-reduced-motion: reduce) { .reveal-section { opacity: 1; transform: none; filter: none; transition: none; } }
      .vibe-audio-button { position: fixed; right: 1rem; bottom: 1rem; z-index: 50; border: 1px solid var(--site-panel-border, rgba(148,163,184,0.35)); border-radius: 999px; background: var(--site-control-bg, rgba(255,255,255,0.92)); color: var(--site-text, #0f172a); padding: 0.8rem 1rem; font-weight: 700; box-shadow: 0 12px 30px var(--site-shadow, rgba(15,23,42,0.16)); cursor: pointer; }
      .site-header { position: sticky; top: 1rem; z-index: 20; display: flex; align-items: center; justify-content: space-between; gap: 1rem; width: min(100%, 980px); margin: 0 auto; padding: 0.8rem 1rem; border: 1px solid var(--site-panel-border, rgba(148,163,184,0.28)); border-radius: 999px; background: var(--site-nav-bg, rgba(255,255,255,0.86)); box-shadow: 0 14px 40px var(--site-shadow, rgba(15,23,42,0.12)); backdrop-filter: blur(18px); }
      .site-brand { color: var(--site-text, #0f172a); font-weight: 800; }
      .site-menu-button { display: none; border: 1px solid var(--site-panel-border, rgba(148,163,184,0.35)); border-radius: 999px; background: var(--site-control-bg, #fff); color: var(--site-text, #0f172a); padding: 0.55rem 0.85rem; font-weight: 800; }
      .site-nav ul { display: flex; align-items: center; gap: 0.35rem; margin: 0; padding: 0; list-style: none; }
      .site-nav-item { position: relative; }
      .site-nav-link, .site-hidden-back, .site-subnav a { display: inline-flex; align-items: center; border-radius: 999px; color: var(--site-nav-text, #334155); padding: 0.55rem 0.85rem; text-decoration: none; font-weight: 750; transition: background 160ms ease, color 160ms ease; }
      .site-nav-link:hover, .site-nav-link.is-active { background: var(--site-active-bg, #0f172a); color: var(--site-active-text, #fff); }
      .site-nav-children { position: absolute; left: 0; top: calc(100% + 0.35rem); min-width: 180px; flex-direction: column; align-items: stretch; border: 1px solid var(--site-panel-border, rgba(148,163,184,0.25)); border-radius: 1rem; background: var(--site-nav-dropdown, rgba(255,255,255,0.96)); padding: 0.35rem; box-shadow: 0 18px 40px var(--site-shadow, rgba(15,23,42,0.14)); opacity: 0; pointer-events: none; transform: translateY(-4px); transition: opacity 160ms ease, transform 160ms ease; }
      .site-nav-item:hover > .site-nav-children, .site-nav-item:focus-within > .site-nav-children { opacity: 1; pointer-events: auto; transform: translateY(0); }
      .site-subnav { position: relative; z-index: 10; width: min(100%, 980px); margin: -1.25rem auto 0; border: 1px solid var(--site-panel-border, rgba(148,163,184,0.22)); border-radius: 999px; background: var(--site-nav-bg, rgba(255,255,255,0.78)); padding: 0.35rem; backdrop-filter: blur(16px); }
      .site-subnav ul { display: flex; flex-wrap: wrap; gap: 0.25rem; margin: 0; padding: 0; list-style: none; }
      .site-subnav a:hover, .site-subnav a.is-active { background: var(--site-active-bg, #0f172a); color: var(--site-active-text, #fff); }
      .site-nested-subnav { position: relative; z-index: 10; width: min(100%, 320px); margin: -1.25rem auto 0; border: 1px solid var(--site-panel-border, rgba(148,163,184,0.22)); border-radius: 1.25rem; background: var(--site-nav-bg, rgba(255,255,255,0.82)); padding: 0.45rem; backdrop-filter: blur(16px); }
      .site-nested-subnav ul { display: grid; gap: 0.25rem; margin: 0; padding: 0; list-style: none; }
      .site-nested-subnav a { justify-content: flex-start; width: 100%; border-radius: 0.9rem; }
      .site-nested-subnav a:hover, .site-nested-subnav a.is-active { background: var(--site-active-bg, #0f172a); color: var(--site-active-text, #fff); }
      .site-hidden-back { position: relative; z-index: 10; width: fit-content; margin: -1.25rem auto 0; border: 0; background: var(--site-active-bg, #0f172a); color: var(--site-active-text, #fff); cursor: pointer; box-shadow: 0 12px 30px var(--site-shadow, rgba(15,23,42,0.16)); }
      section[data-section-link], [data-page-link-href] { cursor: pointer; }
      .hero-panel { position: relative; min-height: 420px; background-size: cover; background-position: center; color: #fff; overflow: hidden; }
      .hero-text-item { position: absolute; overflow: auto; text-shadow: 0 1px 18px rgba(15,23,42,0.35); }
      .hero-panel a { display: inline-flex; margin-top: 1.5rem; padding: 1rem 1.5rem; border-radius: 999px; background: #334155; color: #f8fafc; text-decoration: none; font-weight: 700; }
      .image-panel .image-block { min-height: 320px; border-radius: 1.5rem; background: var(--site-placeholder-bg, #e2e8f0); background-size: cover; background-position: center; margin-bottom: 1.5rem; }
      .content-items { position: relative; min-height: 560px; border: 0; border-radius: 1rem; background: transparent; }
      .content-item { position: absolute; overflow: auto; border-radius: 1rem; background: var(--site-panel, #fff); color: var(--site-text, #111827); box-shadow: 0 1px 6px var(--site-shadow, rgba(15,23,42,0.08)); }
      .text-item { padding: 0.75rem; }
      .image-item img { display: block; width: 100%; height: 100%; object-fit: cover; }
      .two-column { display: grid; gap: 1.5rem; grid-template-columns: 1fr 1fr; align-items: start; }
      .two-column .image { min-height: 260px; border-radius: 1.5rem; background: var(--site-placeholder-bg, #e2e8f0); background-size: cover; background-position: center; }
      .card-grid { display: grid; gap: 1rem; grid-template-columns: repeat(auto-fit,minmax(240px,1fr)); }
      .card { padding: 1.5rem; border-radius: 1.5rem; background: var(--site-panel, #f8fafc); border: 1px solid var(--site-panel-border, rgba(148,163,184,0.2)); }
      .card .role { margin-top: 0.5rem; color: var(--site-muted, #64748b); }
      .gallery-panel, .character-section, .relationship-section, .timeline-section, .lore { background: rgba(255,255,255,0.05); border-color: rgba(255,255,255,0.05); color: var(--site-text, #111827); backdrop-filter: blur(2px); }
      .character-section { padding: 1.25rem; }
      .character-stack { display: grid; gap: 1rem; }
      .character-card { display: grid; gap: 1rem; padding: 1rem; border: 1px solid rgba(255,255,255,0.05); border-radius: 1rem; background: rgba(255,255,255,0.05); backdrop-filter: blur(2px); }
      .character-portrait { position: relative; min-height: 220px; overflow: hidden; border-radius: 0.75rem; background: var(--site-placeholder-bg, #e2e8f0); }
      .character-portrait img { display: block; width: 100%; height: 100%; object-fit: cover; }
      .portrait-placeholder { display: flex; height: 100%; min-height: 240px; align-items: center; justify-content: center; color: var(--site-muted, #64748b); background: var(--site-placeholder-bg, transparent); }
      .character-copy { position: relative; min-height: 320px; }
      .character-text-holder { position: absolute; color: var(--site-text, #0f172a); }
      .character-break-line { position: absolute; height: 1px; background: var(--site-line, rgba(15,23,42,0.28)); }
      .character-tags { position: absolute; inset-inline: 0.75rem; bottom: 0.75rem; display: flex; flex-wrap: wrap; gap: 0.4rem; }
      .character-tag { display: inline-flex; max-width: 100%; border-radius: 999px; background: var(--site-panel-strong, rgba(255,255,255,0.9)); padding: 0.35rem 0.65rem; font-size: 0.78rem; font-weight: 700; color: var(--site-text, #0f172a); box-shadow: 0 8px 20px var(--site-shadow, rgba(15,23,42,0.12)); }
      .character-tag p, .character-tag h1, .character-tag h2, .character-tag h3 { margin: 0; font-size: inherit; line-height: inherit; }
      .sr-only { position: absolute; width: 1px; height: 1px; padding: 0; margin: -1px; overflow: hidden; clip: rect(0,0,0,0); white-space: nowrap; border: 0; }
      .gallery-panel { overflow: hidden; }
      .gallery-carousel { border-radius: 1.5rem; background: rgba(255,255,255,0.05); outline: none; }
      .gallery-carousel:focus-visible { box-shadow: 0 0 0 3px rgba(14,165,233,0.35); }
      .gallery-carousel-viewport { position: relative; overflow: hidden; border-radius: 1.5rem; touch-action: pan-y; }
      .gallery-carousel-track { display: flex; transform: translate3d(-100%,0,0); transition: transform 500ms ease-in-out; }
      .gallery-carousel-track.is-dragging { transition: none; }
      .gallery-slide { flex: 0 0 100%; aspect-ratio: 16 / 9; margin: 0; overflow: hidden; background: var(--site-placeholder-bg, #e2e8f0); }
      .gallery-slide img { display: block; width: 100%; height: 100%; object-fit: cover; user-select: none; }
      .gallery-placeholder { display: flex; height: 100%; align-items: center; justify-content: center; color: var(--site-muted, #64748b); background: var(--site-placeholder-bg, linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%)); }
      .gallery-arrow { position: absolute; top: 50%; z-index: 2; display: inline-flex; width: 2.5rem; height: 2.5rem; align-items: center; justify-content: center; border: 0; border-radius: 999px; color: #fff; background: rgba(15,23,42,0.46); box-shadow: 0 12px 30px rgba(15,23,42,0.22); transform: translateY(-50%); cursor: pointer; opacity: 1; transition: opacity 180ms ease, background 180ms ease; }
      .gallery-arrow:hover { background: rgba(15,23,42,0.68); }
      .gallery-arrow:focus-visible { outline: 2px solid #fff; outline-offset: 2px; }
      .gallery-arrow svg { width: 1.25rem; height: 1.25rem; fill: none; stroke: currentColor; stroke-width: 2.4; stroke-linecap: round; stroke-linejoin: round; }
      .gallery-arrow-prev { left: 0.75rem; }
      .gallery-arrow-next { right: 0.75rem; }
      .gallery-indicators { position: absolute; inset-inline: 0; bottom: 0.75rem; z-index: 2; display: flex; justify-content: center; gap: 0.5rem; padding-inline: 1rem; }
      .gallery-dot { width: 0.5rem; height: 0.5rem; border: 0; border-radius: 999px; background: rgba(255,255,255,0.72); box-shadow: 0 2px 10px rgba(15,23,42,0.22); cursor: pointer; transition: width 300ms ease, opacity 300ms ease, background 300ms ease; }
      .gallery-dot.is-active { width: 2rem; background: #fff; opacity: 1; }
      @media (hover: hover) and (pointer: fine) {
        .gallery-arrow { opacity: 0; }
        .gallery-carousel:hover .gallery-arrow, .gallery-arrow:focus-visible { opacity: 1; }
      }
      blockquote { margin: 0 0 1rem; font-size: 1.5rem; line-height: 1.6; color: var(--site-text, #0f172a); }
      .quote-panel p { color: var(--site-muted, #475569); }
      ol { margin: 0; padding: 0; display: grid; gap: 1rem; }
      ol li { list-style: none; padding: 1.5rem; border-radius: 1.5rem; background: var(--site-panel, #f8fafc); border: 1px solid var(--site-panel-border, rgba(148,163,184,0.2)); }
      .relationship-grid p { margin: 0 0 0.75rem; color: var(--site-muted, #475569); }
      .relationship-grid span { color: var(--site-nav-text, #334155); font-weight: 600; }
      .relationship-title { margin-bottom: 1rem; color: var(--site-text, #0f172a); }
      .relationship-canvas { position: relative; min-height: 520px; overflow: hidden; border: 1px solid var(--site-panel-border, rgba(255,255,255,0.05)); border-radius: 1rem; background: rgba(255,255,255,0.05); backdrop-filter: blur(2px); }
      .relationship-lines { position: absolute; inset: 0; width: 100%; height: 100%; }
      .relationship-node { position: absolute; width: 88px; transform: translate(-50%,-50%); text-align: center; color: var(--site-text, #0f172a); }
      .relationship-node img, .relationship-node-placeholder { display: flex; width: 64px; height: 64px; align-items: center; justify-content: center; margin: 0 auto 0.35rem; border-radius: 999px; background: var(--site-placeholder-bg, #e2e8f0); object-fit: cover; font-size: 0.68rem; color: var(--site-muted, #64748b); }
      .relationship-node-name { font-size: 0.78rem; font-weight: 700; line-height: 1.2; }
      .relationship-node-name p { margin: 0; }
      .relationship-label { position: absolute; max-width: 160px; transform: translate(-50%,-50%); border-radius: 999px; background: var(--site-panel-strong, rgba(255,255,255,0.92)); padding: 0.35rem 0.6rem; font-size: 0.75rem; font-weight: 700; color: var(--site-text, #0f172a); box-shadow: 0 8px 22px var(--site-shadow, rgba(15,23,42,0.12)); }
      .relationship-label p { margin: 0; }
      .timeline-title { margin-bottom: 1.25rem; text-align: center; color: var(--site-text, #0f172a); }
      .timeline-layout { position: relative; display: flex; gap: 2rem; min-height: 360px; padding: 3rem 1.5rem; }
      .timeline-horizontal .timeline-layout { min-width: var(--timeline-horizontal-width, auto); align-items: flex-start; overflow-x: auto; padding-top: calc(var(--timeline-max-event-height, 340px) + 3.5rem); }
      .timeline-vertical .timeline-layout { display: grid; min-width: var(--timeline-vertical-width, 720px); gap: 2rem; }
      .timeline-rail { position: absolute; background: var(--site-text, #0f172a); }
      .timeline-horizontal .timeline-rail { left: 2rem; right: 2rem; top: calc(var(--timeline-max-event-height, 340px) + 1.5rem); height: 2px; }
      .timeline-vertical .timeline-rail { left: 50%; top: 2rem; bottom: 2rem; width: 2px; transform: translateX(-50%); }
      .timeline-rail::before, .timeline-rail::after { content: ""; position: absolute; width: 0.75rem; height: 0.75rem; border: 2px solid var(--site-text, #0f172a); border-radius: 999px; background: var(--site-panel-strong, #fff); }
      .timeline-horizontal .timeline-rail::before { left: 0; top: 50%; transform: translate(-50%,-50%); }
      .timeline-horizontal .timeline-rail::after { right: 0; top: 50%; transform: translate(50%,-50%); }
      .timeline-vertical .timeline-rail::before { left: 50%; top: 0; transform: translate(-50%,-50%); }
      .timeline-vertical .timeline-rail::after { left: 50%; bottom: 0; transform: translate(-50%,50%); }
      .timeline-event-card { position: relative; z-index: 1; flex: 0 0 auto; margin-top: 0; border: 1px dashed var(--site-panel-border, rgba(255,255,255,0.2)); border-radius: 1rem; background: rgba(255,255,255,0.05); box-shadow: 0 10px 26px var(--site-shadow, rgba(15,23,42,0.08)); backdrop-filter: blur(2px); }
      .timeline-vertical .timeline-event-card { flex: none; }
      .timeline-vertical .timeline-before { justify-self: end; margin-right: calc(50% + 28px); }
      .timeline-vertical .timeline-after { justify-self: start; margin-left: calc(50% + 28px); }
      .timeline-horizontal .timeline-before { margin-top: calc((var(--event-height, 300px) + 4rem) * -1); }
      .timeline-horizontal .timeline-after { margin-top: 0; }
      .timeline-connector { position: absolute; border-color: var(--site-line, rgba(100,116,139,0.75)); border-style: dashed; }
      .timeline-horizontal .timeline-connector-after { left: 50%; top: -2.5rem; height: 2.5rem; border-left-width: 1px; }
      .timeline-horizontal .timeline-connector-before { left: 50%; bottom: -2.5rem; height: 2.5rem; border-left-width: 1px; }
      .timeline-vertical .timeline-connector-after { left: -3rem; top: 2rem; width: 3rem; border-top-width: 1px; }
      .timeline-vertical .timeline-connector-before { right: -3rem; top: 2rem; width: 3rem; border-top-width: 1px; }
      .timeline-image-holder { position: absolute; overflow: hidden; border-radius: 0.85rem; background: var(--site-placeholder-bg, #e2e8f0); }
      .timeline-image-holder img { display: block; width: 100%; height: 100%; object-fit: cover; }
      .timeline-image-holder div { display: flex; height: 100%; align-items: center; justify-content: center; color: var(--site-muted, #64748b); background: var(--site-placeholder-bg, transparent); }
      .timeline-text-holder { position: absolute; border-radius: 0.75rem; padding: 0.5rem 0.6rem; color: var(--site-text, #0f172a); }
      .timeline-break-line { position: absolute; height: 1px; background: var(--site-line, rgba(15,23,42,0.32)); }
      .lore-canvas { position: relative; overflow: hidden; border: 1px dashed var(--site-panel-border, rgba(255,255,255,0.2)); border-radius: 1rem; background: rgba(255,255,255,0.05); backdrop-filter: blur(2px); }
      .lore-text-holder { position: absolute; padding: 0.5rem 0.6rem; color: var(--site-text, #0f172a); }
      .lore-title-holder { font-size: 1.35rem; font-weight: 700; }
      .lore-break-line { position: absolute; height: 1px; background: var(--site-line, rgba(15,23,42,0.32)); }
      @media (max-width: 760px) {
        body { padding: 1rem; }
        .site-header { align-items: flex-start; border-radius: 1.25rem; }
        .site-menu-button { display: inline-flex; }
        .site-nav { display: none; position: absolute; inset-inline: 0; top: calc(100% + 0.5rem); border: 1px solid var(--site-panel-border, rgba(148,163,184,0.28)); border-radius: 1.25rem; background: var(--site-nav-dropdown, rgba(255,255,255,0.96)); padding: 0.75rem; box-shadow: 0 18px 40px var(--site-shadow, rgba(15,23,42,0.14)); }
        .site-nav.is-open { display: block; }
        .site-nav ul { flex-direction: column; align-items: stretch; }
        .site-nav-children { position: static; display: flex; min-width: 0; padding-left: 1rem; border: 0; box-shadow: none; opacity: 1; pointer-events: auto; transform: none; }
        .site-subnav { border-radius: 1.25rem; }
        .site-subnav ul { flex-direction: column; }
        .site-nested-subnav { width: min(100%, 980px); }
        .two-column { grid-template-columns: 1fr; }
        .character-card { grid-template-columns: 1fr !important; }
      }
    </style>
  </head>
  <body data-template="${_template.id}" data-vibe-custom-background="${vibeSurface.isCustomImage ? "true" : "false"}" style="${bodyBackgroundStyle}">
    <div class="vibe-background-fallback"></div>
    <div class="vibe-background-scroll"></div>
    ${musicMarkup}
    ${navigationMarkup}
    ${sections}
    <script>
      const vibeAudio = document.getElementById("vibe-audio");
      const vibeAudioButton = document.querySelector("[data-vibe-audio-button]");
      const vibeAudioTimeKey = "ocworld-vibe-audio-time";
      const saveVibeAudioTime = () => {
        if (!vibeAudio) return;
        try {
          localStorage.setItem(vibeAudioTimeKey, String(vibeAudio.currentTime || 0));
        } catch {}
      };
      if (vibeAudio) {
        vibeAudio.volume = 0.55;
        try {
          const savedTime = Number(localStorage.getItem(vibeAudioTimeKey) || 0);
          if (Number.isFinite(savedTime) && savedTime > 0) {
            vibeAudio.currentTime = savedTime;
          }
        } catch {}
        const playVibeAudio = () => vibeAudio.play().then(() => {
          if (vibeAudioButton) vibeAudioButton.hidden = true;
        }).catch(() => {
          if (vibeAudioButton) vibeAudioButton.hidden = false;
        });
        playVibeAudio();
        vibeAudioButton?.addEventListener("click", playVibeAudio);
        window.setInterval(saveVibeAudioTime, 1000);
        window.addEventListener("pagehide", saveVibeAudioTime);
        window.addEventListener("beforeunload", saveVibeAudioTime);
      }

      const vibeBackgroundFallback = document.querySelector(".vibe-background-fallback");
      const vibeBackgroundScroll = document.querySelector(".vibe-background-scroll");
      const syncVibeBackground = () => {
        if (document.body.dataset.vibeCustomBackground !== "true" || !vibeBackgroundFallback || !vibeBackgroundScroll) {
          return;
        }
        const ratio = Number(getComputedStyle(document.body).getPropertyValue("--vibe-scroll-background-ratio")) || 1;
        const viewportHeight = window.innerHeight || document.documentElement.clientHeight || 1;
        const scaledImageHeight = window.innerWidth / ratio;
        const imageScrollableDistance = Math.max(0, scaledImageHeight - viewportHeight);
        const pageScrollHeight = Math.max(document.body.scrollHeight, document.documentElement.scrollHeight);
        const contentScrollableDistance = Math.max(0, pageScrollHeight - viewportHeight);

        if (imageScrollableDistance <= 1 || contentScrollableDistance <= 1) {
          vibeBackgroundFallback.style.display = "block";
          vibeBackgroundScroll.style.display = "none";
          vibeBackgroundScroll.style.transform = "translate3d(0,0,0)";
          return;
        }

        const currentScrollY = window.scrollY || document.documentElement.scrollTop || 0;
        const scrollProgress = Math.min(1, Math.max(0, currentScrollY / contentScrollableDistance));
        const backgroundOffsetY = Math.min(imageScrollableDistance, scrollProgress * imageScrollableDistance);
        vibeBackgroundFallback.style.display = "none";
        vibeBackgroundScroll.style.display = "block";
        vibeBackgroundScroll.style.height = scaledImageHeight + "px";
        vibeBackgroundScroll.style.transform = "translate3d(0," + -backgroundOffsetY + "px,0)";
      };
      window.addEventListener("scroll", syncVibeBackground, { passive: true });
      window.addEventListener("resize", syncVibeBackground);
      window.addEventListener("load", syncVibeBackground);
      syncVibeBackground();
      if ("ResizeObserver" in window) {
        const backgroundResizeObserver = new ResizeObserver(syncVibeBackground);
        backgroundResizeObserver.observe(document.body);
      }

      const siteMenuButton = document.querySelector("[data-site-menu-button]");
      const siteNav = document.querySelector("[data-site-nav]");
      siteMenuButton?.addEventListener("click", () => {
        const isOpen = siteNav?.classList.toggle("is-open");
        siteMenuButton.setAttribute("aria-expanded", String(Boolean(isOpen)));
      });
      document.querySelector("[data-hidden-back]")?.addEventListener("click", () => {
        if (window.history.length > 1) {
          window.history.back();
        } else {
          window.location.href = "index.html";
        }
      });

      document.querySelectorAll("[data-section-link], [data-page-link-href]").forEach((section) => {
        section.addEventListener("click", (event) => {
          if (event.target.closest("a,button,input,textarea,select,[contenteditable='true']")) return;
          const href = section.getAttribute("data-section-link") || section.getAttribute("data-page-link-href");
          if (href) {
            saveVibeAudioTime();
            window.location.href = href;
          }
        });
      });

      const revealSections = Array.from(document.querySelectorAll("section"));
      revealSections.forEach((section) => section.classList.add("reveal-section"));
      if ("IntersectionObserver" in window) {
        const revealObserver = new IntersectionObserver((entries) => {
          entries.forEach((entry) => {
            if (entry.isIntersecting) {
              entry.target.classList.add("is-visible");
              revealObserver.unobserve(entry.target);
            }
          });
        }, { threshold: 0.12, rootMargin: "0px 0px -8% 0px" });
        revealSections.forEach((section) => revealObserver.observe(section));
      } else {
        revealSections.forEach((section) => section.classList.add("is-visible"));
      }

      document.querySelectorAll("[data-gallery-carousel]").forEach((carousel) => {
        const track = carousel.querySelector(".gallery-carousel-track");
        const viewport = carousel.querySelector(".gallery-carousel-viewport");
        const slides = Array.from(carousel.querySelectorAll(".gallery-slide"));
        const dots = Array.from(carousel.querySelectorAll("[data-gallery-dot]"));
        const status = carousel.querySelector("[data-gallery-status]");
        if (!track || slides.length <= 1) return;
        const realCount = dots.length || slides.length;
        const loop = carousel.dataset.loop !== "false";
        const autoPlay = carousel.dataset.autoPlay !== "false";
        const interval = Math.max(1500, Number(carousel.dataset.interval || 4000));
        let index = 0;
        let virtualIndex = loop && realCount > 1 ? 1 : 0;
        let dragStartX = 0;
        let dragOffset = 0;
        let dragging = false;
        let pointerId = null;
        let hoverPaused = false;
        let interactionPaused = false;
        let resumeTimer = null;
        let autoTimer = null;

        const setTransform = () => {
          track.style.transform = "translate3d(calc(-" + virtualIndex * 100 + "% + " + dragOffset + "px),0,0)";
        };

        const sync = () => {
          slides.forEach((slide) => {
            slide.setAttribute("aria-hidden", String(Number(slide.dataset.slideIndex) !== index));
          });
          dots.forEach((dot, dotIndex) => {
            dot.classList.toggle("is-active", dotIndex === index);
            dot.setAttribute("aria-current", String(dotIndex === index));
          });
          if (status) {
            status.textContent = "Image " + (index + 1) + " of " + realCount;
          }
        };

        const pauseForInteraction = () => {
          interactionPaused = true;
          window.clearTimeout(resumeTimer);
          resumeTimer = window.setTimeout(() => {
            interactionPaused = false;
            restartAuto();
          }, Math.max(2500, interval));
          restartAuto();
        };

        const goTo = (targetIndex, userInitiated) => {
          const nextIndex = loop ? (targetIndex + realCount) % realCount : Math.min(Math.max(targetIndex, 0), realCount - 1);
          if (userInitiated) pauseForInteraction();
          index = nextIndex;
          virtualIndex = loop && realCount > 1 ? nextIndex + 1 : nextIndex;
          dragOffset = 0;
          track.classList.remove("is-dragging");
          setTransform();
          sync();
        };

        const moveBy = (delta, userInitiated) => {
          if (!loop && (index + delta < 0 || index + delta >= realCount)) return;
          if (userInitiated) pauseForInteraction();
          index = loop ? (index + delta + realCount) % realCount : Math.min(Math.max(index + delta, 0), realCount - 1);
          virtualIndex = loop && realCount > 1 ? virtualIndex + delta : index;
          dragOffset = 0;
          track.classList.remove("is-dragging");
          setTransform();
          sync();
        };

        const restartAuto = () => {
          window.clearInterval(autoTimer);
          if (!autoPlay || hoverPaused || interactionPaused || dragging || realCount <= 1) return;
          autoTimer = window.setInterval(() => moveBy(1, false), interval);
        };

        track.addEventListener("transitionend", () => {
          if (!loop || realCount <= 1) return;
          if (virtualIndex === 0) {
            track.classList.add("is-dragging");
            virtualIndex = realCount;
            setTransform();
            requestAnimationFrame(() => requestAnimationFrame(() => track.classList.remove("is-dragging")));
          } else if (virtualIndex === realCount + 1) {
            track.classList.add("is-dragging");
            virtualIndex = 1;
            setTransform();
            requestAnimationFrame(() => requestAnimationFrame(() => track.classList.remove("is-dragging")));
          }
        });

        carousel.querySelector("[data-gallery-prev]")?.addEventListener("click", () => moveBy(-1, true));
        carousel.querySelector("[data-gallery-next]")?.addEventListener("click", () => moveBy(1, true));
        dots.forEach((dot) => {
          dot.addEventListener("click", () => goTo(Number(dot.dataset.galleryDot), true));
        });
        carousel.addEventListener("keydown", (event) => {
          if (event.key === "ArrowLeft") {
            event.preventDefault();
            moveBy(-1, true);
          } else if (event.key === "ArrowRight") {
            event.preventDefault();
            moveBy(1, true);
          }
        });
        carousel.addEventListener("mouseenter", () => {
          hoverPaused = true;
          restartAuto();
        });
        carousel.addEventListener("mouseleave", () => {
          hoverPaused = false;
          restartAuto();
        });
        viewport?.addEventListener("pointerdown", (event) => {
          if (event.pointerType === "mouse" && event.button !== 0) return;
          if (event.target.closest("button,input")) return;
          pauseForInteraction();
          dragging = true;
          pointerId = event.pointerId;
          dragStartX = event.clientX;
          dragOffset = 0;
          track.classList.add("is-dragging");
          viewport.setPointerCapture(event.pointerId);
        });
        viewport?.addEventListener("pointermove", (event) => {
          if (!dragging || pointerId !== event.pointerId) return;
          dragOffset = event.clientX - dragStartX;
          setTransform();
        });
        const finishDrag = (event) => {
          if (!dragging || pointerId !== event.pointerId) return;
          const threshold = Math.min(120, viewport.clientWidth * 0.18);
          dragging = false;
          pointerId = null;
          track.classList.remove("is-dragging");
          if (Math.abs(dragOffset) > threshold) {
            moveBy(dragOffset < 0 ? 1 : -1, true);
          } else {
            dragOffset = 0;
            setTransform();
          }
          if (viewport.hasPointerCapture(event.pointerId)) {
            viewport.releasePointerCapture(event.pointerId);
          }
          restartAuto();
        };
        viewport?.addEventListener("pointerup", finishDrag);
        viewport?.addEventListener("pointercancel", finishDrag);
        setTransform();
        sync();
        restartAuto();
      });
    </script>
  </body>
</html>`;
}

export function buildStaticSiteFiles(project: ProjectData, template: TemplateSpec) {
  const normalizedProject = normalizeProject(project);
  return normalizedProject.pages.map((page) => ({
    path: pageToExportPath(page),
    html: buildStaticHtml(normalizedProject, template, page.id),
  }));
}
