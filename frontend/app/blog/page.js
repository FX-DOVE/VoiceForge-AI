import BlogPageClient from "./page-client";

export const metadata = {
  title: "Blog | VoiceForge AI Team News & Guides",
  description:
    "Stay up to date with product updates, AI text to speech tutorials, developer guides, and behind-the-scenes insights from the VoiceForge AI team.",
  alternates: {
    canonical: "/blog",
  },
};

export default function Page() {
  return <BlogPageClient />;
}
