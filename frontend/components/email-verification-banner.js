"use client";

import { useState } from "react";
import { useAuth } from "@/contexts/auth-context";
import { Mail, X, Loader2, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { getApiUrl } from "@/lib/api/config";

export function EmailVerificationBanner() {
  const { user, updateUser } = useAuth();
  const [loading, setLoading] = useState(false);
  const [dismissed, setDismissed] = useState(false);
  const [resendCooldown, setResendCooldown] = useState(0);

  // Don't show if email is verified or banner was dismissed
  if (!user || user.emailVerified || dismissed) return null;

  async function handleResend() {
    if (loading || resendCooldown > 0) return;

    setLoading(true);
    try {
      const response = await fetch(`${getApiUrl()}/auth/resend-verification`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: user.email }),
      });

      const data = await response.json();

      if (data.success) {
        toast.success(data.message || "Verification email sent!");
        setResendCooldown(60);
        
        // Start cooldown timer
        const timer = setInterval(() => {
          setResendCooldown((prev) => {
            if (prev <= 1) {
              clearInterval(timer);
              return 0;
            }
            return prev - 1;
          });
        }, 1000);
      } else {
        toast.error(data.message || "Failed to resend verification email.");
      }
    } catch (err) {
      toast.error("Failed to resend verification email. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="bg-amber-500/10 border border-amber-500/20 rounded-xl p-4 mb-6">
      <div className="flex items-start gap-4">
        <div className="shrink-0 w-10 h-10 rounded-full bg-amber-500/20 flex items-center justify-center">
          <Mail className="w-5 h-5 text-amber-400" />
        </div>
        <div className="flex-1 min-w-0">
          <h3 className="font-semibold text-amber-100 mb-1">
            Verify Your Email
          </h3>
          <p className="text-sm text-amber-200/70 mb-3">
            Please verify your email address to unlock all features. We sent a verification link to{" "}
            <span className="font-medium text-amber-100">{user.email}</span>.
          </p>
          <div className="flex items-center gap-3">
            <Button
              size="sm"
              onClick={handleResend}
              disabled={loading || resendCooldown > 0}
              className="bg-amber-500 hover:bg-amber-600 text-white disabled:opacity-50"
            >
              {loading ? (
                <Loader2 className="w-4 h-4 animate-spin mr-2" />
              ) : resendCooldown > 0 ? (
                `Resend in ${resendCooldown}s`
              ) : (
                <>
                  <Mail className="w-4 h-4 mr-2" />
                  Resend Email
                </>
              )}
            </Button>
            <Button
              size="sm"
              variant="ghost"
              onClick={() => setDismissed(true)}
              className="text-amber-200/70 hover:text-amber-100 hover:bg-amber-500/10"
            >
              <X className="w-4 h-4 mr-2" />
              Dismiss
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
