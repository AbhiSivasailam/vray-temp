export const dynamic = "force-dynamic";
export const runtime = "edge";
import { Suspense } from "react";
import { ErrorBoundary } from "react-error-boundary";

const toPercent = (partial: number, total: number) => `${Math.round((partial / total) * 100)}%`;

export default function URLPage({
  params: { data },
  searchParams: { timing },
}: {
  params: { data: string };
  searchParams: { timing?: string },
}) {
  const isTimingOnly = !!timing
  const parsedData = decodeURIComponent(data);

  return (
    <div className="flex w-full h-full p-5 self-stretch grow flex-col">
      <Suspense
        key={parsedData}
        fallback={
          <div className="grow flex justify-center items-center">
            <svg aria-hidden="true" className="w-8 h-8 mr-2 text-neutral-200 animate-spin dark:text-neutral-600 fill-white" viewBox="0 0 100 101" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M100 50.5908C100 78.2051 77.6142 100.591 50 100.591C22.3858 100.591 0 78.2051 0 50.5908C0 22.9766 22.3858 0.59082 50 0.59082C77.6142 0.59082 100 22.9766 100 50.5908ZM9.08144 50.5908C9.08144 73.1895 27.4013 91.5094 50 91.5094C72.5987 91.5094 90.9186 73.1895 90.9186 50.5908C90.9186 27.9921 72.5987 9.67226 50 9.67226C27.4013 9.67226 9.08144 27.9921 9.08144 50.5908Z" fill="currentColor" />
              <path d="M93.9676 39.0409C96.393 38.4038 97.8624 35.9116 97.0079 33.5539C95.2932 28.8227 92.871 24.3692 89.8167 20.348C85.8452 15.1192 80.8826 10.7238 75.2124 7.41289C69.5422 4.10194 63.2754 1.94025 56.7698 1.05124C51.7666 0.367541 46.6976 0.446843 41.7345 1.27873C39.2613 1.69328 37.813 4.19778 38.4501 6.62326C39.0873 9.04874 41.5694 10.4717 44.0505 10.1071C47.8511 9.54855 51.7191 9.52689 55.5402 10.0491C60.8642 10.7766 65.9928 12.5457 70.6331 15.2552C75.2735 17.9648 79.3347 21.5619 82.5849 25.841C84.9175 28.9121 86.7997 32.2913 88.1811 35.8758C89.083 38.2158 91.5421 39.6781 93.9676 39.0409Z" fill="currentFill" />
            </svg>
          </div>
        }
      >
        {isTimingOnly ? (
          <ServerTiming data={parsedData} />
        ) : (
          <Search url={parsedData} />
        )}
      </Suspense>
    </div>
  );
}

async function Search({ url }: { url: string }) {
  const apiUrl = new URL(
    process.env.VERCEL_URL
      ? `https://${process.env.VERCEL_URL}`
      : "http://localhost:3000"
  );
  apiUrl.pathname = "/request";
  apiUrl.searchParams.set("url", decodeURIComponent(url));
  const res = await (
    await fetch(apiUrl, {
      cache: "no-store",
      redirect: "manual",
      headers: {
        'x-vercel-protection-bypass': process.env.DEPLOYMENT_PROTECTION_BYPASS ?? '',
      },
    })
  ).json();

  if (res.error) {
    return (
      <div
        className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative dark:bg-red-900 dark:border-red-700 dark:text-red-100"
        role="alert"
      >
        <p>
          <b>Error</b> fetching{" "}
          <code
            className="text-sm bg-red-200 dark:bg-red-600 dark:text-gray-200 px-1 py-0.5 rounded
            "
          >
            {url}
          </code>
          : {res.error}
        </p>
      </div>
    );
  }

  return (
    <>
      <div className="text-sm font-mono pb-8 text-gray-600 dark:text-gray-400">
        {res.coldStart ? "🥶" : "🌶️"} Response: {res.totalTime}ms • Headers: {res.headerTime}ms ({toPercent(res.headerTime, res.totalTime)})  • Body: {res.bodyTime}ms ({toPercent(res.bodyTime, res.totalTime)}) • Status: {res.status}
      </div>

      <div className="text-md md:text-base grid grid-cols-1 md:grid-cols-[auto,1fr] gap-x-6 max-w-full font-mono">
        {res.headers.map((item: any, i: number) => {
          return (
            <>
              <div className="whitespace-nowrap font-semibold text-black dark:text-white" key={`h-${i}`}>
                {item[0]}
              </div>
              <div className="pr-3 break-words mb-3" key={`v-${i}`}>
                {item[0].toLowerCase() === "server-timing" ? (
                  <ServerTiming data={item[1]} />
                ) : (
                  item[1]
                )}
              </div>
            </>
          );
        })}
      </div>
    </>
  );
}

const COLORS = [
  "bg-green-200 dark:bg-green-500",
  "bg-yellow-200 dark:bg-yellow-500",
  "bg-red-200 dark:bg-red-500",
  "bg-purple-200 dark:bg-purple-500",
  "bg-blue-200 dark:bg-blue-500",
  "bg-pink-200 dark:bg-pink-500",
];

function ServerTiming({ data }: { data: string }) {
  return (
    <ErrorBoundary
      fallback={
        <div>
          [Failed to visually render server-timing] {data}
        </div>
      }
    >
      <ServerTimingGraph data={data} />
    </ErrorBoundary>
  )
}

function ServerTimingGraph({
  data,
}: {
  data: string;
}) {
  // TODO: handle the scenario when there are multiple _ spans
  const timings = data.split(",").map((timing: string) => {
    const [label, ...parts] = timing.split(';');
    const descText = parts.find(t => t.startsWith('desc=')) ?? ''
    const durText = parts.find(t => t.startsWith('dur=')) ?? ''
    const duration = parseFloat(durText.split('=')[1] ?? '0');
    const offsets = descText.split('_').pop()?.split('+').map(Number) ?? [];
    const offset = offsets[0] || 0;
    return { label, duration, offset };
  }).sort((a, b) => {
    if (a.offset === b.offset) {
      return b.duration - a.duration
    }

    return a.offset - b.offset
  });

  // get max timing
  const max = timings.reduce((acc, cur) => {
    return Math.max(acc, cur.offset + cur.duration)
  }, 0);

  return (
    <div title={data} className="flex flex-col text-md md:text-base font-mono">
      {timings.map(({ label, offset, duration }) => {
        const leftOffsetPercentage = (offset / max) * 100;

        return (
          <div key={label} className="flex flex-nowrap hover:bg-neutral-100 dark:hover:bg-neutral-800 py-1 px-2 rounded group">
            <div className="whitespace-nowrap w-[250px] text-neutral-400 group-hover:text-inherit group-hover:dark:text-gray-100">
              {label}
            </div>
            <div className="w-full text-black dark:text-white text-sm">
              {duration != null ? (
                <div
                  className={`${duration !== 0 ? "px-1" : ""
                    } whitespace-nowrap min-w-[1px] h-full inline-flex flex-col justify-center text-s
                  ${
                    // pick a random color
                    COLORS[
                    Math.floor(Math.random() * COLORS.length) % COLORS.length
                    ]
                    //
                    }`}
                  style={{
                    width: `${(duration / max) * 100}%`,
                    marginLeft: `${leftOffsetPercentage}%`,
                  }}
                >
                  {duration}ms
                </div>
              ) : null}
            </div>
          </div>
        );
      })}
    </div>
  );
}

