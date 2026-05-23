import Link from "next/link";
import { MarketingPageShell } from "@/components/layout/marketing-page-shell";
import { Button } from "@/components/ui/button";
import { Schema } from "@/components/seo/Schema";
import { 
  Sparkles, 
  Mic, 
  ShieldCheck, 
  Lock, 
  Users, 
  ArrowRight,
  CheckCircle2,
  Volume2
} from "lucide-react";

export const metadata = {
  title: "AI Voice Cloning Software | Clone Your Voice Instantly",
  description:
    "Create a realistic digital replica of any voice with VoiceForge AI's custom voice cloning software. Safe, secure, and professional-grade voice cloning.",
  alternates: {
    canonical: "/voice-cloning",
  },
};

export default function VoiceCloningPage() {
  const schemaData = {
    name: "VoiceForge AI Voice Cloning Software",
    description: "Create a perfect digital replica of any voice using just 1 minute of clear audio reference.",
    applicationCategory: "MultimediaApplication",
    operatingSystem: "Web",
    offers: {
      "@type": "Offer",
      price: "0.00",
      priceCurrency: "USD",
    }
  };

  const steps = [
    {
      step: "01",
      title: "Upload Audio Reference",
      desc: "Provide 1 to 5 minutes of high-quality, clear audio recording. Ensure there is minimal background noise.",
      icon: Mic
    },
    {
      step: "02",
      title: "Secure Training Model",
      desc: "Our neural network extracts deep vocal characteristics including tone, pitch, cadence, and unique nuances.",
      icon: Sparkles
    },
    {
      step: "03",
      title: "Generate Custom Speech",
      desc: "Input any text and generate high-fidelity speech in your cloned voice across 50+ languages instantly.",
      icon: Volume2
    }
  ];

  return (
    <>
      <Schema type="SoftwareApplication" data={schemaData} />
      <MarketingPageShell
        eyebrow="Voice Cloning"
        title="Create your perfect digital voice replica"
        subtitle="High-fidelity AI voice cloning software. Clone your own voice or any voice talent with just 1 minute of audio reference. Instant setup, realistic results."
      >
        <div className="flex flex-col gap-24 py-6">
          
          {/* Main Features Grid */}
          <section className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              {
                icon: ShieldCheck,
                title: "Consent-Driven Security",
                description:
                  "We strictly enforce speaker consent. Your voice clone belongs exclusively to your account, protected by industry-leading security.",
              },
              {
                icon: Sparkles,
                title: "Flawless Emotional Nuance",
                description:
                  "Our advanced voice generator retains breathing, emotional depth, and unique inflections, making speech sound completely natural.",
              },
              {
                icon: Users,
                title: "Multi-Language Dubbing",
                description:
                  "Generate speech using your custom voice clone in 50+ languages. Speak Spanish, Japanese, or German while preserving your voice identity.",
              },
            ].map((item, i) => (
              <div
                key={item.title}
                className="glass-panel rounded-[2rem] border-white/5 p-8 flex flex-col gap-4 hover:border-primary/20 transition-all group"
              >
                <div className="size-14 rounded-2xl bg-primary/10 text-primary flex items-center justify-center group-hover:scale-110 transition-transform">
                  <item.icon className="size-7" />
                </div>
                <h3 className="text-xl font-bold text-white mt-2">{item.title}</h3>
                <p className="text-on-surface-variant text-sm leading-relaxed">{item.description}</p>
              </div>
            ))}
          </section>

          {/* How It Works Section */}
          <section className="flex flex-col gap-12">
            <div className="text-center max-w-2xl mx-auto flex flex-col gap-4">
              <h2 className="text-3xl sm:text-4xl font-bold text-white tracking-tight">
                How Custom Voice Cloning Works
              </h2>
              <p className="text-on-surface-variant">
                Creating your own AI voice clone is simple. Follow these three steps to begin generating synthetic speech.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {steps.map((s) => (
                <div key={s.step} className="relative glass-panel p-8 rounded-[2rem] border-white/5 flex flex-col gap-4">
                  <div className="absolute top-6 right-8 text-5xl font-black text-white/5 font-mono select-none">
                    {s.step}
                  </div>
                  <div className="size-12 rounded-xl bg-primary/10 text-primary flex items-center justify-center">
                    <s.icon className="size-6" />
                  </div>
                  <h3 className="text-lg font-bold text-white mt-4">{s.title}</h3>
                  <p className="text-sm text-on-surface-variant leading-relaxed">{s.desc}</p>
                </div>
              ))}
            </div>
          </section>

          {/* Privacy and Verification */}
          <section className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center glass-panel rounded-[2rem] border-white/5 p-8 sm:p-12">
            <div className="flex flex-col gap-6">
              <div className="size-12 rounded-2xl bg-amber-500/10 text-amber-400 flex items-center justify-center">
                <Lock className="size-6" />
              </div>
              <h2 className="text-3xl font-bold text-white tracking-tight">
                Your voice is protected and secure
              </h2>
              <p className="text-on-surface-variant leading-relaxed">
                Security and ethics are at the core of VoiceForge AI. Every custom voice model trained on our platform is completely private by default and encrypted. 
              </p>
              <ul className="flex flex-col gap-3">
                {[
                  "Strict validation prevents unauthorized impersonation",
                  "Encrypted storage scopes models to your account only",
                  "No training on your private files without explicit opt-in",
                  "Delete your cloned voice anytime with one click"
                ].map((item) => (
                  <li key={item} className="flex items-center gap-3 text-sm text-white/90">
                    <CheckCircle2 className="size-4 text-emerald-400 shrink-0" />
                    {item}
                  </li>
                ))}
              </ul>
            </div>
            <div className="flex flex-col gap-6 bg-white/[0.02] border border-white/5 p-8 rounded-[2rem]">
              <h3 className="text-xl font-bold text-white">Ethical AI standard</h3>
              <p className="text-sm text-on-surface-variant leading-relaxed">
                VoiceForge AI implements rigorous checks to prevent malicious deepfakes and fraud. We require that you upload a verbal consent verification statement matching the speaker&apos;s biometric voice characteristics before your cloned model is activated.
              </p>
              <Button asChild className="h-12 rounded-full bg-primary hover:bg-primary/90 text-on-primary font-bold w-fit mt-2">
                <Link href="/signup">Create Voice Clone <ArrowRight className="ml-2 size-4" /></Link>
              </Button>
            </div>
          </section>

          {/* CTA Banner */}
          <section className="glass-panel rounded-[1.5rem] sm:rounded-[2rem] border-white/5 p-8 sm:p-12 flex flex-col md:flex-row md:items-center justify-between gap-8 bg-gradient-to-br from-primary/10 via-background to-purple-500/10">
            <div className="flex flex-col gap-4 max-w-xl">
              <h2 className="text-2xl sm:text-3xl font-bold text-white">
                Start cloning your voice today
              </h2>
              <p className="text-on-surface-variant">
                Unlock natural voice clones and high-fidelity text to speech conversion. Get 10,000 free starting credits.
              </p>
            </div>
            <Button
              asChild
              className="rounded-full bg-primary hover:bg-primary/90 text-on-primary font-bold h-12 px-6"
            >
              <Link href="/signup">
                Sign Up Free <ArrowRight className="ml-2 size-4" />
              </Link>
            </Button>
          </section>

        </div>
      </MarketingPageShell>
    </>
  );
}
