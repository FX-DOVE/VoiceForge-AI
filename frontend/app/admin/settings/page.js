"use client";

import { motion } from "framer-motion";
import { 
  Settings, 
  Save, 
  Bell, 
  Globe, 
  Cpu, 
  ShieldCheck, 
  Palette,
  Terminal,
  Activity,
  Server,
  Lock
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export default function AdminSettingsPage() {
  const tabs = [
    { label: "General", icon: Globe },
    { label: "API Config", icon: Terminal },
    { label: "Security", icon: Lock },
    { label: "Appearance", icon: Palette },
  ];

  return (
    <div className="flex-1 flex flex-col h-full overflow-hidden">
      {/* Header */}
      <header className="hidden lg:flex h-20 border-b border-white/5 bg-background/80 backdrop-blur-md sticky top-0 z-30 items-center justify-between px-10 shrink-0">
        <div className="flex items-center gap-4">
           <Settings className="size-6 text-primary" />
           <h2 className="text-2xl font-bold text-white tracking-tight">System Settings</h2>
        </div>
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" className="size-12 rounded-full hover:bg-white/5 border border-white/5">
            <Bell className="size-5 text-on-surface-variant" />
          </Button>
          <Button className="bg-primary hover:bg-primary/90 text-on-primary rounded-full px-8 h-12 font-bold shadow-[0_0_20px_rgba(59,130,246,0.2)]">
            <Save className="mr-2 size-4" />
            Save Changes
          </Button>
        </div>
      </header>

      <div className="flex-1 overflow-y-auto overflow-x-hidden p-4 sm:p-6 lg:p-10 max-w-container-max mx-auto w-full flex flex-col gap-10 pb-20">
        {/* Tabs */}
        <div className="flex border-b border-white/5 gap-10">
          {tabs.map((t, i) => (
            <button
              key={t.label}
              className={cn(
                "flex items-center gap-3 pb-6 px-2 text-sm font-bold uppercase tracking-widest transition-all relative",
                i === 0 ? "text-primary border-b-[3px] border-primary" : "text-on-surface-variant hover:text-white"
              )}
            >
              <t.icon className="size-4" />
              {t.label}
            </button>
          ))}
        </div>

        <div className="flex flex-col gap-16">
          {/* General Config */}
          <section className="flex flex-col gap-8">
            <div className="flex flex-col gap-2">
              <h3 className="text-2xl font-bold text-white tracking-tight">General Configuration</h3>
              <p className="text-on-surface-variant">Manage the core identity and operational status of your VoiceForge instance.</p>
            </div>
            
            <div className="glass-panel p-10 rounded-[2.5rem] border-white/5 flex flex-col gap-10">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="flex flex-col gap-3">
                  <label className="text-xs font-bold text-on-surface-variant uppercase tracking-widest">Site Name</label>
                  <Input className="h-14 bg-white/5 border-white/10 rounded-2xl focus:ring-primary/20" defaultValue="VoiceForge AI Production" />
                </div>
                <div className="flex flex-col gap-3">
                  <label className="text-xs font-bold text-on-surface-variant uppercase tracking-widest">Admin Contact Email</label>
                  <Input className="h-14 bg-white/5 border-white/10 rounded-2xl focus:ring-primary/20" defaultValue="admin@voiceforge.ai" />
                </div>
              </div>

              <div className="pt-8 border-t border-white/5 flex items-center justify-between">
                <div className="flex flex-col gap-1">
                   <span className="text-sm font-bold text-white">Maintenance Mode</span>
                   <p className="text-xs text-on-surface-variant font-medium">Temporarily disable access to the platform for all non-admin users.</p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer group">
                  <input type="checkbox" className="sr-only peer" />
                  <div className="w-14 h-8 bg-white/5 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[4px] after:left-[4px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-6 after:w-6 after:transition-all peer-checked:bg-primary"></div>
                </label>
              </div>
            </div>
          </section>

          {/* API Config */}
          <section className="flex flex-col gap-8">
            <div className="flex flex-col gap-2">
              <h3 className="text-2xl font-bold text-white tracking-tight">API & Resource Limits</h3>
              <p className="text-on-surface-variant">Configure generation parameters, rate limits, and model access.</p>
            </div>
            
            <div className="glass-panel p-10 rounded-[2.5rem] border-white/5 flex flex-col gap-10">
              <div className="flex flex-col gap-3 max-w-md">
                 <label className="text-xs font-bold text-on-surface-variant uppercase tracking-widest">Default Generation Model</label>
                 <select defaultValue="pro" className="h-14 px-6 bg-white/5 border border-white/10 rounded-2xl text-white outline-none focus:ring-2 focus:ring-primary/20 transition-all appearance-none">
                    <option value="turbo" className="bg-background">VoiceForge v2 Turbo (Fastest)</option>
                    <option value="pro" className="bg-background">VoiceForge v2 Pro (High Fidelity)</option>
                    <option value="v1" className="bg-background">VoiceForge v1 (Legacy)</option>
                 </select>
              </div>

              <div className="flex flex-col gap-6 max-w-2xl">
                 <div className="flex justify-between items-end">
                    <span className="text-sm font-bold text-white">Global Rate Limit (RPM)</span>
                    <span className="px-3 py-1 rounded-lg bg-primary/10 text-primary font-bold text-xs uppercase">120 RPM</span>
                 </div>
                 <input type="range" min="10" max="500" defaultValue="120" className="w-full accent-primary h-2 bg-white/5 rounded-full" />
                 <div className="flex justify-between text-[10px] font-bold text-on-surface-variant uppercase tracking-widest">
                    <span>10 RPM</span>
                    <span>500 RPM</span>
                 </div>
              </div>
            </div>
          </section>

          {/* Security */}
          <section className="flex flex-col gap-8">
            <h3 className="text-2xl font-bold text-white tracking-tight">Security & Access</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
               <div className="glass-panel p-8 rounded-[2rem] border-white/5 flex flex-col justify-between gap-6 min-h-[220px]">
                  <div>
                    <div className="flex items-center gap-3 mb-3">
                       <ShieldCheck className="size-6 text-primary" />
                       <h4 className="text-lg font-bold text-white">2FA Enforcement</h4>
                    </div>
                    <p className="text-sm text-on-surface-variant leading-relaxed">
                      Enforce two-factor authentication for all administrative accounts across the platform.
                    </p>
                  </div>
                  <div className="flex items-center justify-between">
                     <span className="text-xs font-bold text-white uppercase tracking-widest">Require Globally</span>
                     <label className="relative inline-flex items-center cursor-pointer group">
                        <input type="checkbox" className="sr-only peer" defaultChecked />
                        <div className="w-14 h-8 bg-white/5 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[4px] after:left-[4px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-6 after:w-6 after:transition-all peer-checked:bg-primary"></div>
                      </label>
                  </div>
               </div>

               <div className="glass-panel p-8 rounded-[2rem] border-white/5 flex flex-col gap-6">
                  <div className="flex items-center gap-3">
                     <Server className="size-6 text-primary" />
                     <h4 className="text-lg font-bold text-white">Admin IP Whitelist</h4>
                  </div>
                  <p className="text-sm text-on-surface-variant leading-relaxed">
                    Restrict admin dashboard access to specific IP addresses. One per line.
                  </p>
                  <textarea 
                    className="flex-1 min-h-[120px] bg-white/5 border border-white/10 rounded-2xl p-4 text-xs font-mono text-on-surface-variant focus:border-primary outline-none transition-all resize-none"
                    placeholder="e.g., 192.168.1.1"
                    defaultValue={`203.0.113.50\n198.51.100.14`}
                  />
               </div>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}
