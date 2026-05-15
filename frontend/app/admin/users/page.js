"use client";

import { motion } from "framer-motion";
import { 
  Search, 
  Filter, 
  Download, 
  MoreVertical, 
  Trash2, 
  ArrowRightLeft,
  ChevronLeft,
  ChevronRight,
  Database
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

export default function AdminUsersPage() {
  const users = [
    { name: "Elena Rostova", email: "elena.r@synapse.io", plan: "Enterprise", usage: "85%", status: "Active", joined: "Oct 24, 2023", initials: "ER" },
    { name: "Marcus Kim", email: "m.kim@indiedev.net", plan: "Pro", usage: "24%", status: "Active", joined: "Nov 02, 2023", initials: "MK" },
    { name: "John Doe", email: "j.doe@example.com", plan: "Free", usage: "100%", status: "Suspended", joined: "Dec 15, 2023", initials: "JD" },
    { name: "Sarah Lopez", email: "sarah.creative@studio.art", plan: "Pro", usage: "90%", status: "Active", joined: "Jan 05, 2024", initials: "SL" },
  ];

  return (
    <div className="flex-1 flex flex-col h-full overflow-hidden">
      {/* Header */}
      <header className="hidden lg:flex h-20 border-b border-white/5 bg-background/80 backdrop-blur-md sticky top-0 z-30 items-center justify-between px-10 shrink-0">
        <div className="flex items-center gap-4">
           <Database className="size-6 text-primary" />
           <h2 className="text-2xl font-bold text-white tracking-tight">User Management</h2>
        </div>
      </header>

      <div className="flex-1 overflow-y-auto overflow-x-hidden p-4 sm:p-6 lg:p-10 max-w-container-max mx-auto w-full flex flex-col gap-10">
        {/* Tools */}
        <div className="flex flex-col gap-8">
          <div className="flex flex-wrap items-center gap-4 justify-between">
            <div className="relative flex-1 max-w-md group">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 size-5 text-on-surface-variant group-focus-within:text-primary transition-colors" />
              <input 
                className="w-full h-14 pl-12 pr-4 bg-white/5 border border-white/10 rounded-2xl focus:outline-none focus:border-primary transition-all text-on-surface placeholder:text-on-surface-variant/50" 
                placeholder="Search users by name or email..."
              />
            </div>
            <div className="flex gap-4">
               <Button variant="outline" className="h-14 px-8 rounded-2xl border-white/10 hover:bg-white/5 font-bold">
                 All Plans
               </Button>
               <Button variant="outline" className="h-14 px-8 rounded-2xl border-white/10 hover:bg-white/5 font-bold">
                 <Filter className="mr-2 size-4" />
                 Status
               </Button>
            </div>
          </div>

          <div className="flex gap-4 flex-wrap pb-2 border-b border-white/5">
             <Button variant="ghost" className="h-12 rounded-full text-on-surface-variant hover:text-white hover:bg-white/5 font-bold">
               <Download className="mr-2 size-4" />
               Export CSV
             </Button>
             <Button variant="ghost" className="h-12 rounded-full text-on-surface-variant hover:text-white hover:bg-white/5 font-bold">
               <ArrowRightLeft className="mr-2 size-4" />
               Change Plan
             </Button>
             <Button variant="ghost" className="h-12 rounded-full text-red-400 hover:text-red-300 hover:bg-red-500/10 font-bold ml-auto">
               <Trash2 className="mr-2 size-4" />
               Delete Users
             </Button>
          </div>
        </div>

        {/* Data Table */}
        <div className="glass-panel rounded-[2rem] overflow-hidden border-white/5 shadow-2xl">
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="border-b border-white/5 bg-white/5">
                  <th className="p-6 w-12 text-center">
                    <input type="checkbox" className="rounded border-white/10 bg-transparent text-primary focus:ring-primary h-4 w-4" />
                  </th>
                  <th className="p-6 text-xs font-bold uppercase tracking-widest text-on-surface-variant">User</th>
                  <th className="p-6 text-xs font-bold uppercase tracking-widest text-on-surface-variant">Plan</th>
                  <th className="p-6 text-xs font-bold uppercase tracking-widest text-on-surface-variant min-w-[200px]">Monthly Usage</th>
                  <th className="p-6 text-xs font-bold uppercase tracking-widest text-on-surface-variant">Status</th>
                  <th className="p-6 text-xs font-bold uppercase tracking-widest text-on-surface-variant">Join Date</th>
                  <th className="p-6 w-12"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {users.map((user, i) => (
                  <motion.tr 
                    key={user.email}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.05 }}
                    className="hover:bg-white/5 transition-all group"
                  >
                    <td className="p-6 text-center">
                      <input type="checkbox" className="rounded border-white/10 bg-transparent text-primary focus:ring-primary h-4 w-4" />
                    </td>
                    <td className="p-6">
                      <div className="flex items-center gap-4">
                        <div className="size-10 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold border border-primary/20 shrink-0">
                          {user.initials}
                        </div>
                        <div className="flex flex-col">
                          <span className="text-base font-bold text-white">{user.name}</span>
                          <span className="text-sm text-on-surface-variant">{user.email}</span>
                        </div>
                      </div>
                    </td>
                    <td className="p-6">
                      <span className={cn(
                        "inline-flex items-center px-3 py-1 rounded-lg text-[10px] font-bold uppercase tracking-widest border",
                        user.plan === "Enterprise" ? "bg-purple-500/10 text-purple-400 border-purple-500/20" :
                        user.plan === "Pro" ? "bg-blue-500/10 text-blue-400 border-blue-500/20" :
                        "bg-white/5 text-on-surface-variant border-white/10"
                      )}>
                        {user.plan}
                      </span>
                    </td>
                    <td className="p-6">
                      <div className="flex flex-col gap-2">
                        <div className="flex justify-between text-[10px] font-bold uppercase tracking-widest text-on-surface-variant">
                          <span>Usage</span>
                          <span className={cn(user.usage === "100%" ? "text-red-400" : "text-primary")}>{user.usage}</span>
                        </div>
                        <div className="w-full h-1.5 bg-white/5 rounded-full overflow-hidden">
                          <div className={cn("h-full rounded-full transition-all duration-1000", user.usage === "100%" ? "bg-red-400" : "bg-primary")} style={{ width: user.usage }} />
                        </div>
                      </div>
                    </td>
                    <td className="p-6">
                       <span className={cn(
                        "inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest border",
                        user.status === "Active" ? "bg-green-500/10 text-green-400 border-green-500/20" : "bg-red-500/10 text-red-400 border-red-500/20"
                      )}>
                        <span className={cn("size-1.5 rounded-full", user.status === "Active" ? "bg-green-400" : "bg-red-400")}></span>
                        {user.status}
                      </span>
                    </td>
                    <td className="p-6 text-sm font-medium text-on-surface-variant">{user.joined}</td>
                    <td className="p-6 text-right">
                       <Button variant="ghost" size="icon" className="size-10 opacity-0 group-hover:opacity-100 transition-opacity rounded-full">
                          <MoreVertical className="size-5" />
                       </Button>
                    </td>
                  </motion.tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="px-8 py-6 bg-white/5 border-t border-white/5 flex items-center justify-between">
             <span className="text-sm font-bold text-on-surface-variant">
               Showing <span className="text-white">1</span> to <span className="text-white">4</span> of <span className="text-white">97</span> results
             </span>
             <div className="flex gap-2">
                <Button variant="outline" size="icon" className="rounded-full border-white/10 hover:bg-white/5" disabled>
                   <ChevronLeft className="size-4" />
                </Button>
                <Button className="size-10 rounded-full bg-primary text-on-primary font-bold">1</Button>
                <Button variant="ghost" className="size-10 rounded-full text-on-surface-variant hover:text-white hover:bg-white/5 font-bold">2</Button>
                <Button variant="outline" size="icon" className="rounded-full border-white/10 hover:bg-white/5">
                   <ChevronRight className="size-4" />
                </Button>
             </div>
          </div>
        </div>
      </div>
    </div>
  );
}
