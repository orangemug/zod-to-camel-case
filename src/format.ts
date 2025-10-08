export const camelToSnakeCase = (str: string) => {
  const out = str.replace(
    /^(_*)(.*)(_*)$/,
    (_, s: string, m: string, e: string) => {
      return (
        s + m.replace(/[A-Z]/g, (letter) => `_${letter.toLowerCase()}`) + e
      );
    },
  );
  return out;
};

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
  if (!str.match(/^_*([a-z]|[a-z][_])+_*$/)) {
    throw new Error("Invalid");
  }
  return str
    .toLowerCase()
    .replace(/^(_*)(.*)(_*)$/, (_, s: string, m: string, e: string) => {
      return s + m.replace(/_+([a-z])/g, (_, c: string) => c.toUpperCase()) + e;
    });
};

export function keysToCamelCase<T>(obj: T): any {
  if (Array.isArray(obj))
    return obj.map((o) => {
      return keysToCamelCase(o);
    });
  if (obj !== null && typeof obj === "object") {
    return Object.fromEntries(
      Object.entries(obj).map(([k, v]) => {
        return [snakeToCamelCase(k), keysToCamelCase(v)];
      }),
    );
  }
  return obj;
}
