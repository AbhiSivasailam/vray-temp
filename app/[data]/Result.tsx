import { ErrorBoundary } from "react-error-boundary";
import { SuccessData } from "../types";
import { ShareButton } from "./ShareButton";

const toPercent = (partial: number, total: number) => `${Math.round((partial / total) * 100)}%`;

export function Result({ data, showShareButton }: { data: SuccessData, showShareButton?: boolean }) {
  return (
    <>
      <div className="text-sm font-mono pb-8 text-gray-600 dark:text-gray-400">
        {data.coldStart ? "🥶" : "🌶️"} Response: {data.totalTime}ms • Headers: {data.headerTime}ms ({toPercent(data.headerTime, data.totalTime)})  • Body: {data.bodyTime}ms ({toPercent(data.bodyTime, data.totalTime)}) • Status: {data.status} • URL: <span className="font-bold text-gray-900 dark:text-gray-100">{data.url}</span>
        {showShareButton ? (
          <> • <ShareButton data={data} /></>
        ) : null}
      </div>

      <div className="text-md md:text-base grid grid-cols-1 md:grid-cols-[auto,1fr] gap-x-6 max-w-full font-mono">
        {data.headers.map((item: any, i: number) => {
          return (
            <>
              <div className="whitespace-nowrap font-semibold text-black dark:text-white" key={`h-${i}`}>
                {item[0]}
                {item[0].toLowerCase() === "server-timing" ? (
                  <a href={`/${encodeURIComponent(item[1])}?timing=true`} target="_blank" className="text-gray-600 dark:text-gray-300 font-normal"> (🔗 permalink)</a>
                ) : null}
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

export function ServerTiming({ data }: { data: string }) {
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
            <div className="whitespace-nowrap min-w-[250px] text-neutral-400 group-hover:text-inherit group-hover:dark:text-gray-100">
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

