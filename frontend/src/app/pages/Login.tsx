import { useEffect } from "react";
import { useNavigate, useLocation } from "react-router";
import { Code2, ArrowLeft } from "lucide-react";
import { useSignIn, useAuth } from "@clerk/clerk-react";

function GoogleIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
      <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
      <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
      <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
      <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
    </svg>
  );
}

export default function Login() {
  const navigate = useNavigate();
  const location = useLocation();
  const { isSignedIn } = useAuth();
  const { signIn, isLoaded } = useSignIn();
  const from = (location.state as { from?: string })?.from ?? "/dashboard";

  // If already signed in, redirect immediately
  useEffect(() => {
    if (isSignedIn) navigate(from, { replace: true });
  }, [isSignedIn, navigate, from]);

  const handleGoogleSignIn = async () => {
    if (!isLoaded) return;
    try {
      await signIn.authenticateWithRedirect({
        strategy: "oauth_google",
        redirectUrl: "/sso-callback",
        redirectUrlComplete: from,
      });
    } catch (err) {
      console.error("Google sign-in error:", err);
    }
  };

  return (
    <div className="min-h-screen bg-[#111111] flex items-center justify-center p-6">
      {/* BG glow */}
      <div className="fixed inset-0 bg-gradient-radial from-primary/5 via-transparent to-transparent pointer-events-none" />

      <div className="relative w-full max-w-sm">
        {/* Back link */}
        <button
          onClick={() => navigate("/")}
          className="flex items-center gap-2 text-sm text-[#666] hover:text-[#aaa] transition-colors mb-8"
        >
          <ArrowLeft className="w-4 h-4" /> Back to home
        </button>

        {/* Card */}
        <div className="bg-[#1a1a1a] border border-[#2a2a2a] rounded-2xl p-8 shadow-2xl">
          {/* Logo */}
          <div className="flex items-center gap-2.5 mb-8">
            <div className="w-9 h-9 rounded-xl bg-primary flex items-center justify-center">
              <Code2 className="w-5 h-5 text-white" />
            </div>
            <div className="leading-none">
              <p className="font-bold text-white text-sm">SkillDzire</p>
              <p className="text-[10px] text-[#666] font-mono tracking-wider">CodeLab</p>
            </div>
          </div>

          <h1 className="text-xl font-bold text-white mb-2">Welcome back</h1>
          <p className="text-[#888] text-sm leading-relaxed mb-8">
            Sign in using your SkillDzire account to save projects and access your coding history.
          </p>

          {/* Google sign-in */}
          <button
            onClick={handleGoogleSignIn}
            disabled={!isLoaded}
            className="w-full flex items-center justify-center gap-3 py-3.5 bg-white text-[#111] rounded-xl font-bold text-sm hover:bg-gray-100 active:scale-[0.98] transition-all shadow-lg mb-4 disabled:opacity-60 disabled:cursor-not-allowed"
          >
            <GoogleIcon />
            Continue with Google
          </button>

          <p className="text-xs text-center text-[#555] leading-relaxed">
            By signing in you agree to the SkillDzire{" "}
            <span className="text-primary cursor-pointer hover:underline">Terms of Service</span>
            {" "}and{" "}
            <span className="text-primary cursor-pointer hover:underline">Privacy Policy</span>.
          </p>

          {/* Divider */}
          <div className="flex items-center gap-3 my-6">
            <div className="flex-1 h-px bg-[#2a2a2a]" />
            <span className="text-xs text-[#444]">or</span>
            <div className="flex-1 h-px bg-[#2a2a2a]" />
          </div>

          {/* Guest mode */}
          <button
            onClick={() => navigate("/compiler")}
            className="w-full flex items-center justify-center gap-2 py-3 bg-transparent border border-[#2a2a2a] text-[#888] rounded-xl text-sm hover:border-primary/40 hover:text-primary transition-colors"
          >
            Continue as Guest
            <span className="text-xs text-[#555]">(limited features)</span>
          </button>
        </div>

        {/* Guest notice */}
        <p className="text-center text-xs text-[#444] mt-4 leading-relaxed px-4">
          Guest mode lets you run code but project saving and execution history require sign-in.
        </p>
      </div>
    </div>
  );
}