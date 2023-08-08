export const dynamic = "force-dynamic";
export const runtime = "edge";
import { Suspense } from "react";
import { ErrorBoundary } from "react-error-boundary";
import { headers } from "next/headers";

export default function URLPage({
  params: { url },
}: {
  params: { url: string };
}) {
  return (
    <div className="flex w-full h-full p-5 self-stretch grow flex-col">
      <Suspense
        key={url}
        fallback={
          <div className="grow flex justify-center items-center text-gray-400 dark:text-gray-600">
            Loading…
          </div>
        }
      >
        <Search url={url} />
      </Suspense>
    </div>
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

  const isVercelResponse = res.headers.find(
    (header: string[]) => header[0] === "x-vercel-id"
  );

  return (
    <>
      <div className="border-b border-gray-400 dark:border-gray-600 pb-2 text-sm font-mono mb-3">
        Response: {res.totalTime}ms • Headers: {res.headerTime}ms • Body: {res.bodyTime}ms • Status: {res.status}
      </div>

      <div className="text-md md:text-base grid grid-cols-1 md:grid-cols-[auto,1fr] gap-x-6 max-w-full font-mono">
        {res.headers.map((item: any, i: number) => {
          return (
            <>
              <div className="whitespace-nowrap font-bold" key={`h-${i}`}>
                {item[0]}
              </div>
              <div className="pr-3 break-words mb-3" key={`v-${i}`}>
                {item[0].toLowerCase() === "server-timing" ? (
                  <ErrorBoundary
                    fallback={
                      <div>
                        [Failed to visually render server-timing] {item[1]}
                      </div>
                    }
                  >
                    <ServerTiming
                      isVercelResponse={isVercelResponse}
                      data={item[1]}
                    />
                  </ErrorBoundary>
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

function ServerTiming({
  isVercelResponse,
  data,
}: {
  isVercelResponse: boolean;
  data: string;
}) {

  // TODO: handle the scenario when there are multiple _ spans
  const timings = data.split(",").map((timing: string) => {
    const [label, ...parts] = timing.split(';');
    const descText = parts.find(t => t.startsWith('desc=')) ?? ''
    const durText = parts.find(t => t.startsWith('dur=')) ?? ''
    const duration = parseFloat(durText.split('=')[1] ?? '0');
    const offsets = descText.split('_').pop()?.split('+').map(Number) ?? [];
    const offset = offsets[0] ?? 0;
    return { label, duration, offset };
  });

  // get max timing
  const max = timings.reduce((acc, cur) => {
    return Math.max(acc, cur.offset + cur.duration)
  }, 0);

  return (
    <div title={data} className="grid grid-cols-[auto,1fr] gap-x-6 gap-y-2">
      {timings.map(({ label, offset, duration }) => {
        const leftOffsetPercentage = (offset / max) * 100;

        return (
          <>
            <div key={`label-${label}`} className="whitespace-nowrap">
              {label}
            </div>
            <div
              className="w-full text-black dark:text-white text-sm"
              key={`timing-${label}`}
            >
              {duration != null ? (
                <div
                  className={`${
                    duration !== 0 ? "px-1" : ""
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
                  {duration > 0 ? `${duration}ms` : ""}
                </div>
              ) : null}
            </div>
          </>
        );
      })}
    </div>
  );
}
