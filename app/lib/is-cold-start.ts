import { type FetchSuccess, type ServerTiming } from "@/app/types";

export function isColdStart(data: FetchSuccess) {
  const serverTimingsObj = data.serverTimings.reduce(
    (result: { [label: string]: ServerTiming | undefined }, t) => {
      result[t.label] = t;
      return result;
    },
    {},
  );

  return (
    serverTimingsObj["lambda-tla"] ||
    serverTimingsObj["lambda-hotness-cold"]
  );
}
