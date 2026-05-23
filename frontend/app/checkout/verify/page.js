"use client";

import { useEffect, useState, useRef } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { paymentsApi } from "@/lib/api";
import { Loader2, CheckCircle2, XCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import Link from "next/link";

export default function CheckoutVerifyPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const reference = searchParams.get("reference");
  
  const [status, setStatus] = useState("verifying"); // verifying, success, error
  const [message, setMessage] = useState("Verifying your payment with Paystack...");
  const [creditsAdded, setCreditsAdded] = useState(0);
  const verifyingRef = useRef(false);

  useEffect(() => {
    if (!reference) {
      setStatus("error");
      setMessage("No payment reference found.");
      return;
    }

    if (verifyingRef.current) return;
    verifyingRef.current = true;

    paymentsApi.verify(reference)
      .then((data) => {
        // We modified backend to return the full balance structure, but we don't know the exact credits added unless we return it.
        // If we want to show credits added, we can modify the backend to return it.
        // Currently getCreditBalance just returns totalCredits, creditsUsed, etc.
        // Let's assume the backend verify returns the balance, we just show success.
        setStatus("success");
        setMessage("Payment successful! Redirecting to billing...");
        setTimeout(() => router.replace("/billing?payment=success"), 1500);
      })
      .catch((err) => {
        setStatus("error");
        setMessage(err.message || "Failed to verify payment. If you were charged, please contact support.");
      });
  }, [reference]);

  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center p-4">
      <div className="glass-panel p-8 rounded-3xl max-w-sm w-full text-center space-y-6">
        {status === "verifying" && (
          <div className="flex flex-col items-center gap-4">
            <Loader2 className="size-12 text-primary animate-spin" />
            <h1 className="text-xl font-bold text-white">Verifying Payment</h1>
            <p className="text-sm text-neutral-400">{message}</p>
          </div>
        )}

        {status === "success" && (
          <div className="flex flex-col items-center gap-4">
            <div className="size-16 rounded-full bg-emerald-500/10 flex items-center justify-center text-emerald-500 mb-2">
              <CheckCircle2 className="size-8" />
            </div>
            <h1 className="text-2xl font-bold text-white">Payment Confirmed</h1>
            <p className="text-sm text-neutral-400">{message}</p>
            
            <div className="w-full pt-4">
              <Button disabled className="w-full bg-primary text-on-primary font-bold">
                <Loader2 className="size-4 animate-spin mr-2" /> Redirecting...
              </Button>
            </div>
          </div>
        )}

        {status === "error" && (
          <div className="flex flex-col items-center gap-4">
            <div className="size-16 rounded-full bg-red-500/10 flex items-center justify-center text-red-500 mb-2">
              <XCircle className="size-8" />
            </div>
            <h1 className="text-2xl font-bold text-white">Verification Failed</h1>
            <p className="text-sm text-neutral-400">{message}</p>
            
            <div className="w-full pt-4 space-y-3">
              <Button asChild className="w-full bg-primary text-on-primary font-bold">
                <Link href="/checkout">Try Again</Link>
              </Button>
              <Button asChild variant="outline" className="w-full border-white/10">
                <Link href="/help">Contact Support</Link>
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
