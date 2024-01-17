"use client";

import { useState } from "react";
import { SuccessData } from "../types";
import { save } from "./share-action";

export function ShareButton({ data }: { data: SuccessData }) {
  const [isLoading, setIsLoading] = useState(false)

  async function shareData() {
    if (isLoading) return

    setIsLoading(true)
    const result = await save(data)

    const sharedUrl = `${window.location.origin}/shared/${result.id}`
    await navigator.clipboard.writeText(sharedUrl)
    window.location.href = sharedUrl
    setIsLoading(false)
  }

  return (
    <button type="button" onClick={shareData} className="hover:animate-none font-bold text-transparent bg-clip-text bg-gradient-to-br from-purple-500 to-cyan-500 animate-pulse">
      🔗 {isLoading ? 'Saving link...' : 'Get request permalink'}
    </button>
  )
}
