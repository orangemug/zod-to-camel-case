import { $ZodIssue } from "zod/v4/core";

/**
 * Convert Zod issues into the error string that will be thrown by Zod for those issues.
 */
export function zodError(...issues: $ZodIssue[]): string {
  return JSON.stringify(
    issues,
    null,
    2,
  );
}
