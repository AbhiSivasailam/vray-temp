"use server";

import { kv } from "@vercel/kv";
import { SuccessData } from "../types";

export async function save(data: SuccessData) {
  const key = Math.random().toString(36).slice(2)
  const value = JSON.stringify(data)

  await kv.set(key, value)

  return { id: key }
}
