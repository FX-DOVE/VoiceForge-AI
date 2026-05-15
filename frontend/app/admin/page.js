"use client";

import { motion } from "framer-motion";
import { 
  DollarSign, 
  Users, 
  Zap, 
  Activity, 
  TrendingUp, 
  AlertCircle, 
  CheckCircle2, 
  Key,
  CloudCheck,
  UserPlus,
  Bell
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

export default function AdminDashboardPage() {
  const stats = [
    { label: "Total Revenue", value: "$12,340", trend: "+15%", icon: DollarSign, color: "text-green-400" },
    { label: "Active Subscriptions", value: "1,245", trend: "+24", icon: Users, color: "text-blue-400" },
    { label: "API Usage", value: "85%", trend: "Warning", icon: Zap, color: "text-orange-400", progress: 85 },
    { label: "Generation Volume", value: "4.2M", trend: "Optimal", icon: Activity, color: "text-purple-400" },
  ];

  const regions = [
    { name: "US East (N. Virginia)", latency: "24ms", status: "Operational", color: "bg-green-500" },
    { name: "US West (Oregon)", latency: "32ms", status: "Operational", color: "bg-green-500" },
    { name: "EU (Frankfurt)", latency: "145ms", status: "Degraded", color: "bg-red-500" },
  ];

  const activities = [
    { title: "API Key Rotated", desc: "Enterprise account 'GlobalCorp' requested emergency key rotation.", time: "2 mins ago", icon: Key, iconColor: "text-orange-400" },
    { title: "Spike in Synthesis Errors", desc: "EU (Frankfurt) region reporting elevated 500 errors on the /v1/synthesize endpoint.", time: "15 mins ago", icon: AlertCircle, iconColor: "text-red-400" },
    { title: "Model Weights Updated", desc: "Successfully deployed 'VoiceEngine-v2.1' to all primary clusters.", time: "1 hour ago", icon: CloudCheck, iconColor: "text-blue-400" },
    { title: "New Pro Subscription", desc: "User ID #8921 upgraded to Pro tier.", time: "3 hours ago", icon: UserPlus, iconColor: "text-green-400" },
  ];

  return (
    <div className="flex-1 flex flex-col h-full overflow-hidden">
      {/* Header */}
      <header className="hidden lg:flex h-20 border-b border-white/5 bg-background/80 backdrop-blur-md sticky top-0 z-30 items-center justify-between px-10 shrink-0">
        <h2 className="text-2xl font-bold text-white tracking-tight">Overview</h2>
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" className="size-12 rounded-full hover:bg-white/5 border border-white/5">
            <Bell className="size-5 text-on-surface-variant" />
          </Button>
          <Button className="bg-primary hover:bg-primary/90 text-on-primary rounded-full px-8 h-12 font-bold shadow-[0_0_20px_rgba(59,130,246,0.2)]">
            Generate Report
          </Button>
        </div>
      </header>

      <div className="flex-1 overflow-y-auto overflow-x-hidden p-4 sm:p-6 lg:p-10 max-w-container-max mx-auto w-full flex flex-col gap-10 pb-20">
        {/* Hero Stats */}
        <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {stats.map((s, i) => (
            <motion.div
              key={s.label}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1 }}
              className="glass-panel p-8 rounded-[2rem] flex flex-col gap-4 border-white/5 relative group hover:bg-white/[0.05] transition-all"
            >
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-bold text-on-surface-variant uppercase tracking-widest">{s.label}</h3>
                <s.icon className={cn("size-6", s.color)} />
              </div>
              <div className="flex items-end gap-3">
                <span className="text-4xl font-bold text-white tracking-tight">{s.value}</span>
                <span className={cn("text-xs font-bold mb-1 flex items-center gap-1", s.trend.includes("+") ? "text-green-400" : "text-orange-400")}>
                  {s.trend.includes("+") && <TrendingUp className="size-3" />}
                  {s.trend}
                </span>
              </div>
              {s.progress ? (
                <div className="w-full bg-white/5 rounded-full h-2 mt-2">
                   <div className="h-full bg-gradient-to-r from-blue-500 to-orange-500 rounded-full" style={{ width: `${s.progress}%` }} />
                </div>
              ) : (
                <div className="mt-4 h-10 flex items-end gap-1 opacity-20 group-hover:opacity-100 transition-all">
                   {[20, 35, 25, 50, 40, 65, 85].map((h, idx) => (
                     <div key={idx} className={cn("w-full rounded-t-sm transition-all duration-500", idx === 6 ? "bg-primary" : "bg-white/20")} style={{ height: `${h}%` }} />
                   ))}
                </div>
              )}
            </motion.div>
          ))}
        </section>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
          {/* System Health */}
          <section className="lg:col-span-1 flex flex-col gap-6">
            <h2 className="text-xl font-bold text-white tracking-tight px-2">System Health</h2>
            <div className="glass-panel rounded-[2rem] p-4 border-white/5 flex flex-col gap-2">
              {regions.map((r, i) => (
                <div key={r.name} className="flex items-center justify-between p-4 rounded-2xl hover:bg-white/5 transition-all">
                  <div className="flex items-center gap-4">
                    <div className="size-10 rounded-full bg-white/5 flex items-center justify-center ring-1 ring-white/10">
                      <div className={cn("size-2 rounded-full", r.color)} />
                    </div>
                    <div className="flex flex-col">
                      <span className="text-sm font-bold text-white">{r.name}</span>
                      <span className="text-xs text-on-surface-variant font-medium">Latency: {r.latency}</span>
                    </div>
                  </div>
                  <span className={cn(
                    "text-[10px] font-bold uppercase tracking-widest px-3 py-1 rounded-full border",
                    r.status === "Operational" ? "text-green-400 border-green-500/20 bg-green-500/10" : "text-red-400 border-red-500/20 bg-red-500/10"
                  )}>{r.status}</span>
                </div>
              ))}
              <div className="mt-4 pt-4 border-t border-white/5 px-4 pb-2">
                 <div className="flex justify-between items-center text-xs font-bold text-on-surface-variant">
                   <span className="uppercase tracking-widest">Main Database</span>
                   <span className="text-primary uppercase tracking-widest">99.99% Uptime</span>
                 </div>
              </div>
            </div>
          </section>

          {/* Recent Activity Feed */}
          <section className="lg:col-span-2 flex flex-col gap-6">
            <div className="flex items-center justify-between px-2">
              <h2 className="text-xl font-bold text-white tracking-tight">Recent Activity</h2>
              <Button variant="link" className="text-sm text-primary font-bold">View All</Button>
            </div>
            <div className="glass-panel rounded-[2rem] p-8 border-white/5 relative">
              <div className="flex flex-col gap-0 relative">
                <div className="absolute left-[19px] top-4 bottom-4 w-px bg-white/5" />
                {activities.map((a, i) => (
                  <div key={i} className="flex gap-6 relative py-4 group">
                    <div className="size-10 rounded-full bg-background border border-white/5 flex items-center justify-center z-10 shadow-xl shrink-0 group-hover:border-primary/50 transition-all">
                      <a.icon className={cn("size-5", a.iconColor)} />
                    </div>
                    <div className={cn("flex-1 pb-4", i !== activities.length - 1 ? "border-b border-white/5" : "")}>
                       <div className="flex justify-between items-start mb-1">
                          <h4 className="text-base font-bold text-white">{a.title}</h4>
                          <span className="text-xs font-medium text-on-surface-variant">{a.time}</span>
                       </div>
                       <p className="text-sm text-on-surface-variant leading-relaxed">{a.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}
