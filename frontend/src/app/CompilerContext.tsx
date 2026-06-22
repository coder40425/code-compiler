import {
  createContext,
  useContext,
  useState,
  useCallback,
  useMemo,
  type ReactNode,
} from "react";
import type { ExecuteResponse, Language } from "./types";
import * as api from "./api";
import { toast } from "sonner";
import { useAuth } from "./AuthContext";

export const LANGUAGES: Language[] = [
  { label: "Python",     value: "python",     monacoLang: "python" },
  { label: "JavaScript", value: "javascript", monacoLang: "javascript" },
  { label: "C",          value: "c",          monacoLang: "c" },
  { label: "C++",        value: "cpp",        monacoLang: "cpp" },
  { label: "Java",       value: "java",       monacoLang: "java" },
  { label: "Go",         value: "go",         monacoLang: "go" },
  { label: "PHP",        value: "php",        monacoLang: "php" },
  { label: "Ruby",       value: "ruby",       monacoLang: "ruby" },
  { label: "C#",         value: "csharp",     monacoLang: "csharp" },
  { label: "Kotlin",     value: "kotlin",     monacoLang: "kotlin" },
];

export const DEFAULT_TEMPLATES: Record<string, string> = {
  python:     `print("Hello SkillDzire")`,
  javascript: `console.log("Hello SkillDzire");`,
  c:          `#include <stdio.h>\n\nint main() {\n    printf("Hello SkillDzire");\n    return 0;\n}`,
  cpp:        `#include <iostream>\nusing namespace std;\n\nint main() {\n    cout << "Hello SkillDzire" << endl;\n    return 0;\n}`,
  java:       `public class Main {\n    public static void main(String[] args){\n        System.out.println("Hello SkillDzire");\n    }\n}`,
  go:         `package main\n\nimport "fmt"\n\nfunc main() {\n    fmt.Println("Hello SkillDzire")\n}`,
  php:        `<?php\necho "Hello SkillDzire";\n?>`,
  ruby:       `puts "Hello SkillDzire"`,
  csharp:     `using System;\n\nclass Program {\n    static void Main() {\n        Console.WriteLine("Hello SkillDzire");\n    }\n}`,
  kotlin:     `fun main() {\n    println("Hello SkillDzire")\n}`,
};

interface CompilerState {
  language: Language;
  code: string;
  stdin: string;
  result: ExecuteResponse | null;
  isRunning: boolean;
  projectName: string;
  activeProjectId: string | null;
  // FIX: incremented only when code needs to be force-reloaded into Monaco
  // (switching language template, loading a project, restoring a version).
  // Monaco uses this as a `key` to remount only when truly needed —
  // NOT on every keystroke.
  editorEpoch: number;
}

interface CompilerContextValue extends CompilerState {
  setLanguage: (lang: Language) => void;
  setCode: (code: string) => void;
  setStdin: (stdin: string) => void;
  setProjectName: (name: string) => void;
  setActiveProjectId: (id: string | null) => void;
  runCode: () => Promise<void>;
  loadProjectIntoCompiler: (
    id: string,
    name: string,
    lang: string,
    code: string
  ) => void;
}

const CompilerContext = createContext<CompilerContextValue | null>(null);

export function CompilerProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth();

  const [language, setLanguageState] = useState<Language>(LANGUAGES[0]);
  const [code, setCodeState]         = useState(DEFAULT_TEMPLATES.python);
  const [stdin, setStdin]            = useState("");
  const [result, setResult]          = useState<ExecuteResponse | null>(null);
  const [isRunning, setIsRunning]    = useState(false);
  const [projectName, setProjectName]       = useState("Untitled Project");
  const [activeProjectId, setActiveProjectId] = useState<string | null>(null);
  const [editorEpoch, setEditorEpoch] = useState(0);

  const setLanguage = useCallback((lang: Language) => {
    setLanguageState(lang);
    setCodeState(DEFAULT_TEMPLATES[lang.value] ?? "");
    // Force Monaco to reload its defaultValue — this is a deliberate,
    // user-initiated content swap, not a typing keystroke.
    setEditorEpoch((e) => e + 1);
  }, []);

  // FIX: setCode is called on every keystroke from Monaco's onChange.
  // It must ONLY update local state — it must NEVER bump editorEpoch,
  // because that would force Monaco to remount and reset the cursor.
  const setCode = useCallback((c: string) => setCodeState(c), []);

  const runCode = useCallback(async () => {
    setIsRunning(true);
    setResult(null);
    try {
      const res = await api.executeCode({
        language: language.value,
        code,
        stdin,
        userId: user?.userId ?? undefined,
      });
      setResult(res);
      if (res.status === "completed") toast.success("Executed successfully");
      else toast.error(`Execution failed: ${res.status}`);
    } catch (e) {
      toast.error((e as Error).message);
    } finally {
      setIsRunning(false);
    }
  }, [language, code, stdin, user?.userId]);

  const loadProjectIntoCompiler = useCallback(
    (id: string, name: string, lang: string, projectCode: string) => {
      const found = LANGUAGES.find((l) => l.value === lang) ?? LANGUAGES[0];
      setLanguageState(found);
      setCodeState(projectCode);
      setActiveProjectId(id);
      setProjectName(name);
      // Deliberate content swap from loading a saved project — remount Monaco.
      setEditorEpoch((e) => e + 1);
    },
    []
  );

  // FIX: memoize the context value. Without this, every render of
  // CompilerProvider (which happens on EVERY keystroke since code lives here)
  // creates a brand new object/functions, which can cascade re-renders into
  // any consumer — including ones that might affect Monaco's wrapper.
  const value = useMemo<CompilerContextValue>(
    () => ({
      language,
      code,
      stdin,
      result,
      isRunning,
      projectName,
      activeProjectId,
      editorEpoch,
      setLanguage,
      setCode,
      setStdin,
      setProjectName,
      setActiveProjectId,
      runCode,
      loadProjectIntoCompiler,
    }),
    [
      language,
      code,
      stdin,
      result,
      isRunning,
      projectName,
      activeProjectId,
      editorEpoch,
      setLanguage,
      setCode,
      runCode,
      loadProjectIntoCompiler,
    ]
  );

  return (
    <CompilerContext.Provider value={value}>
      {children}
    </CompilerContext.Provider>
  );
}

export function useCompiler() {
  const ctx = useContext(CompilerContext);
  if (!ctx) throw new Error("useCompiler must be used within CompilerProvider");
  return ctx;
}