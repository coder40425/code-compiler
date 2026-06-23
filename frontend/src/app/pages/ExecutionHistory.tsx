import { useEffect, useState } from "react";
import {
  Clock,
  CheckCircle,
  XCircle,
  AlertTriangle,
  ChevronDown,
  ChevronUp,
  Loader2,
  Terminal,
} from "lucide-react";
import { format } from "date-fns";
import { toast } from "sonner";
import * as api from "../api";
import type { Execution } from "../types";
import { useAuth } from "../AuthContext";
import StatusBadge from "../components/StatusBadge";
import EmptyState from "../components/EmptyState";

const STATUS_ICON = {
  completed: <CheckCircle className="w-4 h-4 text-green-400" />,
  runtime_error: <XCircle className="w-4 h-4 text-red-400" />,
  compile_error: <XCircle className="w-4 h-4 text-red-400" />,
  timeout: <AlertTriangle className="w-4 h-4 text-yellow-400" />,
};

const STATUS_BG = {
  completed: "bg-green-500/15",
  runtime_error: "bg-red-500/15",
  compile_error: "bg-red-500/15",
  timeout: "bg-yellow-500/15",
};

const LANG_ICONS: Record<string, string> = {
  python: "🐍",
  javascript: "🟨",
  c: "⚙️",
  cpp: "⚙️",
  java: "☕",
  go: "🐹",
  php: "🐘",
  ruby: "💎",
  csharp: "🔷",
  kotlin: "🎯",
};

function ExecutionRow({ execution }: { execution: Execution }) {
  const [expanded, setExpanded] = useState(false);

  return (
    <div className="bg-card border border-border rounded-2xl overflow-hidden transition-all">
      {/* Header row */}
      <button
        onClick={() => setExpanded((v) => !v)}
        className="w-full flex items-center gap-4 px-5 py-4 hover:bg-muted/40 transition-colors text-left"
      >
        {/* Status icon */}
        <div
          className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${
            STATUS_BG[execution.status] ?? "bg-muted"
          }`}
        >
          {STATUS_ICON[execution.status] ?? (
            <Clock className="w-4 h-4 text-muted-foreground" />
          )}
        </div>

        {/* Language + job id */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <span className="text-sm font-semibold text-foreground font-mono">
              {LANG_ICONS[execution.language] ?? "💻"} {execution.language}
            </span>
            <StatusBadge status={execution.status} small />
          </div>
          <p className="text-xs text-muted-foreground font-mono truncate mt-0.5">
            {execution.jobId}
          </p>
        </div>

        {/* Exec time + date */}
        <div className="text-right shrink-0 hidden sm:block">
          <p className="text-sm font-medium text-foreground">
            {execution.executionTime}ms
          </p>
          <p className="text-xs text-muted-foreground">
            {format(new Date(execution.createdAt), "MMM d · HH:mm")}
          </p>
        </div>

        {/* Expand toggle */}
        <div className="shrink-0 text-muted-foreground ml-2">
          {expanded ? (
            <ChevronUp className="w-4 h-4" />
          ) : (
            <ChevronDown className="w-4 h-4" />
          )}
        </div>
      </button>

      {/* Expanded detail */}
      {expanded && (
        <div className="border-t border-border divide-y divide-border/60">
          {/* Code */}
          <div className="px-5 py-4">
            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2 font-mono">
              Code
            </p>
            <pre className="text-sm font-mono text-foreground/90 bg-[#0d0d0d] rounded-xl p-4 overflow-auto max-h-48 leading-relaxed">
              {execution.code || (
                <span className="text-muted-foreground italic">empty</span>
              )}
            </pre>
          </div>

          {/* Stdin (only if present) */}
          {execution.stdin && (
            <div className="px-5 py-4">
              <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2 font-mono">
                Stdin
              </p>
              <pre className="text-sm font-mono text-foreground/80 bg-[#0d0d0d] rounded-xl p-4 overflow-auto max-h-24 leading-relaxed">
                {execution.stdin}
              </pre>
            </div>
          )}

          {/* Stdout */}
          <div className="px-5 py-4">
            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2 font-mono">
              Output
            </p>
            {execution.stdout ? (
              <pre className="text-sm font-mono text-green-400 bg-[#0d0d0d] rounded-xl p-4 overflow-auto max-h-40 leading-relaxed whitespace-pre-wrap">
                {execution.stdout}
              </pre>
            ) : (
              <p className="text-xs text-muted-foreground italic">No output.</p>
            )}
          </div>

          {/* Stderr (only if present) */}
          {execution.stderr && (
            <div className="px-5 py-4">
              <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2 font-mono">
                Errors
              </p>
              <pre className="text-sm font-mono text-red-400 bg-[#0d0d0d] rounded-xl p-4 overflow-auto max-h-40 leading-relaxed whitespace-pre-wrap">
                {execution.stderr}
              </pre>
            </div>
          )}

          {/* Meta row */}
          <div className="px-5 py-3 flex flex-wrap gap-6 text-xs text-muted-foreground bg-muted/20">
            <span>
              <span className="uppercase tracking-wider font-semibold">
                Job ID
              </span>{" "}
              <span className="font-mono text-foreground/70">
                {execution.jobId}
              </span>
            </span>
            <span>
              <span className="uppercase tracking-wider font-semibold">
                Time
              </span>{" "}
              <span className="font-mono text-foreground/70">
                {execution.executionTime}ms
              </span>
            </span>
            <span>
              <span className="uppercase tracking-wider font-semibold">
                Date
              </span>{" "}
              <span className="font-mono text-foreground/70">
                {format(new Date(execution.createdAt), "MMM d, yyyy · HH:mm:ss")}
              </span>
            </span>
          </div>
        </div>
      )}
    </div>
  );
}

export default function ExecutionHistory() {
  const { user } = useAuth();
  const [executions, setExecutions] = useState<Execution[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<Execution["status"] | "all">("all");

  useEffect(() => {
    if (!user?.userId) return;

    // Uses GET /api/executions/user/:userId — scoped to this user only
    api
      .getUserExecutions(user.userId)
      .then(setExecutions)
      .catch((err: Error) => {
        toast.error(err.message ?? "Failed to load execution history");
      })
      .finally(() => setLoading(false));
  }, [user?.userId]);

  const filtered =
    filter === "all"
      ? executions
      : executions.filter((e) => e.status === filter);

  const counts = {
    all: executions.length,
    completed: executions.filter((e) => e.status === "completed").length,
    runtime_error: executions.filter((e) => e.status === "runtime_error").length,
    compile_error: executions.filter((e) => e.status === "compile_error").length,
    timeout: executions.filter((e) => e.status === "timeout").length,
  };

  const FILTERS: { label: string; value: Execution["status"] | "all" }[] = [
    { label: `All (${counts.all})`, value: "all" },
    { label: `Completed (${counts.completed})`, value: "completed" },
    { label: `Runtime Error (${counts.runtime_error})`, value: "runtime_error" },
    { label: `Compile Error (${counts.compile_error})`, value: "compile_error" },
    { label: `Timeout (${counts.timeout})`, value: "timeout" },
  ];

  return (
    <div className="p-6 max-w-5xl mx-auto space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-foreground">Execution History</h1>
        <p className="text-muted-foreground text-sm mt-0.5">
          {executions.length} execution{executions.length !== 1 ? "s" : ""} total
        </p>
      </div>

      {/* Filter tabs */}
      <div className="flex flex-wrap gap-2">
        {FILTERS.map(({ label, value }) => (
          <button
            key={value}
            onClick={() => setFilter(value)}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
              filter === value
                ? "bg-primary text-white"
                : "bg-muted text-muted-foreground hover:text-foreground hover:bg-secondary"
            }`}
          >
            {label}
          </button>
        ))}
      </div>

      {/* List */}
      {loading ? (
        <div className="flex items-center justify-center py-20">
          <Loader2 className="w-6 h-6 animate-spin text-primary" />
        </div>
      ) : filtered.length === 0 ? (
        <EmptyState
          icon={Terminal}
          title={
            filter === "all"
              ? "No executions yet"
              : `No ${filter.replace("_", " ")} executions`
          }
          description={
            filter === "all"
              ? "Run some code in the compiler to see your history here."
              : "Try a different filter to see other results."
          }
          action={
            filter !== "all"
              ? { label: "Show all", onClick: () => setFilter("all") }
              : undefined
          }
        />
      ) : (
        <div className="space-y-3">
          {filtered.map((e) => (
            <ExecutionRow key={e._id} execution={e} />
          ))}
        </div>
      )}
    </div>
  );
}