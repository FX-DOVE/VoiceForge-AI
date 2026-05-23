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
        <div className="hidden lg:flex w-1/2 relative bg-surface-container-lowest border-r border-white/5 overflow-hidden">
          {/* Animated Audio Wave */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 1.5 }}
            className="absolute inset-0 flex items-center justify-center"
          >
            <style jsx>{`
              @keyframes waveShift1 {
                0% { transform: translateX(0); }
                100% { transform: translateX(-50%); }
              }
              @keyframes waveShift2 {
                0% { transform: translateX(0); }
                100% { transform: translateX(-50%); }
              }
              @keyframes waveShift3 {
                0% { transform: translateX(0); }
                100% { transform: translateX(-50%); }
              }
              @keyframes pulseGlow {
                0%, 100% { opacity: 0.4; }
                50% { opacity: 0.8; }
              }
              .wave-layer-1 { animation: waveShift1 8s linear infinite; }
              .wave-layer-2 { animation: waveShift2 12s linear infinite; }
              .wave-layer-3 { animation: waveShift3 6s linear infinite; }
              .wave-glow { animation: pulseGlow 4s ease-in-out infinite; }
            `}</style>
            
            {/* Glow background */}
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="wave-glow w-[120%] h-[300px] bg-gradient-to-r from-purple-600/20 via-cyan-400/30 to-pink-500/20 blur-[80px] rounded-full" />
            </div>
            
            {/* Wave Layer 1 - Cyan/Blue (front) */}
            <svg className="absolute w-[200%] h-[400px]" viewBox="0 0 2400 400" preserveAspectRatio="none">
              <defs>
                <linearGradient id="waveGrad1" x1="0%" y1="0%" x2="100%" y2="0%">
                  <stop offset="0%" stopColor="#a855f7" stopOpacity="0.6" />
                  <stop offset="25%" stopColor="#6366f1" stopOpacity="0.8" />
                  <stop offset="50%" stopColor="#22d3ee" stopOpacity="0.9" />
                  <stop offset="75%" stopColor="#6366f1" stopOpacity="0.8" />
                  <stop offset="100%" stopColor="#ec4899" stopOpacity="0.6" />
                </linearGradient>
                <filter id="glow1">
                  <feGaussianBlur stdDeviation="4" result="blur" />
                  <feMerge><feMergeNode in="blur" /><feMergeNode in="SourceGraphic" /></feMerge>
                </filter>
              </defs>
              <g className="wave-layer-1" filter="url(#glow1)">
                <path d="M0,200 C50,160 100,240 150,200 C200,160 250,240 300,200 C350,160 400,240 450,200 C500,160 550,240 600,200 C650,160 700,240 750,200 C800,160 850,240 900,200 C950,160 1000,240 1050,200 C1100,160 1150,240 1200,200 C1250,160 1300,240 1350,200 C1400,160 1450,240 1500,200 C1550,160 1600,240 1650,200 C1700,160 1750,240 1800,200 C1850,160 1900,240 1950,200 C2000,160 2050,240 2100,200 C2150,160 2200,240 2250,200 C2300,160 2350,240 2400,200" fill="none" stroke="url(#waveGrad1)" strokeWidth="3" />
                <path d="M0,200 C50,170 100,230 150,200 C200,170 250,230 300,200 C350,170 400,230 450,200 C500,170 550,230 600,200 C650,170 700,230 750,200 C800,170 850,230 900,200 C950,170 1000,230 1050,200 C1100,170 1150,230 1200,200 C1250,170 1300,230 1350,200 C1400,170 1450,230 1500,200 C1550,170 1600,230 1650,200 C1700,170 1750,230 1800,200 C1850,170 1900,230 1950,200 C2000,170 2050,230 2100,200 C2150,170 2200,230 2250,200 C2300,170 2350,230 2400,200" fill="none" stroke="url(#waveGrad1)" strokeWidth="2" opacity="0.5" />
              </g>
            </svg>

            {/* Wave Layer 2 - Purple (middle) */}
            <svg className="absolute w-[200%] h-[400px]" viewBox="0 0 2400 400" preserveAspectRatio="none">
              <defs>
                <linearGradient id="waveGrad2" x1="0%" y1="0%" x2="100%" y2="0%">
                  <stop offset="0%" stopColor="#c084fc" stopOpacity="0.4" />
                  <stop offset="50%" stopColor="#818cf8" stopOpacity="0.7" />
                  <stop offset="100%" stopColor="#f472b6" stopOpacity="0.4" />
                </linearGradient>
              </defs>
              <g className="wave-layer-2">
                <path d="M0,200 C60,150 120,250 180,200 C240,150 300,250 360,200 C420,150 480,250 540,200 C600,150 660,250 720,200 C780,150 840,250 900,200 C960,150 1020,250 1080,200 C1140,150 1200,250 1260,200 C1320,150 1380,250 1440,200 C1500,150 1560,250 1620,200 C1680,150 1740,250 1800,200 C1860,150 1920,250 1980,200 C2040,150 2100,250 2160,200 C2220,150 2280,250 2340,200 C2340,150 2370,250 2400,200" fill="none" stroke="url(#waveGrad2)" strokeWidth="2.5" />
              </g>
            </svg>

            {/* Wave Layer 3 - Pink/Magenta (back) */}
            <svg className="absolute w-[200%] h-[400px]" viewBox="0 0 2400 400" preserveAspectRatio="none">
              <defs>
                <linearGradient id="waveGrad3" x1="0%" y1="0%" x2="100%" y2="0%">
                  <stop offset="0%" stopColor="#e879f9" stopOpacity="0.3" />
                  <stop offset="50%" stopColor="#38bdf8" stopOpacity="0.5" />
                  <stop offset="100%" stopColor="#c084fc" stopOpacity="0.3" />
                </linearGradient>
              </defs>
              <g className="wave-layer-3">
                <path d="M0,200 C70,140 140,260 210,200 C280,140 350,260 420,200 C490,140 560,260 630,200 C700,140 770,260 840,200 C910,140 980,260 1050,200 C1120,140 1190,260 1260,200 C1330,140 1400,260 1470,200 C1540,140 1610,260 1680,200 C1750,140 1820,260 1890,200 C1960,140 2030,260 2100,200 C2170,140 2240,260 2310,200 C2310,140 2355,260 2400,200" fill="none" stroke="url(#waveGrad3)" strokeWidth="2" />
              </g>
            </svg>

            {/* Particle dots along waves */}
            <svg className="absolute w-[200%] h-[400px]" viewBox="0 0 2400 400" preserveAspectRatio="none">
              <g className="wave-layer-1">
                {[0,150,300,450,600,750,900,1050,1200,1350,1500,1650,1800,1950,2100,2250].map((x, i) => (
                  <circle key={i} cx={x} cy={200 + Math.sin(x * 0.02) * 40} r="2" fill="#22d3ee" opacity={0.3 + Math.random() * 0.5}>
                    <animate attributeName="opacity" values="0.3;0.8;0.3" dur={`${2 + i * 0.3}s`} repeatCount="indefinite" />
                    <animate attributeName="r" values="1;3;1" dur={`${3 + i * 0.2}s`} repeatCount="indefinite" />
                  </circle>
                ))}
              </g>
            </svg>
          </motion.div>

          {/* Gradient Overlays for Depth */}
          <div className="absolute inset-0 bg-gradient-to-t from-background via-transparent to-transparent opacity-90 z-[1]"></div>
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-transparent to-background opacity-100 z-[1]"></div>
          <div className="absolute inset-0 bg-gradient-to-b from-background/80 via-transparent to-transparent opacity-60 z-[1]"></div>
          
          <div className="absolute bottom-20 left-20 z-[2] max-w-md">
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
