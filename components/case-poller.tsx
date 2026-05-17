"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

/**
 * Polls the current route every `intervalMs` while the case is still
 * being processed. We use router.refresh() to re-fetch server data
 * without a full page reload.
 */
export function CasePoller({
  intervalMs = 5000,
  maxAttempts = 60,
}: {
  intervalMs?: number;
  maxAttempts?: number;
}) {
  const router = useRouter();

  useEffect(() => {
    let attempts = 0;
    const timer = setInterval(() => {
      attempts++;
      router.refresh();
      if (attempts >= maxAttempts) {
        clearInterval(timer);
      }
    }, intervalMs);
    return () => clearInterval(timer);
  }, [router, intervalMs, maxAttempts]);

  return null;
}
