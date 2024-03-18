"use server";

import { type FetchSuccess } from "@/app/types";
import { kv } from "@vercel/kv";

export async function save(data: FetchSuccess) {
  const key = Math.random().toString(36).slice(2);
  const value = JSON.stringify(data);
  await kv.set(key, value);
  return { id: key };
}
