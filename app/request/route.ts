export const preferredRegion = "global";

export async function GET(req: Request) {
  let url = new URL(req.url).searchParams.get("url")?.trim();

  if (!url) {
    return new Response("Missing url parameter", { status: 400 });
  }

  if (!url.startsWith("http")) {
    url = "https://" + url;
  }

  let res;

  try {
    res = await fetch(url, {
      cache: "no-cache",
      headers: {
        "x-vercel-debug-proxy-timing": "1",
      },
    });

    // serialize headers
    // @ts-ignore
    return Response.json({ headers: [...res.headers.entries()] });
  } catch (err) {
    return Response.json({
      error: err instanceof Error ? err.message : String(err),
    });
  }
}
