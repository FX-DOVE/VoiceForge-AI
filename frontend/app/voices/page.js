import VoicesPageClient from "./page-client";
import { Schema } from "@/components/seo/Schema";

export const metadata = {
  title: "AI Voices Library | Multilingual Text to Speech Voices",
  description:
    "Explore our complete library of premium AI voices. Discover realistic voice samples across 50+ languages, multiple genders, and speaking styles.",
  alternates: {
    canonical: "/voices",
  },
};

export default function Page() {
  return (
    <>
      <VoicesPageClient />
    </>
  );
}
