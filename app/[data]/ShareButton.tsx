"use client";

import { type FetchSuccess } from "@/app/types";
import { save } from "./share-action";
import { useState } from "react";

export function ShareButton({ data }: { data: FetchSuccess }) {
  const [isLoading, setIsLoading] = useState(false);

  async function shareData() {
    if (!isLoading) {
      setIsLoading(true);
      try {
        const result = await save(data);
        const sharedUrl = `${window.location.origin}/shared/${result.id}`;
        await navigator.clipboard.writeText(sharedUrl).catch(console.error);
        window.location.href = sharedUrl;
      } finally {
        setIsLoading(false);
      }
    }
  }

  return (
    <button
      className="ml-2 permalink font-bold"
      onClick={shareData}
      type="button"
    >
      🔗 {isLoading ? "Saving link..." : "Get permalink"}
    </button>
  );
}
