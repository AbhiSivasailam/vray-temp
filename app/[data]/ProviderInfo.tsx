export async function ProviderInfo({ url }: { url: string }) {
  const providerResponse = await fetch('https://get-providers.vercel.app/', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ url }),
  })
    .then((res) => res.json())
    .catch(() => ({ providers: [], frameworks: [] }));

  return (
    <div className="pb-2">
      <span>Frameworks:</span>{' '}
      {providerResponse.frameworks?.join(', ') || 'Unknown'}
      {' • '}
      <span>Providers:</span>{' '}
      {providerResponse.providers?.join(', ') || 'Unknown'}
    </div>
  );
}

export async function AsnInfo({ ip }: { ip: string | undefined }) {
  const asnResponse = await fetch(
    `https://ipapi.co/${ip}/json?key=${process.env.IPAPI_KEY}`,
  )
    .then((res) => res.json())
    .catch(() => ({ asn: 'Unknown', org: 'Unknown' }));

  return (
    <div>
      <span>IP:</span> {ip}
      {' • '}
      <span>ASN:</span> {`${asnResponse.asn} (${asnResponse.org})`}
      <div className="col-span-full border-b border-gray-200 dark:border-gray-700 mt-6" />
    </div>
  );
}
