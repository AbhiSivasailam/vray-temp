import { analyzeURL } from './lib/analyze-url';
import { normalizeURL } from './lib/normalize-url';
import { toRacingIterable } from './lib/to-racing-iterable';

const [...hosts] = process.argv.slice(2);

if (!hosts.length) {
  console.error('Usage: node cli.mjs <host> [<host> ...]');
  process.exit(1);
}

// normalize hosts
let urls: URL[] = [];
for (const host of hosts) {
  try {
    urls.push(normalizeURL(host));
  } catch (err) {
    console.error(`Invalid URL "${host}"`);
    process.exit(1);
  }
}

// turn hosts into a generator
const analyzedHosts = toRacingIterable(
  urls.map(async (url) => {
    return [url, await analyzeURL(url.toString())];
  }),
);

async function main() {
  for await (const [host, result] of analyzedHosts) {
    console.log(host?.toString(), result);
  }
}

main().catch(console.error);
