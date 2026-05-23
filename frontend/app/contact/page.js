import ContactPageClient from "./page-client";

export const metadata = {
  title: "Contact Sales & Support | VoiceForge AI",
  description:
    "Have questions about VoiceForge AI features, pricing, or enterprise solutions? Contact our sales or support team today for quick assistance.",
  alternates: {
    canonical: "/contact",
  },
};

export default function Page() {
  return <ContactPageClient />;
}
