export const dynamic = "force-dynamic";
export const runtime = "edge";
import { Suspense } from "react";

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
  "bg-green-200",
  "bg-yellow-200",
  "bg-red-200",
  "bg-purple-200",
  "bg-blue-200",
  "bg-pink-200",
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
      <div className="text-md md:text-base grid grid-cols-1 md:grid-cols-[auto,1fr] gap-x-6 max-w-full font-mono">
        {res.headers.map((item: any, i: number) => {
          return (
            <>
              <div className="whitespace-nowrap font-bold" key={`h-${i}`}>
                {item[0]}
              </div>
              <div className="overflow-auto break-words mb-3" key={`v-${i}`}>
                {(() => {
                  if (item[0].toLowerCase() === "server-timing") {
                    // get max timing
                    const max = item[1]
                      .split(",")
                      .reduce((acc: number, cur: string) => {
                        const match = cur.match(
                          /([a-zA-Z0-9_]+)(?:; ?desc="?([^";]*)"?)?;?(?: ?dur=([0-9.]+))?/
                        );
                        if (match) {
                          const dur = parseFloat(match[3] ?? "0");
                          return dur > acc ? dur : acc;
                        }
                        return acc;
                      }, 0);

                    return (
                      <div className="grid grid-cols-[auto,1fr] gap-x-6 gap-y-2">
                        {item[1].split(",").map((timing: string, i: number) => {
                          const match = timing.match(
                            /([a-zA-Z0-9_]+)(?:; ?desc="?([^";]*)"?)?;?(?: ?dur=([0-9.]+))?/
                          );
                          const label = match?.[2] ?? match?.[1];
                          const duration = parseFloat(match?.[3] ?? "0");

                          return (
                            <>
                              <div className="whitespace-nowrap">{label}</div>
                              <div className="w-full text-black text-sm">
                                {duration != null ? (
                                  <div
                                    style={{
                                      width: `${(duration / max) * 100}%`,
                                    }}
                                    className={`
                                  px-1
                                  whitespace-nowrap
                                  min-w-[1px]
                                  h-full
                                  inline-flex
                                  flex-col
                                  justify-center
                                  ${
                                    // pick a random color
                                    COLORS[
                                      Math.floor(
                                        Math.random() * COLORS.length
                                      ) % COLORS.length
                                    ]
                                    //
                                  }
                                `}
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
                  } else {
                    return item[1];
                  }
                })()}
              </div>
            </>
          );
        })}
      </div>
    </>
  );
}
