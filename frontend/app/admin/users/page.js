"use client";

import { useEffect, useState, useCallback } from "react";
import { motion } from "framer-motion";
import { adminApi } from "@/lib/api";
import {
  Search, Download, MoreVertical, ChevronLeft, ChevronRight,
  Users, Loader2, RefreshCw, X, Check,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

function initials(name, email) {
  const src = name || email || "?";
  const parts = src.trim().split(/\s+/);
  if (parts.length >= 2) return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
  return src.slice(0, 2).toUpperCase();
}

const PLAN_COLORS = {
  Enterprise: "bg-violet-500/10 text-violet-400 border-violet-500/20",
  Pro: "bg-blue-500/10 text-blue-400 border-blue-500/20",
  Free: "bg-white/5 text-neutral-400 border-white/10",
};

export default function AdminUsersPage() {
  const [search, setSearch] = useState("");
  const [planFilter, setPlanFilter] = useState("");
  const [users, setUsers] = useState([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [menuOpen, setMenuOpen] = useState(null);
  const [notice, setNotice] = useState(null);

  function showNotice(msg, type = "success") {
    setNotice({ msg, type });
    setTimeout(() => setNotice(null), 3000);
  }
  const limit = 20;

  const load = useCallback(() => {
    setLoading(true);
    const params = { search, limit, page };
    if (planFilter) params.plan = planFilter.toLowerCase();
    adminApi.users(params)
      .then((data) => {
        setTotal(data.total || 0);
        setUsers(
          (data.items || []).map((u) => {
            const charLimit = u.usage?.charactersLimit || 10000;
            const charUsed = u.usage?.charactersUsed || 0;
            const pct = Math.min(100, Math.round((charUsed / charLimit) * 100));
            return {
              _id: u._id || u.id,
              name: u.name || "—",
              email: u.email,
              plan: u.plan ? u.plan.charAt(0).toUpperCase() + u.plan.slice(1) : "Free",
              rawPlan: u.plan || "free",
              usage: pct,
              status: u.status === "suspended" ? "Suspended" : "Active",
              joined: u.createdAt
                ? new Date(u.createdAt).toLocaleDateString(undefined, { month: "short", day: "numeric", year: "numeric" })
                : "—",
              initials: initials(u.name, u.email),
            };
          })
        );
      })
      .catch(() => setUsers([]))
      .finally(() => setLoading(false));
  }, [search, planFilter, page]);

  useEffect(() => { load(); }, [load]);

  async function changePlan(userId, plan) {
    try {
      await adminApi.updateUser(userId, { plan });
      showNotice(`Plan updated to ${plan}`);
      load();
    } catch { showNotice("Failed to update plan", "error"); }
    setMenuOpen(null);
  }

  const totalPages = Math.max(1, Math.ceil(total / limit));

  return (
    <div className="h-full flex flex-col" onClick={() => setMenuOpen(null)}>
      <header className="hidden lg:flex h-16 border-b border-white/[0.06] bg-background/80 backdrop-blur-md sticky top-0 z-30 items-center justify-between px-8 shrink-0">
        <div className="flex items-center gap-3">
          <Users className="size-5 text-primary" />
          <h2 className="text-lg font-bold text-white">User Management</h2>
          {!loading && <span className="text-xs text-neutral-500 font-medium">{total} total</span>}
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

      {notice && (
        <div className={cn(
          "mx-6 mt-4 px-4 py-3 rounded-xl text-sm font-medium flex items-center justify-between",
          notice.type === "error" ? "bg-red-500/10 text-red-400 border border-red-500/20" : "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20"
        )}>
          <span>{notice.msg}</span>
          <button onClick={() => setNotice(null)}><X className="size-4" /></button>
        </div>
      )}

      <div className="flex-1 overflow-y-auto overflow-x-hidden p-6 lg:p-8 flex flex-col gap-6 pb-24">
        {/* Filters */}
        <div className="flex flex-wrap gap-3 items-center">
          <div className="relative flex-1 min-w-[200px] max-w-sm">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-neutral-500" />
            <input
              className="w-full h-10 pl-10 pr-4 bg-white/[0.04] border border-white/[0.08] rounded-xl text-sm text-white placeholder:text-neutral-600 focus:outline-none focus:border-primary transition-all"
              placeholder="Search by name or email…"
              value={search}
              onChange={(e) => { setSearch(e.target.value); setPage(1); }}
            />
          </div>
          <div className="flex gap-2">
            {["", "free", "pro", "enterprise"].map((p) => (
              <button
                key={p}
                onClick={() => { setPlanFilter(p); setPage(1); }}
                className={cn(
                  "h-10 px-4 rounded-xl text-xs font-semibold border transition-all",
                  planFilter === p
                    ? "bg-primary text-white border-primary"
                    : "bg-white/[0.03] text-neutral-400 border-white/[0.08] hover:bg-white/[0.06] hover:text-white"
                )}
              >
                {p ? p.charAt(0).toUpperCase() + p.slice(1) : "All Plans"}
              </button>
            ))}
          </div>
        </div>

        {/* Table */}
        <div className="bg-white/[0.03] border border-white/[0.06] rounded-2xl overflow-hidden">
          {loading ? (
            <div className="flex justify-center items-center py-20">
              <Loader2 className="size-7 text-primary animate-spin" />
            </div>
          ) : users.length === 0 ? (
            <div className="text-center py-20">
              <Users className="size-10 text-neutral-700 mx-auto mb-3" />
              <p className="text-neutral-400 font-medium">No users found</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead>
                  <tr className="border-b border-white/[0.06] bg-white/[0.02]">
                    <th className="px-6 py-4 text-[11px] font-semibold uppercase tracking-widest text-neutral-500">User</th>
                    <th className="px-6 py-4 text-[11px] font-semibold uppercase tracking-widest text-neutral-500">Plan</th>
                    <th className="px-6 py-4 text-[11px] font-semibold uppercase tracking-widest text-neutral-500 min-w-[160px]">Usage</th>
                    <th className="px-6 py-4 text-[11px] font-semibold uppercase tracking-widest text-neutral-500">Status</th>
                    <th className="px-6 py-4 text-[11px] font-semibold uppercase tracking-widest text-neutral-500">Joined</th>
                    <th className="px-6 py-4 w-10" />
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/[0.04]">
                  {users.map((user, i) => (
                    <motion.tr
                      key={user._id || user.email}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: i * 0.03 }}
                      className="hover:bg-white/[0.03] transition-all group"
                    >
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="size-9 rounded-full bg-primary/10 border border-primary/20 flex items-center justify-center text-primary text-xs font-bold shrink-0">
                            {user.initials}
                          </div>
                          <div>
                            <p className="text-sm font-semibold text-white">{user.name}</p>
                            <p className="text-xs text-neutral-500">{user.email}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className={cn("px-2.5 py-1 rounded-lg text-[10px] font-bold uppercase tracking-wider border", PLAN_COLORS[user.plan] || PLAN_COLORS.Free)}>
                          {user.plan}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex flex-col gap-1.5">
                          <div className="flex justify-between text-[10px] font-semibold text-neutral-500">
                            <span>Chars used</span>
                            <span className={user.usage >= 90 ? "text-red-400" : "text-primary"}>{user.usage}%</span>
                          </div>
                          <div className="h-1 w-full bg-white/5 rounded-full overflow-hidden">
                            <div className={cn("h-full rounded-full", user.usage >= 90 ? "bg-red-500" : "bg-primary")} style={{ width: `${user.usage}%` }} />
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className={cn(
                          "inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider border",
                          user.status === "Active" ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20" : "bg-red-500/10 text-red-400 border-red-500/20"
                        )}>
                          <span className={cn("size-1.5 rounded-full", user.status === "Active" ? "bg-emerald-400" : "bg-red-400")} />
                          {user.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-xs text-neutral-500">{user.joined}</td>
                      <td className="px-6 py-4 text-right relative">
                        <button
                          onClick={(e) => { e.stopPropagation(); setMenuOpen(menuOpen === user._id ? null : user._id); }}
                          className="size-8 rounded-full hover:bg-white/10 flex items-center justify-center text-neutral-500 hover:text-white opacity-0 group-hover:opacity-100 transition-all"
                        >
                          <MoreVertical className="size-4" />
                        </button>
                        {menuOpen === user._id && (
                          <div onClick={(e) => e.stopPropagation()} className="absolute right-6 top-full mt-1 z-50 bg-[#1a1d2e] border border-white/[0.08] rounded-xl shadow-xl py-2 min-w-[160px]">
                            <p className="px-4 py-2 text-[10px] font-semibold text-neutral-500 uppercase tracking-widest border-b border-white/[0.06] mb-1">Change Plan</p>
                            {["free", "pro", "enterprise"].map((p) => (
                              <button
                                key={p}
                                onClick={() => changePlan(user._id, p)}
                                className="w-full flex items-center justify-between px-4 py-2 text-sm text-neutral-300 hover:text-white hover:bg-white/5 transition-colors"
                              >
                                <span>{p.charAt(0).toUpperCase() + p.slice(1)}</span>
                                {user.rawPlan === p && <Check className="size-3.5 text-primary" />}
                              </button>
                            ))}
                          </div>
                        )}
                      </td>
                    </motion.tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {/* Pagination */}
          <div className="px-6 py-4 border-t border-white/[0.06] flex items-center justify-between">
            <span className="text-xs text-neutral-500">
              {total === 0 ? "No results" : `${(page - 1) * limit + 1}–${Math.min(page * limit, total)} of ${total}`}
            </span>
            <div className="flex gap-1.5">
              <button
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page === 1}
                className="size-8 rounded-full border border-white/[0.08] flex items-center justify-center text-neutral-400 hover:text-white hover:bg-white/5 disabled:opacity-30 transition-all"
              >
                <ChevronLeft className="size-4" />
              </button>
              {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                const p = i + Math.max(1, page - 2);
                if (p > totalPages) return null;
                return (
                  <button
                    key={p}
                    onClick={() => setPage(p)}
                    className={cn(
                      "size-8 rounded-full text-xs font-semibold transition-all",
                      p === page ? "bg-primary text-white" : "text-neutral-400 hover:text-white hover:bg-white/5"
                    )}
                  >{p}</button>
                );
              })}
              <button
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                disabled={page === totalPages}
                className="size-8 rounded-full border border-white/[0.08] flex items-center justify-center text-neutral-400 hover:text-white hover:bg-white/5 disabled:opacity-30 transition-all"
              >
                <ChevronRight className="size-4" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
