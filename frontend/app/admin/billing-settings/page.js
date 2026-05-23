"use client";

import { useEffect, useState } from "react";
import { adminApi } from "@/lib/api";
import { toast } from "sonner";
import { Save, RefreshCw, DollarSign, Settings, Gift, AlertTriangle } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function BillingSettingsPage() {
  const [settings, setSettings] = useState({
    creditsPerDollar: 1500,
    minimumPaymentUsd: 1,
    welcomeCredits: 2380,
    welcomeCreditUsd: 0.01,
  });
  const [loading, setLoading] = useState(true);
  const previewRate = Math.floor(0.5 / 4.20 * 1_000_000 * 2);
  const [saving, setSaving] = useState(false);
  const [resetting, setResetting] = useState(false);

  const loadSettings = async () => {
    setLoading(true);
    try {
      const data = await adminApi.billingSettings();
      if (data) setSettings(data);
    } catch (err) {
      toast.error("Failed to load billing settings.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadSettings();
  }, []);

  const handleSave = async () => {
    setSaving(true);
    try {
      const data = await adminApi.updateBillingSettings(settings);
      setSettings(data);
      toast.success("Billing settings saved.");
    } catch (err) {
      toast.error("Failed to save settings.");
    } finally {
      setSaving(false);
    }
  };

  const handleChange = (e) => {
    setSettings((prev) => ({ ...prev, [e.target.name]: Number(e.target.value) || 0 }));
  };

  const resetToDefaults = () => {
    setSettings({
      creditsPerDollar: 1500,
      minimumPaymentUsd: 1,
      welcomeCredits: 2380,
      welcomeCreditUsd: 0.01,
    });
  };

  const handleResetAllCredits = async () => {
    if (!window.confirm("⚠️ WARNING: This will reset ALL user credits to 0 and give them only the welcome bonus.\n\nThis action cannot be undone.\n\nAre you sure you want to continue?")) {
      return;
    }
    
    setResetting(true);
    try {
      const data = await adminApi.resetAllCredits();
      toast.success(data.message || `Reset credits for all users`);
    } catch (err) {
      toast.error(err.message || "Failed to reset user credits");
    } finally {
      setResetting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex h-full items-center justify-center">
        <RefreshCw className="size-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="flex-1 overflow-y-auto p-6 lg:p-8 max-w-4xl mx-auto w-full pb-12">
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-white">Billing Settings</h1>
          <p className="text-sm text-neutral-400 mt-1">Configure credit formulas and payment parameters.</p>
        </div>
        <div className="flex gap-3">
          <Button variant="outline" onClick={resetToDefaults} className="border-white/10 text-neutral-300">
            Reset to Defaults
          </Button>
          <Button onClick={handleSave} disabled={saving} className="bg-primary text-on-primary font-bold">
            {saving ? <RefreshCw className="size-4 animate-spin mr-2" /> : <Save className="size-4 mr-2" />}
            Save Settings
          </Button>
        </div>
      </div>

      <div className="space-y-6">
        <div className="glass-panel p-6 rounded-2xl border-white/5 space-y-4">
          <div className="flex items-center gap-3 border-b border-white/5 pb-4 mb-4">
            <Settings className="size-5 text-primary" />
            <h2 className="text-lg font-bold">Exchange Rate</h2>
          </div>
          <div className="space-y-2">
            <label className="text-sm font-semibold text-neutral-300">Credits Per Dollar (USD)</label>
            <input
              type="number"
              name="creditsPerDollar"
              value={settings.creditsPerDollar}
              onChange={handleChange}
              className="w-full bg-white/5 border border-white/10 rounded-xl h-11 px-4 text-sm outline-none focus:border-primary/40 transition-all"
            />
            <p className="text-xs text-neutral-500">Number of credits a user gets for 1 USD. e.g. 1500 = 1,500 credits for $1.</p>
          </div>
        </div>

        <div className="glass-panel p-6 rounded-2xl border-white/5 space-y-4">
          <div className="flex items-center gap-3 border-b border-white/5 pb-4 mb-4">
            <DollarSign className="size-5 text-primary" />
            <h2 className="text-lg font-bold">Payment Limits</h2>
          </div>
          <div className="space-y-2">
            <label className="text-sm font-semibold text-neutral-300">Minimum Payment (USD)</label>
            <input
              type="number"
              step="0.1"
              name="minimumPaymentUsd"
              value={settings.minimumPaymentUsd}
              onChange={handleChange}
              className="w-full bg-white/5 border border-white/10 rounded-xl h-11 px-4 text-sm outline-none focus:border-primary/40 transition-all"
            />
            <p className="text-xs text-neutral-500">The lowest amount a user can purchase.</p>
          </div>
        </div>

        <div className="glass-panel p-6 rounded-2xl border-white/5 space-y-4">
          <div className="flex items-center gap-3 border-b border-white/5 pb-4 mb-4">
            <Gift className="size-5 text-primary" />
            <h2 className="text-lg font-bold">Welcome Credits</h2>
          </div>
          <div className="space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-semibold text-neutral-300">Welcome Credits (Actual Credits)</label>
              <input
                type="number"
                step="1"
                name="welcomeCredits"
                value={settings.welcomeCredits}
                onChange={handleChange}
                className="w-full bg-white/5 border border-white/10 rounded-xl h-11 px-4 text-sm outline-none focus:border-primary/40 transition-all"
              />
              <p className="text-xs text-neutral-500">The exact number of credits granted to new users. e.g., 10000.</p>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-semibold text-neutral-300">Welcome Credit Value (USD Accounting)</label>
              <input
                type="number"
                step="0.01"
                name="welcomeCreditUsd"
                value={settings.welcomeCreditUsd}
                onChange={handleChange}
                className="w-full bg-white/5 border border-white/10 rounded-xl h-11 px-4 text-sm outline-none focus:border-primary/40 transition-all"
              />
              <p className="text-xs text-neutral-500">Internal accounting value for the granted credits.</p>
            </div>
          </div>
        </div>

        <div className="glass-panel p-6 rounded-2xl border-white/5 bg-primary/5 border-primary/20">
          <h2 className="text-sm font-bold text-primary mb-3">Preview Calculation</h2>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-sm">
            <div><span className="text-neutral-400 block mb-1">$1</span><span className="font-bold">{(previewRate * 1).toLocaleString()}</span> cr</div>
            <div><span className="text-neutral-400 block mb-1">$5</span><span className="font-bold">{(previewRate * 5).toLocaleString()}</span> cr</div>
            <div><span className="text-neutral-400 block mb-1">$10</span><span className="font-bold">{(previewRate * 10).toLocaleString()}</span> cr</div>
            <div><span className="text-neutral-400 block mb-1">$100</span><span className="font-bold">{(previewRate * 100).toLocaleString()}</span> cr</div>
          </div>
        </div>

        <div className="glass-panel p-6 rounded-2xl border-red-500/20 bg-red-500/5 space-y-4">
          <div className="flex items-center gap-3 border-b border-red-500/10 pb-4 mb-4">
            <AlertTriangle className="size-5 text-red-400" />
            <h2 className="text-lg font-bold text-red-400">Danger Zone</h2>
          </div>
          <div className="space-y-4">
            <div>
              <h3 className="text-sm font-semibold text-neutral-300 mb-2">Reset All User Credits</h3>
              <p className="text-sm text-neutral-400 mb-4">
                This will reset ALL user credits to 0 and give them only the welcome bonus ({settings.welcomeCredits} credits). 
                Use this if users received incorrect credit amounts due to a bug.
              </p>
              <Button
                variant="destructive"
                onClick={handleResetAllCredits}
                disabled={resetting}
                className="bg-red-500 hover:bg-red-600 text-white"
              >
                {resetting ? (
                  <RefreshCw className="size-4 animate-spin mr-2" />
                ) : (
                  <AlertTriangle className="size-4 mr-2" />
                )}
                Reset All User Credits
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
