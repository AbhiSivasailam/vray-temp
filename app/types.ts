export type FetchResult = FetchSuccess | FetchError;

export interface ServerTiming {
  label: string;
  description: string;
  duration: number;
  offset: number;
  tags: { [key: string]: string };
}

export interface FetchSuccess {
  headers: [string, string][];
  serverTimings: ServerTiming[];
  status: number;
  statusText: string;
  timings: { headers: number; body: number; total: number };
  type?: "serverless" | "edge";
  url: string;
}

export interface FetchError {
  error: {
    message: string;
    url: string;
  };
}
