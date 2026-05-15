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
  Mic
} from "lucide-react";
import { GithubIcon as Github, GoogleIcon as Google } from "@/components/ui/icons";
import { useState } from "react";

export default function SignupPage() {
  const router = useRouter();
  const [showPassword, setShowPassword] = useState(false);

  const handleSignup = (e) => {
    e.preventDefault();
    router.push("/dashboard");
  };

  return (
    <div className="bg-background text-on-surface antialiased overflow-hidden min-h-screen">
      <div className="flex w-full h-screen">
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
        <div className="w-full lg:w-1/2 flex flex-col relative bg-background overflow-y-auto">
          {/* Minimal Back Header */}
          <header className="absolute top-0 left-0 w-full p-8 flex items-center justify-between z-20">
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
          <main className="flex-1 flex flex-col justify-center px-6 py-20 items-center lg:items-start max-w-[640px] w-full mx-auto">
            <div className="w-full max-w-[440px]">
              <div className="text-center lg:text-left mb-10">
                <h1 className="text-4xl font-bold text-on-background mb-2">Create your account</h1>
                <p className="text-on-surface-variant">Join VoiceForge AI to start creating studio-quality voiceovers.</p>
              </div>

              {/* Social Logins */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-8">
                <Button variant="outline" className="h-12 rounded-full border-white/10 bg-white/5 hover:bg-white/10">
                   <Google className="mr-2 size-5 text-red-500" />
                   Google
                </Button>
                <Button variant="outline" className="h-12 rounded-full border-white/10 bg-white/5 hover:bg-white/10">
                   <Github className="mr-2 size-5" />
                   GitHub
                </Button>
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

                <Button className="w-full h-14 bg-primary hover:bg-primary/90 text-on-primary rounded-full text-lg font-bold shadow-[0_0_24px_rgba(59,130,246,0.15)] mt-4">
                  Sign Up
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
  );
}
