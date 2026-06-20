import { useState, useCallback } from "react";
import MonacoEditor from "@monaco-editor/react";
import {
  Play,
  Save,
  GitBranch,
  ChevronDown,
  Loader2,
  LogIn,
  Info,
} from "lucide-react";
import { toast } from "sonner";
import { useNavigate } from "react-router";
import { useCompiler, LANGUAGES } from "../CompilerContext";
import { useAuth } from "../AuthContext";
import StatusBadge from "../components/StatusBadge";
import * as api from "../api";

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

type OutputTab = "output" | "errors" | "details";

function GuestBanner() {
  const navigate = useNavigate();
  return (
    <div className="flex items-center gap-3 px-4 py-2 bg-yellow-500/10 border-b border-yellow-500/20 text-yellow-400 text-xs font-medium">
      <Info className="w-3.5 h-3.5 shrink-0" />
      <span>
        You are in Guest Mode. Code execution is enabled, but saving projects
        and version history requires sign-in.
      </span>
      <button
        onClick={() => navigate("/login")}
        className="ml-auto shrink-0 flex items-center gap-1.5 px-2.5 py-1 bg-yellow-500/20 border border-yellow-500/30 rounded-lg hover:bg-yellow-500/30 transition-colors"
      >
        <LogIn className="w-3 h-3" /> Sign In
      </button>
    </div>
  );
}

function SignInToSaveButton({ label }: { label: string }) {
  const navigate = useNavigate();
  return (
    <div className="relative group">
      <button
        onClick={() => navigate("/login")}
        className="flex items-center gap-1.5 px-3 py-1.5 bg-muted border border-dashed border-border text-muted-foreground text-sm font-medium rounded-lg hover:border-primary/50 hover:text-primary transition-colors"
      >
        <LogIn className="w-3.5 h-3.5" />
        <span className="hidden sm:inline">{label}</span>
      </button>
      <div className="absolute bottom-full mb-2 left-1/2 -translate-x-1/2 w-56 bg-card border border-border rounded-xl px-3 py-2.5 text-xs text-muted-foreground shadow-xl opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity z-50 text-center">
        Project persistence requires sign-in. Run code freely, save later.
      </div>
    </div>
  );
}

export default function Compiler() {
  const {
    language,
    setLanguage,
    code,
    setCode,
    stdin,
    setStdin,
    result,
    isRunning,
    projectName,
    setProjectName,
    activeProjectId,
    setActiveProjectId,
    runCode,
  } = useCompiler();

  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const [outputTab, setOutputTab] = useState<OutputTab>("output");
  const [langOpen, setLangOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [savingVersion, setSavingVersion] = useState(false);

  const handleSaveProject = useCallback(async () => {
    setSaving(true);
    try {
      if (activeProjectId) {
        await api.updateProject(activeProjectId, {
          title: projectName,
          language: language.value,
          currentCode: code,
        });
        toast.success("Project saved");
      } else {
        const p = await api.createProject({
          title: projectName,
          language: language.value,
          currentCode: code,
        });
        // Store new project id so subsequent saves and version snapshots work
        setActiveProjectId(p._id);
        toast.success(`Project "${p.title}" created`);
      }
    } catch (e) {
      toast.error((e as Error).message);
    } finally {
      setSaving(false);
    }
  }, [activeProjectId, projectName, language, code, setActiveProjectId]);

  const handleSaveVersion = useCallback(async () => {
    if (!activeProjectId) {
      toast.error("Save the project first");
      return;
    }
    setSavingVersion(true);
    try {
      // FIX: backend version.service reads currentCode from the Project document.
      // Must push current editor code to the project in MongoDB FIRST, then
      // trigger the snapshot — otherwise the version captures stale DB code.
      await api.updateProject(activeProjectId, {
        title: projectName,
        language: language.value,
        currentCode: code,
      });

      // FIX: createVersion no longer accepts a { code } body.
      // Backend reads project.currentCode directly — pass only projectId.
      await api.createVersion(activeProjectId);
      toast.success("Version saved");
    } catch (e) {
      toast.error((e as Error).message);
    } finally {
      setSavingVersion(false);
    }
  }, [activeProjectId, projectName, language, code]);

  return (
    <div className="flex flex-col h-[calc(100vh-3.5rem)] bg-background overflow-hidden">
      {/* Guest banner */}
      {!isAuthenticated && <GuestBanner />}

      {/* Toolbar */}
      <div className="flex flex-wrap items-center gap-2 px-4 py-2.5 border-b border-border bg-card shrink-0">
        <input
          value={projectName}
          onChange={(e) => setProjectName(e.target.value)}
          className="bg-muted text-foreground text-sm font-medium px-3 py-1.5 rounded-lg border border-border focus:border-primary focus:ring-1 focus:ring-primary/30 outline-none w-40 md:w-52"
          placeholder="Project name..."
        />

        {/* Language selector */}
        <div className="relative">
          <button
            onClick={() => setLangOpen(!langOpen)}
            className="flex items-center gap-2 px-3 py-1.5 bg-muted rounded-lg border border-border text-sm font-medium hover:border-primary/50 transition-colors"
          >
            <span>{LANG_ICONS[language.value]}</span>
            <span className="font-mono">{language.label}</span>
            <ChevronDown className="w-3.5 h-3.5 text-muted-foreground" />
          </button>
          {langOpen && (
            <div className="absolute top-full mt-1 left-0 z-50 w-44 bg-card border border-border rounded-xl shadow-xl overflow-hidden">
              {LANGUAGES.map((l) => (
                <button
                  key={l.value}
                  onClick={() => {
                    setLanguage(l);
                    setLangOpen(false);
                  }}
                  className={`w-full flex items-center gap-2.5 px-3 py-2 text-sm hover:bg-muted transition-colors ${
                    l.value === language.value
                      ? "text-primary bg-primary/10"
                      : "text-foreground"
                  }`}
                >
                  <span>{LANG_ICONS[l.value]}</span>
                  <span className="font-mono">{l.label}</span>
                </button>
              ))}
            </div>
          )}
        </div>

        <div className="flex items-center gap-2 ml-auto">
          {isAuthenticated ? (
            <>
              <button
                onClick={handleSaveProject}
                disabled={saving}
                className="flex items-center gap-1.5 px-3 py-1.5 bg-muted border border-border text-foreground text-sm font-medium rounded-lg hover:border-primary/50 transition-colors disabled:opacity-50"
              >
                {saving ? (
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                ) : (
                  <Save className="w-3.5 h-3.5" />
                )}
                <span className="hidden sm:inline">Save</span>
              </button>
              <button
                onClick={handleSaveVersion}
                disabled={savingVersion || !activeProjectId}
                className="flex items-center gap-1.5 px-3 py-1.5 bg-muted border border-border text-foreground text-sm font-medium rounded-lg hover:border-primary/50 transition-colors disabled:opacity-50"
              >
                {savingVersion ? (
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                ) : (
                  <GitBranch className="w-3.5 h-3.5" />
                )}
                <span className="hidden sm:inline">Version</span>
              </button>
            </>
          ) : (
            <>
              <SignInToSaveButton label="Save" />
              <SignInToSaveButton label="Version" />
            </>
          )}
          <button
            onClick={runCode}
            disabled={isRunning}
            className="flex items-center gap-2 px-4 py-1.5 bg-primary text-white text-sm font-bold rounded-lg hover:bg-primary/90 transition-colors disabled:opacity-60 shadow-lg shadow-primary/20"
          >
            {isRunning ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Play className="w-4 h-4" />
            )}
            {isRunning ? "Running..." : "Run Code"}
          </button>
          {result && <StatusBadge status={result.status} small />}
        </div>
      </div>

      {/* Main content */}
      <div className="flex flex-1 overflow-hidden flex-col md:flex-row">
        {/* Editor + Input */}
        <div className="flex flex-col flex-1 min-h-0 md:min-w-0">
          <div className="flex-1 min-h-0">
            <MonacoEditor
              height="100%"
              language={language.monacoLang}
              value={code}
              onChange={(v) => setCode(v ?? "")}
              theme="vs-dark"
              options={{
                fontFamily: "'JetBrains Mono', monospace",
                fontSize: 14,
                lineHeight: 22,
                minimap: { enabled: false },
                scrollBeyondLastLine: false,
                padding: { top: 12, bottom: 12 },
                renderLineHighlight: "all",
                cursorBlinking: "smooth",
              }}
            />
          </div>
          {/* Input panel */}
          <div className="shrink-0 border-t border-border bg-card">
            <div className="px-3 py-2 border-b border-border flex items-center gap-2">
              <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider font-mono">
                Custom Input (stdin)
              </span>
            </div>
            <textarea
              value={stdin}
              onChange={(e) => setStdin(e.target.value)}
              placeholder="Enter input for your program..."
              rows={3}
              className="w-full bg-transparent text-foreground text-sm font-mono px-3 py-2 resize-none focus:outline-none placeholder:text-muted-foreground/50"
            />
          </div>
        </div>

        {/* Output panel */}
        <div className="md:w-96 border-t md:border-t-0 md:border-l border-border flex flex-col bg-[#0d0d0d] shrink-0">
          <div className="flex border-b border-border">
            {(["output", "errors", "details"] as OutputTab[]).map((tab) => (
              <button
                key={tab}
                onClick={() => setOutputTab(tab)}
                className={`flex-1 py-2.5 text-xs font-semibold uppercase tracking-wider font-mono transition-colors ${
                  outputTab === tab
                    ? "text-primary border-b-2 border-primary"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                {tab}
              </button>
            ))}
          </div>

          <div className="flex-1 overflow-auto p-4 font-mono text-sm">
            {!result ? (
              <p className="text-muted-foreground/50 text-xs italic">
                {isRunning
                  ? "Running your code..."
                  : "Run your code to see output."}
              </p>
            ) : outputTab === "output" ? (
              result.stdout ? (
                <pre className="text-green-400 whitespace-pre-wrap leading-relaxed">
                  {result.stdout}
                </pre>
              ) : (
                <p className="text-muted-foreground/50 text-xs italic">
                  No output.
                </p>
              )
            ) : outputTab === "errors" ? (
              result.stderr ? (
                <pre className="text-red-400 whitespace-pre-wrap leading-relaxed">
                  {result.stderr}
                </pre>
              ) : (
                <p className="text-green-400/70 text-xs">No errors.</p>
              )
            ) : (
              <div className="space-y-3 text-sm">
                <DetailRow label="Job ID" value={result.jobId} mono />
                <DetailRow label="Language" value={result.language} mono />
                <DetailRow
                  label="Exec Time"
                  value={`${result.executionTime}ms`}
                />
                <DetailRow
                  label="Status"
                  value={<StatusBadge status={result.status} small />}
                />
              </div>
            )}
          </div>

          {/* Guest upsell in output panel */}
          {!isAuthenticated && (
            <div className="border-t border-border px-4 py-3 flex items-center gap-3">
              <div className="flex-1 min-w-0">
                <p className="text-xs text-muted-foreground leading-relaxed">
                  Sign in to save executions and access history.
                </p>
              </div>
              <button
                onClick={() => navigate("/login")}
                className="shrink-0 flex items-center gap-1.5 px-2.5 py-1.5 bg-primary text-white rounded-lg text-xs font-semibold hover:bg-primary/90 transition-colors"
              >
                <LogIn className="w-3 h-3" /> Sign In
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function DetailRow({
  label,
  value,
  mono,
}: {
  label: string;
  value: React.ReactNode;
  mono?: boolean;
}) {
  return (
    <div className="flex items-center justify-between gap-4 py-2 border-b border-border/50">
      <span className="text-muted-foreground text-xs uppercase tracking-wider">
        {label}
      </span>
      <span
        className={`text-foreground text-xs ${mono ? "font-mono" : ""} truncate max-w-[180px]`}
      >
        {value}
      </span>
    </div>
  );
}