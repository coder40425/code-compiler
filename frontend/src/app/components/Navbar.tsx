import { useState, useRef, useEffect } from "react";
import { Link, useLocation, useNavigate } from "react-router";
import {
  Menu,
  X,
  Terminal,
  FolderOpen,
  Clock,
  LayoutDashboard,
  LogOut,
  User,
  ChevronDown,
  Home,
} from "lucide-react";
import { useAuth as useClerkAuth } from "@clerk/clerk-react";
import { useAuth } from "../AuthContext";

const NAV_LINKS = [
  { href: "/dashboard", label: "Home", icon: LayoutDashboard },
  { href: "/compiler",  label: "Compiler", icon: Terminal },
  { href: "/projects",  label: "Projects", icon: FolderOpen },
  { href: "/history",   label: "History", icon: Clock },
];

function UserMenu() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handler(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node))
        setOpen(false);
    }
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  if (!user) return null;

  return (
    <div className="relative" ref={ref}>
      <button
        onClick={() => setOpen(!open)}
        className="flex items-center gap-2 px-2.5 py-1.5 rounded-xl hover:bg-muted transition-colors"
      >
        <img
          src={user.avatar}
          alt={user.name}
          className="w-7 h-7 rounded-full object-cover bg-primary/20"
          onError={(e) => {
            (e.target as HTMLImageElement).src = `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(
              user.name
            )}&backgroundColor=f4430b&textColor=ffffff`;
          }}
        />
        <span className="hidden md:block text-sm font-medium text-foreground max-w-28 truncate">
          {user.name}
        </span>
        <ChevronDown
          className={`w-3.5 h-3.5 text-muted-foreground transition-transform ${
            open ? "rotate-180" : ""
          }`}
        />
      </button>

      {open && (
        <div className="absolute right-0 top-full mt-2 w-52 bg-card border border-border rounded-xl shadow-xl z-50 overflow-hidden">
          <div className="px-3 py-3 border-b border-border">
            <p className="text-sm font-semibold text-foreground truncate">
              {user.name}
            </p>
            <p className="text-xs text-muted-foreground truncate">
              {user.email}
            </p>
          </div>
          <div className="py-1">
            <button
              onClick={() => { navigate("/projects"); setOpen(false); }}
              className="w-full flex items-center gap-2.5 px-3 py-2.5 text-sm text-foreground hover:bg-muted transition-colors"
            >
              <FolderOpen className="w-4 h-4 text-muted-foreground" /> My Projects
            </button>
            <button
              onClick={() => { navigate("/history"); setOpen(false); }}
              className="w-full flex items-center gap-2.5 px-3 py-2.5 text-sm text-foreground hover:bg-muted transition-colors"
            >
              <Clock className="w-4 h-4 text-muted-foreground" /> Execution History
            </button>
          </div>
          <div className="border-t border-border py-1">
            <button
              onClick={() => { logout(); navigate("/"); setOpen(false); }}
              className="w-full flex items-center gap-2.5 px-3 py-2.5 text-sm text-red-400 hover:bg-red-500/10 transition-colors"
            >
              <LogOut className="w-4 h-4" /> Sign Out
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default function Navbar() {
  const [open, setOpen] = useState(false);
  const { pathname } = useLocation();
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();
  // FIX: Navbar read isAuthenticated immediately, which is `false` for a
  // brief moment on every page load/refresh while Clerk is still restoring
  // the session from cookies. That caused the visible flicker from
  // signed-out → signed-in UI. isLoaded lets us hold the PREVIOUS visual
  // state (or a neutral one) until Clerk has actually confirmed the answer.
  const { isLoaded } = useClerkAuth();

  const isActive = (href: string) =>
    pathname === href || (href === "/dashboard" && pathname === "/");

  const onCompilerPage = pathname === "/compiler";

  // While Clerk is determining auth state, render only the logo —
  // no sign-in/sign-out buttons flashing back and forth.
  if (!isLoaded) {
    return (
      <header className="sticky top-0 z-50 border-b border-border bg-[#2a2a2a]/98 backdrop-blur-sm">
        <div className="flex items-center justify-between h-14 px-4 md:px-6">
          <Link to="/" className="flex items-center gap-2.5 shrink-0">
            <img
              src="https://skilldzire.com/images/logo-skilldzire.png"
              alt="SkillDzire"
              className="h-8 w-auto object-contain"
              onError={(e) => {
                (e.target as HTMLImageElement).style.display = "none";
              }}
            />
            <div className="leading-none">
              <span className="font-bold text-white text-sm">SkillDzire</span>
              <span className="block text-[10px] text-muted-foreground font-mono tracking-wider">
                CodeLab
              </span>
            </div>
          </Link>
        </div>
      </header>
    );
  }

  return (
    <header className="sticky top-0 z-50 border-b border-border bg-[#2a2a2a]/98 backdrop-blur-sm">
      <div className="flex items-center justify-between h-14 px-4 md:px-6">

        {/* Logo */}
        <Link to="/" className="flex items-center gap-2.5 shrink-0">
          <img
            src="https://skilldzire.com/images/logo-skilldzire.png"
            alt="SkillDzire"
            className="h-8 w-auto object-contain"
            onError={(e) => {
              (e.target as HTMLImageElement).style.display = "none";
            }}
          />
          <div className="leading-none">
            <span className="font-bold text-white text-sm">SkillDzire</span>
            <span className="block text-[10px] text-muted-foreground font-mono tracking-wider">
              CodeLab
            </span>
          </div>
        </Link>

        {/* Desktop nav — only when authenticated */}
        {isAuthenticated && (
          <nav className="hidden md:flex items-center gap-1">
            {NAV_LINKS.map(({ href, label, icon: Icon }) => (
              <Link
                key={href}
                to={href}
                className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                  isActive(href)
                    ? "bg-primary/15 text-primary"
                    : "text-muted-foreground hover:text-foreground hover:bg-muted"
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                {label}
              </Link>
            ))}
          </nav>
        )}

        {/* Right side */}
        <div className="flex items-center gap-2">
          {isAuthenticated ? (
            <>
              {onCompilerPage ? (
                <button
                  onClick={() => navigate("/dashboard")}
                  className="hidden md:inline-flex items-center gap-1.5 px-3 py-1.5 bg-muted border border-border text-foreground rounded-lg text-sm font-semibold hover:bg-secondary transition-colors"
                >
                  <Home className="w-3.5 h-3.5" />
                  Back to Home
                </button>
              ) : (
                <Link
                  to="/compiler"
                  className="hidden md:inline-flex items-center gap-1.5 px-3 py-1.5 bg-primary text-white rounded-lg text-sm font-semibold hover:bg-primary/90 transition-colors"
                >
                  <Terminal className="w-3.5 h-3.5" />
                  Run Code
                </Link>
              )}
              <UserMenu />
            </>
          ) : (
            <>
              <button
                onClick={() => navigate("/compiler")}
                className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 bg-muted border border-border text-foreground rounded-lg text-sm font-medium hover:bg-secondary transition-colors"
              >
                Try as Guest
              </button>
              <button
                onClick={() => navigate("/login")}
                className="flex items-center gap-2 px-3 py-1.5 bg-primary text-white rounded-lg text-sm font-semibold hover:bg-primary/90 transition-colors"
              >
                <User className="w-3.5 h-3.5" />
                Sign In
              </button>
            </>
          )}

          {/* Mobile hamburger — only when authenticated */}
          {isAuthenticated && (
            <button
              onClick={() => setOpen(!open)}
              className="md:hidden p-1.5 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
            >
              {open ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          )}
        </div>
      </div>

      {/* Mobile menu */}
      {open && isAuthenticated && (
        <nav className="md:hidden border-t border-border bg-card px-4 py-3 flex flex-col gap-1">
          {NAV_LINKS.map(({ href, label, icon: Icon }) => (
            <Link
              key={href}
              to={href}
              onClick={() => setOpen(false)}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-colors ${
                isActive(href)
                  ? "bg-primary/15 text-primary"
                  : "text-muted-foreground hover:text-foreground hover:bg-muted"
              }`}
            >
              <Icon className="w-4 h-4" />
              {label}
            </Link>
          ))}
        </nav>
      )}
    </header>
  );
}