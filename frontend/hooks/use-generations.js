"use client";

import { useCallback, useEffect, useState } from "react";
import { ttsApi } from "@/lib/api";
import { mapGenerationToListItem } from "@/lib/format";

export function useGenerations(search = "") {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const data = await ttsApi.history({ limit: 20, search });
      setItems((data.items || []).map(mapGenerationToListItem));
    } catch {
      setItems([]);
    } finally {
      setLoading(false);
    }
  }, [search]);

  useEffect(() => {
    load();
  }, [load]);

  return { items, loading, reload: load };
}
