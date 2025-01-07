import { type FetchSuccess } from '@/app/types';
import { isColdStart } from '@/app/lib/is-cold-start';
import { Fragment, type ReactNode } from 'react';
import { ServerTimings } from './ServerTimings';
import { isFunction } from '../lib/is-function';

interface Props {
  data: FetchSuccess;
  children?: ReactNode;
}

export function Result({ data, children }: Props) {
function statusColor (status: number): string {
  const firstChar = String(status).charAt(0)
  switch (firstChar) {
    case '2':
      return 'text-green-500'
    case '4':
      return 'text-orange-500'
    case '5':
      return 'text-red-500'
    default:
      return 'text-gray-500'
  }
}
  const frameworks = data.headers.find(
    ([key]) => key.toLowerCase() === 'frameworks'
  )?.[1];
  const providers = data.headers.find(
    ([key]) => key.toLowerCase() === 'providers'
  )?.[1];

  const headers = data.headers.filter(
    ([key]) =>
      key.toLowerCase() !== 'frameworks' && key.toLowerCase() !== 'providers'
  );

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

      <div className="text-sm font-mono pb-4 text-gray-600 dark:text-gray-400">
        {(frameworks || providers) && (
          <>
            <span>Frameworks:</span> {frameworks}
            {' • '}
            <span>Providers:</span> {providers}
            <div className="col-span-full border-b border-gray-200 dark:border-gray-700 mt-6" />
          </>
        )}
      </div>

      <div className="text-md md:text-base grid grid-cols-1 md:grid-cols-[auto,1fr] gap-x-6 max-w-full font-mono">
        {headers.map(([headerKey, headerValue]) => (
          <Fragment key={headerKey}>
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
