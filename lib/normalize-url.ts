// if the url doesn't have a protocol, add https://
export function normalizeURL(url: string) {
  try {
    return new URL(url);
  } catch (err) {
    return new URL(`https://${url}`);
  }
}
