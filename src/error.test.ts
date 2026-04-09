import { describe, expect, test } from "vitest";
import { rewriteErrorPathsToCamel } from "./error";
import { ZodError } from "zod";
import { zodError } from "./test-utils";

describe("rewriteErrorPathsToCamel", () => {
  test("basic", () => {
    const error = new ZodError([
      {
        expected: "string",
        code: "invalid_type",
        path: ["key_one"],
        message: "Invalid input: expected string, received undefined",
      },
    ]);
    const result = rewriteErrorPathsToCamel(error);
    expect(result.message).toEqual(zodError(
      {
        expected: "string",
        code: "invalid_type",
        path: ["keyOne"],
        message: "Invalid input: expected string, received undefined",
      },
    ));
  });

  test("complex", () => {
    const error = new ZodError([
      {
        expected: "string",
        code: "invalid_type",
        path: ["key_one", 0, "something_else"],
        message: "Invalid input: expected string, received undefined",
      },
    ]);
    const result = rewriteErrorPathsToCamel(error);
    expect(result.message).toEqual(zodError(
      {
        expected: "string",
        code: "invalid_type",
        path: ["keyOne", 0, "somethingElse"],
        message: "Invalid input: expected string, received undefined",
      },
    ));
  });
});
