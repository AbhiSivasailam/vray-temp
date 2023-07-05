"use client";

import { useRouter } from "next/navigation";

export function Nav({ children }: { children: React.ReactNode }) {
  const router = useRouter();

  async function onInput(e: React.ChangeEvent<HTMLInputElement>) {
    router.replace("/" + encodeURIComponent(e.target.value));
  }

  return (
    <main className="flex min-h-screen flex-col items-center justify-between">
      <div className="w-screen">
        <input
          type="url"
          className="w-full rounded-none text-md dark:text-gray-100 dark:bg-gray-800 p-3 px-5 focus:outline-none"
          autoComplete="off"
          autoCorrect="off"
          autoCapitalize="off"
          autoFocus
          placeholder="rauchg.com"
          onInput={onInput}
        />
      </div>
      <div className="flex grow flex-col w-full h-full">{children}</div>
    </main>
  );
}
