import { BrowserRouter, Routes, Route } from "react-router";
import { Toaster } from "sonner";
import { AuthProvider } from "./AuthContext";
import { CompilerProvider } from "./CompilerContext";
import Navbar from "./components/Navbar";
import ProtectedRoute from "./components/ProtectedRoute";
import Landing from "./pages/Landing";
import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import Compiler from "./pages/Compiler";
import Projects from "./pages/Projects";
import ProjectDetail from "./pages/ProjectDetail";
import ExecutionHistory from "./pages/ExecutionHistory";
import NotFound from "./pages/NotFound";
import SsoCallback from "./pages/SsoCallback";

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <CompilerProvider>
          <div className="min-h-screen bg-background text-foreground" style={{ fontFamily: "Inter, sans-serif" }}>
            <Navbar />
            <main>
              <Routes>
                {/* Public */}
                <Route path="/" element={<Landing />} />
                <Route path="/login" element={<Login />} />
                <Route path="/sso-callback" element={<SsoCallback />} />

                {/* Guest-accessible compiler */}
                <Route path="/compiler" element={<Compiler />} />

                {/* Protected */}
                <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
                <Route path="/projects" element={<ProtectedRoute><Projects /></ProtectedRoute>} />
                <Route path="/projects/:id" element={<ProtectedRoute><ProjectDetail /></ProtectedRoute>} />
                <Route path="/history" element={<ProtectedRoute><ExecutionHistory /></ProtectedRoute>} />

                <Route path="*" element={<NotFound />} />
              </Routes>
            </main>
            <Toaster
              position="bottom-right"
              theme="dark"
              toastOptions={{
                style: {
                  background: "#1a1a1a",
                  border: "1px solid #2a2a2a",
                  color: "#fff",
                  fontFamily: "Inter, sans-serif",
                },
              }}
            />
          </div>
        </CompilerProvider>
      </AuthProvider>
    </BrowserRouter>
  );
}