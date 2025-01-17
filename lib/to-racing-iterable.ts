// https://stackoverflow.com/a/78166734
export async function* toRacingIterable<T>(array: T[]) {
  const promiseContainerMap = new Map(
    array.map((item) => {
      const promise = Promise.resolve(item);
      return [promise, promise.then((value) => [promise, value] as const)];
    }),
  );
  while (promiseContainerMap.size) {
    const [key, value] = await Promise.race(promiseContainerMap.values());
    promiseContainerMap.delete(key);
    yield value;
  }
}
