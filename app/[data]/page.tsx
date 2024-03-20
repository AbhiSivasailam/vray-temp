import { Suspense } from "react";
import { ErrorBoundary } from "react-error-boundary";
import { Result } from "./Result";
import { ShareButton } from "./ShareButton";
import { ServerTimings } from "./ServerTimings";
import { Spinner } from "./Spinner";
import { request } from "../lib/request";

export const dynamic = "force-dynamic";

interface Props {
  searchParams: {
    /**
     * Forces trying to get a cold boot.
     */
    cold?: string;
    /**
     * Enables Server-Timing rendering mode.
     */
    timing?: string;
  };
  params: {
    /**
     * Holds a string that can be a URL or a Server-Timing header. It will
     * be rendered as one or the other depending on the timing query.
     */
    data: string;
  };
}

export default function URLPage({ params, searchParams }: Props) {
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
  const response = await request(url, { cold });
  if ("error" in response) {
    return (
      <div
        className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative dark:bg-red-900 dark:border-red-700 dark:text-red-100"
        role="alert"
      >
        <p>
          <b>Error</b> fetching{" "}
          <code className="text-sm bg-red-200 dark:bg-red-600 dark:text-gray-200 px-1 py-0.5 rounded">
            {url}
          </code>
          : {response.error.message}
        </p>
      </div>
    );
  }

  return (
    <Result data={response}>
      <ShareButton data={response} />
    </Result>
  );
}
