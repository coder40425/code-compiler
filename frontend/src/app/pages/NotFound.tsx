import { Link } from "react-router";
import { Terminal } from "lucide-react";

export default function NotFound() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] text-center px-6">
      <div className="w-20 h-20 rounded-2xl bg-card border border-border flex items-center justify-center mb-6">
        <span className="text-4xl font-black font-mono text-primary">404</span>
      </div>
      <h1 className="text-2xl font-bold text-foreground mb-2">Page not found</h1>
      <p className="text-muted-foreground mb-8 max-w-sm">
        The page you are looking for does not exist or has been moved.
      </p>
      <div className="flex gap-3">
        <Link to="/" className="px-4 py-2.5 bg-muted text-foreground rounded-xl text-sm font-semibold hover:bg-secondary transition-colors">
          Go Home
        </Link>
        <Link to="/compiler" className="flex items-center gap-2 px-4 py-2.5 bg-primary text-white rounded-xl text-sm font-bold hover:bg-primary/90 transition-colors">
          <Terminal className="w-4 h-4" /> Open Compiler
        </Link>
      </div>
    </div>
  );
}
