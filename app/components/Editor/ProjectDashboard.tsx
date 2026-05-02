"use client";

import type { ChangeEvent } from "react";
import type { ProjectData } from "../../lib/ocworld";

export interface LocalProjectRecord {
  id: string;
  name: string;
  createdAt: string;
  updatedAt: string;
  project: ProjectData;
}

interface ProjectDashboardProps {
  open: boolean;
  projects: LocalProjectRecord[];
  activeProjectId: string;
  saveStatusText: string;
  onClose: () => void;
  onCreateProject: () => void;
  onOpenProject: (projectId: string) => void;
  onRenameProject: (projectId: string, name: string) => void;
  onDuplicateProject: (projectId: string) => void;
  onDeleteProject: (projectId: string) => void;
  onExportProject: (projectId: string) => void;
  onImportProject: (file: File) => void;
}

function formatUpdatedAt(value: string) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "Just now";
  return date.toLocaleDateString(undefined, {
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });
}

export default function ProjectDashboard({
  open,
  projects,
  activeProjectId,
  saveStatusText,
  onClose,
  onCreateProject,
  onOpenProject,
  onRenameProject,
  onDuplicateProject,
  onDeleteProject,
  onExportProject,
  onImportProject,
}: ProjectDashboardProps) {
  if (!open) return null;

  const handleImport = (event: ChangeEvent<HTMLInputElement>) => {
    const input = event.currentTarget;
    const file = input.files?.[0];
    input.value = "";
    if (file) {
      onImportProject(file);
    }
  };

  return (
    <div className="fixed inset-0 z-[70] overflow-y-auto bg-stone-950/55 px-4 py-6 backdrop-blur-sm">
      <div className="mx-auto max-w-5xl overflow-hidden rounded-[1.7rem] border border-stone-300 bg-[#fffdf8] shadow-[0_28px_90px_rgba(41,32,22,0.32)]">
        <div
          className="border-b border-stone-300/70 px-5 py-5 sm:px-7"
          style={{
            backgroundImage:
              "linear-gradient(rgba(90,80,66,0.08) 1px, transparent 1px), linear-gradient(90deg, rgba(90,80,66,0.08) 1px, transparent 1px)",
            backgroundSize: "24px 24px",
          }}
        >
          <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
            <div>
              <p className="text-xs uppercase tracking-[0.28em] text-stone-500">Local library</p>
              <h2 className="mt-2 font-serif text-3xl font-semibold tracking-[-0.04em] text-slate-950">
                Your OCWorld Projects
              </h2>
              <p className="mt-2 text-sm leading-6 text-stone-600">
                Stored on this browser only. {saveStatusText}
              </p>
            </div>
            <div className="flex flex-wrap gap-2">
              <button
                type="button"
                onClick={onCreateProject}
                className="rounded-full bg-slate-950 px-4 py-2 text-sm font-semibold text-white shadow-sm transition hover:-translate-y-0.5 hover:bg-slate-800"
              >
                New project
              </button>
              <label className="rounded-full border border-stone-300 bg-white/75 px-4 py-2 text-sm font-semibold text-slate-800 shadow-sm transition hover:-translate-y-0.5 hover:bg-white">
                Import JSON
                <input type="file" accept="application/json,.json" className="hidden" onChange={handleImport} />
              </label>
              <button
                type="button"
                onClick={onClose}
                className="rounded-full border border-stone-300 bg-white/75 px-4 py-2 text-sm font-semibold text-slate-800 shadow-sm transition hover:bg-white"
              >
                Close
              </button>
            </div>
          </div>
        </div>

        <div className="grid gap-4 p-5 sm:p-7">
          {projects.length ? (
            projects
              .slice()
              .sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime())
              .map((project) => {
                const isActive = project.id === activeProjectId;
                return (
                  <article
                    key={project.id}
                    className={`rounded-[1.25rem] border p-4 shadow-sm transition ${
                      isActive
                        ? "border-slate-700 bg-slate-950 text-white shadow-slate-900/15"
                        : "border-stone-300/75 bg-white/70 hover:-translate-y-0.5 hover:bg-white hover:shadow-md"
                    }`}
                  >
                    <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                      <div className="min-w-0 flex-1">
                        <input
                          value={project.name}
                          onChange={(event) => onRenameProject(project.id, event.target.value)}
                          aria-label="Project name"
                          className={`w-full rounded-xl border px-3 py-2 font-serif text-xl font-semibold tracking-[-0.03em] outline-none transition ${
                            isActive
                              ? "border-white/20 bg-white/10 text-white placeholder:text-white/45 focus:bg-white/15"
                              : "border-transparent bg-transparent text-slate-950 placeholder:text-stone-400 focus:border-stone-300 focus:bg-white"
                          }`}
                          placeholder="Untitled OCWorld"
                        />
                        <div className={`mt-2 flex flex-wrap gap-3 text-xs ${isActive ? "text-stone-300" : "text-stone-500"}`}>
                          <span>{project.project.pages.length} page{project.project.pages.length === 1 ? "" : "s"}</span>
                          <span>{project.project.pages.reduce((total, page) => total + page.sections.length, 0)} section{project.project.pages.reduce((total, page) => total + page.sections.length, 0) === 1 ? "" : "s"}</span>
                          <span>Updated {formatUpdatedAt(project.updatedAt)}</span>
                        </div>
                      </div>

                      <div className="flex flex-wrap gap-2">
                        <button
                          type="button"
                          onClick={() => onOpenProject(project.id)}
                          disabled={isActive}
                          className={`rounded-full px-3 py-2 text-sm font-semibold transition disabled:cursor-default ${
                            isActive
                              ? "bg-white/12 text-white/70"
                              : "border border-stone-300 bg-white/80 text-slate-800 hover:bg-white"
                          }`}
                        >
                          {isActive ? "Open" : "Open"}
                        </button>
                        <button
                          type="button"
                          onClick={() => onDuplicateProject(project.id)}
                          className={`rounded-full px-3 py-2 text-sm font-semibold transition ${
                            isActive ? "border border-white/18 bg-white/10 text-white hover:bg-white/15" : "border border-stone-300 bg-white/80 text-slate-800 hover:bg-white"
                          }`}
                        >
                          Duplicate
                        </button>
                        <button
                          type="button"
                          onClick={() => onExportProject(project.id)}
                          className={`rounded-full px-3 py-2 text-sm font-semibold transition ${
                            isActive ? "border border-white/18 bg-white/10 text-white hover:bg-white/15" : "border border-stone-300 bg-white/80 text-slate-800 hover:bg-white"
                          }`}
                        >
                          Export Project
                        </button>
                        <button
                          type="button"
                          onClick={() => onDeleteProject(project.id)}
                          disabled={projects.length <= 1}
                          className="rounded-full border border-rose-200 bg-rose-50 px-3 py-2 text-sm font-semibold text-rose-700 transition hover:bg-rose-100 disabled:cursor-not-allowed disabled:opacity-40"
                        >
                          Delete
                        </button>
                      </div>
                    </div>
                  </article>
                );
              })
          ) : (
            <div className="rounded-[1.25rem] border border-dashed border-stone-300 bg-white/60 p-10 text-center">
              <p className="font-serif text-2xl font-semibold tracking-[-0.03em] text-slate-950">No projects yet.</p>
              <p className="mt-2 text-sm text-stone-600">Start a new OCWorld sketchbook when you are ready.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
