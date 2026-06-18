import {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  type ReactNode,
} from "react";
import { useUser, useAuth as useClerkAuth } from "@clerk/clerk-react";
import { registerGetToken } from "../app/api/axiosInstance";

export interface AuthUser {
  userId: string;
  name: string;
  email: string;
  avatar: string;
  token: string;
}

interface AuthContextValue {
  user: AuthUser | null;
  isAuthenticated: boolean;
  token: string | null;
  login: () => void;
  logout: () => void;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const { user: clerkUser, isLoaded: userLoaded } = useUser();
  const { isSignedIn, signOut, getToken } = useClerkAuth();

  const [token, setToken] = useState<string | null>(null);

  // Register getToken with the Axios interceptor once Clerk is loaded.
  // This means every axiosInstance call will automatically get a fresh JWT.
  useEffect(() => {
    registerGetToken(getToken);
  }, [getToken]);

  // Keep our local token state in sync for consumers who read user.token
  useEffect(() => {
    if (!isSignedIn) {
      setToken(null);
      return;
    }
    getToken().then((t) => setToken(t ?? null));
  }, [isSignedIn, getToken]);

  // Map Clerk user to our AuthUser shape
  const user: AuthUser | null =
    userLoaded && isSignedIn && clerkUser
      ? {
          userId: clerkUser.id,
          name: clerkUser.fullName ?? clerkUser.username ?? "User",
          email: clerkUser.primaryEmailAddress?.emailAddress ?? "",
          avatar: clerkUser.imageUrl ?? "",
          token: token ?? "",
        }
      : null;

  // login() is a no-op — sign-in is handled by Clerk in Login.tsx
  const login = useCallback(() => {}, []);

  const logout = useCallback(() => {
    signOut();
  }, [signOut]);

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated: !!isSignedIn,
        token,
        login,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}