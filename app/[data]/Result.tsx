import { ErrorBoundary } from "react-error-boundary";
import { SuccessData } from "../types";
import { ShareButton } from "./ShareButton";

/**
 * https://github.com/vercel/edge-functions/blob/0d5c575a3a80fadac0b980a39056519a54b101f3/packages/node-bridge-private/src/performance.ts#L291
 */
const LABELS = {
  'lambda-bootstrap': 'Time spent since the code started being evaluated until we started importing the function code. This includes how long took loading the mnimal required runtime source code.',
  'lambda-tla': "Time spent since the code started being evaluated until the module level promise is fully resolved. This is only available for the TLA launcher as it's time free for Vercel on Lambda.",
  'lambda-post-init-delay': "The difference between the time when the init phase finishes and the handling phase starts. This is typically low but AWS can pre-warm the function increasing this gap (which is not perceived by the user).",
  'lambda-import-fn': "Time spent into importing the function code. The finish mark can be in the handling phase so we need to substract the phase gap to have an accurate number.",
  'lambda-server-ready': "Time spent since the function code was imported until the local server is listening and ready to handle requests.",
  'lambda-request': 'Time spent since the launcher was called by AWS and the request against localhost was performed. This can include other work pushed to the handling phase (like importing the user code).',
  'lambda-handler-latency': 'Time spent since the request to localhost was initiated until the user code starts handling it. This represents the local server network latency.',
  'lambda-response': 'Time since the user code starts running until there is a response. This depends on the user code and should not be measured for performance improvements on our side.',
  'lambda-total-latency': 'Total time from invocation start to user code being run, plus init time in the case of cold boots.',
  'lambda-ttfb': 'Time since the code starts running until the first byte of the user response is received. Includes Cold + Processing time.',
  'lambda-tunnel': 'Time to connect back to the tunnel server. Only relevant for streaming and the initial N1 requests.',
  'lambda': 'Measured in proxy - this is the TTFB of the full round trip to s-f-r, aws, customer code, and back, possibly including regional invocation',
  'lambda-schedstat-paused': 'milliseconds spent waiting in the cpu controller (run)queue. We can read this as how much time CPU is waiting to be scheduled. It can vary depending of the AWS Lambda machine tier. Low is better.',
  'lambda-aws-invoke': 'How long it took from when SFR or Proxy send the invocation to AWS, to the rusty-runtime being executed. This is an approximation of network + firecracker + whatever AWS is doing.',
  'lambda-child-spawn': 'How long it took to spawn Node.js.',
  'lambda-child-init': 'How long it took to initialise the Node.js bridge and start the internal HTTP server. This includes importing the user code.',
  'lambda-child-request-ttfb': 'How long it took to send the request to the Node.js internal HTTP server and receive the headers & status code.',
  'lambda-child-request': 'How long it took to send the request to the Node.js internal HTTP server and receive the full body.',
  'lambda-tunnel-connect': 'How long it took to connect to the N1 tunnel and do the handshake.',
}

const toPercent = (partial: number, total: number) => `${Math.round((partial / total) * 100)}%`;

export function Result({ data, showShareButton }: { data: SuccessData, showShareButton?: boolean }) {
  return (
    <>
      <div className="text-sm font-mono pb-8 text-gray-600 dark:text-gray-400">
        {data.coldStart ? "🥶" : "🌶️"} <span>{data.url} ({data.status} OK in {data.totalTime}ms) • headers: {data.headerTime}ms ({toPercent(data.headerTime, data.totalTime)})  • body: {data.bodyTime}ms ({toPercent(data.bodyTime, data.totalTime)})</span>
        {showShareButton ? (
          <> <ShareButton data={data} /></>
        ) : null}
      </div>

      <div className="text-md md:text-base grid grid-cols-1 md:grid-cols-[auto,1fr] gap-x-6 max-w-full font-mono">
        {data.headers.map((item: any, i: number) => {
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
    <div className="flex flex-col text-md md:text-base font-mono">
      {timings.map(({ label, offset, duration }) => {
        const leftOffsetPercentage = (offset / max) * 100;
        const description: string = LABELS[label as keyof typeof LABELS] ?? '';

        return (
          <div key={label} className="flex flex-nowrap hover:bg-neutral-100 dark:hover:bg-neutral-800 px-2 rounded group">
            <div className="has-tooltip cursor-help min-w-[250px] text-neutral-400 group-hover:text-inherit group-hover:dark:text-gray-100 py-1">
              {description && <span className='tooltip p-2 bg-neutral-800 dark:bg-neutral-100 text-neutral-100 dark:text-neutral-800'>
                <b>{label}</b>: <span className="font-sans">{description}</span>
              </span>}
              {label}
            </div>
            <div className="w-full text-black dark:text-white text-sm py-1">
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

