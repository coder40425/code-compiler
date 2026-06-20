import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router";
import {
  Terminal,
  RotateCcw,
  GitBranch,
  ArrowLeft,
  Loader2,
  AlertCircle,
} from "lucide-react";
import { format } from "date-fns";
import { toast } from "sonner";
import * as api from "../api";
import type { Project, Version } from "../types";
import { useCompiler } from "../CompilerContext";

export default function ProjectDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { loadProjectIntoCompiler, activeProjectId } = useCompiler();
  const [project, setProject] = useState<Project | null>(null);
  const [versions, setVersions] = useState<Version[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [restoringId, setRestoringId] = useState<string | null>(null);

  useEffect(() => {
    if (!id) return;
    setLoading(true);
    setLoadError(null);
    Promise.all([api.getProject(id), api.getVersions(id)])
      .then(([p, v]) => {
        setProject(p);
        setVersions(v);
      })
      .catch((err: Error) => {
        // FIX: was just toast.error — now also sets loadError so we can show
        //      a meaningful UI state instead of "Project not found" for network errors
        setLoadError(err.message ?? "Failed to load project");
        toast.error(err.message ?? "Failed to load project");
      })
      .finally(() => setLoading(false));
  }, [id]);

  const handleRestore = async (versionId: string) => {
    if (!id) return;
    setRestoringId(versionId);
    try {
      const updated = await api.restoreVersion(id, versionId);
      setProject(updated);

      // FIX: if this project is currently open in the compiler, sync the
      //      compiler context so the user doesn't see stale code when they go back
      if (activeProjectId === id) {
        loadProjectIntoCompiler(
          updated._id,
          updated.title,
          updated.language,
          updated.currentCode
        );
      }

      toast.success("Version restored");
    } catch (e) {
      toast.error((e as Error).message);
    } finally {
      setRestoringId(null);
    }
  };

  const handleOpenCompiler = () => {
    if (!project) return;
    loadProjectIntoCompiler(
      project._id,
      project.title,
      project.language,
      project.currentCode
    );
    navigate("/compiler");
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-6 h-6 animate-spin text-primary" />
      </div>
    );
  }

  // FIX: was a single "Project not found" for all failure modes.
  //      Now distinguishes: network/auth error vs actual 404
  if (loadError || !project) {
    return (
      <div className="flex flex-col items-center justify-center h-64 text-muted-foreground gap-3">
        <AlertCircle className="w-8 h-8 text-red-400" />
        <p className="text-sm font-medium">
          {loadError ?? "Project not found."}
        </p>
        <button
          onClick={() => navigate("/projects")}
          className="text-primary text-sm underline"
        >
          Back to projects
        </button>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-5xl mx-auto space-y-6">
      <div className="flex items-center gap-3">
        <button
          onClick={() => navigate("/projects")}
          className="p-2 bg-muted rounded-xl text-muted-foreground hover:text-foreground hover:bg-secondary transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
        </button>
        <div className="flex-1">
          <h1 className="text-xl font-bold text-foreground">{project.title}</h1>
          <p className="text-xs text-muted-foreground font-mono">
            {project.language} · Created{" "}
            {format(new Date(project.createdAt), "MMM d, yyyy")}
          </p>
        </div>
        <button
          onClick={handleOpenCompiler}
          className="flex items-center gap-2 px-4 py-2 bg-primary text-white rounded-xl text-sm font-bold hover:bg-primary/90 transition-colors"
        >
          <Terminal className="w-4 h-4" /> Open in Compiler
        </button>
      </div>

      {/* Current code */}
      <div className="bg-card border border-border rounded-2xl overflow-hidden">
        <div className="flex items-center gap-2 px-4 py-3 border-b border-border">
          <GitBranch className="w-4 h-4 text-muted-foreground" />
          <span className="text-sm font-semibold text-foreground">
            Current Code
          </span>
        </div>
        <pre className="p-5 text-sm font-mono text-foreground/90 overflow-auto max-h-64 bg-[#0d0d0d] leading-relaxed">
          {project.currentCode || (
            <span className="text-muted-foreground italic">No code yet.</span>
          )}
        </pre>
      </div>

      {/* Version timeline */}
      <div className="bg-card border border-border rounded-2xl overflow-hidden">
        <div className="flex items-center gap-2 px-4 py-3 border-b border-border">
          <GitBranch className="w-4 h-4 text-muted-foreground" />
          <span className="text-sm font-semibold text-foreground">
            Version History
          </span>
          <span className="ml-auto text-xs text-muted-foreground">
            {versions.length} version{versions.length !== 1 ? "s" : ""}
          </span>
        </div>
        {versions.length === 0 ? (
          <p className="text-muted-foreground text-sm text-center py-10">
            No versions saved yet.
          </p>
        ) : (
          <div className="divide-y divide-border">
            {versions.map((v) => (
              <div
                key={v._id}
                className="flex items-center gap-4 px-4 py-3 hover:bg-muted/50 transition-colors"
              >
                <div className="w-8 h-8 rounded-full bg-primary/15 flex items-center justify-center shrink-0">
                  <span className="text-xs font-bold text-primary font-mono">
                    v{v.versionNumber}
                  </span>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-mono text-foreground truncate">
                    {v.code.slice(0, 60)}
                    {v.code.length > 60 ? "…" : ""}
                  </p>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    {format(new Date(v.createdAt), "MMM d, yyyy · HH:mm")}
                  </p>
                </div>
                <button
                  onClick={() => handleRestore(v._id)}
                  disabled={restoringId === v._id}
                  className="flex items-center gap-1.5 px-3 py-1.5 bg-muted border border-border text-foreground text-xs font-semibold rounded-lg hover:border-primary/50 hover:text-primary transition-colors disabled:opacity-50 shrink-0"
                >
                  {restoringId === v._id ? (
                    <Loader2 className="w-3 h-3 animate-spin" />
                  ) : (
                    <RotateCcw className="w-3 h-3" />
                  )}
                  Restore
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}