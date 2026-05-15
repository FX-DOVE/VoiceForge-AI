"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { motion } from "framer-motion";
import { 
  User, 
  CreditCard, 
  Key, 
  Bell, 
  Camera, 
  CheckCircle2, 
  Copy, 
  Trash2,
  Plus
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useRef, useState, useEffect } from "react";
import { useAuth } from "@/contexts/auth-context";
import { useUsage } from "@/hooks/use-usage";
import { usersApi, filesApi } from "@/lib/api";
import { toast } from "sonner";
import { ApiError } from "@/lib/api/client";

const DEFAULT_AVATAR =
  "https://lh3.googleusercontent.com/aida-public/AB6AXuBg7h91fg7bqsAkL62YfMC8IQr_SJ_tniLt0-y6cg2RHooUbIvbp8KWFo83Hgq3sNFj64-P5xukuwjLg6E-ZNDmu_DPIwCZetojleAlsSHqoioPzgRk5Y20A_vMCy-nQmte8tKMrqa7V3K8AOWPobwJkETw5wwFdMAh9TgT9Ke4chPDnB20JpjB7ksQekpIS1GlKwCuuH-nMRb3EpyW-GVkOytcx-61_sxH3PyQ7KIbzd1MMbjlP8lhndHvs7E_JV7Upa1rpuiqiNw";

export default function SettingsPage() {
  const { user, refreshUser } = useAuth();
  const { usage } = useUsage();
  const fileInputRef = useRef(null);
  const [avatar, setAvatar] = useState(user?.avatar || DEFAULT_AVATAR);
  const [avatarError, setAvatarError] = useState("");
  const [fullName, setFullName] = useState(user?.name || "");
  const [email, setEmail] = useState(user?.email || "");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (user) {
      setFullName(user.name || "");
      setEmail(user.email || "");
      if (user.avatar) setAvatar(user.avatar);
    }
  }, [user]);

  function handlePickFile() {
    setAvatarError("");
    fileInputRef.current?.click();
  }

  async function handleAvatarChange(e) {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith("image/")) {
      setAvatarError("Please choose an image file.");
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      setAvatarError("Image must be smaller than 5 MB.");
      return;
    }

    try {
      setSaving(true);
      const data = await filesApi.upload(file);
      const url = data.file.url;
      await usersApi.updateProfile({ avatar: url });
      setAvatar(url);
      await refreshUser();
      toast.success("Avatar updated.");
    } catch (err) {
      toast.error("Failed to upload avatar.");
    } finally {
      setSaving(false);
    }
  }

  async function handleResetAvatar() {
    try {
      setSaving(true);
      await usersApi.updateProfile({ avatar: "" });
      setAvatar(DEFAULT_AVATAR);
      await refreshUser();
      toast.success("Avatar reset.");
    } catch (err) {
      toast.error("Failed to reset avatar.");
    } finally {
      setSaving(false);
    }
  }

  async function handleSaveProfile() {
    setSaving(true);
    try {
      await usersApi.updateProfile({ name: fullName, email });
      await refreshUser();
      toast.success("Profile updated successfully.");
    } catch (err) {
      toast.error(err instanceof ApiError ? err.message : "Failed to update profile.");
    } finally {
      setSaving(false);
    }
  }
  const sections = [
    { id: "profile", label: "Profile", icon: User },
    { id: "subscription", label: "Subscription", icon: CreditCard },
    { id: "apikeys", label: "API Keys", icon: Key },
    { id: "notifications", label: "Notifications", icon: Bell },
  ];

  return (
    <>
      <div className="flex-1 max-w-container-max mx-auto w-full px-4 sm:px-6 lg:px-8 py-6 sm:py-8 lg:py-10 flex flex-col lg:flex-row gap-6 lg:gap-10">
        {/* Settings Navigation Sidebar */}
        <aside className="w-full lg:w-72 shrink-0 flex flex-col gap-6">
          <div className="glass-panel p-6 rounded-[2rem] border-white/5 flex flex-col gap-6 h-fit lg:sticky lg:top-10">
            <div className="flex items-center gap-4 mb-2">
              <div 
                className="size-12 rounded-full bg-cover bg-center border border-white/10"
                style={{ backgroundImage: 'url("https://lh3.googleusercontent.com/aida-public/AB6AXuCakgyynGLfKz-vka6hxzoPJwasmTznjL78KShe89TTuFGQ-3Pj32AzScGTTmX4upA0R84lZ8BcK0R30-nssJXzhSbFt-xY7obHmxZcCcg4okR7id03O1VxtKKaqnuJEXl9PirhA4vubwLJG_wmqABCggISBara0Lj5x_jE3h9S2PU9K4JTvcOkegi0O23HfYUFKR4LurfM8v3Rk57I37QtLDadEUkmJxZVHh-Rw6QiV5xR9UJQLqRSYB2o2q37X8MQ4mV1aU6QVbM")' }}
              />
              <div className="flex flex-col">
                 <h2 className="text-lg font-bold text-white">Settings</h2>
                 <p className="text-xs font-bold text-on-surface-variant uppercase tracking-widest">Manage Account</p>
              </div>
            </div>

            <nav className="flex lg:flex-col gap-2 overflow-x-auto -mx-1 px-1 lg:overflow-visible">
              {sections.map((s, i) => (
                <a 
                  key={s.id}
                  href={`#${s.id}`}
                  className={cn(
                    "flex items-center gap-4 px-4 py-3 rounded-2xl transition-all group whitespace-nowrap shrink-0",
                    i === 0 ? "bg-primary/10 text-primary" : "text-on-surface-variant hover:bg-white/5 hover:text-white"
                  )}
                >
                  <s.icon className="size-5" />
                  <span className="text-sm font-bold">{s.label}</span>
                </a>
              ))}
            </nav>
          </div>
        </aside>

        {/* Main Content Area */}
        <main className="flex-1 min-w-0 flex flex-col gap-12 lg:gap-16 pb-20">
          {/* Profile Section */}
          <section id="profile" className="flex flex-col gap-8 scroll-mt-10">
            <div className="flex flex-col gap-2 border-b border-white/5 pb-6">
              <h2 className="text-2xl sm:text-3xl font-bold text-white tracking-tight">Profile Settings</h2>
              <p className="text-on-surface-variant">Manage your personal information and avatar.</p>
            </div>
            
            <div className="glass-panel p-5 sm:p-8 rounded-[1.5rem] sm:rounded-[2rem] border-white/5 flex flex-col gap-8 lg:gap-10">
              <div className="flex flex-col sm:flex-row items-center gap-8">
                <button
                  type="button"
                  onClick={handlePickFile}
                  aria-label="Upload avatar"
                  className="relative group cursor-pointer shrink-0 focus:outline-none focus-visible:ring-2 focus-visible:ring-primary rounded-full"
                >
                  <div
                    className="size-32 rounded-full bg-cover bg-center border-4 border-white/5 shadow-2xl transition-all group-hover:scale-105"
                    style={{ backgroundImage: `url("${avatar}")` }}
                  />
                  <div className="absolute inset-0 bg-black/40 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity backdrop-blur-sm">
                    <Camera className="size-8 text-primary" />
                  </div>
                </button>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/png,image/jpeg,image/webp"
                  className="hidden"
                  onChange={handleAvatarChange}
                />
                <div className="flex flex-col gap-4 text-center sm:text-left">
                  <h3 className="text-xl font-bold text-white">Your Avatar</h3>
                  <p className="text-sm text-on-surface-variant max-w-sm">
                    This will be displayed on your profile and mentions.
                    PNG, JPG or WEBP up to 5 MB. Recommended 256x256px.
                  </p>
                  {avatarError && (
                    <p className="text-xs text-red-400">{avatarError}</p>
                  )}
                  <div className="flex flex-wrap items-center gap-2 justify-center sm:justify-start">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={handlePickFile}
                      className="h-10 px-6 rounded-full border-white/10 hover:bg-white/5 font-bold"
                    >
                      Upload New Image
                    </Button>
                    {avatar !== DEFAULT_AVATAR && (
                      <Button
                        type="button"
                        variant="ghost"
                        onClick={handleResetAvatar}
                        className="h-10 px-4 rounded-full text-on-surface-variant hover:text-red-400 hover:bg-red-500/10 font-bold"
                      >
                        Reset
                      </Button>
                    )}
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="flex flex-col gap-3">
                  <label className="text-xs font-bold text-on-surface-variant uppercase tracking-widest">Full Name</label>
                  <Input 
                    className="h-12 bg-white/5 border-white/10 rounded-xl focus:ring-primary/20" 
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                  />
                </div>
                <div className="flex flex-col gap-3">
                  <label className="text-xs font-bold text-on-surface-variant uppercase tracking-widest">Email Address</label>
                  <Input 
                    className="h-12 bg-white/5 border-white/10 rounded-xl focus:ring-primary/20" 
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    disabled
                  />
                </div>
              </div>

              <div className="flex justify-end pt-6 border-t border-white/5">
                <Button 
                  className="h-12 px-10 bg-primary hover:bg-primary/90 text-on-primary rounded-full font-bold shadow-[0_0_20px_rgba(59,130,246,0.2)]"
                  onClick={handleSaveProfile}
                  disabled={saving}
                >
                  {saving ? "Saving..." : "Save Changes"}
                </Button>
              </div>
            </div>
          </section>

          {/* Subscription Section */}
          <section id="subscription" className="flex flex-col gap-8 scroll-mt-10">
            <div className="flex flex-col gap-2 border-b border-white/5 pb-6">
              <h2 className="text-2xl sm:text-3xl font-bold text-white tracking-tight">Subscription</h2>
              <p className="text-on-surface-variant">Manage your current plan and usage.</p>
            </div>

            <div className="glass-panel rounded-[1.5rem] sm:rounded-[2rem] border-white/5 relative overflow-hidden flex flex-col gap-8 p-5 sm:p-8">
              <div className="absolute top-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-white/10 to-transparent" />
              
              <div className="flex flex-col md:flex-row justify-between items-start gap-6">
                <div className="flex flex-col gap-2">
                   <div className="flex items-center gap-3">
                     <h3 className="text-2xl font-bold text-white">Pro Plan</h3>
                     <span className="px-3 py-1 rounded-full bg-primary/10 text-primary text-[10px] font-bold uppercase tracking-widest border border-primary/20">Active</span>
                   </div>
                   <p className="text-lg text-on-surface-variant">$49.99 / month</p>
                </div>
                <Button variant="outline" className="h-12 px-8 rounded-full border-white/10 hover:bg-white/5 font-bold">
                   Manage Plan
                </Button>
              </div>

              <div className="bg-white/5 rounded-2xl p-6 border border-white/5 flex flex-col gap-4">
                 <div className="flex justify-between items-end">
                    <div className="flex flex-col gap-1">
                      <span className="text-sm font-bold text-white">Monthly Audio Credits</span>
                      <span className="text-xs text-on-surface-variant font-medium">Resets in 12 days</span>
                    </div>
                     <span className="text-sm font-bold text-on-surface-variant">
                      <span className="text-white">{(usage?.charactersUsed ?? 0).toLocaleString()}</span> / {(usage?.charactersLimit ?? 100000).toLocaleString()} chars
                    </span>
                 </div>
                 <div className="w-full bg-white/5 rounded-full h-2 overflow-hidden">
                    <div className="bg-primary h-full rounded-full transition-all duration-1000" style={{ width: `${(usage?.charactersUsed / usage?.charactersLimit * 100) || 0}%` }} />
                 </div>
              </div>
            </div>
          </section>

          {/* API Keys Section */}
          <section id="apikeys" className="flex flex-col gap-8 scroll-mt-10">
            <div className="flex flex-col gap-2 border-b border-white/5 pb-6">
              <h2 className="text-2xl sm:text-3xl font-bold text-white tracking-tight">API Keys</h2>
              <p className="text-on-surface-variant">Manage your VoiceForge AI API keys for programmatic access.</p>
            </div>

            <div className="glass-panel p-5 sm:p-8 rounded-[1.5rem] sm:rounded-[2rem] border-white/5 flex flex-col gap-8">
              <div className="flex justify-between items-center">
                 <h3 className="text-xl font-bold text-white">Active Keys</h3>
                 <Button className="h-10 px-6 rounded-full bg-white/5 text-primary hover:bg-white/10 border border-white/10 font-bold">
                    <Plus className="mr-2 size-4" />
                    New Key
                 </Button>
              </div>

              <div className="flex flex-col gap-4">
                 {[
                   { name: "Production Key", date: "Oct 24, 2023", key: "vfa_prod_xxxxxxxxxxxxxx" },
                   { name: "Development Key", date: "Nov 12, 2023", key: "vfa_dev_xxxxxxxxxxxxxxx" }
                 ].map((k) => (
                   <div key={k.name} className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 p-5 rounded-2xl bg-white/5 border border-white/5">
                      <div className="flex flex-col gap-3 w-full max-w-md">
                         <div className="flex items-center gap-3">
                           <span className="text-sm font-bold text-white">{k.name}</span>
                           <span className="text-xs text-on-surface-variant font-medium">Created: {k.date}</span>
                         </div>
                         <div className="h-10 px-4 bg-black/20 rounded-lg flex items-center border border-white/5 font-mono text-xs text-on-surface-variant/80 overflow-hidden">
                           <span className="truncate">{k.key}</span>
                         </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Button variant="ghost" size="icon" className="size-10 rounded-full hover:bg-white/5 text-on-surface-variant hover:text-primary">
                          <Copy className="size-4" />
                        </Button>
                        <Button variant="ghost" size="icon" className="size-10 rounded-full hover:bg-white/5 text-on-surface-variant hover:text-red-400">
                          <Trash2 className="size-4" />
                        </Button>
                      </div>
                   </div>
                 ))}
              </div>
            </div>
          </section>
        </main>
      </div>
    </>
  );
}
