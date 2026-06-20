import { useEffect, useState } from "react";
import { useNavigate } from "react-router";
import {
  Plus,
  Trash2,
  ExternalLink,
  Pencil,
  FolderOpen,
  Loader2,
} from "lucide-react";
import { format } from "date-fns";
import { toast } from "sonner";
import * as api from "../api";
import type { Project } from "../types";
import EmptyState from "../components/EmptyState";
import { useCompiler, LANGUAGES } from "../CompilerContext";

const LANG_COLORS: Record<string, string> = {
  python: "bg-blue-500/15 text-blue-400",
  javascript: "bg-yellow-500/15 text-yellow-400",
  c: "bg-gray-500/15 text-gray-400",
  cpp: "bg-gray-500/15 text-gray-300",
  java: "bg-orange-500/15 text-orange-400",
  go: "bg-cyan-500/15 text-cyan-400",
  php: "bg-purple-500/15 text-purple-400",
  ruby: "bg-red-500/15 text-red-400",
  csharp: "bg-blue-600/15 text-blue-300",
  kotlin: "bg-pink-500/15 text-pink-400",
};

function NewProjectModal({
  onClose,
  onCreated,
}: {
  onClose: () => void;
  onCreated: (p: Project) => void;
}) {
  const [title, setTitle] = useState("");
  const [language, setLanguage] = useState("python");
  const [loading, setLoading] = useState(false);

  const handleCreate = async () => {
    if (!title.trim()) {
      toast.error("Project name required");
      return;
    }
    setLoading(true);
    try {
      const p = await api.createProject({
        title: title.trim(),
        language,
        currentCode: "",
      });
      onCreated(p);
      toast.success(`Project "${p.title}" created`);
    } catch (e) {
      toast.error((e as Error).message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
      <div className="bg-card border border-border rounded-2xl p-6 w-full max-w-md shadow-2xl">
        <h2 className="text-lg font-bold text-foreground mb-5">New Project</h2>
        <label className="block text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1.5">
          Project Name
        </label>
        <input
          autoFocus
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && handleCreate()}
          placeholder="My awesome project"
          className="w-full bg-muted text-foreground text-sm px-3 py-2.5 rounded-xl border border-border focus:border-primary focus:ring-1 focus:ring-primary/30 outline-none mb-4"
        />
        <label className="block text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1.5">
          Language
        </label>
        <select
          value={language}
          onChange={(e) => setLanguage(e.target.value)}
          className="w-full bg-muted text-foreground text-sm px-3 py-2.5 rounded-xl border border-border focus:border-primary outline-none mb-6"
        >
          {LANGUAGES.map((l) => (
            <option key={l.value} value={l.value}>
              {l.label}
            </option>
          ))}
        </select>
        <div className="flex gap-3">
          <button
            onClick={onClose}
            className="flex-1 py-2.5 bg-muted text-foreground rounded-xl text-sm font-semibold hover:bg-secondary transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleCreate}
            disabled={loading}
            className="flex-1 py-2.5 bg-primary text-white rounded-xl text-sm font-bold hover:bg-primary/90 transition-colors flex items-center justify-center gap-2 disabled:opacity-60"
          >
            {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : null}
            Create
          </button>
        </div>
      </div>
    </div>
  );
}

export default function Projects() {
  const navigate = useNavigate();
  const { loadProjectIntoCompiler } = useCompiler();
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [editId, setEditId] = useState<string | null>(null);
  const [editTitle, setEditTitle] = useState("");

  useEffect(() => {
    api
      .getProjects()
      .then(setProjects)
      // FIX: was catch(() => {}) — user saw blank list with no explanation
      .catch((err: Error) => toast.error(err.message ?? "Failed to load projects"))
      .finally(() => setLoading(false));
  }, []);

  const handleDelete = async (id: string, title: string) => {
    if (!confirm(`Delete "${title}"?`)) return;
    setDeletingId(id);
    try {
      await api.deleteProject(id);
      setProjects((p) => p.filter((x) => x._id !== id));
      toast.success("Project deleted");
    } catch (e) {
      toast.error((e as Error).message);
    } finally {
      setDeletingId(null);
    }
  };

  const handleRename = async (id: string) => {
    if (!editTitle.trim()) return;
    try {
      const updated = await api.updateProject(id, { title: editTitle.trim() });
      setProjects((p) => p.map((x) => (x._id === id ? updated : x)));
      toast.success("Renamed");
    } catch (e) {
      toast.error((e as Error).message);
    } finally {
      setEditId(null);
    }
  };

  const handleOpen = (p: Project) => {
    loadProjectIntoCompiler(p._id, p.title, p.language, p.currentCode);
    navigate("/compiler");
  };

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Projects</h1>
          <p className="text-muted-foreground text-sm mt-0.5">
            {projects.length} project{projects.length !== 1 ? "s" : ""}
          </p>
        </div>
        <button
          onClick={() => setShowModal(true)}
          className="flex items-center gap-2 px-4 py-2 bg-primary text-white rounded-xl text-sm font-bold hover:bg-primary/90 transition-colors shadow-lg shadow-primary/20"
        >
          <Plus className="w-4 h-4" /> New Project
        </button>
      </div>

      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {[...Array(6)].map((_, i) => (
            <div
              key={i}
              className="h-40 bg-card border border-border rounded-2xl animate-pulse"
            />
          ))}
        </div>
      ) : projects.length === 0 ? (
        <EmptyState
          icon={FolderOpen}
          title="No projects yet"
          description="Create your first project to get started."
          action={{ label: "New Project", onClick: () => setShowModal(true) }}
        />
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {projects.map((p) => (
            <div
              key={p._id}
              className="bg-card border border-border rounded-2xl p-5 flex flex-col gap-4 hover:border-primary/30 transition-colors group"
            >
              <div className="flex items-start justify-between gap-2">
                <div className="flex-1 min-w-0">
                  {editId === p._id ? (
                    <input
                      autoFocus
                      value={editTitle}
                      onChange={(e) => setEditTitle(e.target.value)}
                      onBlur={() => handleRename(p._id)}
                      onKeyDown={(e) =>
                        e.key === "Enter" && handleRename(p._id)
                      }
                      className="bg-muted text-foreground text-sm font-semibold px-2 py-1 rounded-lg border border-primary outline-none w-full"
                    />
                  ) : (
                    <h3 className="text-sm font-semibold text-foreground truncate">
                      {p.title}
                    </h3>
                  )}
                  <span
                    className={`inline-flex items-center mt-1.5 px-2 py-0.5 rounded-full text-xs font-mono font-medium ${
                      LANG_COLORS[p.language] ?? "bg-muted text-muted-foreground"
                    }`}
                  >
                    {p.language}
                  </span>
                </div>
              </div>
              {/* FIX: show updatedAt (what backend sorts by), fallback to createdAt */}
              <p className="text-xs text-muted-foreground">
                Updated{" "}
                {format(new Date(p.updatedAt ?? p.createdAt), "MMM d, yyyy")}
              </p>
              <div className="flex gap-2 mt-auto">
                <button
                  onClick={() => handleOpen(p)}
                  className="flex-1 flex items-center justify-center gap-1.5 py-2 bg-primary/15 text-primary rounded-xl text-xs font-semibold hover:bg-primary/25 transition-colors"
                >
                  <ExternalLink className="w-3.5 h-3.5" /> Open
                </button>
                <button
                  onClick={() => {
                    setEditId(p._id);
                    setEditTitle(p.title);
                  }}
                  className="p-2 bg-muted rounded-xl text-muted-foreground hover:text-foreground hover:bg-secondary transition-colors"
                >
                  <Pencil className="w-3.5 h-3.5" />
                </button>
                <button
                  onClick={() => handleDelete(p._id, p.title)}
                  disabled={deletingId === p._id}
                  className="p-2 bg-muted rounded-xl text-muted-foreground hover:text-red-400 hover:bg-red-500/10 transition-colors disabled:opacity-50"
                >
                  {deletingId === p._id ? (
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  ) : (
                    <Trash2 className="w-3.5 h-3.5" />
                  )}
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {showModal && (
        <NewProjectModal
          onClose={() => setShowModal(false)}
          onCreated={(p) => {
            setProjects((prev) => [p, ...prev]);
            setShowModal(false);
          }}
        />
      )}
    </div>
  );
}