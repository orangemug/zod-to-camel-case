import z, { ZodError } from "zod";
import { snakeToCamelCase } from "./format";

export function rewriteErrorPathsToCamel(error: ZodError<any>): ZodError<any> {
  const newIssues: z.core.$ZodIssue[] = error.issues.map((issue) => {
    const path = issue.path.map((segment) =>
      typeof segment === "string" ? snakeToCamelCase(segment) : segment,
    );
    return { ...issue, path };
  });
  return new ZodError(newIssues);
}
