"use client";

import { Toaster } from "sonner";

export function Providers({ children }) {
  return (
    <>
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
    </>
  );
}
