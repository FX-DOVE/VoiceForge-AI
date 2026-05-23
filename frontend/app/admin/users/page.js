"use client";

import { useEffect, useState, useCallback, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { adminApi } from "@/lib/api";
import { calculateCreditsFromPayment } from "@/lib/creditCalc";
import {
  Search, Download, MoreVertical, ChevronLeft, ChevronRight,
  Users, User, Loader2, RefreshCw, X, Check, Ban, ShieldAlert, Trash2, AlertTriangle, PlusCircle
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

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

const STATUS_COLORS = {
  Active: "bg-emerald-500/10 text-emerald-400 border-emerald-500/20",
  Banned: "bg-red-500/10 text-red-400 border-red-500/20",
  Restricted: "bg-amber-500/10 text-amber-400 border-amber-500/20",
  Suspended: "bg-red-500/10 text-red-400 border-red-500/20",
};

export default function AdminUsersPage() {
  const [search, setSearch] = useState("");
  const [planFilter, setPlanFilter] = useState("");
  const [users, setUsers] = useState([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [menuOpen, setMenuOpen] = useState(null);
  const [menuPos, setMenuPos] = useState({ top: 0, left: 0 });
  const [notice, setNotice] = useState(null);
  const [modalType, setModalType] = useState(null);
  const [selectedUser, setSelectedUser] = useState(null);
  const [actionReason, setActionReason] = useState("");
  const [selectedRestrictions, setSelectedRestrictions] = useState(["tts", "cloning", "payments"]);
  const [processing, setProcessing] = useState(false);
  const [creditsAmount, setCreditsAmount] = useState("");
  const [creditsNote, setCreditsNote] = useState("");
  const [usdAmount, setUsdAmount] = useState("");

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
            const statusLabel = u.status ? u.status.charAt(0).toUpperCase() + u.status.slice(1) : "Active";
            return {
              _id: u._id || u.id,
              name: u.name || "—",
              email: u.email,
              plan: u.plan ? u.plan.charAt(0).toUpperCase() + u.plan.slice(1) : "Free",
              rawPlan: u.plan || "free",
              usage: pct,
              status: statusLabel,
              rawStatus: u.status || "active",
              banReason: u.banReason,
              restrictionReason: u.restrictionReason,
              restrictions: u.restrictions || [],
              joined: u.createdAt
                ? new Date(u.createdAt).toLocaleDateString(undefined, { month: "short", day: "numeric", year: "numeric" })
                : "—",
              initials: initials(u.name, u.email),
              totalCredits: u.totalCredits || 0,
              creditsUsed: u.creditsUsed || 0,
              creditsRemaining: u.creditsRemaining || 0,
              totalPayments: u.totalPayments || 0,
              generationsCount: u.generationsCount || 0,
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

  async function handleBan() {
    if (!selectedUser) return;
    setProcessing(true);
    try {
      await adminApi.banUser(selectedUser._id, actionReason);
      showNotice(`User ${selectedUser.name || selectedUser.email} banned successfully`);
      load();
    } catch { showNotice("Failed to ban user", "error"); }
    setProcessing(false);
    setModalType(null);
    setSelectedUser(null);
    setActionReason("");
  }

  async function handleUnban(userId, userName) {
    try {
      await adminApi.unbanUser(userId);
      showNotice(`User ${userName} unbanned successfully`);
      load();
    } catch { showNotice("Failed to unban user", "error"); }
  }

  async function handleRestrict() {
    if (!selectedUser) return;
    setProcessing(true);
    try {
      await adminApi.restrictUser(selectedUser._id, actionReason, selectedRestrictions);
      showNotice(`User ${selectedUser.name || selectedUser.email} restricted successfully`);
      load();
    } catch { showNotice("Failed to restrict user", "error"); }
    setProcessing(false);
    setModalType(null);
    setSelectedUser(null);
    setActionReason("");
  }

  async function handleUnrestrict(userId, userName) {
    try {
      await adminApi.unrestrictUser(userId);
      showNotice(`Restrictions removed from ${userName}`);
      load();
    } catch { showNotice("Failed to remove restrictions", "error"); }
  }

  async function handleDelete() {
    if (!selectedUser) return;
    setProcessing(true);
    try {
      await adminApi.deleteUser(selectedUser._id, actionReason);
      showNotice(`User ${selectedUser.name || selectedUser.email} deleted successfully`);
      load();
    } catch { showNotice("Failed to delete user", "error"); }
    setProcessing(false);
    setModalType(null);
    setSelectedUser(null);
    setActionReason("");
  }

  async function handleAddCredits() {
    if (!selectedUser) return;
    const amount = Number(creditsAmount);
    if (!amount || amount <= 0) { showNotice("Enter a valid USD amount", "error"); return; }
    setProcessing(true);
    try {
      const result = await adminApi.addCredits(selectedUser._id, amount, creditsNote, parseFloat(usdAmount) || 0);
      const proMsg = result.upgradedToPro ? " — upgraded to Pro!" : "";
      showNotice(`${amount.toLocaleString()} credits added to ${selectedUser.name || selectedUser.email}. New balance: ${result.newBalance?.toLocaleString()}${proMsg}`);
      load();
    } catch (e) { showNotice(e?.message || "Failed to add credits", "error"); }
    setProcessing(false);
    setModalType(null);
    setSelectedUser(null);
    setCreditsAmount("");
    setCreditsNote("");
    setUsdAmount("");
  }

  function openModal(type, user) {
    setSelectedUser(user);
    setModalType(type);
    setActionReason("");
    setSelectedRestrictions(["tts", "cloning", "payments"]);
    setCreditsAmount("");
    setCreditsNote("");
    setUsdAmount("");
    setMenuOpen(null);
  }

  const totalPages = Math.max(1, Math.ceil(total / limit));

  return (
    <div className="h-full flex flex-col min-h-0" onClick={() => setMenuOpen(null)}>
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
            <div className="overflow-visible">
              <table className="w-full min-w-[700px] text-left">
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
                      onClick={() => openModal("viewUser", user)}
                      className="hover:bg-white/[0.03] cursor-pointer transition-all group"
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
                          STATUS_COLORS[user.status] || STATUS_COLORS.Active
                        )}>
                          <span className={cn("size-1.5 rounded-full", 
                            user.status === "Active" ? "bg-emerald-400" : 
                            user.status === "Banned" ? "bg-red-400" :
                            user.status === "Restricted" ? "bg-amber-400" : "bg-red-400"
                          )} />
                          {user.status}
                        </span>
                        {user.banReason && (
                          <p className="text-[10px] text-red-400 mt-1 max-w-[120px] truncate">{user.banReason}</p>
                        )}
                        {user.restrictionReason && (
                          <p className="text-[10px] text-amber-400 mt-1 max-w-[120px] truncate">{user.restrictionReason}</p>
                        )}
                      </td>
                      <td className="px-6 py-4 text-xs text-neutral-500">{user.joined}</td>
                      <td className="px-6 py-4 text-right relative">
                        <button
                          onClick={(e) => { e.stopPropagation(); const r = e.currentTarget.getBoundingClientRect(); setMenuPos({ top: r.bottom + 6, right: window.innerWidth - r.right }); setMenuOpen(menuOpen === user._id ? null : user._id); }}
                          className="size-8 rounded-full hover:bg-white/10 flex items-center justify-center text-neutral-500 hover:text-white opacity-0 group-hover:opacity-100 transition-all"
                        >
                          <MoreVertical className="size-4" />
                        </button>
                        {menuOpen === user._id && (
                          <div onClick={(e) => e.stopPropagation()} style={{ position: 'fixed', top: menuPos.top, right: menuPos.right, zIndex: 9999 }} className="bg-[#1a1d2e] border border-white/[0.08] rounded-xl shadow-2xl py-2 min-w-[220px]">
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
                            
                            <div className="border-t border-white/[0.06] my-2" />
                            
                            <p className="px-4 py-2 text-[10px] font-semibold text-neutral-500 uppercase tracking-widest border-b border-white/[0.06] mb-1">Actions</p>
                            
                            {user.rawStatus === "banned" ? (
                              <button
                                onClick={() => handleUnban(user._id, user.name || user.email)}
                                className="w-full flex items-center gap-2 px-4 py-2 text-sm text-emerald-400 hover:text-emerald-300 hover:bg-emerald-500/10 transition-colors"
                              >
                                <Check className="size-4" />
                                <span>Unban User</span>
                              </button>
                            ) : (
                              <button
                                onClick={() => openModal("ban", user)}
                                className="w-full flex items-center gap-2 px-4 py-2 text-sm text-red-400 hover:text-red-300 hover:bg-red-500/10 transition-colors"
                              >
                                <Ban className="size-4" />
                                <span>Ban User</span>
                              </button>
                            )}
                            
                            {user.rawStatus === "restricted" ? (
                              <button
                                onClick={() => handleUnrestrict(user._id, user.name || user.email)}
                                className="w-full flex items-center gap-2 px-4 py-2 text-sm text-emerald-400 hover:text-emerald-300 hover:bg-emerald-500/10 transition-colors"
                              >
                                <Check className="size-4" />
                                <span>Remove Restrictions</span>
                              </button>
                            ) : (
                              <button
                                onClick={() => openModal("restrict", user)}
                                className="w-full flex items-center gap-2 px-4 py-2 text-sm text-amber-400 hover:text-amber-300 hover:bg-amber-500/10 transition-colors"
                              >
                                <ShieldAlert className="size-4" />
                                <span>Restrict User</span>
                              </button>
                            )}
                            
                            <button
                              onClick={() => openModal("addCredits", user)}
                              className="w-full flex items-center gap-2 px-4 py-2 text-sm text-emerald-400 hover:text-emerald-300 hover:bg-emerald-500/10 transition-colors"
                            >
                              <PlusCircle className="size-4" />
                              <span>Add Credits</span>
                            </button>

                            <div className="border-t border-white/[0.06] my-2" />
                            
                            <button
                              onClick={() => openModal("delete", user)}
                              className="w-full flex items-center gap-2 px-4 py-2 text-sm text-red-500 hover:text-red-400 hover:bg-red-500/10 transition-colors"
                            >
                              <Trash2 className="size-4" />
                              <span>Delete User</span>
                            </button>
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

      {/* Add Credits Modal */}
      <Dialog open={modalType === "addCredits"} onOpenChange={() => setModalType(null)}>
        <DialogContent className="bg-surface-container border-white/10 text-white">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-emerald-400">
              <PlusCircle className="size-5" />
              Add Credits
            </DialogTitle>
            <DialogDescription className="text-neutral-400">
              Manually allocate credits to <span className="text-white font-semibold">{selectedUser?.name || selectedUser?.email}</span>. This is logged in the activity feed.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div>
              <label className="text-sm font-medium text-neutral-300 mb-2 block">Amount in USD ($)</label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400 text-sm font-semibold">$</span>
                <input
                  type="number"
                  min="0.01"
                  step="0.01"
                  value={usdAmount}
                  onChange={(e) => {
                    const usd = e.target.value;
                    setUsdAmount(usd);
                    const parsed = parseFloat(usd);
                    if (parsed > 0) {
                      setCreditsAmount(String(calculateCreditsFromPayment(parsed)));
                    } else {
                      setCreditsAmount("");
                    }
                  }}
                  placeholder="e.g. 5.00"
                  className="w-full h-11 pl-7 pr-3 bg-white/5 border border-white/10 rounded-lg text-sm text-white placeholder:text-neutral-600 focus:outline-none focus:border-emerald-500/50"
                />
              </div>
            </div>
            {creditsAmount && (
              <div className="flex items-center justify-between px-4 py-3 rounded-xl bg-emerald-500/10 border border-emerald-500/20">
                <span className="text-sm text-emerald-300 font-medium">Credits to be added</span>
                <span className="text-lg font-bold text-emerald-400">{Number(creditsAmount).toLocaleString()}</span>
              </div>
            )}
            <div>
              <label className="text-sm font-medium text-neutral-300 mb-2 block">Note (optional)</label>
              <input
                type="text"
                value={creditsNote}
                onChange={(e) => setCreditsNote(e.target.value)}
                placeholder="e.g. Manual credit — Paystack webhook failed"
                className="w-full h-10 px-3 bg-white/5 border border-white/10 rounded-lg text-sm text-white placeholder:text-neutral-600 focus:outline-none focus:border-emerald-500/50"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setModalType(null)} className="border-white/10 hover:bg-white/5">
              Cancel
            </Button>
            <Button
              onClick={handleAddCredits}
              disabled={processing || !creditsAmount}
              className="bg-emerald-600 hover:bg-emerald-700 text-white"
            >
              {processing ? <Loader2 className="size-4 animate-spin" /> : <PlusCircle className="size-4 mr-2" />}
              Add Credits
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Ban User Modal */}
      <Dialog open={modalType === "ban"} onOpenChange={() => setModalType(null)}>
        <DialogContent className="bg-surface-container border-white/10 text-white">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-red-400">
              <Ban className="size-5" />
              Ban User
            </DialogTitle>
            <DialogDescription className="text-neutral-400">
              Are you sure you want to ban {selectedUser?.name || selectedUser?.email}? This will prevent them from accessing the platform.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div>
              <label className="text-sm font-medium text-neutral-300 mb-2 block">Reason for ban (optional)</label>
              <textarea
                value={actionReason}
                onChange={(e) => setActionReason(e.target.value)}
                placeholder="e.g., Violation of terms, spam activity..."
                className="w-full h-24 px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-sm text-white placeholder:text-neutral-600 focus:outline-none focus:border-red-500/50 resize-none"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setModalType(null)} className="border-white/10 hover:bg-white/5">
              Cancel
            </Button>
            <Button 
              onClick={handleBan} 
              disabled={processing}
              className="bg-red-500 hover:bg-red-600 text-white"
            >
              {processing ? <Loader2 className="size-4 animate-spin" /> : <Ban className="size-4 mr-2" />}
              Ban User
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Restrict User Modal */}
      <Dialog open={modalType === "restrict"} onOpenChange={() => setModalType(null)}>
        <DialogContent className="bg-surface-container border-white/10 text-white">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-amber-400">
              <ShieldAlert className="size-5" />
              Restrict User
            </DialogTitle>
            <DialogDescription className="text-neutral-400">
              Restrict {selectedUser?.name || selectedUser?.email} from specific features while keeping their account active.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div>
              <label className="text-sm font-medium text-neutral-300 mb-2 block">Reason for restriction</label>
              <textarea
                value={actionReason}
                onChange={(e) => setActionReason(e.target.value)}
                placeholder="e.g., Payment dispute, suspicious activity..."
                className="w-full h-20 px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-sm text-white placeholder:text-neutral-600 focus:outline-none focus:border-amber-500/50 resize-none"
              />
            </div>
            <div>
              <label className="text-sm font-medium text-neutral-300 mb-2 block">Select restrictions</label>
              <div className="space-y-2">
                {[
                  { key: "tts", label: "Text-to-Speech Generation" },
                  { key: "cloning", label: "Voice Cloning" },
                  { key: "payments", label: "Payments & Purchases" },
                ].map(({ key, label }) => (
                  <label key={key} className="flex items-center gap-3 p-3 rounded-lg bg-white/5 border border-white/10 cursor-pointer hover:bg-white/[0.07] transition-colors">
                    <input
                      type="checkbox"
                      checked={selectedRestrictions.includes(key)}
                      onChange={(e) => {
                        if (e.target.checked) {
                          setSelectedRestrictions([...selectedRestrictions, key]);
                        } else {
                          setSelectedRestrictions(selectedRestrictions.filter(r => r !== key));
                        }
                      }}
                      className="size-4 rounded border-white/20 bg-white/5 text-amber-500 focus:ring-amber-500/20"
                    />
                    <span className="text-sm text-neutral-300">{label}</span>
                  </label>
                ))}
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setModalType(null)} className="border-white/10 hover:bg-white/5">
              Cancel
            </Button>
            <Button 
              onClick={handleRestrict} 
              disabled={processing || selectedRestrictions.length === 0}
              className="bg-amber-500 hover:bg-amber-600 text-white"
            >
              {processing ? <Loader2 className="size-4 animate-spin" /> : <ShieldAlert className="size-4 mr-2" />}
              Restrict User
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete User Modal */}
      <Dialog open={modalType === "delete"} onOpenChange={() => setModalType(null)}>
        <DialogContent className="bg-surface-container border-white/10 text-white">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-red-500">
              <AlertTriangle className="size-5" />
              Delete User
            </DialogTitle>
            <DialogDescription className="text-neutral-400">
              <span className="text-red-400 font-semibold">Warning:</span> This action cannot be undone. All user data including generations, clones, and payments will be permanently deleted.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="p-4 rounded-lg bg-red-500/10 border border-red-500/20">
              <p className="text-sm text-red-400">
                You are about to delete: <strong>{selectedUser?.name || selectedUser?.email}</strong>
              </p>
            </div>
            <div>
              <label className="text-sm font-medium text-neutral-300 mb-2 block">Reason for deletion (optional)</label>
              <textarea
                value={actionReason}
                onChange={(e) => setActionReason(e.target.value)}
                placeholder="e.g., User request, policy violation..."
                className="w-full h-20 px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-sm text-white placeholder:text-neutral-600 focus:outline-none focus:border-red-500/50 resize-none"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setModalType(null)} className="border-white/10 hover:bg-white/5">
              Cancel
            </Button>
            <Button 
              onClick={handleDelete} 
              disabled={processing}
              className="bg-red-600 hover:bg-red-700 text-white"
            >
              {processing ? <Loader2 className="size-4 animate-spin" /> : <Trash2 className="size-4 mr-2" />}
              Delete Permanently
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* View User Modal */}
      <Dialog open={modalType === "viewUser"} onOpenChange={() => setModalType(null)}>
        <DialogContent className="bg-surface-container border-white/10 text-white max-w-lg">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-primary">
              <User className="size-5" />
              User Profile & Usage Details
            </DialogTitle>
            <DialogDescription className="text-neutral-400">
              Detailed breakdown of usage, plan, and credits for this account.
            </DialogDescription>
          </DialogHeader>
          {selectedUser && (
            <div className="space-y-6 py-4">
              {/* User Header Info */}
              <div className="flex items-center gap-4 p-4 rounded-2xl bg-white/[0.02] border border-white/[0.04]">
                <div className="size-12 rounded-full bg-primary/10 border border-primary/20 flex items-center justify-center text-primary text-base font-bold shrink-0">
                  {selectedUser.initials}
                </div>
                <div>
                  <h4 className="text-base font-bold text-white">{selectedUser.name}</h4>
                  <p className="text-sm text-neutral-400">{selectedUser.email}</p>
                  <div className="flex items-center gap-2 mt-1.5">
                    <span className={cn("px-2 py-0.5 rounded-md text-[9px] font-bold uppercase tracking-wider border", PLAN_COLORS[selectedUser.plan] || PLAN_COLORS.Free)}>
                      {selectedUser.plan}
                    </span>
                    <span className={cn("inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[9px] font-bold uppercase tracking-wider border", STATUS_COLORS[selectedUser.status] || STATUS_COLORS.Active)}>
                      {selectedUser.status}
                    </span>
                  </div>
                </div>
              </div>

              {/* Stats Grid */}
              <div className="grid grid-cols-2 gap-4">
                {/* Generation Card */}
                <div className="p-4 rounded-2xl bg-white/[0.02] border border-white/[0.04] flex flex-col justify-between">
                  <div>
                    <span className="text-xs text-neutral-500 font-medium">Total Generations</span>
                    <h3 className="text-2xl font-bold text-white mt-1">
                      {selectedUser.generationsCount?.toLocaleString() || 0}
                    </h3>
                  </div>
                  <p className="text-[10px] text-neutral-500 mt-2">Audio files generated using TTS</p>
                </div>

                {/* Payments Card */}
                <div className="p-4 rounded-2xl bg-white/[0.02] border border-white/[0.04] flex flex-col justify-between">
                  <div>
                    <span className="text-xs text-neutral-500 font-medium">Total Spent</span>
                    <h3 className="text-2xl font-bold text-emerald-400 mt-1">
                      ${(selectedUser.totalPayments || 0).toFixed(2)}
                    </h3>
                  </div>
                  <p className="text-[10px] text-neutral-500 mt-2">Lifetime payments processed</p>
                </div>
              </div>

              {/* Credits Breakdown */}
              <div className="p-5 rounded-2xl bg-white/[0.02] border border-white/[0.04] space-y-4">
                <h5 className="text-xs font-semibold text-neutral-400 uppercase tracking-wider">Credit Ledger</h5>
                
                <div className="space-y-3">
                  <div className="flex items-center justify-between border-b border-white/[0.04] pb-2">
                    <span className="text-sm text-neutral-400">Total Purchased</span>
                    <span className="text-sm font-semibold text-white">
                      {(selectedUser.totalCredits || 0).toLocaleString()}
                    </span>
                  </div>

                  <div className="flex items-center justify-between border-b border-white/[0.04] pb-2">
                    <span className="text-sm text-neutral-400">Used Credits</span>
                    <span className="text-sm font-semibold text-neutral-400">
                      {(selectedUser.creditsUsed || 0).toLocaleString()}
                    </span>
                  </div>

                  <div className="flex items-center justify-between pt-1">
                    <span className="text-sm font-medium text-emerald-400">Remaining Balance</span>
                    <span className="text-base font-bold text-emerald-400">
                      {(selectedUser.creditsRemaining || 0).toLocaleString()}
                    </span>
                  </div>
                </div>
              </div>

              {/* Joined and IDs */}
              <div className="flex flex-col gap-2 text-xs text-neutral-500 px-1">
                <div className="flex justify-between">
                  <span>Joined Date</span>
                  <span className="text-neutral-400">{selectedUser.joined}</span>
                </div>
                <div className="flex justify-between">
                  <span>User Database ID</span>
                  <span className="font-mono text-[10px] text-neutral-400">{selectedUser._id}</span>
                </div>
                {selectedUser.restrictions?.length > 0 && (
                  <div className="flex justify-between mt-1">
                    <span>Active Restrictions</span>
                    <span className="text-amber-400 font-medium">
                      {selectedUser.restrictions.join(", ")}
                    </span>
                  </div>
                )}
              </div>
            </div>
          )}
          <DialogFooter>
            <Button onClick={() => setModalType(null)} className="w-full bg-white/5 hover:bg-white/10 text-white border-white/[0.08]">
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
