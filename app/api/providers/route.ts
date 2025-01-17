import { analyzeURL } from '@/lib/analyze-url';
import { normalizeURL } from '@/lib/normalize-url';

export function GET() {
  return new Response('Method not supported. Use POST instead.', {
    status: 405,
  });
}

export async function POST(req: Request) {
  const { url } = await req.json();

  if (!url) {
    return new Response('Missing `url` in JSON body', { status: 400 });
  }

  let normalizedURL;

  try {
    normalizedURL = normalizeURL(url);
  } catch (err) {
    if (err instanceof TypeError) {
      return new Response(`Invalid \`url\` (${err.message ?? ''})`, {
        status: 400,
      });
    } else {
      throw err;
    }
  }

  return new Response(
    JSON.stringify(await analyzeURL(normalizedURL.toString())),
  );
}
