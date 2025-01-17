import { parseServerTiming } from '@/app/lib/parse-server-timings';

interface Props {
  data: string;
}

const COLORS = [
  'bg-green-200 dark:bg-green-500',
  'bg-yellow-200 dark:bg-yellow-500',
  'bg-red-200 dark:bg-red-500',
  'bg-purple-200 dark:bg-purple-500',
  'bg-blue-200 dark:bg-blue-500',
  'bg-pink-200 dark:bg-pink-500',
];

export function ServerTimings({ data }: Props) {
  const timings = parseServerTiming(data);
  const max = timings.reduce(
    (acc, cur) => Math.max(acc, cur.offset + cur.duration),
    0,
  );

  return (
    <div className="flex flex-col text-md md:text-base font-mono">
      {timings.map(({ description, tags, label, offset, duration }) => (
        <div
          key={label + offset + duration + description}
          className="flex flex-nowrap hover:bg-neutral-100 dark:hover:bg-neutral-800 px-2 rounded group"
        >
          <div className="has-tooltip cursor-help min-w-[250px] text-neutral-400 group-hover:text-inherit group-hover:dark:text-gray-100 py-1">
            {(description || Boolean(Object.keys(tags).length)) && (
              <div className="tooltip p-2 bg-neutral-800 dark:bg-neutral-100 text-neutral-100 dark:text-neutral-800">
                {description && (
                  <div>
                    <b>{label}</b>:{' '}
                    <span className="font-sans">{description}</span>
                  </div>
                )}
                {Object.keys(tags).length > 0 && (
                  <div className="font-sans mt-1">
                    {Object.keys(tags).map((key) => (
                      <span
                        className="bg-gray-50 text-gray-700 rounded-sm text-xs p-1 mr-2 dark:bg-gray-500 dark:text-gray-50"
                        key={key}
                      >
                        <b>{key}</b>:{' '}
                        <span className="font-sans">{tags[key]}</span>
                      </span>
                    ))}
                  </div>
                )}
              </div>
            )}
            {label}
          </div>
          <div className="w-full text-black dark:text-white text-sm py-1">
            {duration != null ? (
              <div
                className={`${
                  duration !== 0 ? 'px-1' : ''
                } whitespace-nowrap min-w-[1px] h-full inline-flex flex-col justify-center text-s
                  ${
                    // pick a random color
                    COLORS[
                      Math.floor(Math.random() * COLORS.length) % COLORS.length
                    ]
                    //
                  }`}
                style={{
                  width: `${(duration / max) * 100}%`,
                  marginLeft: `${(offset / max) * 100}%`,
                }}
              >
                {duration}ms
              </div>
            ) : null}
          </div>
        </div>
      ))}
    </div>
  );
}
