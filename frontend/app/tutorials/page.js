"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { Play, Clock, ArrowRight, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { MarketingPageShell } from "@/components/layout/marketing-page-shell";

const TUTORIALS = [
  {
    id: 1,
    title: "Getting Started with VoiceForge",
    description:
      "Set up your account, pick your first voice, and generate your first audio clip.",
    duration: "4:12",
    level: "Beginner",
    category: "Onboarding",
    img: "https://lh3.googleusercontent.com/aida-public/AB6AXuD2D8D9oK2CItxDddKsnRQtWZhWFb22944r_D9_ybJrA4EUuMFaCtOviWQookDKNIzOrspcaLAHxVVypCLp37O1V2AHTz5ZGAqZq_Wj09Aiw7-IIn9An92_pXw43X1dnpmz8iay8mIeeQQ3Q_5XCYTgixa6UvJxuEZyvi4KicFLoug_-CCU0oPGqincJS603Xmmq786xGk29GHqiS38-RQE6DDoC_WcqgSA-x0d8LyNGWjZoOcx8ljQq-pEIyhl8m82x_kVtc7eVvw",
  },
  {
    id: 2,
    title: "Cloning Your Voice in 5 Minutes",
    description:
      "Upload high-quality samples and produce a custom voice clone fast.",
    duration: "5:03",
    level: "Beginner",
    category: "Cloning",
    img: "https://lh3.googleusercontent.com/aida-public/AB6AXuAWVcK77PB_yx276Gr_o2lGtn-Ns9h25u_SCSCykDUSFgjsCeEr5WQZg_t61JYQMVcmt9-xB0RCj-wkyujn-ZCpUkCD8S_JDVGvjE-5Nb6fnFliYPAw_66Yr0ySx0NkkAgMB1GrHxGpItdutBQ7lJPO6QkYTjanVUrFfKwIggk3jDzMx9IL_oZShjPkzTIXLlpvuJTUqirG0QGDGyHL4Emy39Z3Ts2hvC--S4QiAJd8iKrPHNXr6baWoEt2fGiGALuktxM8n6d_GRk",
  },
  {
    id: 3,
    title: "Mastering Stability and Similarity",
    description:
      "Tune the studio sliders to get the most expressive output for your use case.",
    duration: "7:44",
    level: "Intermediate",
    category: "Studio",
    img: "https://lh3.googleusercontent.com/aida-public/AB6AXuD2D8D9oK2CItxDddKsnRQtWZhWFb22944r_D9_ybJrA4EUuMFaCtOviWQookDKNIzOrspcaLAHxVVypCLp37O1V2AHTz5ZGAqZq_Wj09Aiw7-IIn9An92_pXw43X1dnpmz8iay8mIeeQQ3Q_5XCYTgixa6UvJxuEZyvi4KicFLoug_-CCU0oPGqincJS603Xmmq786xGk29GHqiS38-RQE6DDoC_WcqgSA-x0d8LyNGWjZoOcx8ljQq-pEIyhl8m82x_kVtc7eVvw",
  },
  {
    id: 4,
    title: "Calling the API from Node.js",
    description:
      "Generate audio from a Node script using our official JavaScript SDK.",
    duration: "9:21",
    level: "Advanced",
    category: "API",
    img: "https://lh3.googleusercontent.com/aida-public/AB6AXuAWVcK77PB_yx276Gr_o2lGtn-Ns9h25u_SCSCykDUSFgjsCeEr5WQZg_t61JYQMVcmt9-xB0RCj-wkyujn-ZCpUkCD8S_JDVGvjE-5Nb6fnFliYPAw_66Yr0ySx0NkkAgMB1GrHxGpItdutBQ7lJPO6QkYTjanVUrFfKwIggk3jDzMx9IL_oZShjPkzTIXLlpvuJTUqirG0QGDGyHL4Emy39Z3Ts2hvC--S4QiAJd8iKrPHNXr6baWoEt2fGiGALuktxM8n6d_GRk",
  },
  {
    id: 5,
    title: "Sharing Voices with the Community",
    description:
      "Make your voice public, set guidelines, and discover others' work.",
    duration: "3:58",
    level: "Beginner",
    category: "Community",
    img: "https://lh3.googleusercontent.com/aida-public/AB6AXuD2D8D9oK2CItxDddKsnRQtWZhWFb22944r_D9_ybJrA4EUuMFaCtOviWQookDKNIzOrspcaLAHxVVypCLp37O1V2AHTz5ZGAqZq_Wj09Aiw7-IIn9An92_pXw43X1dnpmz8iay8mIeeQQ3Q_5XCYTgixa6UvJxuEZyvi4KicFLoug_-CCU0oPGqincJS603Xmmq786xGk29GHqiS38-RQE6DDoC_WcqgSA-x0d8LyNGWjZoOcx8ljQq-pEIyhl8m82x_kVtc7eVvw",
  },
  {
    id: 6,
    title: "Production Workflows for Audiobooks",
    description:
      "Long-form generation, chapter splits, and post-processing best practices.",
    duration: "12:30",
    level: "Advanced",
    category: "Studio",
    img: "https://lh3.googleusercontent.com/aida-public/AB6AXuAWVcK77PB_yx276Gr_o2lGtn-Ns9h25u_SCSCykDUSFgjsCeEr5WQZg_t61JYQMVcmt9-xB0RCj-wkyujn-ZCpUkCD8S_JDVGvjE-5Nb6fnFliYPAw_66Yr0ySx0NkkAgMB1GrHxGpItdutBQ7lJPO6QkYTjanVUrFfKwIggk3jDzMx9IL_oZShjPkzTIXLlpvuJTUqirG0QGDGyHL4Emy39Z3Ts2hvC--S4QiAJd8iKrPHNXr6baWoEt2fGiGALuktxM8n6d_GRk",
  },
];

const CATEGORIES = ["All", "Onboarding", "Studio", "Cloning", "API", "Community"];

export default function TutorialsPage() {
  return (
    <MarketingPageShell
      eyebrow="Tutorials"
      title="Learn VoiceForge end-to-end"
      subtitle="Step-by-step videos covering everything from your first generation to advanced API integrations."
    >
      <div className="flex flex-col gap-10">
        <div className="flex flex-wrap gap-2">
          {CATEGORIES.map((c, i) => (
            <button
              key={c}
              type="button"
              className={`h-10 px-5 rounded-full text-xs font-bold border transition-all ${
                i === 0
                  ? "bg-primary text-on-primary border-primary"
                  : "bg-white/5 text-on-surface-variant border-white/10 hover:text-white hover:bg-white/10"
              }`}
            >
              {c}
            </button>
          ))}
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {TUTORIALS.map((t, i) => (
            <motion.a
              key={t.id}
              href={`#tutorial-${t.id}`}
              initial={{ opacity: 0, y: 12 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.05 }}
              className="glass-panel rounded-3xl border-white/5 overflow-hidden flex flex-col group hover:bg-white/[0.05] transition-all"
            >
              <div className="relative aspect-video bg-cover bg-center" style={{ backgroundImage: `url("${t.img}")` }}>
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent" />
                <div className="absolute inset-0 flex items-center justify-center">
                  <span className="size-16 rounded-full bg-primary text-on-primary flex items-center justify-center shadow-2xl group-hover:scale-110 transition-transform">
                    <Play className="size-6 fill-current ml-0.5" />
                  </span>
                </div>
                <span className="absolute top-3 left-3 px-2.5 py-1 rounded-full bg-black/60 backdrop-blur-md text-[10px] font-bold uppercase tracking-widest text-white border border-white/10">
                  {t.category}
                </span>
                <span className="absolute top-3 right-3 px-2 py-1 rounded-full bg-black/60 backdrop-blur-md text-[10px] font-bold text-white border border-white/10 flex items-center gap-1">
                  <Clock className="size-3" />
                  {t.duration}
                </span>
              </div>
              <div className="p-5 flex flex-col gap-2">
                <span className="text-[10px] font-bold uppercase tracking-widest text-primary">
                  {t.level}
                </span>
                <h3 className="text-lg font-bold text-white group-hover:text-primary transition-colors">
                  {t.title}
                </h3>
                <p className="text-sm text-on-surface-variant line-clamp-2">
                  {t.description}
                </p>
              </div>
            </motion.a>
          ))}
        </div>

        <div className="glass-panel rounded-3xl border-white/5 p-8 sm:p-12 flex flex-col md:flex-row md:items-center justify-between gap-6 bg-gradient-to-br from-primary/10 via-background to-purple-500/10">
          <div className="flex flex-col gap-2">
            <div className="flex items-center gap-2 text-primary">
              <Sparkles className="size-5" />
              <span className="text-xs font-bold uppercase tracking-widest">
                Want a specific topic?
              </span>
            </div>
            <h3 className="text-2xl font-bold text-white">
              Suggest a tutorial
            </h3>
            <p className="text-on-surface-variant max-w-xl">
              Tell us what you&apos;d like to learn next and we&apos;ll build it.
            </p>
          </div>
          <Button
            asChild
            className="rounded-full bg-primary hover:bg-primary/90 text-on-primary font-bold h-12 px-6"
          >
            <Link href="/contact">
              Submit Idea <ArrowRight className="ml-2 size-4" />
            </Link>
          </Button>
        </div>
      </div>
    </MarketingPageShell>
  );
}
