"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { adminApi } from "@/lib/api";
import {
  TrendingUp, Download, Search, Receipt, CheckCircle2,
  CreditCard, RefreshCw, Loader2, Users, DollarSign,
} from "lucide-react";
import { cn } from "@/lib/utils";

const SPLIT_COLORS = { blue: "bg-blue-500", purple: "bg-purple-500", orange: "bg-orange-500" };

export default function AdminBillingPage() {
  const [billing, setBilling] = useState(null);
  const [loading, setLoading] = useState(true);
  const [txSearch, setTxSearch] = useState("");

  const load = () => {
    setLoading(true);
    adminApi.billing().catch(() => null).then((d) => { setBilling(d); setLoading(false); });
  };

  useEffect(() => { load(); }, []);

  const transactions = (billing?.transactions || []).filter((t) =>
    !txSearch || t.customer.toLowerCase().includes(txSearch.toLowerCase()) || t.id.toLowerCase().includes(txSearch.toLowerCase())
  );

  const mrr = billing?.mrr ?? 0;
  const activeSubs = billing?.activeSubscriptions ?? 0;
  const totalUsers = billing?.totalUsers ?? 0;
  const split = billing?.subscriptionSplit || [];
  const stripeOk = billing?.stripeConfigured ?? false;

  return (
    <div className="h-full flex flex-col">
      <header className="hidden lg:flex h-16 border-b border-white/[0.06] bg-background/80 backdrop-blur-md sticky top-0 z-30 items-center justify-between px-8 shrink-0">
        <div>
          <h2 className="text-lg font-bold text-white">Billing & Financials</h2>
          <p className="text-[11px] text-neutral-500 uppercase tracking-widest mt-0.5">Manage Revenue and Gateways</p>
        </div>
        <div className="flex items-center gap-3">
          <button onClick={load} className="size-9 rounded-full hover:bg-white/5 flex items-center justify-center text-neutral-400 hover:text-white transition-colors">
            <RefreshCw className={cn("size-4", loading && "animate-spin")} />
          </button>
          <button className="flex items-center gap-2 h-9 px-4 rounded-full border border-white/[0.08] text-xs text-neutral-400 hover:text-white hover:bg-white/5 transition-all">
            <Download className="size-3.5" />Export CSV
          </button>
        </div>
      </header>

      {loading && !billing ? (
        <div className="flex-1 flex items-center justify-center">
          <Loader2 className="size-8 text-primary animate-spin" />
        </div>
      ) : (
        <div className="flex-1 overflow-y-auto overflow-x-hidden p-6 lg:p-8 flex flex-col gap-6 pb-24">

          {/* Top metrics */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
            {/* MRR card */}
            <motion.div
              initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}
              className="lg:col-span-2 bg-white/[0.03] border border-white/[0.06] rounded-2xl p-7 flex flex-col gap-5 overflow-hidden relative group"
            >
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-[11px] font-semibold text-neutral-500 uppercase tracking-widest mb-2">Monthly Recurring Revenue</p>
                  <div className="flex items-baseline gap-3">
                    <h2 className="text-5xl font-bold text-white">${mrr.toLocaleString()}</h2>
                    <span className="flex items-center gap-1 text-[11px] font-bold text-emerald-400 bg-emerald-500/10 px-2.5 py-1 rounded-full border border-emerald-500/20">
                      <TrendingUp className="size-3" />Live
                    </span>
                  </div>
                  <p className="text-xs text-neutral-500 mt-2">{activeSubs} paid subscribers · {totalUsers} total users</p>
                </div>
                <div className="size-12 rounded-2xl bg-emerald-500/10 flex items-center justify-center">
                  <DollarSign className="size-6 text-emerald-400" />
                </div>
              </div>
              <div className="mt-2 h-24 w-full relative opacity-40 group-hover:opacity-80 transition-opacity duration-700">
                <svg className="w-full h-full" viewBox="0 0 1000 100" preserveAspectRatio="none">
                  <defs>
                    <linearGradient id="mrrGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#10b981" stopOpacity="0.3" />
                      <stop offset="100%" stopColor="#10b981" stopOpacity="0" />
                    </linearGradient>
                  </defs>
                  <path d="M0,80 Q150,65 250,85 T500,55 T700,35 T1000,5 L1000,100 L0,100 Z" fill="url(#mrrGrad)" />
                  <path d="M0,80 Q150,65 250,85 T500,55 T700,35 T1000,5" stroke="#10b981" strokeWidth="2.5" fill="none" />
                </svg>
                <div className="flex justify-between text-[10px] font-semibold text-neutral-600 uppercase tracking-widest mt-2">
                  <span>Jan</span><span>Feb</span><span>Mar</span><span>Apr</span><span>May</span><span>Jun</span>
                </div>
              </div>
            </motion.div>

            {/* Subscription Split */}
            <motion.div
              initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.08 }}
              className="bg-white/[0.03] border border-white/[0.06] rounded-2xl p-7 flex flex-col gap-5"
            >
              <div className="flex items-center justify-between">
                <p className="text-[11px] font-semibold text-neutral-500 uppercase tracking-widest">Subscription Split</p>
                <Users className="size-4 text-neutral-600" />
              </div>
              <div>
                <p className="text-4xl font-bold text-white">{totalUsers.toLocaleString()}</p>
                <p className="text-xs text-neutral-500 mt-1">total registered users</p>
              </div>
              <div className="flex flex-col gap-4 mt-2">
                {split.map((tier) => (
                  <div key={tier.label} className="flex flex-col gap-1.5">
                    <div className="flex justify-between text-xs font-semibold">
                      <span className="text-white flex items-center gap-2">
                        <span className={cn("size-2 rounded-full", SPLIT_COLORS[tier.color] || "bg-white/20")} />
                        {tier.label}
                      </span>
                      <span className="text-neutral-500">{tier.percent}% ({tier.count})</span>
                    </div>
                    <div className="h-1 w-full bg-white/5 rounded-full overflow-hidden">
                      <div className={cn("h-full rounded-full transition-all duration-700", SPLIT_COLORS[tier.color] || "bg-white/20")} style={{ width: `${tier.percent}%` }} />
                    </div>
                  </div>
                ))}
                {split.length === 0 && <p className="text-xs text-neutral-600">No subscription data yet.</p>}
              </div>
            </motion.div>
          </div>

          {/* Gateways */}
          <motion.div
            initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.12 }}
            className="bg-white/[0.03] border border-white/[0.06] rounded-2xl p-6"
          >
            <div className="flex items-center justify-between mb-5">
              <p className="text-[11px] font-semibold text-neutral-500 uppercase tracking-widest">Payment Gateways</p>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className={cn("flex items-center gap-4 p-4 rounded-xl border transition-all", stripeOk ? "bg-emerald-500/5 border-emerald-500/20" : "bg-white/[0.02] border-white/[0.06]")}>
                <div className="size-10 rounded-xl bg-white flex items-center justify-center text-black font-black text-lg italic shrink-0">S</div>
                <div className="flex-1">
                  <p className="text-sm font-semibold text-white">Stripe</p>
                  <p className="text-xs text-neutral-500">Primary Processor</p>
                </div>
                <span className={cn("text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-full border", stripeOk ? "text-emerald-400 bg-emerald-500/10 border-emerald-500/20" : "text-neutral-500 bg-white/5 border-white/10")}>
                  {stripeOk ? "Configured" : "Not Set"}
                </span>
              </div>
              <div className="flex items-center gap-4 p-4 rounded-xl border border-white/[0.06] bg-white/[0.02] opacity-50">
                <div className="size-10 rounded-xl bg-[#003087] flex items-center justify-center text-white font-black text-lg italic shrink-0">P</div>
                <div className="flex-1">
                  <p className="text-sm font-semibold text-white">PayPal</p>
                  <p className="text-xs text-neutral-500">Legacy Processor</p>
                </div>
                <span className="text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-full border text-neutral-500 bg-white/5 border-white/10">Inactive</span>
              </div>
            </div>
          </motion.div>

          {/* Transactions */}
          <motion.section
            initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.16 }}
            className="bg-white/[0.03] border border-white/[0.06] rounded-2xl overflow-hidden"
          >
            <div className="px-6 py-4 border-b border-white/[0.06] flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
              <div className="flex items-center gap-3">
                <CreditCard className="size-4 text-primary" />
                <h3 className="text-sm font-bold text-white">Recent Usage Transactions</h3>
                <span className="text-xs text-neutral-500">{billing?.transactions?.length ?? 0} records</span>
              </div>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-3.5 text-neutral-500" />
                <input
                  className="h-9 pl-9 pr-4 bg-white/[0.04] border border-white/[0.08] rounded-xl text-xs text-white placeholder:text-neutral-600 outline-none focus:border-primary transition-all w-52"
                  placeholder="Search customer…"
                  value={txSearch}
                  onChange={(e) => setTxSearch(e.target.value)}
                />
              </div>
            </div>

            {transactions.length === 0 ? (
              <div className="py-16 text-center">
                <Receipt className="size-8 text-neutral-700 mx-auto mb-3" />
                <p className="text-neutral-400 text-sm font-medium">No transactions yet.</p>
                <p className="text-neutral-600 text-xs mt-1">Usage records from Pro users will appear here.</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left">
                  <thead>
                    <tr className="border-b border-white/[0.06] bg-white/[0.02]">
                      <th className="px-6 py-3 text-[11px] font-semibold uppercase tracking-widest text-neutral-500">ID</th>
                      <th className="px-6 py-3 text-[11px] font-semibold uppercase tracking-widest text-neutral-500">Customer</th>
                      <th className="px-6 py-3 text-[11px] font-semibold uppercase tracking-widest text-neutral-500">Date</th>
                      <th className="px-6 py-3 text-[11px] font-semibold uppercase tracking-widest text-neutral-500">Characters</th>
                      <th className="px-6 py-3 text-[11px] font-semibold uppercase tracking-widest text-neutral-500">Plan</th>
                      <th className="px-6 py-3 text-[11px] font-semibold uppercase tracking-widest text-neutral-500">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/[0.04]">
                    {transactions.map((t) => (
                      <tr key={t.id} className="hover:bg-white/[0.03] transition-all group">
                        <td className="px-6 py-4 font-mono text-xs text-neutral-500">{t.id}</td>
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-3">
                            <div className="size-7 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold text-[10px] shrink-0">
                              {t.customer.charAt(0).toUpperCase()}
                            </div>
                            <div>
                              <p className="text-sm font-semibold text-white">{t.customer}</p>
                              <p className="text-[11px] text-neutral-500">{t.email}</p>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 text-xs text-neutral-500">{t.date}</td>
                        <td className="px-6 py-4 text-xs font-semibold text-white">{(t.characters || 0).toLocaleString()} chars</td>
                        <td className="px-6 py-4">
                          <span className={cn(
                            "px-2.5 py-1 rounded-lg text-[10px] font-bold uppercase tracking-wider border",
                            t.plan === "Enterprise" ? "bg-violet-500/10 text-violet-400 border-violet-500/20" :
                            t.plan === "Pro" ? "bg-blue-500/10 text-blue-400 border-blue-500/20" :
                            "bg-white/5 text-neutral-400 border-white/10"
                          )}>{t.plan}</span>
                        </td>
                        <td className="px-6 py-4">
                          <span className={cn(
                            "inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider border",
                            t.status === "Paid" ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20" :
                            t.status === "Free" ? "bg-white/5 text-neutral-400 border-white/10" :
                            "bg-orange-500/10 text-orange-400 border-orange-500/20"
                          )}>
                            <span className={cn("size-1.5 rounded-full",
                              t.status === "Paid" ? "bg-emerald-400" : t.status === "Free" ? "bg-neutral-500" : "bg-orange-400"
                            )} />
                            {t.status}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </motion.section>
        </div>
      )}
    </div>
  );
}
