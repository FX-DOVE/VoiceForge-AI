import { LegalPageShell, LegalSection } from "@/components/layout/legal-page-shell";

const SECTIONS = [
  { id: "overview", label: "Overview" },
  { id: "information-we-collect", label: "Information We Collect" },
  { id: "how-we-use", label: "How We Use Information" },
  { id: "data-security", label: "Data Security" },
  { id: "data-sharing", label: "Data Sharing" },
  { id: "retention", label: "Retention" },
  { id: "your-rights", label: "User Rights" },
  { id: "voice-data", label: "Voice Data & Cloning" },
  { id: "contact", label: "Contact" },
];

export const metadata = {
  title: "Privacy Policy — VoiceForge AI",
  description:
    "How VoiceForge AI collects, uses, and protects your personal and voice data.",
  alternates: {
    canonical: "/privacy",
  },
};

export default function PrivacyPage() {
  return (
    <LegalPageShell
      eyebrow="Legal"
      title="Privacy Policy"
      lastUpdated="May 18, 2026"
      sections={SECTIONS}
    >
      <LegalSection id="overview" title="1. Overview">
        <p>
          VoiceForge AI ("we", "us", or "our") operates a hosted text-to-speech
          and voice-cloning platform. This Privacy Policy explains what
          information we collect, how we use it, and the choices you have. By
          using our services, you agree to the practices described here.
        </p>
        <p>
          This policy applies to our website, web application, mobile clients,
          and all related APIs.
        </p>
      </LegalSection>

      <LegalSection id="information-we-collect" title="2. Information We Collect">
        <p>We collect the following categories of information:</p>
        <ul className="list-disc pl-6 flex flex-col gap-2">
          <li>
            <strong className="text-white">Name and email address:</strong> used for account creation and communication.
          </li>
          <li>
            <strong className="text-white">Account credentials:</strong> password hashes for secure authentication.
          </li>
          <li>
            <strong className="text-white">Uploaded audio and generated content:</strong> voice samples and TTS outputs.
          </li>
          <li>
            <strong className="text-white">Usage data and API logs:</strong> generation history, voices used, prompt text, audio length, and feature usage.
          </li>
          <li>
            <strong className="text-white">IP address and device information:</strong> browser type, operating system, and approximate location for security and analytics.
          </li>
          <li>
            <strong className="text-white">Payment information:</strong> processed by third-party payment providers (Paystack); we do not store full card numbers.
          </li>
        </ul>
      </LegalSection>

      <LegalSection id="how-we-use" title="3. How We Use Information">
        <p>We use the information we collect to:</p>
        <ul className="list-disc pl-6 flex flex-col gap-2">
          <li>Provide and improve the service.</li>
          <li>Process payments and manage your account.</li>
          <li>Detect fraud, abuse, and policy violations.</li>
          <li>Enforce our legal policies and terms of service.</li>
          <li>Communicate with users about their accounts and the service.</li>
          <li>Generate audio output from your prompts.</li>
          <li>Comply with legal obligations.</li>
        </ul>
      </LegalSection>

      <LegalSection id="data-security" title="4. Data Security">
        <p>
          We implement industry-standard technical and organizational safeguards to 
          protect user data from unauthorized access, disclosure, alteration, or destruction.
        </p>
        <ul className="list-disc pl-6 flex flex-col gap-2 mt-4">
          <li>TLS encryption for data in transit.</li>
          <li>AES-256 encryption for data at rest.</li>
          <li>Role-based access control.</li>
          <li>Continuous security monitoring.</li>
          <li>Regular security assessments.</li>
        </ul>
        <p className="mt-4">
          No system is perfectly secure; report vulnerabilities to{" "}
          <a className="text-primary hover:underline" href="mailto:security@voiceforge.ai">
            security@voiceforge.ai
          </a>.
        </p>
      </LegalSection>

      <LegalSection id="data-sharing" title="5. Data Sharing">
        <p>
          We do not sell your personal information. Data may be shared only with 
          trusted service providers necessary to operate the platform, such as:
        </p>
        <ul className="list-disc pl-6 flex flex-col gap-2">
          <li>Hosting and infrastructure providers.</li>
          <li>Payment processors (Paystack).</li>
          <li>Analytics services.</li>
          <li>Authorities when legally compelled.</li>
          <li>Acquirers in the event of a merger or acquisition (with notice).</li>
        </ul>
      </LegalSection>

      <LegalSection id="retention" title="6. Retention">
        <p>
          Data is retained only as long as necessary for business, security, and legal purposes.
        </p>
        <ul className="list-disc pl-6 flex flex-col gap-2 mt-4">
          <li>Generated audio is retained for the duration shown on the generation card (typically 7–30 days, depending on plan).</li>
          <li>Account data is retained for the life of your account.</li>
          <li>Deletion is available on request and is processed within 30 days.</li>
          <li>Aggregate, non-identifying analytics may be kept indefinitely.</li>
        </ul>
      </LegalSection>

      <LegalSection id="your-rights" title="7. User Rights">
        <p>
          Users may request access, correction, or deletion of their personal information, 
          subject to legal and operational requirements.
        </p>
        <ul className="list-disc pl-6 flex flex-col gap-2 mt-4">
          <li>Right to access your personal data.</li>
          <li>Right to correct inaccurate information.</li>
          <li>Right to delete your account and associated data.</li>
          <li>Right to object to or restrict certain processing.</li>
        </ul>
        <p className="mt-4">
          Depending on your jurisdiction, you may have additional rights. Contact us at{" "}
          <a className="text-primary hover:underline" href="mailto:privacy@voiceforge.ai">
            privacy@voiceforge.ai
          </a>{" "}
          to exercise these rights.
        </p>
      </LegalSection>

      <LegalSection id="voice-data" title="8. Voice Data & Cloning">
        <p>
          Voice cloning requires us to process samples of a real person's voice.
          You must own or have explicit, verifiable consent from the speaker for
          every sample uploaded.
        </p>
        <ul className="list-disc pl-6 flex flex-col gap-2">
          <li>
            Cloned voice models are stored encrypted and scoped to your account
            unless you explicitly mark them as public.
          </li>
          <li>
            We never use private voice samples to train shared/global models
            without explicit opt-in.
          </li>
          <li>
            You can delete a cloned voice at any time from <em>My Cloned
            Voices</em>; deletion removes the model from active inference within
            24 hours and from backups within 30 days.
          </li>
        </ul>
      </LegalSection>

      <LegalSection id="contact" title="9. Contact">
        <p>
          Questions about this Privacy Policy? Email{" "}
          <a className="text-primary hover:underline" href="mailto:privacy@voiceforge.ai">
            privacy@voiceforge.ai
          </a>{" "}
          or visit our{" "}
          <a className="text-primary hover:underline" href="/contact">
            Contact page
          </a>
          .
        </p>
      </LegalSection>
    </LegalPageShell>
  );
}
