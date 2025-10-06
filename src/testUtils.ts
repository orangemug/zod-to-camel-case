function keyToCamelCase(key: string): string {
  return key.replace(/(?<!^)(_\w)/g, (_, m) => m[1].toUpperCase());
}

export function keysToCamelCase<T>(obj: T): KeysToCamelCase<T> {
  if (Array.isArray(obj)) {
    return obj.map((item) => keysToCamelCase(item)) as KeysToCamelCase<T>;
  } else if (obj && typeof obj === "object") {
    return Object.entries(obj).reduce((acc, [key, value]) => {
      const newKey = keyToCamelCase(key);
      acc[newKey as keyof typeof acc] = keysToCamelCase(value);
      return acc;
    }, {} as KeysToCamelCase<T>);
  }
  return obj as KeysToCamelCase<T>;
}
