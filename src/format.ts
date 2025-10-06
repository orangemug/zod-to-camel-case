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


export function reverseMappings<T>(obj: T, mappings: Map<string, string>, path: string[]=[]): any {
  if (Array.isArray(obj)) {
    return obj.map(s => {
      reverseMappings(s, mappings, path.concat("*"))
    });
  }
  if (obj !== null && typeof obj === "object") {
    return Object.fromEntries(
      Object.entries(obj).map(([k, v]) => {
        const ip = [...path, k];
        const rm = mappings.get(ip.join("."));
        return [
          rm,
          reverseMappings(v, mappings, [...path, k]),
        ]
      }),
    );
  }
  return mappings.get(path.join("."))!;
}

export const snakeToCamelCase = (str: string) => {
  return str
    .toLocaleLowerCase()
    .replace(/^_+/, "")
    .replace(/_+(\S)/g, (_, c) => c.toUpperCase())
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

export function prettyFormatArray (arr: (string | number | boolean)[]) {
  const items = arr.map(s => JSON.stringify(s));
  if (items.length < 2) return items[0];
  const end = items.slice(-1);
  const start = items.slice(0, -1);
  return [start.join(", "), "&", ...end].join(" ")
}