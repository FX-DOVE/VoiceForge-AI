"use client";

import { usePathname } from "next/navigation";
import { UserShell } from "@/components/layout/user-shell";
import { CloningWizardHeader } from "@/components/cloning/wizard-header";

export default function CloningLayout({ children }) {
  const pathname = usePathname();
  const wizardPaths = ["/cloning/upload", "/cloning/configure", "/cloning/train"];
  const isWizardSubpage = wizardPaths.includes(pathname);

  return (
    <UserShell>
      {isWizardSubpage && <CloningWizardHeader />}
      {children}
    </UserShell>
  );
}
