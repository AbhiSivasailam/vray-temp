import { type FetchResult, type ServerTiming } from "@/app/types";
import { parseServerTiming } from "./parse-server-timings";
import { timestamp } from "./timestamp";
import { randomUUID } from "crypto";

export async function fetchWithTimings(fetchUrl: string): Promise<FetchResult> {
  const url = !fetchUrl.startsWith("http") ? `https://${fetchUrl}` : fetchUrl;

  try {
    const sinceStart = timestamp();
    const response = await fetch(url, {
      cache: "no-cache",
      redirect: "manual",
      headers: {
        "x-randomize": randomUUID(),
        "x-vercel-debug-proxy-timing": "1",
        "x-vercel-internal-timing": "1",
        "x-worker-debug": "1",
        // Emulate a browser request to reduce cold starts from edge functions
        // https://github.com/vercel/proxy/blob/main/services/edge-function-router/internal/o11y/boot_metrics.go#L15
        "user-agent":
          "Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko)",
      },
    });

    const headerTime = sinceStart();
    await response.text();
    const bodyTime = sinceStart() - headerTime;
    const totalTime = sinceStart();

    const serverTimingHeader = response.headers.get("server-timing") ?? "";
    const serverTimings = parseServerTiming(serverTimingHeader);
    const serverTimingsObj = serverTimings.reduce(
      (result: { [label: string]: ServerTiming | undefined }, t) => {
        result[t.label] = t;
        return result;
      },
      {},
    );

    const edgeTiming = serverTimingsObj["edgefnhttp"];
    const lambdaTiming =
      serverTimingsObj["lambda-ttfb"] ||
      serverTimingsObj["lambda-child-request-ttfb"];
    const headers: [string, string][] = [];
    response.headers.forEach((value, key) => {
      headers.push([key, value]);
    });

    return {
      headers: headers,
      serverTimings: serverTimings,
      status: response.status,
      statusText: response.statusText,
      timings: { headers: headerTime, body: bodyTime, total: totalTime },
      type: edgeTiming ? "edge" : !!lambdaTiming ? "serverless" : undefined,
      url: url,
    };
  } catch (error: unknown) {
    return {
      error: {
        message: error instanceof Error ? error.message : String(error),
        url,
      },
    };
  }
}
