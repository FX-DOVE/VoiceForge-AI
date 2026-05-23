"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { motion } from "framer-motion";
import { 
  ArrowLeft, 
  Eye,
  EyeOff,
  Mic,
  AlertTriangle
} from "lucide-react";
import { useState, useEffect, useRef, useCallback } from "react";
import { useAuth } from "@/contexts/auth-context";
import { toast } from "sonner";
import { ApiError } from "@/lib/api/client";
import { WelcomeCreditsModal } from "@/components/modals/welcome-credits-modal";
import Script from "next/script";

export default function SignupPage() {
  const router = useRouter();
  const { register, googleLogin } = useAuth();
  const [showPassword, setShowPassword] = useState(false);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [termsAccepted, setTermsAccepted] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [showWelcomeModal, setShowWelcomeModal] = useState(false);
  const [welcomeCredits, setWelcomeCredits] = useState(2380);

  const googleButtonRef = useRef(null);
  const googleInitialized = useRef(false);

  // Function to render Google button
  const renderGoogleButton = useCallback(() => {
    if (!window.google?.accounts?.id || !googleButtonRef.current) return;
    
    if (!googleInitialized.current) {
      window.google.accounts.id.initialize({
        client_id: process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID,
        callback: async (credentialResponse) => {
          if (credentialResponse.credential) {
            setGoogleLoading(true);
            try {
              const result = await googleLogin(credentialResponse.credential);
              
              if (result.isNewUser && result.welcomeCreditsGranted) {
                setWelcomeCredits(result.welcomeCreditsAmount);
                setShowWelcomeModal(true);
                toast.success(`Welcome! ${result.welcomeCreditsAmount} credits added to your account.`);
              } else if (result.isNewUser) {
                toast.success("Account created successfully with Google!");
                router.push("/dashboard");
              } else {
                toast.success("Signed in successfully with Google.");
                router.push("/dashboard");
              }
            } catch (err) {
              console.error("[Google Sign-Up] Error:", err);
              toast.error(err?.message || "Google sign up failed. Please try again.");
            } finally {
              setGoogleLoading(false);
            }
          }
        },
        auto_select: false,
        cancel_on_tap_outside: true,
      });
      googleInitialized.current = true;
    }

    window.google.accounts.id.renderButton(googleButtonRef.current, {
      theme: "outline",
      size: "large",
      width: "100%",
      text: "continue_with",
      shape: "rectangular",
    });
  }, [googleLogin, router]);

  // Try to render when component mounts (if SDK already loaded)
  useEffect(() => {
    renderGoogleButton();
  }, [renderGoogleButton]);

  // Listen for Google SDK load event
  useEffect(() => {
    window.__googleSignUpCallback = renderGoogleButton;
    return () => { delete window.__googleSignUpCallback; };
  }, [renderGoogleButton]);

  const handleSignup = async (e) => {
    e.preventDefault();
    if (!termsAccepted) {
      toast.error("You must accept the Terms of Service, Privacy Policy, and Refund Policy to create an account.");
      return;
    }
    setSubmitting(true);
    try {
      const result = await register({ email, password, name, termsAccepted, termsVersion: "2026-05-18" });
      toast.success("Account created successfully.");
      
      // Show welcome modal if credits were granted
      if (result.welcomeCreditsGranted) {
        setWelcomeCredits(result.welcomeCreditsAmount || 2380);
        setShowWelcomeModal(true);
      } else {
        router.push("/dashboard");
      }
    } catch (err) {
      toast.error(err instanceof ApiError ? err.message : "Sign up failed.");
    } finally {
      setSubmitting(false);
    }
  };
  
  const handleWelcomeModalClose = () => {
    setShowWelcomeModal(false);
    router.push("/dashboard");
  };

  return (
    <>
      <WelcomeCreditsModal 
        isOpen={showWelcomeModal} 
        onClose={handleWelcomeModalClose}
        creditsAmount={welcomeCredits}
      />
      <div className="bg-background text-on-surface antialiased min-h-screen overflow-x-hidden">
      <meta name="robots" content="noindex, nofollow" />
      <div className="flex w-full min-h-screen lg:h-screen">
        {/* Left Pane: 3D Visual */}
        <div className="hidden lg:flex w-1/2 relative bg-surface-container-lowest border-r border-white/5">
          <motion.img 
            initial={{ opacity: 0, scale: 1.1 }}
            animate={{ opacity: 0.8, scale: 1 }}
            transition={{ duration: 1.5 }}
            alt="VoiceForge AI Visualization" 
            className="absolute inset-0 w-full h-full object-cover mix-blend-screen" 
            src="https://lh3.googleusercontent.com/aida-public/AB6AXuClYdI7HXEmXhvpPHMcqTSdJB_GZgHWPDEaIF4D4rUGMXakXZxhxYthkMTULe7hKJ-L_4ufivnSgMDuoFrpvGPK9vR1ijxzL1E1M69-gkb_7A2DUsYopZEV393g2ceVV_HyWaaf5q8ep-O8tJU4xrDtWiI7B8AaIAPfTJ3RLlwg0jMBt09_7rh8HEgxZnF-ZuoLeVeVvAZeKVUc-0NPHb1PvCp5B9ov7h8fkkj8sXBVrIB5Uzp2PWso5vpqm0B7irDKlMPoff_qrhI"
          />
          {/* Gradient Overlay for Depth */}
          <div className="absolute inset-0 bg-gradient-to-t from-background via-transparent to-transparent opacity-90"></div>
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-transparent to-background opacity-100"></div>
          
          <div className="absolute bottom-20 left-20 z-10 max-w-md">
            <motion.div 
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.5 }}
              className="flex items-center gap-3 text-primary mb-8"
            >
              <div className="size-10 bg-primary/20 rounded-xl flex items-center justify-center">
                <Mic className="size-6 text-primary" />
              </div>
              <h2 className="text-2xl font-bold tracking-tight text-white">VoiceForge AI</h2>
            </motion.div>
            <motion.h3 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.7 }}
              className="text-6xl font-bold text-white mb-6 leading-[1.1]"
            >
              Shape the sound of tomorrow.
            </motion.h3>
            <motion.p 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.9 }}
              className="text-xl text-on-surface-variant"
            >
              Experience next-generation text-to-speech with unprecedented emotional range and clarity.
            </motion.p>
          </div>
        </div>

        {/* Right Pane: Minimal Form */}
        <div className="w-full lg:w-1/2 flex flex-col relative bg-background overflow-y-auto min-h-screen lg:min-h-0">
          {/* Minimal Back Header */}
          <header className="sticky top-0 w-full px-6 sm:px-8 py-5 flex items-center justify-between z-20 bg-background/80 backdrop-blur-md border-b border-white/5 lg:absolute lg:border-0 lg:bg-transparent lg:backdrop-blur-none">
            <Button 
              variant="ghost" 
              className="size-12 rounded-full hover:bg-surface-container text-on-surface-variant hover:text-on-background backdrop-blur-md"
              asChild
            >
              <Link href="/">
                <ArrowLeft className="size-6" />
              </Link>
            </Button>
            
            {/* Mobile Logo */}
            <div className="flex lg:hidden items-center gap-2 text-primary">
               <Mic className="size-8" />
            </div>
          </header>

          {/* Form Container */}
          <main className="flex-1 flex flex-col justify-center px-6 py-10 lg:py-20 items-center lg:items-start max-w-[640px] w-full mx-auto">
            <div className="w-full max-w-[440px]">
              <div className="text-center lg:text-left mb-10">
                <h1 className="text-4xl font-bold text-on-background mb-2">Create your account</h1>
                <p className="text-on-surface-variant">Join VoiceForge AI to start creating studio-quality voiceovers.</p>
              </div>

              {/* Google OAuth Signup - ref-based container */}
              <div className="mb-8">
                <div ref={googleButtonRef} className="w-full min-h-[44px]" />
              </div>

              <div className="flex items-center gap-4 mb-8">
                <div className="h-px flex-1 bg-white/5"></div>
                <span className="text-xs font-bold text-on-surface-variant uppercase tracking-widest">Or continue with email</span>
                <div className="h-px flex-1 bg-white/5"></div>
              </div>

              {/* Signup Form */}
              <form className="flex flex-col gap-6" onSubmit={handleSignup}>
                <div className="flex flex-col gap-2">
                  <label className="text-sm font-bold text-on-background" htmlFor="name">Full Name</label>
                  <Input 
                    id="name"
                    className="h-14 bg-surface-container/30 border-white/10 rounded-2xl focus:ring-primary/20 transition-all placeholder:text-outline" 
                    placeholder="Enter your full name" 
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    required
                  />
                </div>

                <div className="flex flex-col gap-2">
                  <label className="text-sm font-bold text-on-background" htmlFor="email">Email</label>
                  <Input 
                    id="email"
                    type="email"
                    className="h-14 bg-surface-container/30 border-white/10 rounded-2xl focus:ring-primary/20 transition-all placeholder:text-outline" 
                    placeholder="name@example.com" 
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                  />
                </div>

                <div className="flex flex-col gap-2">
                  <label className="text-sm font-bold text-on-background" htmlFor="password">Password</label>
                  <div className="relative group">
                    <Input 
                      id="password"
                      type={showPassword ? "text" : "password"}
                      className="h-14 bg-surface-container/30 border-white/10 rounded-2xl focus:ring-primary/20 transition-all placeholder:text-outline pr-12" 
                      placeholder="Create a strong password" 
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      required
                    />
                    <button 
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-4 top-1/2 -translate-y-1/2 text-outline hover:text-on-surface transition-colors"
                    >
                      {showPassword ? <EyeOff className="size-5" /> : <Eye className="size-5" />}
                    </button>
                  </div>
                </div>

                {/* Anti-Abuse Notice */}
                <div className="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/20 flex items-start gap-3">
                  <AlertTriangle className="size-5 text-amber-500 shrink-0 mt-0.5" />
                  <p className="text-sm text-amber-200/80">
                    Creating multiple accounts to obtain additional free credits is strictly prohibited and may result in account suspension, credit forfeiture, and permanent bans.
                  </p>
                </div>

                {/* Legal Acceptance Checkbox */}
                <label className="flex items-start gap-3 cursor-pointer group">
                  <div className="relative flex items-center">
                    <input
                      type="checkbox"
                      checked={termsAccepted}
                      onChange={(e) => setTermsAccepted(e.target.checked)}
                      className="peer sr-only"
                    />
                    <div className="size-5 rounded border border-white/20 bg-white/5 peer-checked:bg-primary peer-checked:border-primary transition-all flex items-center justify-center">
                      <svg className="size-3 text-white opacity-0 peer-checked:opacity-100" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                      </svg>
                    </div>
                  </div>
                  <span className="text-sm text-on-surface-variant leading-relaxed">
                    I have read and agree to the{" "}
                    <Link href="/terms" className="text-primary hover:underline">Terms of Service</Link>,{" "}
                    <Link href="/privacy" className="text-primary hover:underline">Privacy Policy</Link>, and{" "}
                    <Link href="/refund-policy" className="text-primary hover:underline">Refund Policy</Link>.
                  </span>
                </label>

                <Button 
                  type="submit" 
                  disabled={submitting || !termsAccepted} 
                  className="w-full h-14 bg-primary hover:bg-primary/90 text-on-primary rounded-full text-lg font-bold shadow-[0_0_24px_rgba(59,130,246,0.15)] mt-4 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {submitting ? "Creating account..." : "Sign Up"}
                </Button>
              </form>

              <div className="mt-10 text-center">
                <p className="text-on-surface-variant">
                  Already have an account?{" "}
                  <Link className="text-primary hover:text-primary/80 font-bold transition-colors" href="/login">
                    Sign in
                  </Link>
                </p>
              </div>
            </div>
          </main>
        </div>
      </div>
    </div>
      <Script
        src="https://accounts.google.com/gsi/client"
        strategy="afterInteractive"
        onLoad={() => {
          if (window.__googleSignUpCallback) window.__googleSignUpCallback();
        }}
      />
    </>
  );
}
