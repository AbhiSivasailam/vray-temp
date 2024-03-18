import { fetchWithTimings } from "@/app/lib/fetch-with-timings";
import { isColdStart } from "@/app/lib/is-cold-start";
import { FetchError, FetchResult, FetchSuccess } from "@/app/types";

export async function request(url: string, options?: { cold?: boolean }) {
  return !options?.cold ? fetchWithTimings(url) : runFetch(url);
}

const MAX_CONCURRENT = 100;
const INC_CONCURRENT = 2;

async function runFetch(url: string, parallel = 2): Promise<FetchResult> {
  const results = await Promise.all(
    Array.from({ length: parallel }, () => fetchWithTimings(url)),
  );

  // Split success and errors
  const error = results.filter(isFetchError);
  if (error.length > 0) {
    return error[0];
  }

  const success = results.filter(isFetchSuccess);
  if (typeof success[0]?.type === "undefined") {
    return success[0];
  }

  const cold = success.find(isColdStart);
  if (cold) {
    return cold;
  }

  return parallel < MAX_CONCURRENT
    ? runFetch(url, parallel + INC_CONCURRENT)
    : success[0];
}

function isFetchSuccess(value: FetchResult): value is FetchSuccess {
  return "status" in value;
}

function isFetchError(value: FetchResult): value is FetchError {
  return "error" in value;
}
