import { resolve, resolveCname, reverse } from 'dns';

export async function analyzeURL(url: string, retry = false, optional = false) {
  const frameworks = new Set();
  const providers = new Set();

  let res;
  try {
    res = await fetch(url);
  } catch (err) {
    if (!retry) {
      return analyzeURL(url, true, optional);
    }

    // retry
    try {
      res = await fetch(url);
    } catch (err) {
      if (!optional) {
        // @ts-ignore
        console.error(url, err?.message, err?.cause ? err.cause.message : '');
      }
      return null;
    }
  }

  let hostname, cname;

  try {
    let parsedUrl = new URL(url);
    [hostname, cname] = await Promise.all([
      getHostname(parsedUrl.hostname),
      getCname(parsedUrl.hostname),
    ]);
  } catch (err) {
    if (!retry) {
      return analyzeURL(url, true, optional);
    }

    if (!optional) {
      // @ts-ignore
      console.error(url, err?.message);
    }
    return null;
  }

  let body;

  try {
    body = await res.text();
  } catch (err) {
    if (!retry) {
      return analyzeURL(url, true, optional);
    }

    if (!optional) {
      // @ts-ignore
      console.error(url, err?.message);
    }
    return null;
  }

  if (body.includes('id="challenge-running"')) {
    if (!optional) console.error(url, 'Cloudflare challenge');
    return null;
  }

  // frameworks or site builders
  if (body.includes('id="__next"')) {
    frameworks.add('Next.js');
    frameworks.add('React');
  }

  if (body.includes('self.__next_f.push')) {
    frameworks.add('Next.js (App Router)');
    frameworks.add('React');
  }

  if (body.includes('__remixContext')) {
    frameworks.add('Remix');
    frameworks.add('React');
  }

  if (body.includes('id="___gatsby"')) {
    frameworks.add('Gatsby');
    frameworks.add('React');
  }

  if (body.includes('id="__nuxt"')) {
    frameworks.add('Nuxt.js');
    frameworks.add('Vue');
  }

  if (body.includes('data-wf-site=')) {
    frameworks.add('Webflow');
    providers.add('Webflow');
  }

  if (body.includes('data-stencil-build')) {
    frameworks.add('Stencil');
  }

  if (body.includes('//assets.squarespace.com')) {
    frameworks.add('Squarespace');
    providers.add('Squarespace');
  }

  if (body.includes('/wp-json') || body.includes('/wp-includes/')) {
    frameworks.add('WordPress');
  }

  if (res.headers.has('x-do-app-origin')) {
    frameworks.add('DigitalOcean App Platform');
  }

  if (res.headers.has('x-wix-request-id')) {
    frameworks.add('Wix');
    providers.add('Wix');
  }

  if (res.headers.has('x-sc-rewrite')) {
    providers.add('Sitecore');
  }

  if (body.includes('<meta name=generator content="Hugo')) {
    frameworks.add('Hugo');
  }

  if (body.includes('<div id="svelte">') || body.includes('svelte-')) {
    frameworks.add('Svelte');
  }

  if (body.includes('sveltekit:')) {
    frameworks.add('SvelteKit');
    frameworks.add('Svelte');
  }

  if (res.headers.has('x-shopify-stage')) {
    frameworks.add('Shopify');
    providers.add('Shopify');
  }

  if (res.headers.has('oxygen-full-page-cache')) {
    providers.add('Shopify Oxygen');
  }

  if (body.includes('data-reactroot')) {
    frameworks.add('React');
  }

  if (body.includes('<div id="root">')) {
    frameworks.add('CRA');
  }

  if (res.headers.has('x-bubble-perf')) {
    frameworks.add('Bubble');
    providers.add('Bubble');
  }

  if (
    res.headers.has('x-pantheon-styx-hostname') ||
    res.headers.has('x-styx-req-id')
  ) {
    providers.add('Pantheon');
  }

  if (res.headers.has('replit-cluster')) {
    providers.add('Replit');
  }

  if (res.headers.has('x-render-origin-server')) {
    providers.add('Render');
  }

  if (
    res.headers.get('server') === 'railway' ||
    res.headers.get('server') === 'railway-edge'
  ) {
    providers.add('Railway');
  }

  if (body.includes('data-server-rendered="true"')) {
    frameworks.add('Vue SSR');
  }

  if (
    body.includes('<script src="runtime.') &&
    body.includes('<script src="polyfills.')
  ) {
    frameworks.add('Angular');
  }

  if (body.includes('data-turbo-track')) {
    frameworks.add('Hotwire Turbo');
  }

  if (/<html([^>]*\bamp\b|[^>]*\u26A1\uFE0F?)[^>]*>/i.test(body)) {
    frameworks.add('AMP');
  }

  if (body.includes('content="Framer ')) {
    frameworks.add('Framer');
    providers.add('Framer');
  }

  if (body.includes('content="Astro ')) {
    frameworks.add('Astro');
  }

  if (body.includes('src="https://scripts.swipepages.com')) {
    frameworks.add('Swipe Pages');
    providers.add('Swipe Pages');
  }

  if (body.includes('/etc.clientlibs/')) {
    frameworks.add('Adobe Experience Manager (AEM)');
  }

  if (body.includes('<meta name="generator" content="Ghost')) {
    frameworks.add('Ghost');
  }

  // hosting
  if (
    res.headers.has('x-vercel-id') ||
    'Vercel' === res.headers.get('server')
  ) {
    providers.add('Vercel');
  }

  if (res.headers.has('fly-request-id')) {
    providers.add('Fly.io');
  }

  if ((res.headers.get('server') ?? '').includes('deno/')) {
    providers.add('Deno Deploy');
  }

  if (
    res.headers.has('x-ak-protocol') ||
    res.headers.get('x-cache')?.includes('Akamai') ||
    res.headers.get('server') === 'AkamaiGHost' ||
    res.headers.has('x-akamai-transformed')
  ) {
    providers.add('Akamai');
  }

  if (
    res.headers.has('x-nf-request-id') ||
    res.headers.get('server') === 'Netlify'
  ) {
    providers.add('Netlify');
  }

  if (res.headers.get('x-powered-by') === 'Express') {
    providers.add('Express');
  }

  if (res.headers.get('server') === 'AmazonS3') {
    providers.add('AWS S3');
    providers.add('AWS');
  } else if ((res.headers.get('server') ?? '').includes('nginx')) {
    providers.add('Nginx');
  } else if (res.headers.get('server') === 'Apache') {
    providers.add('Apache');
  }

  if (res.headers.has('x-amz-cf-id')) {
    providers.add('AWS CloudFront');
    providers.add('AWS');
  }

  if (res.headers.has('x-opennext')) {
    providers.add('SST (OpenNext)');
  }

  // dynamics 365 commerce
  if (
    res.headers.get('set-cookie')?.includes('msdyn365') ||
    body.includes('_msdyn365')
  ) {
    providers.add('Microsoft Dynamics 365 Commerce');
  }

  if (body.includes('demandware.static') || body.includes('demandware.store')) {
    providers.add('Salesforce Commerce Cloud');
  }

  if (res.headers.has('X-MSEdge-Ref')) {
    providers.add('Azure CDN');
    providers.add('Azure');
  }

  if (res.headers.has('cf-ray')) {
    providers.add('Cloudflare');
  }

  if (
    res.headers.get('via')?.toLowerCase() === '1.1 google' ||
    res.headers.get('server') === 'Google Frontend'
  ) {
    providers.add('Google Cloud');
  }

  if ((res.headers.get('via') ?? '').includes('vegur')) {
    providers.add('Heroku');
  }

  if (hostname?.includes('.clients.your-server.de')) {
    providers.add('Hetzner');
  }

  if (cname?.includes('.elasticbeanstalk.com')) {
    providers.add('AWS Elastic Beanstalk');
  }

  if (cname?.includes('cudawaas.com')) {
    providers.add('Barracuda WAF');
  }

  if ((res.headers.get('x-served-by') ?? '').includes('cache-')) {
    providers.add('Fastly');
  }

  if (res.headers.has('x-edg-mr')) {
    providers.add('Edgio');
  }

  if (res.headers.has('x-azure-ref')) {
    providers.add('Azure');
  }

  if (res.headers.has('x-edg-aws-region')) {
    providers.add('AWS');
  }

  if (res.headers.has('x-kinsta-cache')) {
    providers.add('Kinsta');
  }

  if (res.headers.has('x-wpengine-sec')) {
    providers.add('WP Engine');
  }

  // we need to distinguish GitHub.com vs from GitHub Pages
  // GitHub Pages are served from Fastly but GitHub.com is not
  if (res.headers.has('x-github-request-id') && providers.has('Fastly')) {
    providers.add('GitHub Pages');
  }

  if (res.headers.has('x-envoy-upstream-service-time')) {
    providers.add('Envoy');
  }

  // when a website is cf-cache-status: DYNAMIC
  // and the `/index` route is a 308 redirect,
  // it's likely to be using Cloudflare Pages
  if (providers.size === 1 && providers.has('Cloudflare')) {
    try {
      const resIndex = await fetch(url + '/index', {
        signal: AbortSignal.timeout(5000),
        redirect: 'manual',
      });
      if (resIndex.status === 308) {
        providers.add('Cloudflare Pages [maybe]');
      }
    } catch (err) {
      console.error('error (/index cf check)', err);
    }
  }

  if (body.includes('<!-- Cloudflare Pages Analytics -->')) {
    providers.add('Cloudflare Pages');
  }

  return {
    frameworks: Array.from(frameworks),
    providers: Array.from(providers),
  };
}

function getHostname(domain: string): Promise<string | null> {
  return new Promise((res) => {
    resolve(domain, (err, addresses) => {
      if (err) {
        res(null);
      } else {
        reverse(addresses[0], (err, hostnames) => {
          if (err) {
            res(null);
          } else {
            res(hostnames[0]);
          }
        });
      }
    });
  });
}

function getCname(domain: string): Promise<string | null> {
  return new Promise((resolve) => {
    resolveCname(domain, (err, addresses) => {
      if (err) {
        resolve(null);
      } else {
        resolve(addresses[0]);
      }
    });
  });
}
