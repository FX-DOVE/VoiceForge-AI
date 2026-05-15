"use client";

import { Toaster } from "sonner";
import { AuthProvider } from "@/contexts/auth-context";

export function Providers({ children }) {
  return (
    <AuthProvider>
      {children}
      <Toaster
        richColors
        closeButton
        theme="dark"
        toastOptions={{
          classNames: {
            toast:
              "glass-panel border border-white/10 text-on-surface",
          },
        }}
      />
    </AuthProvider>
  );
}
