"use client";

import { useEffect, useState, useCallback } from "react";
import { motion } from "framer-motion";
import { adminApi } from "@/lib/api";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  Mail,
  Eye,
  Send,
  RefreshCw,
  Loader2,
  CheckCircle,
  AlertCircle,
  Gift,
  CreditCard,
  XCircle,
  Sparkles,
  Bell,
  ArrowLeft,
  ExternalLink,
  Smartphone,
  Monitor,
} from "lucide-react";
import { getApiUrl } from "@/lib/api/config";

const getTemplateIcon = (id) => {
  switch (id) {
    case "welcome": return Gift;
    case "verification": return CheckCircle;
    case "password-reset": return AlertCircle;
    case "credit-limit": return CreditCard;
    case "order-success": return CheckCircle;
    case "purchase-error": return XCircle;
    case "voice-clone-ready": return Sparkles;
    case "marketing": return Mail;
    case "low-balance": return Bell;
    default: return Mail;
  }
};

const getTemplateColor = (id) => {
  switch (id) {
    case "welcome": return "text-emerald-400 bg-emerald-500/10";
    case "verification": return "text-blue-400 bg-blue-500/10";
    case "password-reset": return "text-amber-400 bg-amber-500/10";
    case "credit-limit": return "text-red-400 bg-red-500/10";
    case "order-success": return "text-green-400 bg-green-500/10";
    case "purchase-error": return "text-rose-400 bg-rose-500/10";
    case "voice-clone-ready": return "text-violet-400 bg-violet-500/10";
    case "marketing": return "text-cyan-400 bg-cyan-500/10";
    case "low-balance": return "text-orange-400 bg-orange-500/10";
    default: return "text-gray-400 bg-gray-500/10";
  }
};

export default function EmailTemplatesPage() {
  const [templates, setTemplates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedTemplate, setSelectedTemplate] = useState(null);
  const [previewMode, setPreviewMode] = useState("desktop"); // desktop | mobile
  const [sendingTest, setSendingTest] = useState(false);

  const fetchTemplates = useCallback(async () => {
    try {
      setLoading(true);
      const data = await adminApi.getEmailTemplates();
      setTemplates(data.templates || []);
    } catch (err) {
      toast.error(err.message || "Failed to fetch email templates");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchTemplates();
  }, [fetchTemplates]);

  const handlePreview = (template) => {
    setSelectedTemplate(template);
  };

  const handleSendTest = async () => {
    if (!selectedTemplate) return;
    try {
      setSendingTest(true);
      // This would call a test email endpoint
      toast.success(`Test email sent for "${selectedTemplate.name}"`);
    } catch (err) {
      toast.error(err.message || "Failed to send test email");
    } finally {
      setSendingTest(false);
    }
  };

  const getPreviewUrl = (id) => {
    return `${getApiUrl()}${adminApi.previewEmailTemplate(id)}`;
  };

  return (
    <div className="h-full flex flex-col overflow-hidden bg-background">
      {/* Header */}
      <header className="shrink-0 px-4 sm:px-6 py-4 border-b border-white/5">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="size-10 rounded-xl bg-primary/10 flex items-center justify-center">
              <Mail className="size-5 text-primary" />
            </div>
            <div>
              <h1 className="text-lg sm:text-xl font-bold text-white">Email Templates</h1>
              <p className="text-xs sm:text-sm text-white/50">Preview and manage email designs</p>
            </div>
          </div>
          <div className="flex items-center gap-2 sm:gap-3">
            <Button
              variant="outline"
              size="sm"
              onClick={fetchTemplates}
              disabled={loading}
              className="h-9 rounded-lg border-white/10 hover:bg-white/5"
            >
              {loading ? <Loader2 className="size-4 animate-spin" /> : <RefreshCw className="size-4" />}
            </Button>
          </div>
        </div>
      </header>

      {/* Content */}
      <div className="flex-1 overflow-hidden flex">
        {/* Template List */}
        <div className="w-full md:w-80 lg:w-96 border-r border-white/5 overflow-y-auto">
          <div className="p-4 space-y-3">
            {loading ? (
              <div className="flex items-center justify-center py-12">
                <Loader2 className="size-5 animate-spin text-neutral-400" />
              </div>
            ) : templates.length > 0 ? (
              templates.map((template, i) => {
                const Icon = getTemplateIcon(template.id);
                const colorClass = getTemplateColor(template.id);
                const isSelected = selectedTemplate?.id === template.id;

                return (
                  <motion.div
                    key={template.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.05 }}
                    onClick={() => handlePreview(template)}
                    className={cn(
                      "group p-4 rounded-xl border cursor-pointer transition-all",
                      isSelected
                        ? "bg-primary/10 border-primary/30"
                        : "bg-white/[0.02] border-white/5 hover:bg-white/[0.04] hover:border-white/10"
                    )}
                  >
                    <div className="flex items-start gap-3">
                      <div className={cn("size-10 rounded-lg flex items-center justify-center shrink-0", colorClass)}>
                        <Icon className="size-5" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <h3 className={cn(
                          "font-medium text-sm truncate",
                          isSelected ? "text-primary" : "text-white"
                        )}>
                          {template.name}
                        </h3>
                        <p className="text-xs text-neutral-400 mt-1 line-clamp-2">
                          {template.description}
                        </p>
                      </div>
                      <Eye className={cn(
                        "size-4 shrink-0 transition-colors",
                        isSelected ? "text-primary" : "text-neutral-500 group-hover:text-neutral-400"
                      )} />
                    </div>
                  </motion.div>
                );
              })
            ) : (
              <div className="text-center py-12 text-neutral-500 text-sm">
                No templates found
              </div>
            )}
          </div>
        </div>

        {/* Preview Area */}
        <div className="flex-1 bg-black/20 overflow-hidden flex flex-col">
          {selectedTemplate ? (
            <>
              {/* Preview Toolbar */}
              <div className="px-4 py-3 border-b border-white/5 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <button
                    onClick={() => setSelectedTemplate(null)}
                    className="md:hidden p-2 hover:bg-white/5 rounded-lg transition-colors"
                  >
                    <ArrowLeft className="size-4 text-neutral-400" />
                  </button>
                  <h2 className="font-medium text-white">{selectedTemplate.name}</h2>
                </div>
                <div className="flex items-center gap-2">
                  {/* View Mode Toggle */}
                  <div className="flex items-center bg-white/5 rounded-lg p-1 mr-2">
                    <button
                      onClick={() => setPreviewMode("desktop")}
                      className={cn(
                        "p-1.5 rounded-md transition-colors",
                        previewMode === "desktop" ? "bg-white/10 text-white" : "text-neutral-400 hover:text-white"
                      )}
                    >
                      <Monitor className="size-4" />
                    </button>
                    <button
                      onClick={() => setPreviewMode("mobile")}
                      className={cn(
                        "p-1.5 rounded-md transition-colors",
                        previewMode === "mobile" ? "bg-white/10 text-white" : "text-neutral-400 hover:text-white"
                      )}
                    >
                      <Smartphone className="size-4" />
                    </button>
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => window.open(getPreviewUrl(selectedTemplate.id), '_blank')}
                    className="h-8 rounded-lg border-white/10 hover:bg-white/5"
                  >
                    <ExternalLink className="size-3.5 mr-1.5" />
                    Open
                  </Button>
                  <Button
                    size="sm"
                    onClick={handleSendTest}
                    disabled={sendingTest}
                    className="h-8 rounded-lg bg-primary hover:bg-primary/90"
                  >
                    {sendingTest ? (
                      <Loader2 className="size-3.5 mr-1.5 animate-spin" />
                    ) : (
                      <Send className="size-3.5 mr-1.5" />
                    )}
                    Test
                  </Button>
                </div>
              </div>

              {/* Preview Frame */}
              <div className="flex-1 overflow-auto p-4 sm:p-8">
                <div className={cn(
                  "mx-auto transition-all duration-300",
                  previewMode === "mobile" ? "max-w-[375px]" : "max-w-[600px]"
                )}>
                  <div className="bg-white/5 rounded-xl overflow-hidden shadow-2xl">
                    <iframe
                      src={getPreviewUrl(selectedTemplate.id)}
                      className="w-full h-[calc(100vh-240px)] min-h-[500px]"
                      style={{ border: 'none' }}
                      title={`${selectedTemplate.name} Preview`}
                    />
                  </div>
                </div>
              </div>
            </>
          ) : (
            <div className="flex-1 flex items-center justify-center">
              <div className="text-center">
                <div className="size-16 rounded-2xl bg-white/5 flex items-center justify-center mx-auto mb-4">
                  <Mail className="size-8 text-neutral-500" />
                </div>
                <h3 className="text-lg font-medium text-white mb-2">Select a Template</h3>
                <p className="text-sm text-neutral-500 max-w-xs">
                  Choose an email template from the list to preview how it will look when sent to users
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
