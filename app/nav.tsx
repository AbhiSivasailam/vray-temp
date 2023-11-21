"use client";

import Link from "next/link";
import { useRouter, usePathname, useSearchParams } from "next/navigation";

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

  async function onInput(e: React.ChangeEvent<HTMLInputElement>) {
    router.replace(`/${encodeURIComponent(e.target.value)}${isTimingOnly ? '?timing=true' : ''}`);
  }

  return (
    <main className="flex min-h-screen flex-col items-center justify-between">
      <div className="w-screen">
        <div className="w-full items-center whitespace-nowrap text-md border-b border-gray-200 dark:border-neutral-700 flex">
          <NavLink href="/" selected={!isTimingOnly}>Get headers</NavLink>
          <NavLink href="/?timing=true" selected={isTimingOnly}>Analyze Server Timing</NavLink>
          <form className="w-full border-l border-gray-200 dark:border-neutral-700">
            <input
              type="url"
              className="w-full rounded-none dark:text-gray-100 dark:bg-black p-5 focus:outline-none placeholder-neutral-400"
              autoComplete="off"
              autoCorrect="off"
              autoCapitalize="off"
              autoFocus
              placeholder={isTimingOnly ? 'terminator_rt;dur=170,terminator_conn;dur=0,terminator_dial;dur=0,terminator_whdr;dur=0,terminator_wreq;dur=0,cert_fetch;dur=0,seawall_rt;dur=1,seawall_conn;dur=0,seawall_wreq;dur=0,seawall_vf;dur=0,seawall_pre;dur=0,seawall_tx;dur=0,seawall_p1;dur=0,seawall_p2;dur=0,cache-data_hostname;desc=cache-data_hostname_0+1;dur=1,http;desc=http_0+0_1+0_2+57_60+110;dur=167,process-data_hostname;desc=process-data_hostname_1+0;dur=0,wdns;desc=wdns_2+0;dur=0,wtcp;desc=wtcp_2+0;dur=0,whttp;desc=whttp_3+56;dur=56,middleware;desc=middleware_2+58;dur=58,cache-build_outputs;desc=cache-build_outputs_60+0;dur=0,router;desc=router_2+58;dur=58,cache-requests;desc=cache-requests_60+108;dur=108,redis-requests;desc=redis-requests_60+0;dur=0,edgemwhttp;dur=55;hot=0;ehot=0;pod="98db86749-mq2lm";reusedconn=0,edgemwtcp;dur=0,edgemwtls;dur=3' : 'rauchg.com'}
              defaultValue={decodeURIComponent(pathname.slice(1))}
              onInput={onInput}
            />
          </form>
        </div>
      </div>
      <div className="flex grow flex-col h-full w-full">{children}</div>
    </main>
  );
}
