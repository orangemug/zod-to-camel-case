export const camelToSnake = (str: string) =>
  str.replace(/[A-Z]/g, (letter) => `_${letter.toLowerCase()}`);

export function keysToSnake<T>(obj: T): any {
  if (Array.isArray(obj)) return obj.map(keysToSnake);
  if (obj !== null && typeof obj === "object") {
    return Object.fromEntries(
      Object.entries(obj).map(([k, v]) => [camelToSnake(k), keysToSnake(v)]),
    );
  }
  return obj;
}

export const snakeToCamel = (str: string) =>
  str.replace(/_([a-z])/g, (_, c) => c.toUpperCase());

// eslint-disable-next-line  @typescript-eslint/no-explicit-any
export function keysToCamel<T>(obj: T): any {
  if (Array.isArray(obj)) return obj.map(keysToCamel);
  if (obj !== null && typeof obj === "object") {
    return Object.fromEntries(
      Object.entries(obj).map(([k, v]) => [snakeToCamel(k), keysToCamel(v)]),
    );
  }
  return obj;
}
