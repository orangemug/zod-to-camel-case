import { z, ZodError, ZodType } from "zod";
import { keysToCamelCase, keysToSnakeCase } from "./format";
import { ZodContribKeysToCamel } from "./types";
import { rewriteErrorPathsToCamel } from "./error";

export { keysToCamelCase, keysToSnakeCase };

type zodToCamelCaseOptionsTrue = { bidirectional: true };
type zodToCamelCaseOptionsFalse = { bidirectional?: false };
export type zodToCamelCaseOptions = { bidirectional?: boolean };

export function zodToCamelCase<T extends ZodType>(
  schema: T,
  // Overload for 'true' condition
  options: zodToCamelCaseOptionsTrue,
): Omit<ZodType<ZodContribKeysToCamel<z.infer<T>>>, "parse" | "safeParse"> & {
  // Expecting camel-case input to parse
  parse(
    input: ZodContribKeysToCamel<z.infer<T>>,
  ): ZodContribKeysToCamel<z.infer<T>>;
  // Expecting camel-case input to safeParse
  safeParse(input: ZodContribKeysToCamel<z.infer<T>>): {
    success: boolean;
    data?: ZodContribKeysToCamel<z.infer<T>>;
    error?: any;
  };
};

export function zodToCamelCase<T extends ZodType>(
  schema: T,
  // Overload for 'false' and 'missing' condition
  options?: zodToCamelCaseOptionsFalse,
): Omit<ZodType<ZodContribKeysToCamel<z.infer<T>>>, "parse" | "safeParse"> & {
  // Expecting snake-case-case input to parse
  parse(input: z.infer<T>): ZodContribKeysToCamel<z.infer<T>>;
  // Expecting snake-case-case input to safeParse
  safeParse(input: z.infer<T>): {
    success: boolean;
    data?: ZodContribKeysToCamel<z.infer<T>>;
    error?: any;
  };
};

export function zodToCamelCase<T extends ZodType>(
  schema: T,
  options: zodToCamelCaseOptions = {},
) {
  const { bidirectional } = options;
  const newSchema = z
    .preprocess((input) => {
      if (bidirectional) {
        return keysToSnakeCase(input as any);
      }
      return input;
    }, schema)
    .transform(
      (data) => keysToCamelCase(data) as ZodContribKeysToCamel<z.infer<T>>,
    );

  return {
    ...newSchema,
    parse: (
      input: ZodContribKeysToCamel<z.infer<T>> | z.infer<T>,
    ): ZodContribKeysToCamel<z.infer<T>> => {
      try {
        const parsed = newSchema.parse(input);
        return keysToCamelCase(parsed) as ZodContribKeysToCamel<z.infer<T>>;
      } catch (err) {
        if (bidirectional && err instanceof ZodError) {
          throw rewriteErrorPathsToCamel(err);
        }
        throw err;
      }
    },
    safeParse(input: ZodContribKeysToCamel<z.infer<T>>) {
      const result = newSchema.safeParse(input);
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
