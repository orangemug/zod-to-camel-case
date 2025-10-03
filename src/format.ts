export const camelToSnakeCase = (str: string) =>
  str.replace(/[A-Z]/g, (letter) => `_${letter.toLowerCase()}`);

export function keysToSnakeCase<T>(obj: T): any {
  if (Array.isArray(obj)) return obj.map(keysToSnakeCase);
  if (obj !== null && typeof obj === "object") {
    return Object.fromEntries(
      Object.entries(obj).map(([k, v]) => [
        camelToSnakeCase(k),
        keysToSnakeCase(v),
      ]),
    );
  }
  return obj;
}

export const snakeToCamelCase = (str: string) => {
  return str
    .replace(/^_+/, "")
    .replace(/_+([a-z])/g, (_, c) => c.toUpperCase())
    .replace(/_+$/, "");
};

export function keysToCamelCase<T>(obj: T): any {
  if (Array.isArray(obj)) return obj.map(keysToCamelCase);
  if (obj !== null && typeof obj === "object") {
    return Object.fromEntries(
      Object.entries(obj).map(([k, v]) => [
        snakeToCamelCase(k),
        keysToCamelCase(v),
      ]),
    );
  }
  return obj;
}
