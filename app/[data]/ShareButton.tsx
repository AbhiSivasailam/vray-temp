"use client";

import { useState } from "react";
import { SuccessData } from "../types";
import { save } from "./share-action";

export function ShareButton({ data }: { data: SuccessData }) {
  const [isLoading, setIsLoading] = useState(false)

  async function shareData() {
    if (isLoading) return

    setIsLoading(true)
    try {
      const result = await save(data)
      const sharedUrl = `${window.location.origin}/shared/${result.id}`
      await navigator.clipboard.writeText(sharedUrl).catch(console.error)
      window.location.href = sharedUrl
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <button type="button" onClick={shareData} className="permalink font-bold">
      🔗 {isLoading ? 'Saving link...' : 'Get permalink'}
    </button>
  )
}
