"use client";

import { useEffect, useState, useCallback } from "react";
import { usageApi } from "@/lib/api";

export function useUsage() {
  const [usage, setUsage] = useState(null);
  const [loading, setLoading] = useState(true);

  const reload = useCallback(async () => {
    setLoading(true);
    try {
      const data = await usageApi.summary();
      setUsage(data);
    } catch {
      setUsage(null);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    reload();
  }, [reload]);

  return { usage, loading, reload };
}
