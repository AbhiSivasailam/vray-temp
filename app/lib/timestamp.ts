/**
 * Allows to set a timestamp returning a function that can be called to get
 * the time elapsed since the timestamp was set.
 */
export function timestamp(start = process.hrtime.bigint()) {
  return () => Math.round(Number(process.hrtime.bigint() - start) / 1e6);
}
