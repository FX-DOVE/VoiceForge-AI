"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { ttsApi } from "@/lib/api";
import { mapGenerationToListItem } from "@/lib/format";

export function useGenerations(search = "") {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const itemsRef = useRef(items);
  itemsRef.current = items;

  const load = useCallback(async (silent = false) => {
    if (!silent) setLoading(true);
    else setIsRefreshing(true);

    try {
      const data = await ttsApi.history({ limit: 25, search });
      const mapped = (data.items || []).map(mapGenerationToListItem);
      setItems(mapped);
    } catch {
      if (!silent) setItems([]);
    } finally {
      if (!silent) setLoading(false);
      setIsRefreshing(false);
    }
  }, [search]);

  useEffect(() => {
    load();

    // Live polling: refresh every 6 seconds if there are active jobs
    const interval = setInterval(() => {
      const hasActive = itemsRef.current.some(
        (i) => i.rawStatus === "queued" || i.rawStatus === "processing"
      );
      if (hasActive) {
        load(true); // silent refresh
      }
    }, 6000);

    return () => clearInterval(interval);
  }, [load]);

  const remove = useCallback((id) => {
    setItems((prev) => prev.filter((item) => item.id !== id));
  }, []);

  return { items, loading, reload: load, remove, isRefreshing };
}
