import { z, ZodError, ZodType } from "zod";
import { keysToCamelCase, keysToSnakeCase, prettyFormatArray, reverseMappings, snakeToCamelCase } from "./format";
import { ZodContribSnakeToCamel, ZodContribKeysToCamel } from "./types";
import { rewriteErrorPathsToCamel } from "./error";
import { zodSiblingKeys } from "./zod";

export { keysToCamelCase, keysToSnakeCase };
export type { ZodContribSnakeToCamel, ZodContribKeysToCamel };

export type zodToCamelCaseOptions = { bidirectional?: boolean };


function schemaMappings<T extends ZodType> (schema: T): Map<string, string> {
  const mappings = new Map<string, string>()
  zodSiblingKeys(schema, (keys, path, type) => {
    const localMappings = new Map<string, string>()
    const conflicts = new Set<string>()
    for (const key of keys) {
      const mappedKey = snakeToCamelCase(key)
      mappings.set([...path.map(snakeToCamelCase), mappedKey].join("."), key);
      if (localMappings.has(mappedKey)) {
        const oldKey = localMappings.get(mappedKey)!;
        conflicts.add(oldKey);
        conflicts.add(key);
      }
      localMappings.set(mappedKey, key);
    }
    if (conflicts.size > 0) {
      throw new Error(`conflicting keys: ${prettyFormatArray([...conflicts])}${type === "union" ? ` (in union)` : ""}`)
    }
  })
  return mappings;
}

// parse(...) with optional `Input` type
type parse<Input, T> = (input: Input) => ZodContribKeysToCamel<z.infer<T>>;

// safeParse(...) with optional `Input` type
type safeParse<Input, T> = (input: Input) => {
  success: boolean;
  data?: ZodContribKeysToCamel<z.infer<T>>;
  error?: any;
};

// zodToCamelCase (unidirectional)
export default function zodToCamelCase<T extends ZodType>(
  schema: T,
  // Overload for 'true' condition
  options: { bidirectional: true },
): Omit<ZodType<ZodContribKeysToCamel<z.infer<T>>>, "parse" | "safeParse"> & {
  // Expecting snake-case-case input to parse
  parse: parse<ZodContribKeysToCamel<z.infer<T>>, T>;
  // Expecting snake-case-case input to safeParse
  safeParse: safeParse<ZodContribKeysToCamel<z.infer<T>>, T>;
};

// zodToCamelCase (bidirectional)
export default function zodToCamelCase<T extends ZodType>(
  schema: T,
  // Overload for 'false' and 'missing' condition
  options?: { bidirectional?: false },
): Omit<ZodType<ZodContribKeysToCamel<z.infer<T>>>, "parse" | "safeParse"> & {
  // Expecting snake-case-case input to parse
  parse: parse<z.infer<T>, T>;
  // Expecting snake-case-case input to safeParse
  safeParse: safeParse<z.infer<T>, T>;
};

// zodToCamelCase
export default function zodToCamelCase<T extends ZodType>(
  schema: T,
  options: zodToCamelCaseOptions = {},
) {
  // TODO: Use extracted mappings in reverse process later on
  const mappings = schemaMappings(schema);

  const { bidirectional = false } = options;

  return {
    ...schema,
    parse: (
      input: ZodContribKeysToCamel<z.infer<T>> | z.infer<T>,
    ): ZodContribKeysToCamel<z.infer<T>> => {
      try {
        const mappedInput = bidirectional ? keysToSnakeCase(input) : input
        const parsed = schema.parse(mappedInput);
        const out = keysToCamelCase(parsed) as ZodContribKeysToCamel<z.infer<T>>;
        return out;
      } catch (err) {
        if (bidirectional && err instanceof ZodError) {
          throw rewriteErrorPathsToCamel(err);
        }
        throw err;
      }
    },
    safeParse(input: ZodContribKeysToCamel<z.infer<T>>) {
      const result = schema.safeParse(
        bidirectional ? keysToSnakeCase(input) : input
      );
      if (!result.success) {
        return {
          success: false as const,
          error: bidirectional
            ? rewriteErrorPathsToCamel(result.error)
            : result.error,
        };
      }
      return {
        success: true as const,
        data: keysToCamelCase(result.data) as ZodContribKeysToCamel<z.infer<T>>,
      };
    },
  };
}
