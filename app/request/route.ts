export const preferredRegion = "global";

const timestamp =
  (start = process.hrtime.bigint()) =>
    () =>
      Math.round(Number(process.hrtime.bigint() - start) / 1e6)

export async function GET(req: Request) {
  let url = new URL(req.url).searchParams.get("url")?.trim();

  if (!url) {
    return new Response("Missing url parameter", { status: 400 });
  }

  if (!url.startsWith("http")) {
    url = "https://" + url;
  }

  try {
    // Log time we started request
    const duration = timestamp();

    // Fetch headers
    const res = await fetch(url, {
      cache: "no-cache",
      redirect: "manual",
      headers: {
        "x-vercel-debug-proxy-timing": "1",
        "x-vercel-internal-timing": "1",
        "x-worker-debug": "1",
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
    const coldStart = res.headers.get("server-timing")?.includes('hot=0')

    // serialize headers
    return Response.json({
      status: res.status,
      headerTime,
      coldStart,
      bodyTime,
      totalTime,
      // @ts-ignore
      headers: [...res.headers.entries()],
    });
  } catch (err) {
    return Response.json({
      error: err instanceof Error ? err.message : String(err),
    });
  }
}
