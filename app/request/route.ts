export const preferredRegion = "global";

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
    const start = Date.now();
    
    // Fetch headers
    const res = await fetch(url, {
      cache: "no-cache",
      headers: {
        "x-vercel-debug-proxy-timing": "1",
      },
    });

    // Calculate time to receive all headers
    const headerTime = Date.now() - start;

    // Read in full response body
    await res.text();

    // Calculate time to receive the response body
    const bodyTime = Date.now() - headerTime - start;

    // Calculate total response time
    const totalTime = Date.now() - start;

    // serialize headers
    return Response.json({
      status: res.status,
      headerTime: headerTime,
      bodyTime: bodyTime,
      totalTime: totalTime,
      // @ts-ignore
      headers: [...res.headers.entries()],
    });
  } catch (err) {
    return Response.json({
      error: err instanceof Error ? err.message : String(err),
    });
  }
}
