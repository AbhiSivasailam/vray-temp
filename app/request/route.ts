import { request } from "../lib/request";

export const preferredRegion = "global";

export async function GET(req: Request) {
  let searchParamsUrl = new URL(req.url).searchParams.get("url")?.trim();

  if (!searchParamsUrl) {
    return new Response("Missing url parameter", { status: 400 });
  }

  return Response.json(await request(searchParamsUrl));
}
