"use server";

export async function request(url: string) {
  url = url.trim();

  // prefix url with https if absent
  if (!url.startsWith("http")) {
    url = "https://" + url;
  }

  let res;

  try {
    res = await fetch(url, {
      cache: "no-cache",
      headers: {
        "x-vercel-debug-proxy-timing": "1",
        "x-vercel-internal-timing": "1",
      },
    });

    // serialize headers
    return { headers: res.headers.entries() };
  } catch (err) {
    return {
      error: err instanceof Error ? err.message : String(err),
    };
  }
}
