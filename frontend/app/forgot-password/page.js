"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { motion } from "framer-motion";
import { 
  LockKeyhole, 
  ArrowLeft, 
  ArrowRight, 
  Mail,
  CheckCircle2
} from "lucide-react";
import { useState } from "react";
import { cn } from "@/lib/utils";

export default function ForgotPasswordPage() {
  const [isSent, setIsSent] = useState(false);

  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center relative overflow-hidden px-8">
      {/* Background Decor */}
      <div className="absolute inset-0 z-0 flex items-center justify-center">
         <div className="w-[800px] h-[800px] bg-primary/5 rounded-full blur-[120px] opacity-50" />
      </div>
      
      <header className="absolute top-0 left-0 w-full p-8 flex items-center max-w-container-max mx-auto z-20">
         <Link 
           href="/login" 
           className="flex items-center gap-2 text-on-surface-variant hover:text-white transition-all font-bold group"
         >
           <ArrowLeft className="size-4 group-hover:-translate-x-1 transition-transform" />
           Back to Login
         </Link>
      </header>

      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md relative z-10"
      >
        <div className="glass-panel p-12 rounded-[3rem] border-white/5 bg-white/[0.02] shadow-[0_32px_64px_-12px_rgba(0,0,0,0.5)] flex flex-col gap-10 overflow-hidden">
           {/* Glossy top edge */}
           <div className="absolute top-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-white/10 to-transparent" />
           
           <div className="flex flex-col items-center text-center gap-6">
              <div className="size-16 bg-primary/10 rounded-[2rem] flex items-center justify-center border border-primary/20 shadow-[0_0_20px_rgba(59,130,246,0.15)] group hover:scale-110 transition-transform duration-500">
                 {isSent ? (
                   <CheckCircle2 className="size-8 text-green-400" />
                 ) : (
                   <LockKeyhole className="size-8 text-primary" />
                 )}
              </div>
              <div className="flex flex-col gap-2">
                 <h1 className="text-4xl font-bold text-white tracking-tight">
                    {isSent ? "Email Sent" : "Reset Password"}
                 </h1>
                 <p className="text-on-surface-variant leading-relaxed">
                    {isSent 
                      ? "Check your inbox for a secure reset link. Don't forget to check your spam folder."
                      : "Enter your email address to receive a secure password reset link."}
                 </p>
              </div>
           </div>

           {!isSent ? (
             <form 
               className="flex flex-col gap-8"
               onSubmit={(e) => {
                 e.preventDefault();
                 setIsSent(true);
               }}
             >
                <div className="flex flex-col gap-3">
                   <label className="text-xs font-bold text-on-surface-variant uppercase tracking-widest ml-1">Email Address</label>
                   <div className="relative group">
                      <Mail className="absolute left-4 top-1/2 -translate-y-1/2 size-5 text-on-surface-variant group-focus-within:text-primary transition-colors" />
                      <Input 
                        type="email" 
                        placeholder="name@company.com" 
                        required 
                        className="h-14 pl-12 bg-white/5 border-white/10 rounded-2xl focus:ring-primary/20 text-white placeholder:text-on-surface-variant/50"
                      />
                   </div>
                </div>
                <Button className="h-14 bg-primary hover:bg-primary/90 text-on-primary rounded-full font-bold text-lg shadow-[0_0_30px_rgba(59,130,246,0.2)] group">
                   Send Reset Link
                   <ArrowRight className="ml-2 size-5 group-hover:translate-x-1 transition-transform" />
                </Button>
             </form>
           ) : (
             <Button 
               onClick={() => setIsSent(false)}
               variant="outline" 
               className="h-14 rounded-full border-white/10 hover:bg-white/5 font-bold"
             >
                Try a different email
             </Button>
           )}

           <div className="pt-8 border-t border-white/5 text-center">
              <p className="text-sm font-medium text-on-surface-variant">
                 Remember your password? 
                 <Link href="/login" className="text-primary hover:text-white ml-2 underline-offset-8 hover:underline transition-all">Return to Login</Link>
              </p>
           </div>
        </div>
      </motion.div>
    </div>
  );
}
