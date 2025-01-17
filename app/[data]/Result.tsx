import { type FetchSuccess } from '@/app/types';
import { isColdStart } from '@/app/lib/is-cold-start';
import { Fragment, Suspense, type ReactNode } from 'react';
import { ServerTimings } from './ServerTimings';
import { isFunction } from '../lib/is-function';
import { AsnInfo, ProviderInfo } from './ProviderInfo';

interface Props {
  data: FetchSuccess;
  children?: ReactNode;
}

export function Result({ data, children }: Props) {
  function statusColor(status: number): string {
    const firstChar = String(status).charAt(0);
    switch (firstChar) {
      case '2':
        return 'text-green-500';
      case '4':
        return 'text-orange-500';
      case '5':
        return 'text-red-500';
      default:
        return 'text-gray-500';
    }
  }

  return (
    <>
      <div className="text-sm font-mono pb-2 text-gray-600 dark:text-gray-400">
        {data.headers.find(([key]) => key === 'x-vercel-id') && isFunction(data)
          ? isColdStart(data)
            ? '🥶 '
            : '🌶️ '
          : ''}
        <span>
          {data.url}
          {' ('}
          <span className={`font-bold ${statusColor(data.status)}`}>
            {data.status} {data.statusText}
          </span>{' '}
          in {data.timings.total}ms) • headers: {data.timings.headers}ms (
          {toPercent(data.timings.headers, data.timings.total)}) • body:{' '}
          {data.timings.body}ms (
          {toPercent(data.timings.body, data.timings.total)})
        </span>
        {children}
      </div>

      <div className="text-sm font-mono pb-4 text-gray-600 dark:text-gray-400 h-[117px]">
        <Suspense fallback={<div className="h-[28px]" />}>
          <ProviderInfo url={data.url} />
        </Suspense>
        <Suspense fallback={<div className="h-[28px]" />}>
          <AsnInfo ip={data.ip} />
        </Suspense>
      </div>

      <div className="text-md md:text-base grid grid-cols-1 md:grid-cols-[auto,1fr] gap-x-6 max-w-full font-mono">
        {data.headers.map(([headerKey, headerValue], index) => (
          <Fragment key={headerKey + headerValue + index}>
            <div className="whitespace-nowrap font-semibold text-black dark:text-white">
              {headerKey}
            </div>
            <div className="pr-3 break-words mb-3">
              {headerKey.toLowerCase() === 'server-timing' ? (
                <ServerTimings data={headerValue} />
              ) : (
                headerValue
              )}
            </div>
          </Fragment>
        ))}
      </div>
    </>
  );
}

function toPercent(partial: number, total: number) {
  return `${Math.round((partial / total) * 100)}%`;
}
