interface LandingStrings {
  heroTitle: string;
  heroDescription: string;
  cta: string;
  featureHeading: string;
  featureItems: string[];
  worldHeading: string;
  templateHeading: string;
  howTitle: string;
  howSteps: { title: string; description: string }[];
  ctaFooter: string;
}

interface EditorStrings {
  title: string;
  subtitle: string;
  paletteTitle: string;
  canvasHint: string;
  settingsTitle: string;
  generalTitle: string;
  saveButton: string;
  loadButton: string;
  exportButton: string;
  duplicateButton: string;
  removeButton: string;
  emptyCanvas: string;
}

export type Translations = {
  navigation: {
    editor: string;
    templates: string;
    howItWorks: string;
  };
  landing: LandingStrings;
  editor: EditorStrings;
};

export const translations: { en: Translations } = {
  en: {
    navigation: {
      editor: "Editor",
      templates: "Styles",
      howItWorks: "How it works",
    },
    landing: {
      heroTitle: "Build calm story pages with a simple editor.",
      heroDescription: "OCWorld helps creators turn characters, notes, and images into polished page layouts for sharing ideas and scenes.",
      cta: "Start building",
      featureHeading: "A cleaner way to shape your story.",
      featureItems: [
        "Edit text and images directly on the page",
        "Arrange sections in a calm vertical editor",
        "Save drafts locally and export a static page",
      ],
      worldHeading: "Edit with clarity and breathing room.",
      templateHeading: "A gentle, editorial first draft experience.",
      howTitle: "How it works",
      howSteps: [
        { title: "Start from a page", description: "Choose a calm starting style and begin with a simple layout." },
        { title: "Add sections", description: "Drop in headers, images, notes, timelines, and gallery cards." },
        { title: "Save or export", description: "Keep a local draft or download a shareable static page." },
      ],
      ctaFooter: "Make your next story page feel quiet, thoughtful, and ready to share.",
    },
    editor: {
      title: "OCWorld Studio",
      subtitle: "A calm editing canvas for original creators and storytellers.",
      paletteTitle: "Section library",
      canvasHint: "Drag a section onto the page or tap to add.",
      settingsTitle: "Section settings",
      generalTitle: "Studio settings",
      saveButton: "Save draft",
      loadButton: "Load draft",
      exportButton: "Export page",
      duplicateButton: "Duplicate section",
      removeButton: "Remove section",
      emptyCanvas: "Your page is empty — add a section to begin.",
    },
  },
};
