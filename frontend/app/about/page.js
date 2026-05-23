import AboutPageClient from "./page-client";

export const metadata = {
  title: "About Us | VoiceForge AI",
  description:
    "We are building the future of voice. Learn about VoiceForge AI's mission, values, and global reach for creators, developers, and businesses.",
  alternates: {
    canonical: "/about",
  },
};

export default function Page() {
  return <AboutPageClient />;
}
