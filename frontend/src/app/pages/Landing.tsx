import { useState, useEffect } from "react";
import { useNavigate } from "react-router";
import {
  Terminal,
  Zap,
  FolderOpen,
  GitBranch,
  Shield,
  ChevronRight,
  Code2,
} from "lucide-react";
import { useSignIn, useAuth } from "@clerk/clerk-react";

const CODE_LINES = [
  { text: 'print("Hello SkillDzire")', lang: "python", delay: 0 },
  { text: 'console.log("Hello SkillDzire");', lang: "javascript", delay: 600 },
  { text: 'System.out.println("Hello SkillDzire");', lang: "java", delay: 1200 },
  { text: 'fmt.Println("Hello SkillDzire")', lang: "go", delay: 1800 },
  { text: 'cout << "Hello SkillDzire";', lang: "cpp", delay: 2400 },
];

const LANG_COLORS: Record<string, string> = {
  python: "text-blue-400",
  javascript: "text-yellow-400",
  java: "text-orange-400",
  go: "text-cyan-400",
  cpp: "text-purple-400",
};

function AnimatedCodeBlock() {
  const [lineIndex, setLineIndex] = useState(0);
  const [typed, setTyped] = useState("");
  const [charIndex, setCharIndex] = useState(0);

  useEffect(() => {
    const currentLine = CODE_LINES[lineIndex];
    if (charIndex < currentLine.text.length) {
      const t = setTimeout(() => {
        setTyped((prev) => prev + currentLine.text[charIndex]);
        setCharIndex((c) => c + 1);
      }, 45);
      return () => clearTimeout(t);
    } else {
      const t = setTimeout(() => {
        const next = (lineIndex + 1) % CODE_LINES.length;
        setLineIndex(next);
        setTyped("");
        setCharIndex(0);
      }, 1800);
      return () => clearTimeout(t);
    }
  }, [charIndex, lineIndex]);

  const line = CODE_LINES[lineIndex];

  return (
    <div className="bg-[#0d0d0d] border border-[#2a2a2a] rounded-2xl overflow-hidden shadow-2xl shadow-black/50">
      {/* Window chrome */}
      <div className="flex items-center gap-2 px-4 py-3 border-b border-[#2a2a2a] bg-[#141414]">
        <div className="w-3 h-3 rounded-full bg-red-500/70" />
        <div className="w-3 h-3 rounded-full bg-yellow-500/70" />
        <div className="w-3 h-3 rounded-full bg-green-500/70" />
        <span className="ml-3 text-xs font-mono text-[#666] tracking-wide">
          main.
          {line.lang === "cpp"
            ? "cpp"
            : line.lang === "java"
            ? "java"
            : line.lang}
        </span>
        <span className="ml-auto text-xs font-mono text-[#444] capitalize">
          {line.lang}
        </span>
      </div>
      {/* Code area */}
      <div className="p-5 font-mono text-sm min-h-[120px] flex flex-col justify-center">
        <div className="flex items-start gap-3">
          <span className="text-[#444] select-none text-xs pt-0.5">01</span>
          <span
            className={`${
              LANG_COLORS[line.lang] ?? "text-green-400"
            } leading-relaxed`}
          >
            {typed}
            <span className="inline-block w-0.5 h-4 bg-primary ml-0.5 animate-pulse align-middle" />
          </span>
        </div>
        <div className="flex items-center gap-2 mt-3 pt-3 border-t border-[#1e1e1e]">
          <div className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
          <span className="text-green-400/70 text-xs font-mono">
            Executed in 142ms
          </span>
        </div>
      </div>
      {/* Output strip */}
      <div className="px-5 py-3 bg-[#0a0a0a] border-t border-[#1e1e1e] flex items-center gap-2">
        <span className="text-[#444] text-xs font-mono">output</span>
        <span className="text-green-400 text-xs font-mono">Hello SkillDzire</span>
      </div>
    </div>
  );
}

const FEATURES = [
  {
    icon: Terminal,
    title: "10+ Languages",
    desc: "Python, JavaScript, C, C++, Java, Go, PHP, Ruby, C#, Kotlin — all in one place.",
    color: "text-blue-400",
    bg: "bg-blue-500/10",
  },
  {
    icon: Zap,
    title: "Instant Execution",
    desc: "Run code in milliseconds with real-time stdout, stderr, and execution time.",
    color: "text-primary",
    bg: "bg-primary/10",
  },
  {
    icon: FolderOpen,
    title: "Project Saving",
    desc: "Save your work to named projects and pick up right where you left off.",
    color: "text-purple-400",
    bg: "bg-purple-500/10",
  },
  {
    icon: GitBranch,
    title: "Version History",
    desc: "Save snapshots of your code and restore any previous version instantly.",
    color: "text-green-400",
    bg: "bg-green-500/10",
  },
  {
    icon: Shield,
    title: "Docker-Isolated",
    desc: "Every execution runs in a sandboxed Docker container — fully isolated and secure.",
    color: "text-yellow-400",
    bg: "bg-yellow-500/10",
  },
  {
    icon: Code2,
    title: "Monaco Editor",
    desc: "The same editor powering VS Code — syntax highlighting, auto-complete, and more.",
    color: "text-cyan-400",
    bg: "bg-cyan-500/10",
  },
];

const LANGS = [
  "Python","JavaScript","C","C++","Java","Go","PHP","Ruby","C#","Kotlin",
];

export default function Landing() {
  const navigate = useNavigate();
  const { isSignedIn } = useAuth();
  const { signIn, isLoaded } = useSignIn();

  const handleStartCoding = () => {
    navigate("/compiler");
  };

  // FIX: was calling mock login() — now uses Clerk Google OAuth
  const handleGoogleSignIn = async () => {
    if (!isLoaded) return;
    // If already signed in, go straight to dashboard
    if (isSignedIn) {
      navigate("/dashboard");
      return;
    }
    try {
      await signIn.authenticateWithRedirect({
        strategy: "oauth_google",
        redirectUrl: "/sso-callback",
        redirectUrlComplete: "/dashboard",
      });
    } catch (err) {
      console.error("Google sign-in error:", err);
    }
  };

  return (
    <div className="min-h-screen bg-[#111111] text-white">
      {/* Gradient orb */}
      <div className="fixed top-0 left-1/2 -translate-x-1/2 w-[800px] h-[400px] bg-primary/5 rounded-full blur-3xl pointer-events-none" />

      {/* Hero */}
      <section className="relative pt-16 pb-20 px-6 max-w-7xl mx-auto">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          {/* Left */}
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-primary/10 border border-primary/20 rounded-full text-xs font-semibold text-primary mb-6">
              <span className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse" />
              Powered by Docker · Runs in the cloud
            </div>
            <h1 className="text-4xl md:text-5xl lg:text-[3.2rem] font-bold leading-tight mb-5">
              SkillDzire CodeLab{" "}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-[#ff6b35]">
                Write. Compile. Learn.
              </span>
            </h1>
            <p className="text-[#b3b3b3] text-lg leading-relaxed mb-8 max-w-lg">
              A cloud-based multi-language IDE built for learners. Write, run,
              and save code across 10+ languages — no setup, no installs, just
              code.
            </p>

            <div className="flex flex-wrap gap-3 mb-8">
              <button
                onClick={handleStartCoding}
                className="flex items-center gap-2 px-6 py-3 bg-primary text-white rounded-xl font-bold text-sm hover:bg-primary/90 transition-colors shadow-lg shadow-primary/25"
              >
                <Terminal className="w-4 h-4" /> Start Coding
                <ChevronRight className="w-4 h-4" />
              </button>
              <button
                onClick={handleGoogleSignIn}
                disabled={!isLoaded}
                className="flex items-center gap-2.5 px-6 py-3 bg-white text-[#111] rounded-xl font-bold text-sm hover:bg-gray-100 transition-colors shadow-lg disabled:opacity-60 disabled:cursor-not-allowed"
              >
                <GoogleIcon />
                Sign in with Google
              </button>
            </div>

            {/* Language pills */}
            <div className="flex flex-wrap gap-2">
              {LANGS.map((l) => (
                <span
                  key={l}
                  className="px-2.5 py-1 bg-[#1a1a1a] border border-[#2a2a2a] rounded-lg text-xs font-mono text-[#b3b3b3]"
                >
                  {l}
                </span>
              ))}
            </div>
          </div>

          {/* Right — animated editor */}
          <div className="w-full max-w-md mx-auto lg:mx-0 lg:ml-auto">
            <AnimatedCodeBlock />
            {/* Floating stat cards */}
            <div className="grid grid-cols-2 gap-3 mt-4">
              <div className="bg-[#1a1a1a] border border-[#2a2a2a] rounded-xl px-4 py-3 text-center">
                <p className="text-2xl font-black text-primary">10+</p>
                <p className="text-xs text-[#666] font-medium mt-0.5">
                  Languages
                </p>
              </div>
              <div className="bg-[#1a1a1a] border border-[#2a2a2a] rounded-xl px-4 py-3 text-center">
                <p className="text-2xl font-black text-green-400">&lt;200ms</p>
                <p className="text-xs text-[#666] font-medium mt-0.5">
                  Avg Execution
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="px-6 py-16 max-w-7xl mx-auto">
        <div className="text-center mb-12">
          <h2 className="text-2xl md:text-3xl font-bold mb-3">
            Everything you need to{" "}
            <span className="text-primary">code and learn</span>
          </h2>
          <p className="text-[#b3b3b3] max-w-lg mx-auto">
            A professional-grade IDE experience, designed specifically for
            students and learners.
          </p>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {FEATURES.map(({ icon: Icon, title, desc, color, bg }) => (
            <div
              key={title}
              className="bg-[#1a1a1a] border border-[#2a2a2a] rounded-2xl p-5 hover:border-primary/30 transition-colors group"
            >
              <div
                className={`w-10 h-10 rounded-xl ${bg} flex items-center justify-center mb-4`}
              >
                <Icon className={`w-5 h-5 ${color}`} />
              </div>
              <h3 className="font-semibold text-white mb-1.5">{title}</h3>
              <p className="text-[#b3b3b3] text-sm leading-relaxed">{desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* CTA strip */}
      <section className="px-6 py-16 max-w-7xl mx-auto">
        <div className="relative bg-[#1a1a1a] border border-[#2a2a2a] rounded-2xl p-10 text-center overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-primary/8 to-transparent pointer-events-none" />
          <div className="relative">
            <h2 className="text-2xl md:text-3xl font-bold mb-3">
              Ready to start coding?
            </h2>
            <p className="text-[#b3b3b3] mb-7 max-w-md mx-auto">
              Sign in with your SkillDzire account to save projects, track
              execution history, and code from anywhere.
            </p>
            <div className="flex flex-wrap justify-center gap-3">
              <button
                onClick={handleGoogleSignIn}
                disabled={!isLoaded}
                className="flex items-center gap-2.5 px-6 py-3 bg-white text-[#111] rounded-xl font-bold text-sm hover:bg-gray-100 transition-colors shadow-lg disabled:opacity-60 disabled:cursor-not-allowed"
              >
                <GoogleIcon />
                Continue with Google
              </button>
              <button
                onClick={handleStartCoding}
                className="flex items-center gap-2 px-6 py-3 bg-primary/15 text-primary border border-primary/30 rounded-xl font-bold text-sm hover:bg-primary/25 transition-colors"
              >
                <Terminal className="w-4 h-4" />
                Try as Guest
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-[#1e1e1e] px-6 py-8 max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4 text-sm text-[#555]">
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 rounded-md bg-primary flex items-center justify-center">
            <Code2 className="w-3.5 h-3.5 text-white" />
          </div>
          <span className="font-semibold text-[#888]">SkillDzire CodeLab</span>
        </div>
        <p>© {new Date().getFullYear()} SkillDzire. All rights reserved.</p>
      </footer>
    </div>
  );
}

function GoogleIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
      <path
        d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
        fill="#4285F4"
      />
      <path
        d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
        fill="#34A853"
      />
      <path
        d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
        fill="#FBBC05"
      />
      <path
        d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
        fill="#EA4335"
      />
    </svg>
  );
}