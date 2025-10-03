import { z, ZodError, ZodType } from "zod";
import { keysToCamelCase, keysToSnakeCase } from "./format";
import { ZodContribKeysToCamel } from "./types";
import { rewriteErrorPathsToCamel } from "./error";

export { keysToCamelCase, keysToSnakeCase };

// Fully generic reusable function with internal type mapping
export function zodToCamelCaseOutput<T extends ZodType>(schema: T) {
  const newSchema = schema.transform((data) => keysToCamelCase(data));
  return {
    ...newSchema,
    parse(input: z.infer<T>): ZodContribKeysToCamel<z.infer<T>> {
      try {
        const parsed = newSchema.parse(input);
        return keysToCamelCase(parsed) as ZodContribKeysToCamel<z.infer<T>>;
      } catch (err) {
        throw err;
      }
    },
    safeParse(input: z.infer<T>) {
      const result = newSchema.safeParse(input);
      if (!result.success) {
        return { success: false as const, error: result.error };
      }
      return {
        success: true as const,
        data: keysToCamelCase(result.data) as ZodContribKeysToCamel<z.infer<T>>,
      };
    },
  };
}

// Fully generic reusable function with internal type mapping
export function zodToCamelCaseInputAndOutput<T extends ZodType>(schema: T) {
  const newSchema = z
    .preprocess((input) => keysToSnakeCase(input as any), schema)
    .transform((data) => keysToCamelCase(data));
  return {
    ...newSchema,
    parse(
      input: ZodContribKeysToCamel<z.infer<T>>,
    ): ZodContribKeysToCamel<z.infer<T>> {
      try {
        const parsed = newSchema.parse(input);
        return keysToCamelCase(parsed) as ZodContribKeysToCamel<z.infer<T>>;
      } catch (err) {
        if (err instanceof ZodError) throw rewriteErrorPathsToCamel(err);
        throw err;
      }
    },
    safeParse(input: ZodContribKeysToCamel<z.infer<T>>) {
      const result = newSchema.safeParse(input);
      if (!result.success) {
        return {
          success: false as const,
          error: rewriteErrorPathsToCamel(result.error),
        };
      }
      return {
        success: true as const,
        data: keysToCamelCase(result.data) as ZodContribKeysToCamel<z.infer<T>>,
      };
    },
  };
}
