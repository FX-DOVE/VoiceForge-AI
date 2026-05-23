"use client";

import { usePathname } from "next/navigation";
import { UserShell } from "@/components/layout/user-shell";
import { CloningWizardHeader } from "@/components/cloning/wizard-header";
import { ProtectedRoute } from "@/components/protected-route";

export default function CloningLayout({ children }) {
  const pathname = usePathname();
  const wizardPaths = ["/cloning/upload", "/cloning/configure", "/cloning/train"];
  const isWizardSubpage = wizardPaths.includes(pathname);

  return (
    <ProtectedRoute>
      <UserShell>
        {isWizardSubpage && <CloningWizardHeader />}
        {children}
      </UserShell>
    </ProtectedRoute>
  );
}
