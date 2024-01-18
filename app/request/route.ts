import { ErrorData, SuccessData } from "../types";

export const preferredRegion = "global";

const timestamp =
  (start = process.hrtime.bigint()) =>
    () =>
      Math.round(Number(process.hrtime.bigint() - start) / 1e6)

export async function GET(req: Request) {
  let searchParamsUrl = new URL(req.url).searchParams.get("url")?.trim();

  if (!searchParamsUrl) {
    return new Response("Missing url parameter", { status: 400 });
  }

  let urlToFetch = searchParamsUrl

  if (!searchParamsUrl.startsWith("http")) {
    urlToFetch = "https://" + searchParamsUrl;
  }

  try {
    // Log time we started request
    const duration = timestamp();

    // Fetch headers
    const res = await fetch(urlToFetch, {
      cache: "no-cache",
      redirect: "manual",
      headers: {
        "x-vercel-debug-proxy-timing": "1",
        "x-vercel-internal-timing": "1",
        "x-worker-debug": "1",
        // Use a dummy user agent to emmulate a browser request, useful to
        // reduce cold starts from edge functions. See:
        // https://github.com/vercel/proxy/blob/73df46e0c9319ecd9cc06e42ba19fb171891d44a/lib/routing/invoke_handler_cloudflare.lua#L185
        "user-agent": "Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko)",
      },
    });

    // Calculate time to receive all headers
    const headerTime = duration();

    // Read in full response body
    await res.text();

    // Calculate time to receive the response body
    const bodyTime = duration() - headerTime;

    // Calculate total response time
    const totalTime = duration();

    // Determine hotness
    const coldStart = !!res.headers.get("server-timing")?.includes('hot=0')

    // serialize headers
    return Response.json({
      status: res.status,
      headerTime,
      coldStart,
      bodyTime,
      totalTime,
      // @ts-ignore
      headers: [...res.headers.entries()],
      url: searchParamsUrl,
    } satisfies SuccessData);
  } catch (err) {
    return Response.json({
      error: err instanceof Error ? err.message : String(err),
    } satisfies ErrorData);
  }
}
