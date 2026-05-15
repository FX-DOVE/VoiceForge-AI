"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { CreditCard, Download, ExternalLink, CheckCircle2 } from "lucide-react";


const rows = [
  { id: "INV-2048", date: "May 2, 2026", amount: "$49.99", status: "Paid" },
  { id: "INV-1981", date: "Apr 2, 2026", amount: "$49.99", status: "Paid" },
  { id: "INV-1922", date: "Mar 2, 2026", amount: "$49.99", status: "Paid" },
];

export default function BillingPage() {
  return (
    <div className="flex flex-1 flex-col bg-background">
      <main className="flex-1 container-custom py-8 lg:py-12 space-y-10">

        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
           <div>
             <h1 className="text-3xl font-bold tracking-tight">Billing & Subscription</h1>
             <p className="text-neutral-400 mt-1">Manage your plan, payment methods, and invoices.</p>
           </div>
           <Button className="bg-blue-600 hover:bg-blue-700 text-white rounded-full px-6 h-11" asChild>
             <Link href="/checkout">Upgrade to Pro</Link>
           </Button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
           {/* Active Plan */}
           <div className="lg:col-span-2 space-y-6">
              <div className="glass-panel p-8 border-blue-500/20 bg-blue-500/[0.02]">
                 <div className="flex justify-between items-start">
                    <div className="space-y-1">
                       <p className="text-xs font-bold uppercase tracking-widest text-blue-500">Current Plan</p>
                       <h2 className="text-2xl font-bold">Pro Monthly</h2>
                    </div>
                    <div className="flex items-center gap-2 text-green-500 text-sm font-bold bg-green-500/10 px-3 py-1 rounded-full">
                       <CheckCircle2 className="size-4" />
                       Active
                    </div>
                 </div>
                 
                 <p className="mt-4 text-neutral-400">Your next renewal is on <span className="text-white font-medium">June 2, 2026</span> for <span className="text-white font-medium">$49.99</span>.</p>
                 
                 <div className="mt-8 flex flex-wrap gap-4">
                    <Button variant="outline" className="rounded-full border-white/10 hover:bg-white/5">Change Plan</Button>
                    <Button variant="ghost" className="text-neutral-500 hover:text-red-500">Cancel Subscription</Button>
                 </div>
              </div>

              <div className="glass-panel border-white/10 overflow-hidden">
                <div className="px-6 py-4 border-b border-white/5 bg-white/[0.02]">
                   <h3 className="font-bold">Payment History</h3>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full text-left">
                    <thead>
                      <tr className="text-[10px] font-bold uppercase tracking-widest text-neutral-500 border-b border-white/5">
                        <th className="px-6 py-4">Invoice ID</th>
                        <th className="px-6 py-4">Date</th>
                        <th className="px-6 py-4">Amount</th>
                        <th className="px-6 py-4">Status</th>
                        <th className="px-6 py-4 text-right">Receipt</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-white/5">
                      {rows.map((r, i) => (
                        <tr key={r.id} className="text-sm hover:bg-white/[0.01] transition-colors">
                          <td className="px-6 py-4 font-mono text-neutral-300">{r.id}</td>
                          <td className="px-6 py-4 text-neutral-400">{r.date}</td>
                          <td className="px-6 py-4 font-medium">{r.amount}</td>
                          <td className="px-6 py-4">
                             <span className="text-[10px] font-bold uppercase tracking-wider text-green-500 bg-green-500/10 px-2 py-0.5 rounded">Paid</span>
                          </td>
                          <td className="px-6 py-4 text-right">
                             <Button variant="ghost" size="icon" className="size-8 rounded-full hover:bg-white/5">
                                <Download className="size-4 text-neutral-500" />
                             </Button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
           </div>

           {/* Sidebar: Payment Method */}
           <div className="space-y-6">
              <div className="glass-panel p-6 border-white/10">
                 <h3 className="font-bold mb-4">Payment Method</h3>
                 <div className="flex items-center gap-4 p-4 rounded-xl bg-white/5 border border-white/5">
                    <div className="size-10 rounded-lg bg-white/10 flex items-center justify-center">
                       <CreditCard className="size-6 text-neutral-300" />
                    </div>
                    <div>
                       <p className="text-sm font-bold">•••• 4242</p>
                       <p className="text-xs text-neutral-500">Expires 12/28</p>
                    </div>
                 </div>
                 <Button variant="outline" className="w-full mt-6 rounded-full border-white/10 hover:bg-white/5">
                    Update Method
                    <ExternalLink className="ml-2 size-3" />
                 </Button>
              </div>

              <div className="p-6 rounded-2xl bg-blue-600/5 border border-blue-600/10">
                 <h4 className="text-sm font-bold text-blue-500">Need help?</h4>
                 <p className="text-xs text-neutral-500 mt-2 leading-relaxed">
                   If you have questions about your billing, please contact our support team.
                 </p>
                 <Button variant="link" className="text-xs p-0 h-auto mt-3 text-blue-500 hover:text-blue-400">Contact Support</Button>
              </div>
           </div>
        </div>
      </main>
    </div>
  );
}

