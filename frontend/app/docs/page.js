import DocsPageClient from "./page-client";

export const metadata = {
  title: "API Documentation | VoiceForge AI Developer Hub",
  description:
    "Complete REST API reference and Webhooks documentation for VoiceForge AI. Generate realistic text to speech audio and manage voice clones programmatically.",
  alternates: {
    canonical: "/docs",
  },
};

export default function Page() {
  return <DocsPageClient />;
}
