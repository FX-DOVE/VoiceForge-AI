"use client";

import { useEffect, useState, useCallback, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { adminApi, filesApi } from "@/lib/api";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  Gift,
  Send,
  Loader2,
  DollarSign,
  FileText,
  Users,
  Clock,
  CheckCircle,
  Sparkles,
  History,
  Upload,
  X,
  Search,
  ImageIcon,
} from "lucide-react";

export default function GiftEmailPage() {
  const [tab, setTab] = useState("compose"); // compose | history
  const [sending, setSending] = useState(false);
  const [campaigns, setCampaigns] = useState([]);
  const [loadingCampaigns, setLoadingCampaigns] = useState(false);
  const [previewCredits, setPreviewCredits] = useState(null);
  const [calculatingCredits, setCalculatingCredits] = useState(false);

  // User selection state
  const [allUsers, setAllUsers] = useState([]);
  const [loadingUsers, setLoadingUsers] = useState(false);
  const [selectedUsers, setSelectedUsers] = useState([]); // array of { _id, email, name }
  const [userSearch, setUserSearch] = useState("");
  const [showUserDropdown, setShowUserDropdown] = useState(false);
  const userDropdownRef = useRef(null);

  // File upload state
  const [uploadingImage, setUploadingImage] = useState(false);
  const [uploadingGif, setUploadingGif] = useState(false);
  const imageInputRef = useRef(null);
  const gifInputRef = useRef(null);

  // Form state
  const [form, setForm] = useState({
    subject: "",
    heading: "",
    body: "",
    imageUrl: "",
    gifUrl: "",
    buttonText: "Claim Your Free Credits",
    usdAmount: "",
    recipients: "all",
    expiryDays: "7",
    campaignName: "",
  });

  const updateForm = (key, value) => setForm((prev) => ({ ...prev, [key]: value }));

  // Fetch all users for selection (paginated)
  const fetchUsers = useCallback(async () => {
    setLoadingUsers(true);
    try {
      let page = 1;
      let all = [];
      let hasMore = true;
      while (hasMore) {
        const data = await adminApi.users({ limit: 100, page });
        const items = data.items || [];
        all = [...all, ...items];
        hasMore = items.length === 100;
        page++;
      }
      setAllUsers(all);
    } catch (err) {
      toast.error("Failed to load users");
    } finally {
      setLoadingUsers(false);
    }
  }, []);

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  // Close user dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (userDropdownRef.current && !userDropdownRef.current.contains(e.target)) {
        setShowUserDropdown(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Filter users by search
  const filteredUsers = allUsers.filter((u) => {
    const q = userSearch.toLowerCase();
    return (u.name || "").toLowerCase().includes(q) || (u.email || "").toLowerCase().includes(q);
  });

  const getUserId = (user) => user.id || user._id;

  const toggleUser = (user) => {
    const uid = getUserId(user);
    setSelectedUsers((prev) => {
      const exists = prev.find((u) => u.id === uid);
      if (exists) return prev.filter((u) => u.id !== uid);
      return [...prev, { id: uid, email: user.email, name: user.name }];
    });
  };

  const isUserSelected = (userId) => selectedUsers.some((u) => u.id === userId);

  // File upload handler
  const handleFileUpload = async (file, type) => {
    if (!file) return;
    const isGif = type === "gif";
    const setter = isGif ? setUploadingGif : setUploadingImage;
    const formKey = isGif ? "gifUrl" : "imageUrl";

    // Validate file type
    const validTypes = isGif
      ? ["image/gif"]
      : ["image/png", "image/jpeg", "image/jpg", "image/webp", "image/gif"];
    if (!validTypes.includes(file.type)) {
      toast.error(isGif ? "Please upload a GIF file" : "Please upload an image file (PNG, JPG, WebP, GIF)");
      return;
    }
    if (file.size > 10 * 1024 * 1024) {
      toast.error("File must be under 10MB");
      return;
    }

    setter(true);
    try {
      const data = await filesApi.upload(file);
      updateForm(formKey, data.file.url);
      toast.success(`${isGif ? "GIF" : "Image"} uploaded!`);
    } catch (err) {
      toast.error(err.message || "Upload failed");
    } finally {
      setter(false);
    }
  };

  // Calculate credits when USD amount changes
  useEffect(() => {
    const amount = parseFloat(form.usdAmount);
    if (!amount || amount <= 0) {
      setPreviewCredits(null);
      return;
    }
    const timer = setTimeout(async () => {
      setCalculatingCredits(true);
      try {
        const res = await (await fetch(`/api/payments/estimate?amount=${amount}`)).json();
        setPreviewCredits(res.credits || Math.floor(amount * 66666));
      } catch {
        setPreviewCredits(Math.floor(amount * 66666));
      }
      setCalculatingCredits(false);
    }, 300);
    return () => clearTimeout(timer);
  }, [form.usdAmount]);

  const fetchCampaigns = useCallback(async () => {
    setLoadingCampaigns(true);
    try {
      const data = await adminApi.getGiftCampaigns();
      setCampaigns(data.campaigns || []);
    } catch (err) {
      toast.error(err.message || "Failed to load campaigns");
    } finally {
      setLoadingCampaigns(false);
    }
  }, []);

  useEffect(() => {
    if (tab === "history") fetchCampaigns();
  }, [tab, fetchCampaigns]);

  const handleSend = async () => {
    if (!form.body.trim()) return toast.error("Email body is required");
    if (!form.usdAmount || parseFloat(form.usdAmount) <= 0) return toast.error("USD amount is required");
    if (form.recipients === "specific" && selectedUsers.length === 0) return toast.error("Please select at least one user");

    setSending(true);
    try {
      const payload = {
        ...form,
        usdAmount: parseFloat(form.usdAmount),
        expiryDays: parseInt(form.expiryDays) || 7,
        specificUserIds: form.recipients === "specific" ? selectedUsers.map((u) => u.id) : [],
      };
      const data = await adminApi.sendGiftEmail(payload);
      toast.success(`Gift email sent to ${data.totalSent} users! (${data.credits.toLocaleString()} credits each)`);
      setForm({
        subject: "", heading: "", body: "", imageUrl: "", gifUrl: "",
        buttonText: "Claim Your Free Credits", usdAmount: "", recipients: "all",
        expiryDays: "7", campaignName: "",
      });
      setSelectedUsers([]);
      setPreviewCredits(null);
    } catch (err) {
      toast.error(err.message || "Failed to send gift email");
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="h-full flex flex-col overflow-hidden bg-background">
      {/* Header */}
      <header className="shrink-0 px-4 sm:px-6 py-4 border-b border-white/5">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="size-10 rounded-xl bg-emerald-500/10 flex items-center justify-center">
              <Gift className="size-5 text-emerald-400" />
            </div>
            <div>
              <h1 className="text-lg sm:text-xl font-bold text-white">Gift Email Campaign</h1>
              <p className="text-xs sm:text-sm text-white/50">Send free credits to users via beautifully formatted emails</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <div className="flex items-center bg-white/5 rounded-lg p-1">
              <button
                onClick={() => setTab("compose")}
                className={cn(
                  "px-3 py-1.5 rounded-md text-sm font-medium transition-colors",
                  tab === "compose" ? "bg-primary/20 text-primary" : "text-neutral-400 hover:text-white"
                )}
              >
                <Send className="size-3.5 inline mr-1.5" />
                Compose
              </button>
              <button
                onClick={() => setTab("history")}
                className={cn(
                  "px-3 py-1.5 rounded-md text-sm font-medium transition-colors",
                  tab === "history" ? "bg-primary/20 text-primary" : "text-neutral-400 hover:text-white"
                )}
              >
                <History className="size-3.5 inline mr-1.5" />
                History
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-4 sm:p-6">
        <AnimatePresence mode="wait">
          {tab === "compose" ? (
            <motion.div
              key="compose"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="max-w-4xl mx-auto space-y-6"
            >
              {/* Credit Amount Section */}
              <div className="p-5 rounded-2xl bg-white/[0.02] border border-white/[0.06]">
                <h3 className="text-sm font-semibold text-white mb-4 flex items-center gap-2">
                  <DollarSign className="size-4 text-emerald-400" />
                  Credit Gift Amount
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="text-xs text-neutral-400 mb-1.5 block">USD Amount (per user)</label>
                    <div className="relative">
                      <span className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-500 text-sm">$</span>
                      <input
                        type="number"
                        step="0.01"
                        min="0.01"
                        placeholder="0.05"
                        value={form.usdAmount}
                        onChange={(e) => updateForm("usdAmount", e.target.value)}
                        className="w-full pl-7 pr-4 py-2.5 rounded-xl bg-white/[0.04] border border-white/[0.08] text-white text-sm placeholder:text-neutral-500 focus:outline-none focus:border-primary/50 transition-colors"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="text-xs text-neutral-400 mb-1.5 block">Credits (auto-calculated)</label>
                    <div className="flex items-center gap-2 h-[42px] px-4 rounded-xl bg-emerald-500/5 border border-emerald-500/20">
                      {calculatingCredits ? (
                        <Loader2 className="size-4 animate-spin text-emerald-400" />
                      ) : (
                        <Sparkles className="size-4 text-emerald-400" />
                      )}
                      <span className="text-sm font-semibold text-emerald-400">
                        {previewCredits !== null ? previewCredits.toLocaleString() + " credits" : "Enter amount..."}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Email Content Section */}
              <div className="p-5 rounded-2xl bg-white/[0.02] border border-white/[0.06]">
                <h3 className="text-sm font-semibold text-white mb-4 flex items-center gap-2">
                  <FileText className="size-4 text-blue-400" />
                  Email Content
                </h3>
                <div className="space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="text-xs text-neutral-400 mb-1.5 block">Email Subject</label>
                      <input
                        type="text"
                        placeholder="You've Got Free Credits!"
                        value={form.subject}
                        onChange={(e) => updateForm("subject", e.target.value)}
                        className="w-full px-4 py-2.5 rounded-xl bg-white/[0.04] border border-white/[0.08] text-white text-sm placeholder:text-neutral-500 focus:outline-none focus:border-primary/50 transition-colors"
                      />
                    </div>
                    <div>
                      <label className="text-xs text-neutral-400 mb-1.5 block">Heading (in email body)</label>
                      <input
                        type="text"
                        placeholder="You've Got Free Credits!"
                        value={form.heading}
                        onChange={(e) => updateForm("heading", e.target.value)}
                        className="w-full px-4 py-2.5 rounded-xl bg-white/[0.04] border border-white/[0.08] text-white text-sm placeholder:text-neutral-500 focus:outline-none focus:border-primary/50 transition-colors"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="text-xs text-neutral-400 mb-1.5 block">Email Body (supports HTML)</label>
                    <textarea
                      rows={6}
                      placeholder="Write your message here... You can use HTML tags for formatting like <b>bold</b>, <br> for line breaks, etc."
                      value={form.body}
                      onChange={(e) => updateForm("body", e.target.value)}
                      className="w-full px-4 py-3 rounded-xl bg-white/[0.04] border border-white/[0.08] text-white text-sm placeholder:text-neutral-500 focus:outline-none focus:border-primary/50 transition-colors resize-y min-h-[120px]"
                    />
                  </div>
                  <div>
                    <label className="text-xs text-neutral-400 mb-1.5 block">Claim Button Text</label>
                    <input
                      type="text"
                      placeholder="Claim Your Free Credits"
                      value={form.buttonText}
                      onChange={(e) => updateForm("buttonText", e.target.value)}
                      className="w-full px-4 py-2.5 rounded-xl bg-white/[0.04] border border-white/[0.08] text-white text-sm placeholder:text-neutral-500 focus:outline-none focus:border-primary/50 transition-colors"
                    />
                  </div>
                </div>
              </div>

              {/* Media Section — Upload from device */}
              <div className="p-5 rounded-2xl bg-white/[0.02] border border-white/[0.06]">
                <h3 className="text-sm font-semibold text-white mb-4 flex items-center gap-2">
                  <ImageIcon className="size-4 text-violet-400" />
                  Media (Optional)
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {/* Image Upload */}
                  <div>
                    <label className="text-xs text-neutral-400 mb-1.5 block">Image</label>
                    <input
                      ref={imageInputRef}
                      type="file"
                      accept="image/png,image/jpeg,image/jpg,image/webp,image/gif"
                      className="hidden"
                      onChange={(e) => handleFileUpload(e.target.files?.[0], "image")}
                    />
                    {form.imageUrl ? (
                      <div className="relative group rounded-xl overflow-hidden border border-white/[0.08] bg-black/20">
                        <img src={form.imageUrl} alt="Uploaded" className="w-full h-28 object-cover" />
                        <button
                          onClick={() => { updateForm("imageUrl", ""); if (imageInputRef.current) imageInputRef.current.value = ""; }}
                          className="absolute top-2 right-2 size-6 rounded-full bg-black/60 flex items-center justify-center text-white hover:bg-red-500 transition-colors"
                        >
                          <X className="size-3.5" />
                        </button>
                      </div>
                    ) : (
                      <button
                        onClick={() => imageInputRef.current?.click()}
                        disabled={uploadingImage}
                        className="w-full h-28 rounded-xl border-2 border-dashed border-white/[0.08] bg-white/[0.02] hover:bg-white/[0.04] hover:border-white/[0.15] transition-colors flex flex-col items-center justify-center gap-2 text-neutral-400"
                      >
                        {uploadingImage ? (
                          <Loader2 className="size-5 animate-spin" />
                        ) : (
                          <>
                            <Upload className="size-5" />
                            <span className="text-xs">Upload Image</span>
                            <span className="text-[10px] text-neutral-500">PNG, JPG, WebP, GIF</span>
                          </>
                        )}
                      </button>
                    )}
                  </div>

                  {/* GIF Upload */}
                  <div>
                    <label className="text-xs text-neutral-400 mb-1.5 block">GIF (overrides image)</label>
                    <input
                      ref={gifInputRef}
                      type="file"
                      accept="image/gif"
                      className="hidden"
                      onChange={(e) => handleFileUpload(e.target.files?.[0], "gif")}
                    />
                    {form.gifUrl ? (
                      <div className="relative group rounded-xl overflow-hidden border border-white/[0.08] bg-black/20">
                        <img src={form.gifUrl} alt="Uploaded GIF" className="w-full h-28 object-cover" />
                        <button
                          onClick={() => { updateForm("gifUrl", ""); if (gifInputRef.current) gifInputRef.current.value = ""; }}
                          className="absolute top-2 right-2 size-6 rounded-full bg-black/60 flex items-center justify-center text-white hover:bg-red-500 transition-colors"
                        >
                          <X className="size-3.5" />
                        </button>
                      </div>
                    ) : (
                      <button
                        onClick={() => gifInputRef.current?.click()}
                        disabled={uploadingGif}
                        className="w-full h-28 rounded-xl border-2 border-dashed border-white/[0.08] bg-white/[0.02] hover:bg-white/[0.04] hover:border-white/[0.15] transition-colors flex flex-col items-center justify-center gap-2 text-neutral-400"
                      >
                        {uploadingGif ? (
                          <Loader2 className="size-5 animate-spin" />
                        ) : (
                          <>
                            <Upload className="size-5" />
                            <span className="text-xs">Upload GIF</span>
                            <span className="text-[10px] text-neutral-500">Animated GIF only</span>
                          </>
                        )}
                      </button>
                    )}
                  </div>
                </div>
              </div>

              {/* Recipients & Settings */}
              <div className="p-5 rounded-2xl bg-white/[0.02] border border-white/[0.06]">
                <h3 className="text-sm font-semibold text-white mb-4 flex items-center gap-2">
                  <Users className="size-4 text-amber-400" />
                  Recipients & Settings
                </h3>
                <div className="space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <div>
                      <label className="text-xs text-neutral-400 mb-1.5 block">Send To</label>
                      <select
                        value={form.recipients}
                        onChange={(e) => { updateForm("recipients", e.target.value); if (e.target.value === "all") setSelectedUsers([]); }}
                        className="w-full px-4 py-2.5 rounded-xl bg-white/[0.04] border border-white/[0.08] text-white text-sm focus:outline-none focus:border-primary/50 transition-colors"
                      >
                        <option value="all" className="bg-[#0a0a0f]">All Users</option>
                        <option value="specific" className="bg-[#0a0a0f]">Specific Users</option>
                      </select>
                    </div>
                    <div>
                      <label className="text-xs text-neutral-400 mb-1.5 block">Expires In (days)</label>
                      <input
                        type="number"
                        min="1"
                        max="30"
                        value={form.expiryDays}
                        onChange={(e) => updateForm("expiryDays", e.target.value)}
                        className="w-full px-4 py-2.5 rounded-xl bg-white/[0.04] border border-white/[0.08] text-white text-sm focus:outline-none focus:border-primary/50 transition-colors"
                      />
                    </div>
                    <div>
                      <label className="text-xs text-neutral-400 mb-1.5 block">Campaign Name</label>
                      <input
                        type="text"
                        placeholder="e.g. Apology Gift"
                        value={form.campaignName}
                        onChange={(e) => updateForm("campaignName", e.target.value)}
                        className="w-full px-4 py-2.5 rounded-xl bg-white/[0.04] border border-white/[0.08] text-white text-sm placeholder:text-neutral-500 focus:outline-none focus:border-primary/50 transition-colors"
                      />
                    </div>
                  </div>

                  {/* User selector when "specific" */}
                  {form.recipients === "specific" && (
                    <div ref={userDropdownRef}>
                      <label className="text-xs text-neutral-400 mb-1.5 block">
                        Select Users ({selectedUsers.length} selected)
                      </label>

                      {/* Selected users chips */}
                      {selectedUsers.length > 0 && (
                        <div className="flex flex-wrap gap-1.5 mb-2">
                          {selectedUsers.map((u) => (
                            <span
                              key={u.id}
                              className="inline-flex items-center gap-1 px-2 py-1 rounded-lg bg-primary/10 border border-primary/20 text-xs text-primary"
                            >
                              {u.name || u.email}
                              <button onClick={() => toggleUser(u)} className="hover:text-red-400 transition-colors">
                                <X className="size-3" />
                              </button>
                            </span>
                          ))}
                          <button
                            onClick={() => setSelectedUsers([])}
                            className="text-[10px] text-neutral-500 hover:text-red-400 px-2 py-1 transition-colors"
                          >
                            Clear all
                          </button>
                        </div>
                      )}

                      {/* Search input */}
                      <div className="relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-3.5 text-neutral-500" />
                        <input
                          type="text"
                          placeholder="Search users by name or email..."
                          value={userSearch}
                          onChange={(e) => setUserSearch(e.target.value)}
                          onFocus={() => setShowUserDropdown(true)}
                          className="w-full pl-9 pr-4 py-2.5 rounded-xl bg-white/[0.04] border border-white/[0.08] text-white text-sm placeholder:text-neutral-500 focus:outline-none focus:border-primary/50 transition-colors"
                        />
                      </div>

                      {/* Dropdown list */}
                      {showUserDropdown && (
                        <div className="mt-1 max-h-52 overflow-y-auto rounded-xl bg-[#0d1117] border border-white/[0.08] shadow-xl">
                          {loadingUsers ? (
                            <div className="flex items-center justify-center py-6">
                              <Loader2 className="size-4 animate-spin text-neutral-400" />
                            </div>
                          ) : filteredUsers.length === 0 ? (
                            <div className="text-center py-4 text-xs text-neutral-500">No users found</div>
                          ) : (
                            filteredUsers.slice(0, 50).map((user) => (
                              <button
                                key={getUserId(user)}
                                onClick={() => toggleUser(user)}
                                className={cn(
                                  "w-full flex items-center gap-3 px-3 py-2.5 text-left hover:bg-white/[0.04] transition-colors border-b border-white/[0.03] last:border-0",
                                  isUserSelected(getUserId(user)) && "bg-primary/5"
                                )}
                              >
                                <div className={cn(
                                  "size-4 rounded border flex items-center justify-center shrink-0 transition-colors",
                                  isUserSelected(getUserId(user))
                                    ? "bg-primary border-primary text-white"
                                    : "border-white/20"
                                )}>
                                  {isUserSelected(getUserId(user)) && <CheckCircle className="size-3" />}
                                </div>
                                <div className="flex-1 min-w-0">
                                  <p className="text-sm text-white truncate">{user.name || "Unnamed"}</p>
                                  <p className="text-[11px] text-neutral-500 truncate">{user.email}</p>
                                </div>
                                <span className={cn(
                                  "text-[9px] px-1.5 py-0.5 rounded font-medium uppercase",
                                  user.plan === "pro" ? "bg-violet-500/10 text-violet-400" : "bg-white/5 text-neutral-500"
                                )}>
                                  {user.plan || "free"}
                                </span>
                              </button>
                            ))
                          )}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>

              {/* Send Button */}
              <div className="flex items-center justify-between p-5 rounded-2xl bg-white/[0.02] border border-white/[0.06]">
                <div className="text-sm text-neutral-400">
                  {previewCredits ? (
                    <span>
                      Each user will receive <strong className="text-emerald-400">{previewCredits.toLocaleString()} credits</strong> (${form.usdAmount})
                    </span>
                  ) : (
                    <span>Configure the amount above to see credit preview</span>
                  )}
                </div>
                <Button
                  onClick={handleSend}
                  disabled={sending || !form.body.trim() || !form.usdAmount}
                  className="bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl px-6 h-10"
                >
                  {sending ? (
                    <Loader2 className="size-4 animate-spin mr-2" />
                  ) : (
                    <Send className="size-4 mr-2" />
                  )}
                  Send Gift Email
                </Button>
              </div>
            </motion.div>
          ) : (
            <motion.div
              key="history"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="max-w-4xl mx-auto"
            >
              <div className="rounded-2xl bg-white/[0.02] border border-white/[0.06] overflow-hidden">
                <div className="p-4 border-b border-white/[0.06]">
                  <h3 className="text-sm font-semibold text-white">Campaign History</h3>
                </div>
                {loadingCampaigns ? (
                  <div className="flex items-center justify-center py-12">
                    <Loader2 className="size-5 animate-spin text-neutral-400" />
                  </div>
                ) : campaigns.length === 0 ? (
                  <div className="text-center py-12 text-neutral-500 text-sm">
                    No campaigns sent yet
                  </div>
                ) : (
                  <div className="divide-y divide-white/[0.04]">
                    {campaigns.map((campaign) => (
                      <div key={campaign._id} className="p-4 hover:bg-white/[0.02] transition-colors">
                        <div className="flex items-start justify-between gap-4">
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 mb-1">
                              <h4 className="text-sm font-medium text-white truncate">
                                {campaign.campaignName || campaign.subject}
                              </h4>
                              <span className={cn(
                                "px-2 py-0.5 rounded-full text-[10px] font-bold uppercase",
                                campaign.status === "sent" && "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20",
                                campaign.status === "expired" && "bg-red-500/10 text-red-400 border border-red-500/20",
                                campaign.status === "draft" && "bg-amber-500/10 text-amber-400 border border-amber-500/20"
                              )}>
                                {campaign.status}
                              </span>
                            </div>
                            <p className="text-xs text-neutral-500 truncate">{campaign.subject}</p>
                            <div className="flex items-center gap-4 mt-2 text-xs text-neutral-400">
                              <span className="flex items-center gap-1">
                                <Users className="size-3" />
                                {campaign.totalSent} sent
                              </span>
                              <span className="flex items-center gap-1">
                                <CheckCircle className="size-3 text-emerald-400" />
                                {campaign.totalClaimed} claimed
                              </span>
                              <span className="flex items-center gap-1">
                                <DollarSign className="size-3" />
                                ${campaign.usdAmount} / {campaign.credits?.toLocaleString()} credits
                              </span>
                              <span className="flex items-center gap-1">
                                <Clock className="size-3" />
                                {new Date(campaign.createdAt).toLocaleDateString()}
                              </span>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
