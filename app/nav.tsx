"use client";

import Link from "next/link";
import { useRouter, usePathname, useSearchParams } from "next/navigation";
import { useEffect, useRef } from "react";

function NavLink({ href, selected, children }: { href: string; selected: boolean; children: React.ReactNode }) {
  return (
    <Link href={href} className={`p-5 ${selected ? 'dark:text-gray-100' : 'text-neutral-400'}`}>
      {children}
    </Link>
  )
}

export function Nav({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const isTimingOnly = !!useSearchParams().get("timing");
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const input = inputRef.current;

    return () => {
      if (input) {
        input.value = ''
      }
    }
  }, [isTimingOnly])

  async function onInput(e: React.ChangeEvent<HTMLInputElement>) {
    const data = e.target.value;

    // Redirect to the shared link page
    if (data.startsWith('shared/')) {
      router.replace(`/${data}`);
    } else {
      router.replace(`/${encodeURIComponent(data)}${isTimingOnly ? '?timing=true' : ''}`);
    }
  }

  return (
    <main className="flex min-h-screen flex-col items-center justify-between">
      <div className="w-full items-center whitespace-nowrap text-md border-b border-gray-200 dark:border-neutral-700 flex flex-wrap md:flex-nowrap">
        <NavLink href="/" selected={!isTimingOnly}>Get headers</NavLink>
        <NavLink href="/?timing=true" selected={isTimingOnly}>Analyze Server Timing</NavLink>
        <form className="w-full border-t md:border-l md:border-t-transparent border-gray-200 dark:border-neutral-700">
          <input
            className="w-full rounded-none dark:text-gray-100 dark:bg-black p-5 focus:outline-none placeholder-neutral-400"
            autoComplete="off"
            autoCorrect="off"
            autoCapitalize="off"
            autoFocus
            placeholder={isTimingOnly ? 'terminator_rt;dur=170,terminator_conn;dur=0,terminator_dial;dur=0,terminator_whdr;dur=0...' : 'rauchg.com'}
            defaultValue={decodeURIComponent(pathname.slice(1))}
            onInput={onInput}
            ref={inputRef}
          />
        </form>
      </div>
      <div className="flex grow flex-col h-full w-full">{children}</div>
    </main>
  );
}
