"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { motion } from "framer-motion";
import { 
  ArrowLeft, 
  CheckCircle2, 
  Lock, 
  ShieldCheck, 
  CreditCard,
  HelpCircle,
  Shield,
  History,
  Headphones
} from "lucide-react";
import { cn } from "@/lib/utils";

export default function CheckoutPage() {
  const router = useRouter();

  const handleCheckout = (e) => {
    e.preventDefault();
    router.push("/dashboard?upgrade=success");
  };

  return (
    <div className="flex min-h-screen flex-col bg-background text-on-surface selection:bg-primary-container selection:text-on-primary-container">
      {/* Focused View Header */}
      <nav className="max-w-container-max mx-auto w-full px-4 sm:px-6 lg:px-8 py-5 sm:py-6 flex items-center justify-between border-b border-white/5">
        <div className="flex items-center gap-3">
          <div className="size-8 bg-primary/20 rounded-lg flex items-center justify-center">
             <div className="size-4 bg-primary rounded-sm" />
          </div>
          <span className="text-xl font-bold text-white tracking-tight">VoiceForge AI</span>
        </div>
        <Link className="flex items-center gap-2 text-on-surface-variant hover:text-white transition-colors font-bold text-sm" href="/dashboard">
          <ArrowLeft className="size-4" />
          Return to Dashboard
        </Link>
      </nav>

      <main className="max-w-container-max mx-auto w-full px-4 sm:px-6 lg:px-8 py-10 sm:py-12 lg:py-16">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-16 items-start">
          {/* Left Column: Order Summary */}
          <div className="lg:col-span-5 flex flex-col gap-10">
            <div className="flex flex-col gap-4">
              <motion.h1 
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                className="text-4xl sm:text-5xl lg:text-6xl font-bold text-white leading-[1.1] tracking-tight"
              >
                Upgrade to <br/>Pro Plan
              </motion.h1>
              <p className="text-base sm:text-lg lg:text-xl text-on-surface-variant">Experience the full power of VoiceForge AI</p>
            </div>

            <div className="glass-panel rounded-[1.5rem] sm:rounded-[2rem] p-5 sm:p-8 flex flex-col gap-8 border-white/5">
              <h2 className="text-2xl font-bold text-white border-b border-white/5 pb-6">Order Summary</h2>
              
              <div className="flex items-stretch justify-between gap-6 rounded-2xl bg-white/5 p-4 border border-white/5">
                <div className="flex flex-col gap-4">
                  <div className="flex flex-col gap-1">
                    <p className="text-white font-bold text-lg">VoiceForge Pro Plan</p>
                    <p className="text-3xl font-bold text-primary">$49.99<span className="text-sm text-on-surface-variant font-normal tracking-normal"> / month</span></p>
                  </div>
                  <Button variant="outline" size="sm" className="rounded-full border-white/10 hover:bg-white/5 font-bold h-9 px-6" asChild>
                    <Link href="/pricing">Change Plan</Link>
                  </Button>
                </div>
                <div 
                  className="w-24 h-24 bg-center bg-no-repeat bg-cover rounded-xl shrink-0 overflow-hidden border border-white/10" 
                  style={{ backgroundImage: 'url("https://lh3.googleusercontent.com/aida-public/AB6AXuBpnJZDzS7Y7oQIx1IJUJOk5ldSmLnhVRaznfbBvdipX5gg48_CDpnya3tdYS2lxXhB5WNQp7USNBG_jcZSA02CPzGgCpU1SnsDtNY7bTQcX78Et_8VygGcCaNCYcjk-Z3f9zUfCPSwErmYhN_QmDKQ83zgoflIgMlGbj07g2K6J3V6r9J2FKv9GBYfMXuEFB3ZmakkdEJupVkAlOrde_EJW0TTvRP4g77cDhVMaSmG4XXqWYBKoP7HNRwXkppSQlUNyKLDU03YoP8")' }}
                />
              </div>

              <div className="flex flex-col gap-4">
                {[
                  "100,000 characters per month",
                  "High-fidelity voice models",
                  "Priority email support",
                  "Commercial usage rights"
                ].map((f) => (
                  <div key={f} className="flex items-center gap-3">
                    <CheckCircle2 className="size-5 text-primary" />
                    <p className="text-on-surface text-base font-medium">{f}</p>
                  </div>
                ))}
              </div>

              <div className="mt-4 pt-8 border-t border-white/5 flex flex-col gap-4">
                <div className="flex justify-between items-center text-on-surface-variant font-medium">
                  <span>Estimated Tax</span>
                  <span className="text-white">$0.00</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-2xl text-white font-bold">Total Due</span>
                  <span className="text-3xl text-primary font-bold">$49.99</span>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-3 opacity-60">
              <ShieldCheck className="size-5 text-primary" />
              <span className="text-xs font-bold uppercase tracking-widest text-on-surface-variant">Secure SSL Encryption</span>
            </div>
          </div>

          {/* Right Column: Secure Payment Form */}
          <div className="lg:col-span-7">
            <motion.div 
              initial={{ opacity: 0, scale: 0.98 }}
              animate={{ opacity: 1, scale: 1 }}
              className="glass-panel rounded-[1.5rem] sm:rounded-[2rem] p-5 sm:p-8 lg:p-10 flex flex-col gap-8 lg:gap-10 border-white/5"
            >
              <div className="flex items-center justify-between flex-wrap gap-4">
                <h2 className="text-2xl font-bold text-white">Payment Method</h2>
                <div className="flex gap-4 opacity-70">
                   <div className="h-6 w-10 bg-white/10 rounded flex items-center justify-center font-bold text-[8px] uppercase tracking-tighter">Visa</div>
                   <div className="h-6 w-10 bg-white/10 rounded flex items-center justify-center font-bold text-[8px] uppercase tracking-tighter">MC</div>
                   <div className="h-6 w-10 bg-white/10 rounded flex items-center justify-center font-bold text-[8px] uppercase tracking-tighter">PayPal</div>
                </div>
              </div>

              <form className="flex flex-col gap-8" onSubmit={handleCheckout}>
                {/* Card Details */}
                <div className="flex flex-col gap-3">
                  <label className="text-sm font-bold text-on-surface-variant uppercase tracking-wider">Card Number</label>
                  <div className="relative group">
                    <Input 
                      className="h-14 pl-6 pr-12 bg-white/5 border-white/10 rounded-2xl focus:ring-primary/20 transition-all font-mono" 
                      placeholder="0000 0000 0000 0000"
                      required
                    />
                    <CreditCard className="absolute right-6 top-1/2 -translate-y-1/2 size-5 text-on-surface-variant" />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-6">
                  <div className="flex flex-col gap-3">
                    <label className="text-sm font-bold text-on-surface-variant uppercase tracking-wider">Expiry Date</label>
                    <Input 
                      className="h-14 px-6 bg-white/5 border-white/10 rounded-2xl focus:ring-primary/20 transition-all" 
                      placeholder="MM / YY" 
                      required
                    />
                  </div>
                  <div className="flex flex-col gap-3">
                    <label className="text-sm font-bold text-on-surface-variant uppercase tracking-wider">CVC</label>
                    <div className="relative">
                      <Input 
                        className="h-14 px-6 bg-white/5 border-white/10 rounded-2xl focus:ring-primary/20 transition-all" 
                        placeholder="•••" 
                        type="password"
                        required
                      />
                      <HelpCircle className="absolute right-6 top-1/2 -translate-y-1/2 size-5 text-on-surface-variant" />
                    </div>
                  </div>
                </div>

                {/* Billing Address */}
                <div className="flex flex-col gap-8 pt-8 border-t border-white/5">
                  <h3 className="text-xl font-bold text-white">Billing Address</h3>
                  
                  <div className="flex flex-col gap-3">
                    <label className="text-sm font-bold text-on-surface-variant uppercase tracking-wider">Country</label>
                    <div className="relative group">
                      <select className="w-full h-14 bg-white/5 border border-white/10 rounded-2xl px-6 focus:ring-2 focus:ring-primary/20 transition-all appearance-none text-white outline-none">
                        <option>United States</option>
                        <option>United Kingdom</option>
                        <option>Canada</option>
                        <option>Germany</option>
                      </select>
                      <ChevronDown className="absolute right-6 top-1/2 -translate-y-1/2 size-5 text-on-surface-variant pointer-events-none" />
                    </div>
                  </div>

                  <div className="flex flex-col gap-3">
                    <label className="text-sm font-bold text-on-surface-variant uppercase tracking-wider">Street Address</label>
                    <Input className="h-14 px-6 bg-white/5 border-white/10 rounded-2xl focus:ring-primary/20 transition-all" placeholder="123 AI Boulevard" required />
                  </div>

                  <div className="grid grid-cols-2 gap-6">
                    <div className="flex flex-col gap-3">
                      <label className="text-sm font-bold text-on-surface-variant uppercase tracking-wider">City</label>
                      <Input className="h-14 px-6 bg-white/5 border-white/10 rounded-2xl focus:ring-primary/20 transition-all" placeholder="San Francisco" required />
                    </div>
                    <div className="flex flex-col gap-3">
                      <label className="text-sm font-bold text-on-surface-variant uppercase tracking-wider">Postal Code</label>
                      <Input className="h-14 px-6 bg-white/5 border-white/10 rounded-2xl focus:ring-primary/20 transition-all" placeholder="94103" required />
                    </div>
                  </div>
                </div>

                {/* Submit CTA */}
                <div className="mt-4 flex flex-col gap-6">
                  <Button className="w-full h-16 bg-primary hover:bg-primary/90 text-on-primary rounded-full text-xl font-bold shadow-[0_0_30px_rgba(59,130,246,0.3)] transition-all" type="submit">
                    <Lock className="mr-2 size-5 fill-current" />
                    Complete Upgrade
                  </Button>
                  <p className="text-center text-xs text-on-surface-variant px-12 leading-relaxed">
                    By completing this purchase, you agree to our <Link className="text-primary hover:underline font-bold" href="/terms">Terms of Service</Link> and authorize a recurring monthly charge of $49.99.
                  </p>
                </div>
              </form>
            </motion.div>

            {/* Trust Badges */}
            <div className="mt-12 grid grid-cols-3 gap-4 sm:gap-8">
              <div className="flex flex-col items-center gap-3 text-on-surface-variant group">
                <Shield className="size-10 text-primary opacity-50 group-hover:opacity-100 transition-opacity" />
                <span className="text-xs font-bold uppercase tracking-widest text-center">Bank-level Security</span>
              </div>
              <div className="flex flex-col items-center gap-3 text-on-surface-variant group">
                <History className="size-10 text-primary opacity-50 group-hover:opacity-100 transition-opacity" />
                <span className="text-xs font-bold uppercase tracking-widest text-center">7-Day Refund Policy</span>
              </div>
              <div className="flex flex-col items-center gap-3 text-on-surface-variant group">
                <Headphones className="size-10 text-primary opacity-50 group-hover:opacity-100 transition-opacity" />
                <span className="text-xs font-bold uppercase tracking-widest text-center">24/7 Priority Support</span>
              </div>
            </div>
          </div>
        </div>
      </main>

      <footer className="max-w-container-max mx-auto w-full px-4 sm:px-6 lg:px-8 py-10 mt-auto flex flex-col sm:flex-row justify-between items-center border-t border-white/5 gap-6">
        <p className="text-sm text-on-surface-variant">© 2024 VoiceForge AI. All rights reserved.</p>
        <div className="flex gap-8">
          <Link className="text-sm text-on-surface-variant hover:text-white transition-colors" href="/privacy">Privacy Policy</Link>
          <Link className="text-sm text-on-surface-variant hover:text-white transition-colors" href="/terms">Terms of Use</Link>
          <Link className="text-sm text-on-surface-variant hover:text-white transition-colors" href="/help">Help Center</Link>
        </div>
      </footer>
    </div>
  );
}

// Helper component for chevron
function ChevronDown(props) {
  return (
    <svg 
      {...props} 
      xmlns="http://www.w3.org/2000/svg" 
      width="24" 
      height="24" 
      viewBox="0 0 24 24" 
      fill="none" 
      stroke="currentColor" 
      strokeWidth="2" 
      strokeLinecap="round" 
      strokeLinejoin="round"
    >
      <path d="m6 9 6 6 6-6" />
    </svg>
  );
}

