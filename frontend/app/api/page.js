import Link from "next/link";
import { MarketingPageShell } from "@/components/layout/marketing-page-shell";
import { Button } from "@/components/ui/button";
import { Schema } from "@/components/seo/Schema";
import { 
  Terminal, 
  Cpu, 
  Zap, 
  Globe, 
  ArrowRight,
  CheckCircle2,
  Code2
} from "lucide-react";

export const metadata = {
  title: "Text to Speech API for Developers | Realistic AI Voice API",
  description:
    "Integrate studio-quality text to speech in minutes. Leverage VoiceForge's fast, scalable AI Voice API with sub-100ms latency, SDKs, and streaming support.",
  alternates: {
    canonical: "/api",
  },
};

export default function ApiLandingPage() {
  const schemaData = {
    name: "VoiceForge AI Text to Speech API",
    description: "Ultra-low latency Text-to-Speech API serving realistic, multilingual AI voices.",
    applicationCategory: "DeveloperApplication",
    operatingSystem: "Web",
    offers: {
      "@type": "Offer",
      price: "0.00",
      priceCurrency: "USD",
    }
  };

  const sampleCode = `const response = await fetch('https://api.voiceforge.ai/v1/generate', {
  method: 'POST',
  headers: {
    'Authorization': 'Bearer ' + process.env.VF_API_KEY,
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    text: "Ultra-low latency AI Text to Speech API delivers studio realism in milliseconds.",
    voice_id: "eve",
    format: "mp3"
  })
});

const audioBuffer = await response.arrayBuffer();`;

  return (
    <>
      <Schema type="SoftwareApplication" data={schemaData} />
      <MarketingPageShell
        eyebrow="Developer API"
        title="Ultra-realistic AI voice API for developers"
        subtitle="Scalable, low-latency, and pay-as-you-go. Integrate professional text to speech synthesis into your apps, games, and web services in minutes."
      >
        <div className="flex flex-col gap-24 py-6">
          
          {/* Stats Section */}
          <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 text-center">
            {[
              { label: "Latency", value: "< 100ms" },
              { label: "Uptime SLA", value: "99.99%" },
              { label: "Supported Languages", value: "50+" },
              { label: "Developer Starting Credits", value: "10,000" }
            ].map((stat) => (
              <div key={stat.label} className="glass-panel p-6 rounded-[1.5rem] border-white/5 flex flex-col gap-2">
                <span className="text-3xl sm:text-4xl font-extrabold text-primary">{stat.value}</span>
                <span className="text-xs font-bold text-neutral-400 uppercase tracking-wider">{stat.label}</span>
              </div>
            ))}
          </section>

          {/* Code Demo & Integration */}
          <section className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div className="flex flex-col gap-6">
              <div className="size-12 rounded-2xl bg-primary/10 text-primary flex items-center justify-center">
                <Code2 className="size-6" />
              </div>
              <h2 className="text-3xl sm:text-4xl font-bold text-white tracking-tight">
                Integrate realistic speech with a single request
              </h2>
              <p className="text-on-surface-variant leading-relaxed">
                VoiceForge AI's developer API is designed for speed and reliability. Whether you are generating long-form narrations, in-game dialogue, or interactive client interactions, our endpoints deliver flawless studio realism.
              </p>
              <div className="flex flex-col gap-4">
                {[
                  "Official SDKs for Javascript, Python, and Go",
                  "Support for dynamic MP3 and WAV streaming",
                  "Webhooks for asynchronous, long-form generations",
                  "Secure, key-based developer authentication"
                ].map((item) => (
                  <div key={item} className="flex items-center gap-3 text-sm text-white/90">
                    <CheckCircle2 className="size-4 text-emerald-400 shrink-0" />
                    <span>{item}</span>
                  </div>
                ))}
              </div>
              <Button asChild className="h-12 rounded-full bg-primary hover:bg-primary/90 text-on-primary font-bold w-fit mt-2">
                <Link href="/docs">View API Docs <ArrowRight className="ml-2 size-4" /></Link>
              </Button>
            </div>
            <div className="rounded-[2rem] border border-white/10 bg-black/40 overflow-hidden shadow-2xl">
              <div className="flex items-center justify-between px-6 py-4 border-b border-white/5 bg-white/[0.02]">
                <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-on-surface-variant">
                  <Terminal className="size-4" /> Node.js / ES6
                </div>
                <span className="text-[10px] text-emerald-400 font-bold bg-emerald-500/10 px-2 py-0.5 rounded-full border border-emerald-500/20">POST /v1/generate</span>
              </div>
              <pre className="p-6 overflow-x-auto text-xs sm:text-sm text-neutral-300 font-mono leading-relaxed max-w-full">
                <code>{sampleCode}</code>
              </pre>
            </div>
          </section>

          {/* Advanced Capabilities */}
          <section className="flex flex-col gap-12">
            <div className="text-center max-w-2xl mx-auto flex flex-col gap-4">
              <h2 className="text-3xl sm:text-4xl font-bold text-white tracking-tight">
                Built for Production Workloads
              </h2>
              <p className="text-on-surface-variant">
                Scale from prototype to global deployment without bottlenecking or complex configuration.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {[
                {
                  icon: Zap,
                  title: "Real-time Streaming Support",
                  desc: "Stream speech in real-time as bytes are synthesized, reducing time-to-first-byte latency dramatically."
                },
                {
                  icon: Cpu,
                  title: "High Throughput Rate Limits",
                  desc: "Scale seamlessly. Pro credit balance automatically scales your rate limits up to 10,000 requests per minute."
                },
                {
                  icon: Globe,
                  title: "Global Multi-region Clusters",
                  desc: "API calls are automatically routed to the closest global server cluster, ensuring ultra-low network latency."
                }
              ].map((c) => (
                <div key={c.title} className="glass-panel p-8 rounded-[2rem] border-white/5 flex flex-col gap-4">
                  <div className="size-12 rounded-xl bg-primary/10 text-primary flex items-center justify-center">
                    <c.icon className="size-6" />
                  </div>
                  <h3 className="text-lg font-bold text-white mt-4">{c.title}</h3>
                  <p className="text-sm text-on-surface-variant leading-relaxed">{c.desc}</p>
                </div>
              ))}
            </div>
          </section>

          {/* CTA Banner */}
          <section className="glass-panel rounded-[1.5rem] sm:rounded-[2rem] border-white/5 p-8 sm:p-12 flex flex-col md:flex-row md:items-center justify-between gap-8 bg-gradient-to-br from-primary/10 via-background to-purple-500/10">
            <div className="flex flex-col gap-4 max-w-xl">
              <h2 className="text-2xl sm:text-3xl font-bold text-white">
                Start building for free
              </h2>
              <p className="text-on-surface-variant">
                Get an API key instantly upon registration. No credit card required. Receive 10,000 free starting credits.
              </p>
            </div>
            <Button
              asChild
              className="rounded-full bg-primary hover:bg-primary/90 text-on-primary font-bold h-12 px-6"
            >
              <Link href="/signup">
                Get API Key <ArrowRight className="ml-2 size-4" />
              </Link>
            </Button>
          </section>

        </div>
      </MarketingPageShell>
    </>
  );
}
