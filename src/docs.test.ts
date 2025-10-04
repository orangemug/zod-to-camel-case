import { describe, expect, test } from "vitest";
import { z } from "zod";
import zodToCamelCase from "./";

describe("docs", () => {
  test("unidirectional", () => {
    const userSchemaSnake = z.object({
      full_name: z.string(),
      user: z.object({
        email_addresses: z.array(z.email()),
      }),
    });
    const userSchema = zodToCamelCase(userSchemaSnake);

    // Infer the type using zod
    type User = z.infer<typeof userSchema>;
    // type => { fullName: string, user: { emailAddresses: string[] } }

    // This input is snake-case
    const results = userSchema.parse({
      full_name: "Turanga Leela",
      user: {
        email_addresses: ["name@example.com"],
      },
    });

    // Assert that the output is camel-case
    expect(results).toEqual({
      fullName: "Turanga Leela",
      user: {
        emailAddresses: ["name@example.com"],
      },
    });
  });

  test("bidirectional", () => {
    const userSchemaSnake = z.object({
      full_name: z.string(),
      user: z.object({
        email_addresses: z.array(z.email()),
      }),
    });
    const userSchema = zodToCamelCase(userSchemaSnake, { bidirectional: true });

    // Infer the type using zod
    type User = z.infer<typeof userSchema>;
    // type => { fullName: string, user: { emailAddresses: string[] } }

    // This input is camel-case
    // **IMPORTANT**: The input to parse() & safeParse() is now camel case
    const results = userSchema.parse({
      fullName: "Turanga Leela",
      user: {
        emailAddresses: ["name@example.com"],
      },
    });

    // Assert that the output is camel-case
    expect(results).toEqual({
      fullName: "Turanga Leela",
      user: {
        emailAddresses: ["name@example.com"],
      },
    });
  });
});
