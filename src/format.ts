export const camelToSnakeCase = (str: string) => {
  return str
    .replace(/^(_*)(.*)(_*)$/, (_, s: string, m: string, e: string) => {
      return s+m.replace(/[A-Z]/g, (letter) => `_${letter.toLowerCase()}`)+e;
    })
}

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
    .toLowerCase()
    .replace(/^(_*)(.*)(_*)$/, (_, s: string, m: string, e: string) => {
      return s+m.replace(/_+([a-z])/g, (_, c: string) => c.toUpperCase())+e;
    })
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
