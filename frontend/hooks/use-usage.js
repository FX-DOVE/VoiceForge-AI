"use client";

import { useEffect, useState } from "react";
import { usageApi } from "@/lib/api";

export function useUsage() {
  const [usage, setUsage] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    usageApi
      .summary()
      .then(setUsage)
      .catch(() => setUsage(null))
      .finally(() => setLoading(false));
  }, []);

  return { usage, loading };
}
