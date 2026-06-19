import { type ReactNode } from "react";
import { Navigate, useLocation } from "react-router";
import { useAuth as useClerkAuth } from "@clerk/clerk-react";

interface ProtectedRouteProps {
  children: ReactNode;
}

export default function ProtectedRoute({ children }: ProtectedRouteProps) {
  const { isLoaded, isSignedIn } = useClerkAuth();
  const location = useLocation();

  // Wait for Clerk to finish loading before making a redirect decision.
  // Without this, a hard refresh redirects signed-in users to /login briefly.
  if (!isLoaded) {
    return (
      <div className="min-h-screen bg-[#111111] flex items-center justify-center">
        <div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!isSignedIn) {
    return <Navigate to="/login" state={{ from: location.pathname }} replace />;
  }

  return <>{children}</>;
}