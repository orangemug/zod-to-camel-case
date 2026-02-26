import { z, ZodArray, ZodError, ZodObject, ZodRawShape, ZodType } from "zod";
import { keysToCamelCase, keysToSnakeCase } from "./format";
import { ZodContribSnakeToCamel, ZodContribKeysToCamel } from "./types";
import { rewriteErrorPathsToCamel } from "./error";

export { keysToCamelCase, keysToSnakeCase };
export type { ZodContribSnakeToCamel, ZodContribKeysToCamel };

export type zodToCamelCaseOptions = { bidirectional?: boolean };

// parse(...) with optional `Input` type
type parse<Input, T> = (input: Input) => ZodContribKeysToCamel<z.infer<T>>;

type ShapeOfObject<T> = T extends ZodObject<infer Shape, any> ? Shape : never;
type ShapeOfArray<T> = T extends ZodArray<infer Shape> ? Shape : never;

// safeParse(...) with optional `Input` type
type safeParse<Input, T> = (input: Input) => {
  success: boolean;
  data?: ZodContribKeysToCamel<z.infer<T>>;
  error?: any;
};

type SnakeToCamel<S extends string> =
  S extends `${infer H}_${infer T}`
    ? `${H}${Capitalize<SnakeToCamel<T>>}`
    : S;

export type RewriteShapeKeys<S extends ZodRawShape> = {
  [K in keyof S as SnakeToCamel<K & string>]:
    S[K] extends ZodObject<infer Inner, any>
      ? ZodObject<RewriteShapeKeys<Inner>>
    : S[K] extends ZodArray<infer E>
      ? ZodArray<
          E extends ZodObject<infer Inner2, any>
            ? ZodObject<RewriteShapeKeys<Inner2>>
            : E
        >
    : S[K];
};

/**
 * General top-level rewrite — supports objects, arrays, or primitives.
 */
export type RewriteZodSchemaKeys<T> =
  T extends ZodObject<infer Shape, any>
    ? ZodObject<RewriteShapeKeys<Shape>>
    : T extends ZodArray<infer Elem>
      ? ZodArray<
          Elem extends ZodObject<infer Inner, any>
            ? ZodObject<RewriteShapeKeys<Inner>>
            : Elem extends ZodArray<any>
              ? RewriteZodSchemaKeys<Elem>
              : Elem
        >
      : T;

// zodToCamelCase (unidirectional)
export default function zodToCamelCase<T extends ZodObject, Shape=ZodObject<RewriteShapeKeys<ShapeOfObject<T>>>>(
  schema: T,
  // Overload for 'true' condition
  options: { bidirectional: true },
): Omit<Shape, "parse" | "safeParse"> & {
  // Expecting snake-case-case input to parse
  parse: parse<z.input<Shape>, Shape>;
  // Expecting snake-case-case input to safeParse
  safeParse: safeParse<z.input<Shape>, Shape>;
};

// zodToCamelCase (bidirectional)
export default function zodToCamelCase<T extends ZodObject, Shape=ZodObject<RewriteShapeKeys<ShapeOfObject<T>>>>(
  schema: T,
  // Overload for 'false' and 'missing' condition
  options?: { bidirectional?: false },
): Omit<Shape, "parse" | "safeParse"> & {
  // Expecting snake-case-case input to parse
  parse: parse<z.infer<T>, Shape>;
  // Expecting snake-case-case input to safeParse
  safeParse: safeParse<z.infer<T>, Shape>;
};

// zodToCamelCase (unidirectional)
export default function zodToCamelCase<T extends ZodArray, Shape=ZodArray<RewriteZodSchemaKeys<ShapeOfArray<T>>>>(
  schema: T,
  // Overload for 'true' condition
  options: { bidirectional: true },
): Omit<Shape, "parse" | "safeParse"> & {
  // Expecting snake-case-case input to parse
  parse: parse<z.input<Shape>, Shape>;
  // Expecting snake-case-case input to safeParse
  safeParse: safeParse<z.input<Shape>, Shape>;
};

// zodToCamelCase (bidirectional)
export default function zodToCamelCase<T extends ZodArray, Shape=ZodArray<RewriteZodSchemaKeys<ShapeOfArray<T>>>>(
  schema: T,
  // Overload for 'false' and 'missing' condition
  options?: { bidirectional?: false },
): Omit<Shape, "parse" | "safeParse"> & {
  // Expecting snake-case-case input to parse
  parse: parse<z.infer<T>, Shape>;
  // Expecting snake-case-case input to safeParse
  safeParse: safeParse<z.infer<T>, Shape>;
};

// zodToCamelCase (bidirectional)
export default function zodToCamelCase<T extends ZodType>(
  schema: T,
  // Overload for 'false' and 'missing' condition
  options?: { bidirectional: true },
): Omit<T, "parse" | "safeParse"> & {
  // Expecting snake-case-case input to parse
  parse: parse<z.infer<T>, T>;
  // Expecting snake-case-case input to safeParse
  safeParse: safeParse<z.infer<T>, T>;
};

// zodToCamelCase (bidirectional)
export default function zodToCamelCase<T extends ZodType>(
  schema: T,
  // Overload for 'false' and 'missing' condition
  options?: { bidirectional?: false },
): Omit<T, "parse" | "safeParse"> & {
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
  const { bidirectional = false } = options;

  return {
    ...schema,
    parse: (
      input: ZodContribKeysToCamel<z.infer<T>> | z.infer<T>,
    ): ZodContribKeysToCamel<z.infer<T>> => {
      try {
        const parsedInput = bidirectional ? keysToSnakeCase(input) : input;
        const parsed = schema.parse(parsedInput);
        const result = keysToCamelCase(parsed) as ZodContribKeysToCamel<
          z.infer<T>
        >;
        return result;
      } catch (err) {
        if (bidirectional && err instanceof ZodError) {
          throw rewriteErrorPathsToCamel(err);
        }
        throw err;
      }
    },
    safeParse(input: ZodContribKeysToCamel<z.infer<T>>) {
      const parsedInput = bidirectional ? keysToSnakeCase(input) : input;
      const result = schema.safeParse(parsedInput);
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
