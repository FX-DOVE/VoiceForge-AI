"use client";

import { useEffect, useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Wallet,
  CreditCard,
  DollarSign,
  Clock,
  Type,
  Activity,
  Key,
  AlertTriangle,
  Bell,
  BarChart3,
  Settings,
  Plus,
  Search,
  Download,
  MoreHorizontal,
  Check,
  X,
  ChevronDown,
  TrendingUp,
  TrendingDown,
  AlertCircle,
  RefreshCw,
} from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { grokApi } from "@/lib/api/grok";

// Tabs configuration
const TABS = [
  { id: "overview", label: "Overview", icon: Activity },
  { id: "funding", label: "Funding History", icon: CreditCard },
  { id: "usage", label: "Usage History", icon: BarChart3 },
  { id: "apikeys", label: "API Keys", icon: Key },
  { id: "alerts", label: "Alerts", icon: Bell },
  { id: "analytics", label: "Analytics", icon: BarChart3 },
  { id: "settings", label: "Settings", icon: Settings },
];

// Format currency
const formatCurrency = (value) => {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 2,
  }).format(value || 0);
};

// Format number
const formatNumber = (value) => {
  return new Intl.NumberFormat("en-US").format(value || 0);
};

// KPI Card Component
function KPICard({ title, value, icon: Icon, trend, trendValue, color = "primary" }) {
  const colorClasses = {
    primary: "from-blue-500/20 to-indigo-500/10 text-blue-400 border-blue-500/20",
    success: "from-emerald-500/20 to-green-500/10 text-emerald-400 border-emerald-500/20",
    warning: "from-amber-500/20 to-yellow-500/10 text-amber-400 border-amber-500/20",
    danger: "from-red-500/20 to-rose-500/10 text-red-400 border-red-500/20",
    purple: "from-purple-500/20 to-violet-500/10 text-purple-400 border-purple-500/20",
  };

  return (
    <div className={cn("glass-panel p-4 sm:p-5 rounded-2xl border bg-gradient-to-br", colorClasses[color])}>
      <div className="flex items-start justify-between">
        <div className="flex-1 min-w-0">
          <p className="text-xs sm:text-sm font-medium text-white/60 mb-1">{title}</p>
          <p className="text-xl sm:text-2xl font-bold text-white truncate">{value}</p>
          {trend && (
            <div className="flex items-center gap-1 mt-2">
              {trend === "up" ? (
                <TrendingUp className="size-3 text-emerald-400" />
              ) : (
                <TrendingDown className="size-3 text-red-400" />
              )}
              <span className={cn("text-xs", trend === "up" ? "text-emerald-400" : "text-red-400")}>
                {trendValue}
              </span>
            </div>
          )}
        </div>
        <div className="size-10 sm:size-12 rounded-xl bg-white/5 flex items-center justify-center shrink-0">
          <Icon className="size-5 sm:size-6 text-current" />
        </div>
      </div>
    </div>
  );
}

// Overview Tab
function OverviewTab({ stats, loading, onRefresh, onSyncXai, syncing }) {
  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <RefreshCw className="size-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* KPI Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        <KPICard
          title="Total Funds Added"
          value={formatCurrency(stats?.totalFundsAdded)}
          icon={Wallet}
          color="success"
        />
        <KPICard
          title="Total API Spend"
          value={formatCurrency(stats?.totalApiSpend)}
          icon={CreditCard}
          color="danger"
        />
        <KPICard
          title="Remaining Balance"
          value={formatCurrency(stats?.remainingBalance)}
          icon={DollarSign}
          color={stats?.remainingBalance < stats?.lowBalanceThreshold ? "warning" : "primary"}
        />
        <KPICard
          title="Est. Remaining Hours"
          value={`${formatNumber(stats?.estimatedRemainingHours)}h`}
          icon={Clock}
          color="purple"
        />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        <KPICard
          title="Total Characters"
          value={formatNumber(stats?.totalCharacters)}
          icon={Type}
          color="primary"
        />
        <KPICard
          title="Total API Requests"
          value={formatNumber(stats?.totalRequests)}
          icon={Activity}
          color="primary"
        />
        <KPICard
          title="Active API Keys"
          value={formatNumber(stats?.activeApiKeys)}
          icon={Key}
          color="success"
        />
        <KPICard
          title="Low Balance Alert"
          value={formatCurrency(stats?.lowBalanceThreshold)}
          icon={AlertTriangle}
          color="warning"
        />
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Financial Summary */}
        <div className="glass-panel p-5 rounded-2xl border border-white/5">
          <h3 className="text-sm font-semibold text-white mb-4">Financial Summary</h3>
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-sm text-white/60">Total Revenue</span>
              <span className="text-sm font-semibold text-emerald-400">{formatCurrency(stats?.totalRevenue)}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-white/60">API Spend</span>
              <span className="text-sm font-semibold text-red-400">{formatCurrency(stats?.totalApiSpend)}</span>
            </div>
            <div className="h-px bg-white/5" />
            <div className="flex justify-between items-center">
              <span className="text-sm font-medium text-white">Gross Profit</span>
              <span className={cn("text-sm font-bold", stats?.grossProfit >= 0 ? "text-emerald-400" : "text-red-400")}>
                {formatCurrency(stats?.grossProfit)}
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-white/60">Current Month Usage</span>
              <span className="text-sm font-semibold text-white">{formatCurrency(stats?.currentMonthUsage)}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-white/60">Today's Usage</span>
              <span className="text-sm font-semibold text-white">{formatCurrency(stats?.todayUsage)}</span>
            </div>
          </div>
        </div>

        {/* Balance Status */}
        <div className="glass-panel p-5 rounded-2xl border border-white/5">
          <h3 className="text-sm font-semibold text-white mb-4">Balance Status</h3>
          <div className="space-y-4">
            <div>
              <div className="flex justify-between items-center mb-2">
                <span className="text-sm text-white/60">Remaining Balance</span>
                <span className={cn(
                  "text-sm font-bold",
                  stats?.remainingBalance < stats?.lowBalanceThreshold ? "text-amber-400" : "text-emerald-400"
                )}>
                  {formatCurrency(stats?.remainingBalance)}
                </span>
              </div>
              <div className="h-2 bg-white/10 rounded-full overflow-hidden">
                <div
                  className={cn(
                    "h-full rounded-full transition-all",
                    stats?.remainingBalance < stats?.lowBalanceThreshold ? "bg-amber-500" : "bg-emerald-500"
                  )}
                  style={{
                    width: `${Math.min(100, (stats?.remainingBalance / (stats?.totalFundsAdded || 1)) * 100)}%`,
                  }}
                />
              </div>
            </div>
            
            <div className="flex justify-between items-center">
              <span className="text-sm text-white/60">Auto-pause at Zero</span>
              <span className={cn("text-xs px-2 py-1 rounded-full font-medium", stats?.autoPauseAtZero ? "bg-emerald-500/20 text-emerald-400" : "bg-red-500/20 text-red-400")}>
                {stats?.autoPauseAtZero ? "Enabled" : "Disabled"}
              </span>
            </div>
            
            <div className="flex justify-between items-center">
              <span className="text-sm text-white/60">Unread Alerts</span>
              <span className="text-sm font-bold text-amber-400">{stats?.unreadAlerts || 0}</span>
            </div>
            
            <div className="flex justify-between items-center">
              <span className="text-sm text-white/60">Cost per TTS Hour</span>
              <span className="text-sm font-semibold text-white">{formatCurrency(stats?.ttsCostPerHour)}</span>
            </div>

            {/* xAI API Status */}
            <div className="h-px bg-white/5 my-2" />
            <div className="flex justify-between items-center">
              <span className="text-sm text-white/60">xAI API Status</span>
              <span className={cn("text-xs px-2 py-1 rounded-full font-medium",
                stats?.xaiApiStatus?.available 
                  ? stats?.xaiApiStatus?.status === "depleted" 
                    ? "bg-red-500/20 text-red-400" 
                    : "bg-emerald-500/20 text-emerald-400"
                  : "bg-amber-500/20 text-amber-400"
              )}>
                {stats?.xaiApiStatus?.available 
                  ? stats?.xaiApiStatus?.status === "active" ? "Active" : "Depleted"
                  : "Not Configured"
                }
              </span>
            </div>
            {stats?.xaiApiStatus?.message && (
              <p className="text-xs text-white/40 mt-1">{stats.xaiApiStatus.message}</p>
            )}
          </div>
        </div>

        {/* Quick Actions */}
        <div className="glass-panel p-5 rounded-2xl border border-white/5">
          <h3 className="text-sm font-semibold text-white mb-4">Quick Actions</h3>
          <div className="space-y-2">
            <Button
              onClick={onRefresh}
              variant="outline"
              className="w-full justify-start h-11 rounded-xl border-white/10 hover:bg-white/5"
            >
              <RefreshCw className="size-4 mr-3" />
              Refresh Data
            </Button>
            <Button
              variant="outline"
              className="w-full justify-start h-11 rounded-xl border-white/10 hover:bg-white/5"
              onClick={() => toast.info("Check Balance triggered")}
            >
              <AlertCircle className="size-4 mr-3" />
              Check Balance
            </Button>
            <Button
              variant="outline"
              className="w-full justify-start h-11 rounded-xl border-primary/20 hover:bg-primary/5 text-primary"
              onClick={onSyncXai}
              disabled={syncing}
            >
              {syncing ? <RefreshCw className="size-4 mr-3 animate-spin" /> : <RefreshCw className="size-4 mr-3" />}
              Sync with xAI
            </Button>
          </div>
          {stats?.xaiBalance !== undefined && (
            <div className="mt-3 pt-3 border-t border-white/5">
              <p className="text-xs text-white/50 mb-1">Real xAI Balance</p>
              <p className="text-lg font-bold text-emerald-400">{formatCurrency(stats.xaiBalance)}</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// Funding History Tab
function FundingTab({ fundings, loading, onAddFunding, onRefresh }) {
  const [search, setSearch] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [formData, setFormData] = useState({
    amount: "",
    date: new Date().toISOString().split("T")[0],
    paymentMethod: "credit_card",
    referenceNumber: "",
    notes: "",
  });

  const filteredFundings = fundings?.filter((f) =>
    f.referenceNumber?.toLowerCase().includes(search.toLowerCase()) ||
    f.notes?.toLowerCase().includes(search.toLowerCase()) ||
    f.paymentMethod?.toLowerCase().includes(search.toLowerCase())
  );

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await onAddFunding({
        ...formData,
        amount: parseFloat(formData.amount),
        date: new Date(formData.date),
      });
      setShowModal(false);
      setFormData({
        amount: "",
        date: new Date().toISOString().split("T")[0],
        paymentMethod: "credit_card",
        referenceNumber: "",
        notes: "",
      });
    } catch (err) {
      toast.error(err.message || "Failed to add funding");
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <RefreshCw className="size-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Toolbar */}
      <div className="flex flex-col sm:flex-row gap-3 sm:items-center sm:justify-between">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-white/40" />
          <Input
            placeholder="Search funding records..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-10 h-11 bg-white/5 border-white/10 rounded-xl"
          />
        </div>
        <div className="flex gap-2">
          <Button onClick={onRefresh} variant="outline" size="sm" className="h-11 rounded-xl border-white/10">
            <RefreshCw className="size-4" />
          </Button>
          <Button onClick={() => setShowModal(true)} className="h-11 rounded-xl bg-primary hover:bg-primary/90">
            <Plus className="size-4 mr-2" />
            Add Funds
          </Button>
        </div>
      </div>

      {/* Table */}
      <div className="glass-panel rounded-2xl border border-white/5 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-white/5 bg-white/[0.02]">
                <th className="text-left px-4 py-3 text-xs font-semibold text-white/60 uppercase">Date</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-white/60 uppercase">Amount</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-white/60 uppercase">Method</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-white/60 uppercase">Reference</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-white/60 uppercase">Notes</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-white/60 uppercase">Status</th>
              </tr>
            </thead>
            <tbody>
              {filteredFundings?.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-4 py-8 text-center text-white/40">
                    No funding records found
                  </td>
                </tr>
              ) : (
                filteredFundings?.map((funding) => (
                  <tr key={funding._id} className="border-b border-white/5 hover:bg-white/[0.02]">
                    <td className="px-4 py-3 text-sm text-white">
                      {new Date(funding.date).toLocaleDateString()}
                    </td>
                    <td className="px-4 py-3 text-sm font-semibold text-emerald-400">
                      {formatCurrency(funding.amount)}
                    </td>
                    <td className="px-4 py-3 text-sm text-white/80 capitalize">
                      {funding.paymentMethod?.replace("_", " ")}
                    </td>
                    <td className="px-4 py-3 text-sm text-white/60 font-mono">
                      {funding.referenceNumber || "-"}
                    </td>
                    <td className="px-4 py-3 text-sm text-white/60 max-w-xs truncate">
                      {funding.notes || "-"}
                    </td>
                    <td className="px-4 py-3">
                      <span className={cn(
                        "text-xs px-2 py-1 rounded-full font-medium",
                        funding.status === "completed" ? "bg-emerald-500/20 text-emerald-400" :
                        funding.status === "pending" ? "bg-amber-500/20 text-amber-400" :
                        "bg-red-500/20 text-red-400"
                      )}>
                        {funding.status}
                      </span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add Funds Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="glass-panel w-full max-w-md rounded-2xl border border-white/10 p-6"
          >
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-lg font-bold text-white">Add Funds</h2>
              <button onClick={() => setShowModal(false)} className="text-white/40 hover:text-white">
                <X className="size-5" />
              </button>
            </div>
            
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="text-sm font-medium text-white/80 mb-1.5 block">Amount (USD)</label>
                <Input
                  type="number"
                  step="0.01"
                  min="0.01"
                  required
                  value={formData.amount}
                  onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                  className="h-11 bg-white/5 border-white/10 rounded-xl"
                  placeholder="0.00"
                />
              </div>
              
              <div>
                <label className="text-sm font-medium text-white/80 mb-1.5 block">Date</label>
                <Input
                  type="date"
                  required
                  value={formData.date}
                  onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                  className="h-11 bg-white/5 border-white/10 rounded-xl"
                />
              </div>
              
              <div>
                <label className="text-sm font-medium text-white/80 mb-1.5 block">Payment Method</label>
                <select
                  value={formData.paymentMethod}
                  onChange={(e) => setFormData({ ...formData, paymentMethod: e.target.value })}
                  className="w-full h-11 px-3 rounded-xl bg-white/5 border border-white/10 text-white focus:outline-none focus:ring-2 focus:ring-primary/50"
                >
                  <option value="credit_card">Credit Card</option>
                  <option value="bank_transfer">Bank Transfer</option>
                  <option value="crypto">Cryptocurrency</option>
                  <option value="paypal">PayPal</option>
                  <option value="other">Other</option>
                </select>
              </div>
              
              <div>
                <label className="text-sm font-medium text-white/80 mb-1.5 block">Reference Number</label>
                <Input
                  value={formData.referenceNumber}
                  onChange={(e) => setFormData({ ...formData, referenceNumber: e.target.value })}
                  className="h-11 bg-white/5 border-white/10 rounded-xl"
                  placeholder="Optional"
                />
              </div>
              
              <div>
                <label className="text-sm font-medium text-white/80 mb-1.5 block">Notes</label>
                <Input
                  value={formData.notes}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                  className="h-11 bg-white/5 border-white/10 rounded-xl"
                  placeholder="Optional"
                />
              </div>
              
              <div className="flex gap-3 pt-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setShowModal(false)}
                  className="flex-1 h-11 rounded-xl border-white/10"
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  className="flex-1 h-11 rounded-xl bg-primary hover:bg-primary/90"
                >
                  Add Funds
                </Button>
              </div>
            </form>
          </motion.div>
        </div>
      )}
    </div>
  );
}

// Simple placeholder for other tabs
function PlaceholderTab({ title }) {
  return (
    <div className="flex flex-col items-center justify-center py-20 text-center">
      <div className="size-16 rounded-2xl bg-primary/10 flex items-center justify-center mb-4">
        <Activity className="size-8 text-primary/60" />
      </div>
      <h3 className="text-lg font-semibold text-white mb-2">{title}</h3>
      <p className="text-sm text-white/40 max-w-md">
        This section is under development. Check back soon for updates.
      </p>
    </div>
  );
}

// Main Page Component
export default function GrokManagementPage() {
  const [activeTab, setActiveTab] = useState("overview");
  const [loading, setLoading] = useState(true);
  const [syncing, setSyncing] = useState(false);
  const [stats, setStats] = useState(null);
  const [fundings, setFundings] = useState([]);

  const fetchDashboardStats = useCallback(async () => {
    try {
      setLoading(true);
      const data = await grokApi.getDashboardStats();
      setStats(data);
    } catch (err) {
      toast.error(err.message || "Failed to fetch dashboard stats");
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchFundings = useCallback(async () => {
    try {
      const data = await grokApi.listFundings();
      setFundings(data.fundings || []);
    } catch (err) {
      toast.error(err.message || "Failed to fetch funding history");
    }
  }, []);

  const handleSyncXai = useCallback(async () => {
    try {
      setSyncing(true);
      const result = await grokApi.syncXaiBilling();
      toast.success(`Synced with xAI! Balance: ${formatCurrency(result.xaiBalance)}`);
      if (result.adjustment !== 0) {
        toast.info(`Adjustment made: ${formatCurrency(result.adjustment)}`);
      }
      await fetchDashboardStats();
      await fetchFundings();
    } catch (err) {
      toast.error(err.message || "Failed to sync with xAI");
    } finally {
      setSyncing(false);
    }
  }, [fetchDashboardStats, fetchFundings]);

  const handleAddFunding = async (data) => {
    await grokApi.addFunding(data);
    toast.success("Funding added successfully");
    await fetchFundings();
    await fetchDashboardStats();
  };

  useEffect(() => {
    fetchDashboardStats();
    fetchFundings();
  }, [fetchDashboardStats, fetchFundings]);

  const renderTab = () => {
    switch (activeTab) {
      case "overview":
        return <OverviewTab stats={stats} loading={loading} onRefresh={fetchDashboardStats} onSyncXai={handleSyncXai} syncing={syncing} />;
      case "funding":
        return <FundingTab fundings={fundings} loading={loading} onAddFunding={handleAddFunding} onRefresh={fetchFundings} />;
      case "usage":
        return <PlaceholderTab title="Usage History" />;
      case "apikeys":
        return <PlaceholderTab title="API Keys Management" />;
      case "alerts":
        return <PlaceholderTab title="Alerts & Notifications" />;
      case "analytics":
        return <PlaceholderTab title="Analytics & Reports" />;
      case "settings":
        return <PlaceholderTab title="Grok Settings" />;
      default:
        return <OverviewTab stats={stats} loading={loading} onRefresh={fetchDashboardStats} onSyncXai={handleSyncXai} syncing={syncing} />;
    }
  };

  return (
    <div className="h-full flex flex-col overflow-hidden bg-background">
      {/* Header */}
      <header className="shrink-0 px-4 sm:px-6 py-4 border-b border-white/5">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="size-10 rounded-xl bg-primary/10 flex items-center justify-center">
              <Wallet className="size-5 text-primary" />
            </div>
            <div>
              <h1 className="text-lg sm:text-xl font-bold text-white">Grok Management</h1>
              <p className="text-xs sm:text-sm text-white/50">Monitor xAI API funding, usage, and spending</p>
            </div>
          </div>
          <div className="flex items-center gap-2 sm:gap-3">
            <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-lg bg-white/5 border border-white/10">
              <span className="text-xs text-white/60">Balance:</span>
              <span className={cn(
                "text-sm font-bold",
                stats?.remainingBalance < stats?.lowBalanceThreshold ? "text-amber-400" : "text-emerald-400"
              )}>
                {formatCurrency(stats?.remainingBalance)}
              </span>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={fetchDashboardStats}
              className="h-9 rounded-lg border-white/10 hover:bg-white/5"
            >
              <RefreshCw className="size-4" />
            </Button>
          </div>
        </div>
      </header>

      {/* Tabs */}
      <div className="shrink-0 px-4 sm:px-6 py-3 border-b border-white/5 overflow-x-auto">
        <div className="flex gap-1 min-w-max">
          {TABS.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={cn(
                  "flex items-center gap-2 px-3 sm:px-4 py-2 rounded-xl text-xs sm:text-sm font-medium transition-all whitespace-nowrap",
                  isActive
                    ? "bg-primary/10 text-primary ring-1 ring-primary/20"
                    : "text-white/60 hover:text-white hover:bg-white/5"
                )}
              >
                <Icon className="size-4" />
                <span className="hidden sm:inline">{tab.label}</span>
                <span className="sm:hidden">{tab.label.split(" ")[0]}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto px-4 sm:px-6 py-4 sm:py-6">
        <AnimatePresence mode="wait">
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2 }}
          >
            {renderTab()}
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
}
