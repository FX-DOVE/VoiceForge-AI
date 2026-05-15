import { LegalPageShell, LegalSection } from "@/components/layout/legal-page-shell";

const SECTIONS = [
  { id: "overview", label: "Overview" },
  { id: "data-we-collect", label: "Data We Collect" },
  { id: "how-we-use", label: "How We Use Data" },
  { id: "voice-data", label: "Voice Data & Cloning" },
  { id: "sharing", label: "Sharing & Disclosure" },
  { id: "retention", label: "Retention" },
  { id: "your-rights", label: "Your Rights" },
  { id: "security", label: "Security" },
  { id: "contact", label: "Contact" },
];

export const metadata = {
  title: "Privacy Policy — VoiceForge AI",
  description:
    "How VoiceForge AI collects, uses, and protects your personal and voice data.",
};

export default function PrivacyPage() {
  return (
    <LegalPageShell
      eyebrow="Legal"
      title="Privacy Policy"
      lastUpdated="October 24, 2026"
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

      <LegalSection id="data-we-collect" title="2. Data We Collect">
        <p>We collect the following categories of information:</p>
        <ul className="list-disc pl-6 flex flex-col gap-2">
          <li>
            <strong className="text-white">Account data:</strong> name, email,
            password hash, billing address, and profile preferences.
          </li>
          <li>
            <strong className="text-white">Usage data:</strong> generation
            history, voices used, prompt text, audio length, and feature usage.
          </li>
          <li>
            <strong className="text-white">Voice samples:</strong> audio
            recordings or files you upload to clone a voice (see Section 4).
          </li>
          <li>
            <strong className="text-white">Device data:</strong> browser type,
            operating system, IP address, and approximate location.
          </li>
          <li>
            <strong className="text-white">Payment data:</strong> handled by our
            PCI-compliant processor; we do not store full card numbers.
          </li>
        </ul>
      </LegalSection>

      <LegalSection id="how-we-use" title="3. How We Use Data">
        <p>We use the data we collect to:</p>
        <ul className="list-disc pl-6 flex flex-col gap-2">
          <li>Provide, operate, and maintain the service.</li>
          <li>Generate audio output from your prompts.</li>
          <li>Train and improve generic models when you opt in.</li>
          <li>Send transactional notifications (billing, security, generation status).</li>
          <li>Detect abuse, fraud, and policy violations.</li>
          <li>Comply with legal obligations.</li>
        </ul>
      </LegalSection>

      <LegalSection id="voice-data" title="4. Voice Data & Cloning">
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

      <LegalSection id="sharing" title="5. Sharing & Disclosure">
        <p>
          We do not sell your personal information. We share data only with:
        </p>
        <ul className="list-disc pl-6 flex flex-col gap-2">
          <li>Service providers under contract (hosting, payments, analytics).</li>
          <li>Authorities when legally compelled.</li>
          <li>Acquirers in the event of a merger or acquisition (with notice).</li>
        </ul>
      </LegalSection>

      <LegalSection id="retention" title="6. Retention">
        <p>
          Generated audio is retained for the duration shown on the generation
          card (typically 7–30 days, depending on plan). Account data is
          retained for the life of your account; deletion is available on
          request and is processed within 30 days. Aggregate, non-identifying
          analytics may be kept indefinitely.
        </p>
      </LegalSection>

      <LegalSection id="your-rights" title="7. Your Rights">
        <p>
          Depending on your jurisdiction, you may have rights to access,
          correct, export, or delete your personal data, and to object to or
          restrict certain processing. Contact us at{" "}
          <a className="text-primary hover:underline" href="mailto:privacy@voiceforge.ai">
            privacy@voiceforge.ai
          </a>{" "}
          to exercise these rights.
        </p>
      </LegalSection>

      <LegalSection id="security" title="8. Security">
        <p>
          We use industry-standard safeguards including TLS in transit, AES-256
          at rest, role-based access control, and continuous monitoring. No
          system is perfectly secure; report vulnerabilities to{" "}
          <a className="text-primary hover:underline" href="mailto:security@voiceforge.ai">
            security@voiceforge.ai
          </a>
          .
        </p>
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
