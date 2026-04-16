import { ZodContribKeysToCamel } from "./types";

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
  return str.replace(/([^_])_+([a-z0-9])/gi, (_, before, char) => {
    return before + char.toUpperCase();
  });
};

export function keysToCamelCase<T>(obj: T): ZodContribKeysToCamel<T> {
  if (Array.isArray(obj)) return obj.map(keysToCamelCase) as ZodContribKeysToCamel<T>;
  if (obj !== null && typeof obj === "object") {
    return Object.fromEntries(
      Object.entries(obj).map(([k, v]) => [
        snakeToCamelCase(k),
        keysToCamelCase(v),
      ]),
    ) as ZodContribKeysToCamel<T>;
  }
  return obj as ZodContribKeysToCamel<T>;
}
