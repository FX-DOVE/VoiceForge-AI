"use client";

import { motion } from "framer-motion";
import { Calendar, ArrowRight, Clock } from "lucide-react";
import Link from "next/link";
import { MarketingPageShell } from "@/components/layout/marketing-page-shell";

const POSTS = [
  {
    slug: "introducing-voice-cloning",
    title: "Introducing Voice Cloning: Your Voice, Anywhere",
    excerpt:
      "Clone any voice with just 30 seconds of audio. Perfect for audiobooks, games, and personalized content.",
    date: "Oct 24, 2026",
    readTime: "5 min",
    category: "Feature",
    img: "https://lh3.googleusercontent.com/aida-public/AB6AXuD2D8D9oK2CItxDddKsnRQtWZhWFb22944r_D9_ybJrA4EUuMFaCtOviWQookDKNIzOrspcaLAHxVVypCLp37O1V2AHTz5ZGAqZq_Wj09Aiw7-IIn9An92_pXw43X1dnpmz8iay8mIeeQQ3Q_5XCYTgixa6UvJxuEZyvi4KicFLoug_-CCU0oPGqincJS603Xmmq786xGk29GHqiS38-RQE6DDoC_WcqgSA-x0d8LyNGWjZoOcx8ljQq-pEIyhl8m82x_kVtc7eVvw",
  },
  {
    slug: "api-v2-is-live",
    title: "API v2 is Live: Faster, More Reliable, Webhooks",
    excerpt:
      "The new API adds streaming, webhooks, and 50% lower latency. Migration guide included.",
    date: "Oct 12, 2026",
    readTime: "7 min",
    category: "Engineering",
    img: "https://lh3.googleusercontent.com/aida-public/AB6AXuAWVcK77PB_yx276Gr_o2lGtn-Ns9h25u_SCSCykDUSFgjsCeEr5WQZg_t61JYQMVcmt9-xB0RCj-wkyujn-ZCpUkCD8S_JDVGvjE-5Nb6fnFliYPAw_66Yr0ySx0NkkAgMB1GrHxGpItdutBQ7lJPO6QkYTjanVUrFfKwIggk3jDzMx9IL_oZShjPkzTIXLlpvuJTUqirG0QGDGyHL4Emy39Z3Ts2hvC--S4QiAJd8iKrPHNXr6baWoEt2fGiGALuktxM8n6d_GRk",
  },
  {
    slug: "community-marketplace-launch",
    title: "Community Voices Marketplace is Now Open",
    excerpt:
      "Browse, clone, and share voices from creators worldwide. Discover your next signature sound.",
    date: "Sep 28, 2026",
    readTime: "4 min",
    category: "Community",
    img: "https://lh3.googleusercontent.com/aida-public/AB6AXuD2D8D9oK2CItxDddKsnRQtWZhWFb22944r_D9_ybJrA4EUuMFaCtOviWQookDKNIzOrspcaLAHxVVypCLp37O1V2AHTz5ZGAqZq_Wj09Aiw7-IIn9An92_pXw43X1dnpmz8iay8mIeeQQ3Q_5XCYTgixa6UvJxuEZyvi4KicFLoug_-CCU0oPGqincJS603Xmmq786xGk29GHqiS38-RQE6DDoC_WcqgSA-x0d8LyNGWjZoOcx8ljQq-pEIyhl8m82x_kVtc7eVvw",
  },
  {
    slug: "best-practices-for-long-form",
    title: "Best Practices for Long-Form Audiobook Generation",
    excerpt:
      "Tips for consistent voice, pacing, and quality across chapters. From our production team.",
    date: "Sep 15, 2026",
    readTime: "8 min",
    category: "Guide",
    img: "https://lh3.googleusercontent.com/aida-public/AB6AXuAWVcK77PB_yx276Gr_o2lGtn-Ns9h25u_SCSCykDUSFgjsCeEr5WQZg_t61JYQMVcmt9-xB0RCj-wkyujn-ZCpUkCD8S_JDVGvjE-5Nb6fnFliYPAw_66Yr0ySx0NkkAgMB1GrHxGpItdutBQ7lJPO6QkYTjanVUrFfKwIggk3jDzMx9IL_oZShjPkzTIXLlpvuJTUqirG0QGDGyHL4Emy39Z3Ts2hvC--S4QiAJd8iKrPHNXr6baWoEt2fGiGALuktxM8n6d_GRk",
  },
];

export default function BlogPage() {
  return (
    <MarketingPageShell
      eyebrow="Blog"
      title="News, guides, and stories from the team"
      subtitle="Stay up to date with product updates, tutorials, and behind-the-scenes insights."
    >
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {POSTS.map((post, i) => (
          <motion.a
            key={post.slug}
            href={`/blog/${post.slug}`}
            initial={{ opacity: 0, y: 12 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: i * 0.05 }}
            className="glass-panel rounded-3xl border-white/5 overflow-hidden flex flex-col group hover:bg-white/[0.05] transition-all"
          >
            <div className="relative aspect-[16/9] bg-cover bg-center" style={{ backgroundImage: `url("${post.img}")` }}>
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent" />
              <span className="absolute top-4 left-4 px-3 py-1 rounded-full bg-primary text-on-primary text-[10px] font-bold uppercase tracking-widest">
                {post.category}
              </span>
            </div>
            <div className="p-6 flex flex-col gap-3 flex-1">
              <div className="flex items-center gap-4 text-xs text-on-surface-variant">
                <div className="flex items-center gap-1.5">
                  <Calendar className="size-3" />
                  {post.date}
                </div>
                <div className="flex items-center gap-1.5">
                  <Clock className="size-3" />
                  {post.readTime}
                </div>
              </div>
              <h3 className="text-xl font-bold text-white group-hover:text-primary transition-colors">
                {post.title}
              </h3>
              <p className="text-sm text-on-surface-variant line-clamp-2">
                {post.excerpt}
              </p>
              <span className="text-xs font-bold text-primary inline-flex items-center gap-1 mt-auto group-hover:gap-2 transition-all">
                Read post <ArrowRight className="size-3" />
              </span>
            </div>
          </motion.a>
        ))}
      </div>
    </MarketingPageShell>
  );
}
