import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router";
import {
  Terminal,
  FolderOpen,
  Clock,
  Zap,
  Plus,
  ArrowRight,
  CheckCircle,
  XCircle,
  AlertTriangle,
} from "lucide-react";
import { format } from "date-fns";
import { toast } from "sonner";
import * as api from "../api";
import type { Project, Execution } from "../types";
import StatusBadge from "../components/StatusBadge";
import { useAuth } from "../AuthContext";

function StatCard({
  icon: Icon,
  label,
  value,
  color,
}: {
  icon: typeof Terminal;
  label: string;
  value: string | number;
  color: string;
}) {
  return (
    <div className="bg-card border border-border rounded-2xl p-5 flex items-center gap-4">
      <div
        className={`w-12 h-12 rounded-xl flex items-center justify-center ${color}`}
      >
        <Icon className="w-5 h-5" />
      </div>
      <div>
        <p className="text-muted-foreground text-xs font-medium uppercase tracking-wider">
          {label}
        </p>
        <p className="text-2xl font-bold text-foreground mt-0.5">{value}</p>
      </div>
    </div>
  );
}

const LANGS_SUPPORTED = 10;

export default function Dashboard() {
  const navigate = useNavigate();
  // FIX: need user.userId to call the user-scoped executions endpoint
  const { user } = useAuth();
  const [projects, setProjects] = useState<Project[]>([]);
  const [executions, setExecutions] = useState<Execution[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user?.userId) return;

    // FIX: was api.getExecutions() — hits GET /api/executions (global, no user scope)
    //      correct: getUserExecutions(userId) — hits GET /api/executions/user/:userId
    Promise.all([
      api.getProjects(),
      api.getUserExecutions(user.userId),
    ])
      .then(([p, e]) => {
        setProjects(p);
        setExecutions(e);
      })
      // FIX: was catch(() => {}) — silently swallowed errors, blank screen with no feedback
      .catch((err: Error) => {
        toast.error(err.message ?? "Failed to load dashboard data");
      })
      .finally(() => setLoading(false));
  }, [user?.userId]);

  const recent = projects.slice(0, 4);
  const recentExecs = executions.slice(0, 5);
  const latestExecTime = executions[0]?.executionTime ?? 0;

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-8">
      {/* Hero */}
      <div className="relative overflow-hidden bg-card border border-border rounded-2xl p-8 md:p-10">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/10 via-transparent to-transparent pointer-events-none" />
        <div className="relative">
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-primary/15 text-primary text-xs font-semibold rounded-full mb-4 font-mono">
            <span className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse" />
            Live Compiler
          </div>
          <h1 className="text-3xl md:text-4xl font-bold text-white mb-2">
            Welcome to SkillDzire{" "}
            <span className="text-primary">CodeLab</span>
          </h1>
          <p className="text-muted-foreground text-base md:text-lg max-w-xl">
            Practice, Build, Compile and Learn with a secure multi-language
            cloud IDE.
          </p>
          <div className="flex flex-wrap gap-3 mt-6">
            <button
              onClick={() => navigate("/compiler")}
              className="flex items-center gap-2 px-5 py-2.5 bg-primary text-white rounded-xl font-semibold hover:bg-primary/90 transition-colors"
            >
              <Terminal className="w-4 h-4" /> Open Compiler
            </button>
            <button
              onClick={() => navigate("/projects")}
              className="flex items-center gap-2 px-5 py-2.5 bg-muted text-foreground rounded-xl font-semibold hover:bg-secondary transition-colors"
            >
              <Plus className="w-4 h-4" /> New Project
            </button>
            <button
              onClick={() => navigate("/history")}
              className="flex items-center gap-2 px-5 py-2.5 bg-muted text-foreground rounded-xl font-semibold hover:bg-secondary transition-colors"
            >
              <Clock className="w-4 h-4" /> View History
            </button>
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <StatCard
          icon={FolderOpen}
          label="Total Projects"
          value={projects.length}
          color="bg-blue-500/15 text-blue-400"
        />
        <StatCard
          icon={Zap}
          label="Total Executions"
          value={executions.length}
          color="bg-primary/15 text-primary"
        />
        <StatCard
          icon={Terminal}
          label="Languages"
          value={LANGS_SUPPORTED}
          color="bg-purple-500/15 text-purple-400"
        />
        <StatCard
          icon={Clock}
          label="Last Exec (ms)"
          value={latestExecTime || "—"}
          color="bg-green-500/15 text-green-400"
        />
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        {/* Recent Projects */}
        <div className="bg-card border border-border rounded-2xl p-5">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-semibold text-foreground">Recent Projects</h2>
            <Link
              to="/projects"
              className="text-xs text-primary hover:underline flex items-center gap-1"
            >
              View all <ArrowRight className="w-3 h-3" />
            </Link>
          </div>
          {loading ? (
            <div className="space-y-3">
              {[...Array(3)].map((_, i) => (
                <div
                  key={i}
                  className="h-14 bg-muted rounded-xl animate-pulse"
                />
              ))}
            </div>
          ) : recent.length === 0 ? (
            <p className="text-muted-foreground text-sm text-center py-8">
              No projects yet.
            </p>
          ) : (
            <div className="space-y-2">
              {recent.map((p) => (
                <Link
                  key={p._id}
                  to={`/projects/${p._id}`}
                  className="flex items-center gap-3 p-3 rounded-xl hover:bg-muted transition-colors group"
                >
                  <div className="w-9 h-9 rounded-lg bg-primary/15 flex items-center justify-center shrink-0">
                    <FolderOpen className="w-4 h-4 text-primary" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-foreground truncate">
                      {p.title}
                    </p>
                    <p className="text-xs text-muted-foreground font-mono">
                      {p.language}
                    </p>
                  </div>
                  {/* FIX: use updatedAt (backend sorts by it) with createdAt fallback */}
                  <span className="text-xs text-muted-foreground shrink-0">
                    {format(new Date(p.updatedAt ?? p.createdAt), "MMM d")}
                  </span>
                </Link>
              ))}
            </div>
          )}
        </div>

        {/* Recent Executions */}
        <div className="bg-card border border-border rounded-2xl p-5">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-semibold text-foreground">Recent Executions</h2>
            <Link
              to="/history"
              className="text-xs text-primary hover:underline flex items-center gap-1"
            >
              View all <ArrowRight className="w-3 h-3" />
            </Link>
          </div>
          {loading ? (
            <div className="space-y-3">
              {[...Array(3)].map((_, i) => (
                <div
                  key={i}
                  className="h-14 bg-muted rounded-xl animate-pulse"
                />
              ))}
            </div>
          ) : recentExecs.length === 0 ? (
            <p className="text-muted-foreground text-sm text-center py-8">
              No executions yet.
            </p>
          ) : (
            <div className="space-y-2">
              {recentExecs.map((e) => (
                <div
                  key={e._id}
                  className="flex items-center gap-3 p-3 rounded-xl hover:bg-muted transition-colors"
                >
                  <div
                    className={`w-9 h-9 rounded-lg flex items-center justify-center shrink-0 ${
                      e.status === "completed"
                        ? "bg-green-500/15"
                        : e.status === "timeout"
                        ? "bg-yellow-500/15"
                        : "bg-red-500/15"
                    }`}
                  >
                    {e.status === "completed" ? (
                      <CheckCircle className="w-4 h-4 text-green-400" />
                    ) : e.status === "timeout" ? (
                      <AlertTriangle className="w-4 h-4 text-yellow-400" />
                    ) : (
                      <XCircle className="w-4 h-4 text-red-400" />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-foreground font-mono">
                      {e.language}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {e.executionTime}ms
                    </p>
                  </div>
                  <StatusBadge status={e.status} small />
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}