"use client";

import { useRouter, usePathname } from "next/navigation";

export function Nav({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();

  async function onInput(e: React.ChangeEvent<HTMLInputElement>) {
    router.replace("/" + encodeURIComponent(e.target.value));
  }

  return (
    <main className="flex min-h-screen flex-col items-center justify-between">
      <div className="w-screen">
        <form>
          <input
            type="url"
            className="w-full rounded-none text-md dark:text-gray-100 dark:bg-black p-5 focus:outline-none border-b border-gray-200 dark:border-neutral-700 placeholder-neutral-400"
            autoComplete="off"
            autoCorrect="off"
            autoCapitalize="off"
            autoFocus
            placeholder="rauchg.com"
            defaultValue={decodeURIComponent(pathname.slice(1))}
            onInput={onInput}
          />
        </form>
      </div>
      <div className="flex grow flex-col w-full h-full w-full">{children}</div>
    </main>
  );
}
