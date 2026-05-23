import FeaturesPageClient from "./page-client";
import { Schema } from "@/components/seo/Schema";

export const metadata = {
  title: "Features | AI Voice Generator & Voice Cloning Software",
  description:
    "Explore the powerful features of VoiceForge AI. Generate studio-quality speech, instantly clone voices, and translate into 50+ languages.",
  alternates: {
    canonical: "/features",
  },
};

export default function Page() {
  return (
    <>
      <FeaturesPageClient />
    </>
  );
}
