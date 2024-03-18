import { type ServerTiming } from "@/app/types";

/**
 * Given a `Server-Timing` header value, parse it into an array of timing
 * objects including tags and offset.
 */
export function parseServerTiming(timing: string) {
  return timing
    .split(",")
    .map((timing: string): ServerTiming => {
      const [label, ...parts] = timing.split(";");
      const [descText, withoutDesc] = findAndRemove(parts, "desc=");
      const [durText, rest] = findAndRemove(withoutDesc, "dur=");
      const offsets = descText.split("_").pop()?.split("+").map(Number) ?? [];
      return {
        label,
        description: getDescription(label),
        duration: parseFloat(durText.split("=")[1] ?? "0"),
        offset: offsets[0] || 0,
        tags: rest.reduce((result: { [key: string]: string }, current) => {
          const [key, value] = current.split("=");
          result[key] = value;
          return result;
        }, {}),
      };
    })
    .sort((a, b) => {
      return a.offset === b.offset
        ? b.duration - a.duration
        : a.offset - b.offset;
    });
}

function findAndRemove(items: string[], start: string): [string, string[]] {
  const index = items.findIndex((t) => t.startsWith(start));
  return index !== -1
    ? [items[index], items.slice(0, index).concat(items.slice(index + 1))]
    : ["", items];
}

function getDescription(label: string) {
  switch (label) {
    case "lambda-bootstrap":
      return "Time spent since the code started being evaluated until we started importing the function code. This includes how long took loading the mnimal required runtime source code.";
    case "lambda-tla":
      return "Time spent since the code started being evaluated until the module level promise is fully resolved. This is only available for the TLA launcher as it's time free for Vercel on Lambda.";
    case "lambda-post-init-delay":
      return "The difference between the time when the init phase finishes and the handling phase starts. This is typically low but AWS can pre-warm the function increasing this gap (which is not perceived by the user).";
    case "lambda-import-fn":
      return "Time spent into importing the function code. The finish mark can be in the handling phase so we need to substract the phase gap to have an accurate number.";
    case "lambda-server-ready":
      return "Time spent since the function code was imported until the local server is listening and ready to handle requests.";
    case "lambda-request":
      return "Time spent since the launcher was called by AWS and the request against localhost was performed. This can include other work pushed to the handling phase (like importing the user code).";
    case "lambda-handler-latency":
      return "Time spent since the request to localhost was initiated until the user code starts handling it. This represents the local server network latency.";
    case "lambda-response":
      return "Time since the user code starts running until there is a response. This depends on the user code and should not be measured for performance improvements on our side.";
    case "lambda-total-latency":
      return "Total time from invocation start to user code being run, plus init time in the case of cold boots.";
    case "lambda-ttfb":
      return "Time since the code starts running until the first byte of the user response is received. Includes Cold + Processing time.";
    case "lambda-tunnel":
      return "Time to connect back to the tunnel server. Only relevant for streaming and the initial N1 requests.";
    case "lambda":
      return "Measured in proxy - this is the TTFB of the full round trip to s-f-r, aws, customer code, and back, possibly including regional invocation";
    case "lambda-schedstat-paused":
      return "milliseconds spent waiting in the cpu controller (run)queue. We can read this as how much time CPU is waiting to be scheduled. It can vary depending of the AWS Lambda machine tier. Low is better.";
    case "lambda-aws-invoke":
      return "How long it took from when SFR or Proxy send the invocation to AWS, to the rusty-runtime being executed. This is an approximation of network + firecracker + whatever AWS is doing.";
    case "lambda-child-spawn":
      return "How long it took to spawn Node.js.";
    case "lambda-child-init":
      return "How long it took to initialise the Node.js bridge and start the internal HTTP server. This includes importing the user code.";
    case "lambda-child-request-ttfb":
      return "How long it took to send the request to the Node.js internal HTTP server and receive the headers & status code.";
    case "lambda-child-request":
      return "How long it took to send the request to the Node.js internal HTTP server and receive the full body.";
    case "lambda-tunnel-connect":
      return "How long it took to connect to the N1 tunnel and do the handshake.";
    case "edgefnhttp":
      return "How long it took the HTTP request to Cloudflare Workers for the Edge Function";
    default:
      return "";
  }
}
