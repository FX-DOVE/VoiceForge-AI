"use client";

import { useEffect, useState } from "react";
import { adminApi, paymentsApi } from "@/lib/api";
import { toast } from "sonner";
import { Save, RefreshCw, DollarSign, Settings, Gift, AlertTriangle, Calculator, Shield } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function BillingSettingsPage() {
  const [settings, setSettings] = useState({
    platformShare: 0.5,
    apiShare: 0.5,
    ttsCostPerMillionCharacters: 15.00,
    creditsPerCharacter: 2,
    minimumDepositUsd: 1,
    maximumDepositUsd: 500,
    welcomeCredits: 2380,
    welcomeCreditUsdValue: 0.01,
    elevenlabs: { costPerMillionCharacters: 50, creditsPerCharacter: 7, platformShare: 0.5, apiShare: 0.5 },
    professional: { costPerMillionCharacters: 50, creditsPerCharacter: 7, platformShare: 0.5, apiShare: 0.5 },
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [resetting, setResetting] = useState(false);
  const [depositPreviews, setDepositPreviews] = useState({ xai: {}, elevenlabs: {} });
  const [profiles, setProfiles] = useState([]);
  const [profilesLoading, setProfilesLoading] = useState(false);

  const loadSettings = async () => {
    setLoading(true);
    try {
      const data = await adminApi.billingSettings();
      if (data) {
        const normalized = { ...data };
        if (data.professional && !data.elevenlabs) {
          normalized.elevenlabs = data.professional;
        }
        setSettings(normalized);
        if (data.examples) {
          setDepositPreviews({
            xai: data.examples.xai || {},
            elevenlabs: data.examples.professional || {},
          });
        }
      }

      // Use new estimate method for live previews per provider (non-fatal)
      try {
        const [xai1, xai5, xai10, pro1, pro5, pro10] = await Promise.all([
          paymentsApi.estimate(1, "xai"),
          paymentsApi.estimate(5, "xai"),
          paymentsApi.estimate(10, "xai"),
          paymentsApi.estimate(1, "elevenlabs"),
          paymentsApi.estimate(5, "elevenlabs"),
          paymentsApi.estimate(10, "elevenlabs"),
        ]);
        setDepositPreviews({
          xai: { 1: xai1?.credits ?? 0, 5: xai5?.credits ?? 0, 10: xai10?.credits ?? 0 },
          elevenlabs: { 1: pro1?.credits ?? 0, 5: pro5?.credits ?? 0, 10: pro10?.credits ?? 0 },
        });
      } catch (estErr) {
        // Previews are nice-to-have; don't block the settings UI
        console.warn("[BillingSettings] estimate previews failed (non-fatal):", estErr?.message);
      }

      // Load granular per-model billing profiles
      try {
        setProfilesLoading(true);
        const pData = await adminApi.billingProfiles();
        setProfiles(pData.profiles || pData || []);
      } catch (pErr) {
        console.warn("[BillingSettings] profiles load failed:", pErr?.message);
      } finally {
        setProfilesLoading(false);
      }
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
      toast.success("Billing settings saved. Changes apply to future deposits immediately.");
    } catch (err) {
      toast.error(err.message || "Failed to save settings.");
    } finally {
      setSaving(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setSettings((prev) => ({ ...prev, [name]: Number(value) || 0 }));
  };

  const resetToDefaults = () => {
    setSettings({
      platformShare: 0.5,
      apiShare: 0.5,
      ttsCostPerMillionCharacters: 15.00,
      creditsPerCharacter: 2,
      minimumDepositUsd: 1,
      maximumDepositUsd: 500,
      welcomeCredits: 2380,
      welcomeCreditUsdValue: 0.01,
      elevenlabs: { costPerMillionCharacters: 50, creditsPerCharacter: 7, platformShare: 0.5, apiShare: 0.5 },
      professional: { costPerMillionCharacters: 50, creditsPerCharacter: 7, platformShare: 0.5, apiShare: 0.5 },
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

  // Live Preview Calculations - use new per-provider estimate (fetched in loadSettings)
  const depositAmount = 10;
  const xaiPreview = (depositPreviews.xai && depositPreviews.xai[10]) || 0;
  const proPreview = (depositPreviews.elevenlabs && depositPreviews.elevenlabs[10]) || 0;

  // For the example box, use main settings (or we could compute per profile)
  const apiBudget = depositAmount * (settings.apiShare || 0.5);
  const characters = (apiBudget / (settings.ttsCostPerMillionCharacters || 15)) * 1_000_000;
  const credits = Math.floor(characters * (settings.creditsPerCharacter || 2));
  const platformRevenue = depositAmount * (settings.platformShare || 0.5);

  // Margin protection check
  const marginWarning = 
    (settings.apiShare || 0) + (settings.platformShare || 0) !== 1.0 ||
    (settings.ttsCostPerMillionCharacters || 0) <= 0;

  if (loading) {
    return (
      <div className="flex h-full items-center justify-center">
        <RefreshCw className="size-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="flex-1 overflow-y-auto p-6 lg:p-8 max-w-5xl mx-auto w-full pb-12">
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-white">Billing Settings</h1>
          <p className="text-sm text-neutral-400 mt-1">Dynamic xAI pricing, revenue split, and credit accounting. Changes apply instantly to new deposits.</p>
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

      {/* Live Preview Calculator */}
      <div className="glass-panel p-6 rounded-2xl border-primary/30 bg-primary/5 mb-8">
        <div className="flex items-center gap-3 mb-4">
          <Calculator className="size-5 text-primary" />
          <h2 className="text-lg font-bold">Live Deposit Preview (using current values)</h2>
        </div>

        <div className="mb-4">
          <div className="text-sm font-bold mb-1 text-amber-400">Pro (xAI) Deposits (live via new estimate)</div>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4 text-sm">
            <div className="bg-white/5 rounded-xl p-4">
              <div className="text-neutral-400 text-xs mb-1">$1 →</div>
              <div className="text-xl font-bold text-primary">{((depositPreviews.xai && depositPreviews.xai[1]) || 0).toLocaleString()} cr</div>
            </div>
            <div className="bg-white/5 rounded-xl p-4">
              <div className="text-neutral-400 text-xs mb-1">$5 →</div>
              <div className="text-xl font-bold text-primary">{((depositPreviews.xai && depositPreviews.xai[5]) || 0).toLocaleString()} cr</div>
            </div>
            <div className="bg-white/5 rounded-xl p-4">
              <div className="text-neutral-400 text-xs mb-1">$10 →</div>
              <div className="text-xl font-bold text-primary">{((depositPreviews.xai && depositPreviews.xai[10]) || 0).toLocaleString()} cr</div>
            </div>
          </div>
        </div>

        <div>
          <div className="text-sm font-bold mb-1 text-violet-400">Professional Deposits (live via new estimate)</div>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4 text-sm">
            <div className="bg-white/5 rounded-xl p-4">
              <div className="text-neutral-400 text-xs mb-1">$1 →</div>
              <div className="text-xl font-bold text-violet-400">{((depositPreviews.elevenlabs && depositPreviews.elevenlabs[1]) || 0).toLocaleString()} cr</div>
            </div>
            <div className="bg-white/5 rounded-xl p-4">
              <div className="text-neutral-400 text-xs mb-1">$5 →</div>
              <div className="text-xl font-bold text-violet-400">{((depositPreviews.elevenlabs && depositPreviews.elevenlabs[5]) || 0).toLocaleString()} cr</div>
            </div>
            <div className="bg-white/5 rounded-xl p-4">
              <div className="text-neutral-400 text-xs mb-1">$10 →</div>
              <div className="text-xl font-bold text-violet-400">{((depositPreviews.elevenlabs && depositPreviews.elevenlabs[10]) || 0).toLocaleString()} cr</div>
            </div>
          </div>
        </div>

        <div className="mt-4 text-xs text-neutral-500">
          Using paymentsApi.estimate(amount, provider) + per-provider profile (new credit calc)
        </div>

        {marginWarning && (
          <div className="mt-3 text-sm text-red-400 flex items-center gap-2">
            <Shield className="size-4" /> Warning: platformShare + apiShare must equal 1.0 and costs positive.
          </div>
        )}
      </div>

      <div className="space-y-6">
        {/* Revenue Split */}
        <div className="glass-panel p-6 rounded-2xl border-white/5 space-y-4">
          <div className="flex items-center gap-3 border-b border-white/5 pb-4 mb-4">
            <Settings className="size-5 text-primary" />
            <h2 className="text-lg font-bold">Revenue Split (Must total 100%)</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-semibold text-neutral-300">Platform Share</label>
              <input type="number" step="0.01" name="platformShare" value={settings.platformShare} onChange={handleChange}
                className="w-full bg-white/5 border border-white/10 rounded-xl h-11 px-4 text-sm mt-1" />
            </div>
            <div>
              <label className="text-sm font-semibold text-neutral-300">API Budget Share</label>
              <input type="number" step="0.01" name="apiShare" value={settings.apiShare} onChange={handleChange}
                className="w-full bg-white/5 border border-white/10 rounded-xl h-11 px-4 text-sm mt-1" />
            </div>
          </div>
        </div>

        {/* xAI Pricing */}
        <div className="glass-panel p-6 rounded-2xl border-white/5 space-y-4">
          <div className="flex items-center gap-3 border-b border-white/5 pb-4 mb-4">
            <DollarSign className="size-5 text-primary" />
            <h2 className="text-lg font-bold">xAI Provider Billing Profile (editable, no deploy)</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-semibold text-neutral-300">Cost per Million Characters (USD)</label>
              <input type="number" step="0.01" name="ttsCostPerMillionCharacters" value={settings.ttsCostPerMillionCharacters} onChange={handleChange}
                className="w-full bg-white/5 border border-white/10 rounded-xl h-11 px-4 text-sm mt-1" />
            </div>
            <div>
              <label className="text-sm font-semibold text-neutral-300">Credits per Character</label>
              <input type="number" name="creditsPerCharacter" value={settings.creditsPerCharacter} onChange={handleChange}
                className="w-full bg-white/5 border border-white/10 rounded-xl h-11 px-4 text-sm mt-1" />
            </div>
            <div>
              <label className="text-sm font-semibold text-neutral-300">Platform Share (0-1)</label>
              <input type="number" step="0.01" name="platformShare" value={settings.platformShare} onChange={handleChange}
                className="w-full bg-white/5 border border-white/10 rounded-xl h-11 px-4 text-sm mt-1" />
            </div>
            <div>
              <label className="text-sm font-semibold text-neutral-300">API Share (0-1, sum=1)</label>
              <input type="number" step="0.01" name="apiShare" value={settings.apiShare} onChange={handleChange}
                className="w-full bg-white/5 border border-white/10 rounded-xl h-11 px-4 text-sm mt-1" />
            </div>
          </div>
          <p className="text-xs text-neutral-500">Changes to these update providerProfiles.xai automatically. Used for deposits + generation charging for xAI voices.</p>
        </div>

        {/* ElevenLabs Pricing (Professional) - Independent billing */}
        <div className="glass-panel p-6 rounded-2xl border-white/5 space-y-4">
          <div className="flex items-center gap-3 border-b border-white/5 pb-4 mb-4">
            <DollarSign className="size-5 text-primary" />
            <h2 className="text-lg font-bold">Professional Pricing (ElevenLabs powered)</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-semibold text-neutral-300">Cost per Million Characters (USD)</label>
              <input type="number" step="0.01" name="elevenlabs.costPerMillionCharacters" value={(settings.elevenlabs && settings.elevenlabs.costPerMillionCharacters) || 50} onChange={(e) => {
                const val = Number(e.target.value);
                setSettings(prev => ({ ...prev, elevenlabs: { ...(prev.elevenlabs || {}), costPerMillionCharacters: val }, professional: { ...(prev.professional || prev.elevenlabs || {}), costPerMillionCharacters: val } }));
              }} className="w-full bg-white/5 border border-white/10 rounded-xl h-11 px-4 text-sm mt-1" />
            </div>
            <div>
              <label className="text-sm font-semibold text-neutral-300">Credits Per Character</label>
              <input type="number" name="elevenlabs.creditsPerCharacter" value={(settings.elevenlabs && settings.elevenlabs.creditsPerCharacter) || 7} onChange={(e) => {
                const val = Number(e.target.value);
                setSettings(prev => ({ ...prev, elevenlabs: { ...(prev.elevenlabs || {}), creditsPerCharacter: val }, professional: { ...(prev.professional || prev.elevenlabs || {}), creditsPerCharacter: val } }));
              }} className="w-full bg-white/5 border border-white/10 rounded-xl h-11 px-4 text-sm mt-1" />
            </div>
            <div>
              <label className="text-sm font-semibold text-neutral-300">Platform Share</label>
              <input type="number" step="0.01" name="elevenlabs.platformShare" value={(settings.elevenlabs && settings.elevenlabs.platformShare) || 0.5} onChange={(e) => {
                const val = Number(e.target.value);
                setSettings(prev => ({ ...prev, elevenlabs: { ...(prev.elevenlabs || {}), platformShare: val }, professional: { ...(prev.professional || prev.elevenlabs || {}), platformShare: val } }));
              }} className="w-full bg-white/5 border border-white/10 rounded-xl h-11 px-4 text-sm mt-1" />
            </div>
            <div>
              <label className="text-sm font-semibold text-neutral-300">API Share</label>
              <input type="number" step="0.01" name="elevenlabs.apiShare" value={(settings.elevenlabs && settings.elevenlabs.apiShare) || 0.5} onChange={(e) => {
                const val = Number(e.target.value);
                setSettings(prev => ({ ...prev, elevenlabs: { ...(prev.elevenlabs || {}), apiShare: val }, professional: { ...(prev.professional || prev.elevenlabs || {}), apiShare: val } }));
              }} className="w-full bg-white/5 border border-white/10 rounded-xl h-11 px-4 text-sm mt-1" />
            </div>
          </div>
          <p className="text-xs text-neutral-500">Independent from xAI. Used for Professional plan deposits and usage.</p>
        </div>

        {/* Credit Accounting */}
        <div className="glass-panel p-6 rounded-2xl border-white/5 space-y-4">
          <div className="flex items-center gap-3 border-b border-white/5 pb-4 mb-4">
            <Calculator className="size-5 text-primary" />
            <h2 className="text-lg font-bold">Credit Accounting Unit</h2>
          </div>
          <div>
            <label className="text-sm font-semibold text-neutral-300">Credits Per Character</label>
            <input type="number" name="creditsPerCharacter" value={settings.creditsPerCharacter} onChange={handleChange}
              className="w-full bg-white/5 border border-white/10 rounded-xl h-11 px-4 text-sm mt-1" />
            <p className="text-xs text-neutral-500 mt-1">Accounting unit only. 1 character = N credits. Does not affect profitability.</p>
          </div>
        </div>

        {/* Deposit Limits */}
        <div className="glass-panel p-6 rounded-2xl border-white/5 space-y-4">
          <div className="flex items-center gap-3 border-b border-white/5 pb-4 mb-4">
            <DollarSign className="size-5 text-primary" />
            <h2 className="text-lg font-bold">Deposit Limits</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-semibold text-neutral-300">Minimum Deposit (USD)</label>
              <input type="number" step="0.5" name="minimumDepositUsd" value={settings.minimumDepositUsd} onChange={handleChange}
                className="w-full bg-white/5 border border-white/10 rounded-xl h-11 px-4 text-sm mt-1" />
            </div>
            <div>
              <label className="text-sm font-semibold text-neutral-300">Maximum Deposit (USD)</label>
              <input type="number" step="1" name="maximumDepositUsd" value={settings.maximumDepositUsd} onChange={handleChange}
                className="w-full bg-white/5 border border-white/10 rounded-xl h-11 px-4 text-sm mt-1" />
            </div>
          </div>
        </div>

        {/* Welcome Credits */}
        <div className="glass-panel p-6 rounded-2xl border-white/5 space-y-4">
          <div className="flex items-center gap-3 border-b border-white/5 pb-4 mb-4">
            <Gift className="size-5 text-primary" />
            <h2 className="text-lg font-bold">Welcome / Onboarding Credits</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-semibold text-neutral-300">Welcome Credits (Granted to new users)</label>
              <input type="number" name="welcomeCredits" value={settings.welcomeCredits} onChange={handleChange}
                className="w-full bg-white/5 border border-white/10 rounded-xl h-11 px-4 text-sm mt-1" />
            </div>
            <div>
              <label className="text-sm font-semibold text-neutral-300">Internal Accounting Value (USD)</label>
              <input type="number" step="0.01" name="welcomeCreditUsdValue" value={settings.welcomeCreditUsdValue} onChange={handleChange}
                className="w-full bg-white/5 border border-white/10 rounded-xl h-11 px-4 text-sm mt-1" />
            </div>
          </div>
        </div>

        {/* Per-Model Billing Profiles (new dynamic model billing) */}
        <div className="glass-panel p-6 rounded-2xl border-white/5 space-y-4">
          <div className="flex items-center gap-3 border-b border-white/5 pb-4 mb-4">
            <Calculator className="size-5 text-primary" />
            <h2 className="text-lg font-bold">Billing Profiles (Provider + Model)</h2>
            {profilesLoading && <RefreshCw className="size-4 animate-spin" />}
          </div>
          {profiles.length === 0 ? (
            <p className="text-sm text-neutral-400">No profiles loaded. Run seed script or refresh.</p>
          ) : (
            <div className="space-y-3">
              {profiles.map((p, idx) => (
                <div key={idx} className="border border-white/10 rounded-xl p-3 text-sm">
                  <div className="flex justify-between items-center">
                    <div>
                      <span className="font-bold">{p.provider}/{p.model}</span>
                      <span className="ml-2 text-xs px-2 py-0.5 rounded bg-white/10">{p.costTier}</span>
                      <span className="ml-2 text-xs text-neutral-400">{p.displayName}</span>
                    </div>
                    <div className="text-right text-xs">
                      ${p.costPerMillionCharacters}/M • {p.creditsPerCharacter} cr/char
                    </div>
                  </div>
                  <div className="mt-2 grid grid-cols-2 gap-2 text-xs">
                    <input type="number" step="0.01" defaultValue={p.costPerMillionCharacters} className="bg-white/5 border border-white/10 rounded px-2 py-1" onBlur={async (e) => {
                      const val = parseFloat(e.target.value);
                      if (!isNaN(val)) {
                        await adminApi.updateBillingProfile({ provider: p.provider, model: p.model, costPerMillionCharacters: val });
                        toast.success("Profile updated");
                        // reload
                        const pData = await adminApi.billingProfiles();
                        setProfiles(pData.profiles || []);
                      }
                    }} />
                    <input type="number" defaultValue={p.creditsPerCharacter} className="bg-white/5 border border-white/10 rounded px-2 py-1" onBlur={async (e) => {
                      const val = parseFloat(e.target.value);
                      if (!isNaN(val)) {
                        await adminApi.updateBillingProfile({ provider: p.provider, model: p.model, creditsPerCharacter: val });
                        toast.success("Profile updated");
                        const pData = await adminApi.billingProfiles();
                        setProfiles(pData.profiles || []);
                      }
                    }} />
                  </div>
                  <div className="text-[10px] text-neutral-500 mt-1">Shares: {p.platformShare} / {p.apiShare} • Active: {p.active ? "yes" : "no"}</div>
                </div>
              ))}
            </div>
          )}
          <p className="text-xs text-neutral-500">Edits save live. Used for exact provider+model charging in Studio previews and generation.</p>
        </div>

        {/* Danger Zone */}
        <div className="glass-panel p-6 rounded-2xl border-red-500/20 bg-red-500/5 space-y-4">
          <div className="flex items-center gap-3 border-b border-red-500/10 pb-4 mb-4">
            <AlertTriangle className="size-5 text-red-400" />
            <h2 className="text-lg font-bold text-red-400">Danger Zone</h2>
          </div>
          <div>
            <h3 className="text-sm font-semibold text-neutral-300 mb-2">Reset All User Credits</h3>
            <p className="text-sm text-neutral-400 mb-4">
              This will reset ALL user credits to 0 and give them only the welcome bonus. Use only for major data correction.
            </p>
            <Button variant="destructive" onClick={handleResetAllCredits} disabled={resetting} className="bg-red-500 hover:bg-red-600 text-white">
              {resetting ? <RefreshCw className="size-4 animate-spin mr-2" /> : <AlertTriangle className="size-4 mr-2" />}
              Reset All User Credits
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
