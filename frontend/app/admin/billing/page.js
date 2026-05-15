"use client";

import { motion } from "framer-motion";
import { 
  TrendingUp, 
  Download, 
  MoreVertical, 
  Search, 
  Filter, 
  Receipt,
  AlertCircle,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  Wallet,
  Building,
  CreditCard
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

export default function AdminBillingPage() {
  const transactions = [
    { id: "#INV-8042", customer: "Acme Corp", date: "Oct 28, 2023", amount: "$499.00", plan: "Enterprise", status: "Paid" },
    { id: "#INV-8041", customer: "Nexus Studios", date: "Oct 28, 2023", amount: "$99.00", plan: "Pro Creator", status: "Pending" },
    { id: "#INV-8040", customer: "Sarah Jenkins", date: "Oct 27, 2023", amount: "$29.00", plan: "Pro Plus", status: "Paid" },
    { id: "#INV-8039", customer: "Omni Media LLC", date: "Oct 25, 2023", amount: "$499.00", plan: "Enterprise", status: "Failed" },
    { id: "#INV-8038", customer: "Marcus Chen", date: "Oct 25, 2023", amount: "$99.00", plan: "Pro Creator", status: "Paid" },
  ];

  return (
    <div className="flex-1 flex flex-col h-full overflow-hidden">
      {/* Header */}
      <header className="hidden lg:flex h-20 border-b border-white/5 bg-background/80 backdrop-blur-md sticky top-0 z-30 items-center justify-between px-10 shrink-0">
        <div className="flex flex-col">
          <h2 className="text-2xl font-bold text-white tracking-tight">Billing & Financials</h2>
          <p className="text-xs font-bold text-on-surface-variant uppercase tracking-widest mt-1">Manage Revenue and Gateways</p>
        </div>
        <Button variant="outline" className="h-11 rounded-full border-white/10 hover:bg-white/5 font-bold">
          <Download className="mr-2 size-4" />
          Export CSV
        </Button>
      </header>

      <div className="flex-1 overflow-y-auto overflow-x-hidden p-4 sm:p-6 lg:p-10 max-w-container-max mx-auto w-full flex flex-col gap-10 pb-20">
        {/* Metrics Grid */}
        <section className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* MRR Card */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="lg:col-span-2 glass-panel p-8 rounded-[2rem] border-white/5 flex flex-col gap-6 relative overflow-hidden group"
          >
            <div className="flex justify-between items-start">
               <div className="flex flex-col gap-2">
                 <span className="text-xs font-bold text-on-surface-variant uppercase tracking-widest">Monthly Recurring Revenue</span>
                 <div className="flex items-baseline gap-4">
                    <h2 className="text-5xl font-bold text-white">$124,500</h2>
                    <span className="flex items-center text-xs font-bold text-green-400 bg-green-500/10 px-3 py-1 rounded-full border border-green-500/20">
                      <TrendingUp className="size-3 mr-1" />
                      +14.2%
                    </span>
                 </div>
               </div>
               <Button variant="ghost" size="icon" className="rounded-full hover:bg-white/5">
                 <MoreVertical className="size-5 text-on-surface-variant" />
               </Button>
            </div>
            
            {/* Chart Simulation */}
            <div className="mt-auto h-32 w-full relative opacity-50 group-hover:opacity-100 transition-opacity duration-700">
               <svg className="w-full h-full" viewBox="0 0 1000 100" preserveAspectRatio="none">
                 <defs>
                   <linearGradient id="lineGradient" x1="0" y1="0" x2="0" y2="1">
                     <stop offset="0%" stopColor="#3b82f6" stopOpacity="0.4" />
                     <stop offset="100%" stopColor="#3b82f6" stopOpacity="0" />
                   </linearGradient>
                 </defs>
                 <path d="M0,80 Q100,70 200,90 T400,60 T600,40 T800,20 T1000,0 L1000,100 L0,100 Z" fill="url(#lineGradient)" />
                 <path d="M0,80 Q100,70 200,90 T400,60 T600,40 T800,20 T1000,0" stroke="#3b82f6" strokeWidth="3" fill="none" />
               </svg>
               <div className="flex justify-between text-[10px] font-bold text-on-surface-variant uppercase tracking-widest mt-4">
                 <span>Jan</span><span>Feb</span><span>Mar</span><span>Apr</span><span>May</span><span>Jun</span>
               </div>
            </div>
          </motion.div>

          {/* Subscription Split */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="glass-panel p-8 rounded-[2rem] border-white/5 flex flex-col gap-6"
          >
            <span className="text-xs font-bold text-on-surface-variant uppercase tracking-widest">Subscription Split</span>
            <h2 className="text-3xl font-bold text-white">4,281 <span className="text-sm font-medium text-on-surface-variant">Active</span></h2>
            
            <div className="flex flex-col gap-8 mt-4">
               {[
                 { label: "Pro", percent: 65, count: 2782, color: "bg-blue-500" },
                 { label: "Free", percent: 25, count: 1070, color: "bg-purple-500" },
                 { label: "Enterprise", percent: 10, count: 429, color: "bg-orange-500" }
               ].map((tier) => (
                 <div key={tier.label} className="flex flex-col gap-2">
                    <div className="flex justify-between text-xs font-bold">
                       <span className="text-white flex items-center gap-2">
                         <span className={cn("size-2 rounded-full", tier.color)} />
                         {tier.label}
                       </span>
                       <span className="text-on-surface-variant">{tier.percent}% ({tier.count})</span>
                    </div>
                    <div className="h-1.5 w-full bg-white/5 rounded-full overflow-hidden">
                       <div className={cn("h-full rounded-full", tier.color)} style={{ width: `${tier.percent}%` }} />
                    </div>
                 </div>
               ))}
            </div>
          </motion.div>
        </section>

        {/* Payouts & Gateways */}
        <section className="grid grid-cols-1 lg:grid-cols-2 gap-8">
           {/* Payout Detail */}
           <div className="glass-panel p-8 rounded-[2rem] border-white/5 flex flex-col gap-8">
              <div className="flex justify-between items-center border-b border-white/5 pb-4">
                 <h3 className="text-xs font-bold text-on-surface-variant uppercase tracking-widest">Payout Details</h3>
                 <Button variant="link" className="text-primary font-bold">Edit</Button>
              </div>
              <div className="flex flex-col gap-8 flex-1 justify-between">
                 <div>
                    <p className="text-sm font-bold text-on-surface-variant uppercase tracking-widest">Available for Payout</p>
                    <h3 className="text-4xl font-bold text-white mt-2">$42,150.00</h3>
                 </div>
                 <div className="flex items-center gap-4 p-5 rounded-2xl bg-white/5 border border-white/5">
                    <Building className="size-6 text-on-surface-variant" />
                    <div className="flex flex-col">
                       <span className="text-sm font-bold text-white">Silicon Valley Bank</span>
                       <span className="text-xs font-mono text-on-surface-variant tracking-widest mt-1">•••• •••• •••• 4201</span>
                    </div>
                 </div>
                 <div className="flex items-center justify-between">
                    <p className="text-xs font-bold text-on-surface-variant flex items-center gap-2">
                       <CheckCircle2 className="size-3.5 text-primary" />
                       Next auto-payout: Nov 1st
                    </p>
                    <Button className="bg-primary hover:bg-primary/90 text-on-primary rounded-full px-8 font-bold">
                       Withdraw Now
                    </Button>
                 </div>
              </div>
           </div>

           {/* Gateways */}
           <div className="glass-panel p-8 rounded-[2rem] border-white/5 flex flex-col gap-8">
              <div className="flex justify-between items-center border-b border-white/5 pb-4">
                 <h3 className="text-xs font-bold text-on-surface-variant uppercase tracking-widest">Payment Gateways</h3>
                 <Button variant="link" className="text-primary font-bold">Manage</Button>
              </div>
              <div className="flex flex-col gap-4">
                 <div className="flex items-center justify-between p-5 rounded-2xl bg-white/5 border border-white/5 group hover:bg-white/[0.08] transition-all">
                    <div className="flex items-center gap-4">
                       <div className="size-12 rounded-xl bg-white flex items-center justify-center p-2 text-black font-black text-xl italic">S</div>
                       <div className="flex flex-col">
                          <span className="text-sm font-bold text-white">Stripe</span>
                          <span className="text-xs font-medium text-on-surface-variant">Primary Processor</span>
                       </div>
                    </div>
                    <span className="px-3 py-1 rounded-full bg-green-500/10 text-green-400 text-[10px] font-bold uppercase tracking-widest border border-green-500/20">Active</span>
                 </div>
                 <div className="flex items-center justify-between p-5 rounded-2xl bg-white/5 border border-white/5 opacity-40 grayscale group hover:bg-white/[0.08] transition-all">
                    <div className="flex items-center gap-4">
                       <div className="size-12 rounded-xl bg-[#003087] flex items-center justify-center p-2 text-white font-black text-xl italic">P</div>
                       <div className="flex flex-col">
                          <span className="text-sm font-bold text-white">PayPal</span>
                          <span className="text-xs font-medium text-on-surface-variant">Legacy Processor</span>
                       </div>
                    </div>
                    <span className="px-3 py-1 rounded-full bg-white/10 text-on-surface-variant text-[10px] font-bold uppercase tracking-widest border border-white/20">Inactive</span>
                 </div>
              </div>
           </div>
        </section>

        {/* Transactions Table */}
        <section className="glass-panel rounded-[2rem] border-white/5 overflow-hidden shadow-2xl">
           <div className="p-8 border-b border-white/5 bg-white/5 flex flex-col md:flex-row justify-between items-center gap-6">
              <h3 className="text-xl font-bold text-white">Recent Transactions</h3>
              <div className="flex gap-4">
                 <div className="relative">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 size-4 text-on-surface-variant" />
                    <input className="h-10 pl-10 pr-4 bg-white/5 border border-white/10 rounded-full text-sm outline-none focus:border-primary transition-all w-64" placeholder="Search invoices..." />
                 </div>
                 <Button variant="outline" size="icon" className="rounded-full border-white/10 hover:bg-white/5">
                    <Filter className="size-4" />
                 </Button>
              </div>
           </div>
           
           <div className="overflow-x-auto">
              <table className="w-full text-left">
                 <thead>
                    <tr className="border-b border-white/5 bg-white/[0.02]">
                       <th className="p-6 text-xs font-bold uppercase tracking-widest text-on-surface-variant">Invoice</th>
                       <th className="p-6 text-xs font-bold uppercase tracking-widest text-on-surface-variant">Customer</th>
                       <th className="p-6 text-xs font-bold uppercase tracking-widest text-on-surface-variant">Date</th>
                       <th className="p-6 text-xs font-bold uppercase tracking-widest text-on-surface-variant">Amount</th>
                       <th className="p-6 text-xs font-bold uppercase tracking-widest text-on-surface-variant">Plan</th>
                       <th className="p-6 text-xs font-bold uppercase tracking-widest text-on-surface-variant">Status</th>
                       <th className="p-6"></th>
                    </tr>
                 </thead>
                 <tbody className="divide-y divide-white/5">
                    {transactions.map((t) => (
                      <tr key={t.id} className="hover:bg-white/5 transition-all group">
                         <td className="p-6 font-mono text-xs text-white">{t.id}</td>
                         <td className="p-6">
                            <div className="flex items-center gap-3">
                               <div className="size-8 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold text-[10px]">{t.customer.charAt(0)}</div>
                               <span className="text-sm font-bold text-white">{t.customer}</span>
                            </div>
                         </td>
                         <td className="p-6 text-sm font-medium text-on-surface-variant">{t.date}</td>
                         <td className="p-6 text-sm font-bold text-white">{t.amount}</td>
                         <td className="p-6 text-sm font-medium text-on-surface-variant">{t.plan}</td>
                         <td className="p-6">
                            <span className={cn(
                              "inline-flex items-center gap-2 px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest border",
                              t.status === "Paid" ? "bg-green-500/10 text-green-400 border-green-500/20" :
                              t.status === "Pending" ? "bg-orange-500/10 text-orange-400 border-orange-500/20" :
                              "bg-red-500/10 text-red-400 border-red-500/20"
                            )}>
                               <span className={cn("size-1.5 rounded-full", 
                                  t.status === "Paid" ? "bg-green-400" :
                                  t.status === "Pending" ? "bg-orange-400 animate-pulse" : "bg-red-400"
                               )} />
                               {t.status}
                            </span>
                         </td>
                         <td className="p-6 text-right">
                            <Button variant="ghost" size="icon" className="size-10 rounded-full opacity-0 group-hover:opacity-100 transition-opacity">
                               <Receipt className="size-4" />
                            </Button>
                         </td>
                      </tr>
                    ))}
                 </tbody>
              </table>
           </div>

           <div className="p-6 bg-white/[0.02] border-t border-white/5 flex items-center justify-between">
              <span className="text-xs font-bold text-on-surface-variant">Showing 1-5 of 124 entries</span>
              <div className="flex gap-2">
                 <Button variant="outline" size="icon" className="size-8 rounded-full border-white/10" disabled>
                    <ChevronLeft className="size-4" />
                 </Button>
                 <Button className="size-8 rounded-full bg-primary text-on-primary font-bold text-xs">1</Button>
                 <Button variant="ghost" className="size-8 rounded-full text-on-surface-variant font-bold text-xs">2</Button>
                 <Button variant="outline" size="icon" className="size-8 rounded-full border-white/10">
                    <ChevronRight className="size-4" />
                 </Button>
              </div>
           </div>
        </section>
      </div>
    </div>
  );
}
