import { Suspense } from 'react';
import { ErrorBoundary } from 'react-error-boundary';
import { Result } from './Result';
import { ShareButton } from './ShareButton';
import { ServerTimings } from './ServerTimings';
import { Spinner } from './Spinner';
import { request } from '../lib/request';

export const dynamic = 'force-dynamic';

interface Props {
  searchParams: Promise<{
    /**
     * Forces trying to get a cold boot.
     */
    cold?: string;
    /**
     * Enables Server-Timing rendering mode.
     */
    timing?: string;
  }>;
  params: Promise<{
    /**
     * Holds a string that can be a URL or a Server-Timing header. It will
     * be rendered as one or the other depending on the timing query.
     */
    data: string;
  }>;
}

export default async function URLPage(props: Props) {
  const searchParams = await props.searchParams;
  const params = await props.params;
  const data = decodeURIComponent(params.data);
  return (
    <Suspense
      fallback={
        <div className="grow flex justify-center items-center">
          <Spinner />
        </div>
      }
    >
      {!!searchParams.timing ? (
        <ErrorBoundary
          fallback={<div>[Failed to visually render server-timing] {data}</div>}
        >
          <ServerTimings data={data} />
        </ErrorBoundary>
      ) : (
        <FetchURL url={data} cold={!!searchParams.cold} />
      )}
    </Suspense>
  );
}

async function FetchURL({ url, cold }: { url: string; cold?: boolean }) {
  const [response, providerResponse] = await Promise.all([
    request(url, { cold }),
    fetch('https://get-providers.vercel.app/', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ url }),
    })
      .then((res) => res.json())
      .catch(() => ({ providers: [] })),
  ]);

  if ('error' in response) {
    return (
      <div
        className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative dark:bg-red-900 dark:border-red-700 dark:text-red-100"
        role="alert"
      >
        <p>
          <b>Error</b> fetching{' '}
          <code className="text-sm bg-red-200 dark:bg-red-600 dark:text-gray-200 px-1 py-0.5 rounded">
            {url}
          </code>
          : {response.error.message}
        </p>
      </div>
    );
  }

  const responseWithProviders = {
    ...response,
    headers: [
      ...response.headers,
      ['frameworks', providerResponse.frameworks?.join(', ') || ''] as [
        string,
        string
      ],
      ['providers', providerResponse.providers?.join(', ') || ''] as [
        string,
        string
      ],
    ],
  };

  return (
    <Result data={responseWithProviders}>
      <ShareButton data={responseWithProviders} />
    </Result>
  );
}
