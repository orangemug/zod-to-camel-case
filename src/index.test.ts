import z from "zod";
import { zodToCamelCase } from "./";
import { describe, expect, expectTypeOf, test } from "vitest";

describe("zodToCamelCase (unidirectional)", () => {
  describe("schema types", () => {
    test("basic types", () => {
      const schema = z.object({
        key_one: z.string(),
        key_two: z.string(),
        additional_props: z.object({
          foo_bar: z.number(),
        }),
      });
      const camelCase = zodToCamelCase(schema);

      expectTypeOf<z.infer<typeof schema>>().toMatchObjectType<{
        key_one: string;
        key_two: string;
        additional_props: {
          foo_bar: number;
        };
      }>();

      expectTypeOf<z.infer<typeof camelCase>>().toMatchObjectType<{
        keyOne: string;
        keyTwo: string;
        additionalProps: {
          fooBar: number;
        };
      }>();
    });

    test("optional/nullable types", () => {
      const schema = z.object({
        key_one: z.string().optional(),
        key_two: z.string().nullable(),
        additional_props: z.object({
          foo_bar: z.number().optional(),
        }),
      });
      const camelCase = zodToCamelCase(schema);

      expectTypeOf<z.infer<typeof schema>>().toMatchObjectType<{
        key_one?: string;
        key_two: string | null;
        additional_props: {
          foo_bar?: number;
        };
      }>();

      expectTypeOf<z.infer<typeof camelCase>>().toMatchObjectType<{
        keyOne?: string;
        keyTwo: string | null;
        additionalProps: {
          fooBar?: number;
        };
      }>();
    });
  });

  describe(".safeParse()", () => {
    test("valid nested data", () => {
      const schema = z.object({
        key_one: z.string(),
        key_two: z.string(),
        additional_props: z.object({
          foo_bar: z.number(),
        }),
      });
      const camelCaseSchema = zodToCamelCase(schema);
      const results = camelCaseSchema.safeParse({
        key_one: "one",
        key_two: "two",
        additional_props: {
          foo_bar: 4,
        },
      });
      expect(results.success).toEqual(true);
      expect(results.data).toEqual({
        keyOne: "one",
        keyTwo: "two",
        additionalProps: {
          fooBar: 4,
        },
      });
    });

    test("parse errors are remapped", () => {
      const schema = z.object({
        key_one: z.string(),
      });
      const camelCaseSchema = zodToCamelCase(schema);
      const results = camelCaseSchema.safeParse({
        // @ts-expect-error
        key_two: "one",
      });
      expect(results.success).toEqual(false);
      expect(results.error?.message).toEqual(
        JSON.stringify(
          [
            {
              expected: "string",
              code: "invalid_type",
              path: ["key_one"],
              message: "Invalid input: expected string, received undefined",
            },
          ],
          null,
          2,
        ),
      );
    });

    test("non-object schema", () => {
      const schema = z.string();
      const camelCaseSchema = zodToCamelCase(schema);
      const result = camelCaseSchema.safeParse("testing");
      expect(result.data).toEqual("testing");
    });

    test("array schema", () => {
      const schema = z.array(z.object({ foo_bar: z.string() }));
      const camelCaseSchema = zodToCamelCase(schema);
      const result = camelCaseSchema.safeParse([{ foo_bar: "testing" }]);
      expect(result.data).toEqual([{ fooBar: "testing" }]);
    });
  });

  describe(".parse()", () => {
    test("valid nested data", () => {
      const schema = z.object({
        key_one: z.string(),
        key_two: z.string(),
        additional_props: z.object({
          foo_bar: z.number(),
        }),
      });
      const camelCaseSchema = zodToCamelCase(schema);
      const results = camelCaseSchema.parse({
        key_one: "one",
        key_two: "two",
        additional_props: {
          foo_bar: 4,
        },
      });
      expect(results).toEqual({
        keyOne: "one",
        keyTwo: "two",
        additionalProps: {
          fooBar: 4,
        },
      });
    });

    test("parse errors are remapped", () => {
      const schema = z.object({
        key_one: z.string(),
      });
      const camelCaseSchema = zodToCamelCase(schema);
      expect(() => {
        camelCaseSchema.parse({
          // @ts-expect-error
          key_two: "one",
        });
      }).toThrow(
        JSON.stringify(
          [
            {
              expected: "string",
              code: "invalid_type",
              path: ["key_one"],
              message: "Invalid input: expected string, received undefined",
            },
          ],
          null,
          2,
        ),
      );
    });

    test("non parse error", () => {
      const schema = z.object({
        key_one: z.string().transform(() => {
          throw new Error("arrgh");
          return "";
        }),
      });
      const camelCaseSchema = zodToCamelCase(schema);
      expect(() => {
        camelCaseSchema.parse({
          key_one: "one",
        });
      }).toThrow(new Error("arrgh"));
    });

    test("non-object schema", () => {
      const schema = z.string();
      const camelCaseSchema = zodToCamelCase(schema);
      const result = camelCaseSchema.parse("testing");
      expect(result).toEqual("testing");
    });

    test("array schema", () => {
      const schema = z.array(z.object({ foo_bar: z.string() }));
      const camelCaseSchema = zodToCamelCase(schema);
      const result = camelCaseSchema.parse([{ foo_bar: "testing" }]);
      expect(result).toEqual([{ fooBar: "testing" }]);
    });
  });
});

describe("zodToCamelCase (bidirectional)", () => {
  describe("schema types", () => {
    test("basic types", () => {
      const schema = z.object({
        key_one: z.string(),
        key_two: z.string(),
        additional_props: z.object({
          foo_bar: z.number(),
        }),
      });
      const camelCase = zodToCamelCase(schema, { bidirectional: true });

      expectTypeOf<z.infer<typeof schema>>().toMatchObjectType<{
        key_one: string;
        key_two: string;
        additional_props: {
          foo_bar: number;
        };
      }>();

      expectTypeOf<z.infer<typeof camelCase>>().toMatchObjectType<{
        keyOne: string;
        keyTwo: string;
        additionalProps: {
          fooBar: number;
        };
      }>();
    });

    test("optional/nullable types", () => {
      const schema = z.object({
        key_one: z.string().optional(),
        key_two: z.string().nullable(),
        additional_props: z.object({
          foo_bar: z.number().optional(),
        }),
      });
      const camelCase = zodToCamelCase(schema);

      expectTypeOf<z.infer<typeof schema>>().toMatchObjectType<{
        key_one?: string;
        key_two: string | null;
        additional_props: {
          foo_bar?: number;
        };
      }>();

      expectTypeOf<z.infer<typeof camelCase>>().toMatchObjectType<{
        keyOne?: string;
        keyTwo: string | null;
        additionalProps: {
          fooBar?: number;
        };
      }>();
    });
  });

  describe(".safeParse()", () => {
    test("valid nested data", () => {
      const schema = z.object({
        key_one: z.string(),
        key_two: z.string(),
        additional_props: z.object({
          foo_bar: z.number(),
        }),
      });
      const camelCaseSchema = zodToCamelCase(schema, { bidirectional: true });
      const results = camelCaseSchema.safeParse({
        keyOne: "one",
        keyTwo: "two",
        additionalProps: {
          fooBar: 4,
        },
      });
      expect(results.success).toEqual(true);
      expect(results.data).toEqual({
        keyOne: "one",
        keyTwo: "two",
        additionalProps: {
          fooBar: 4,
        },
      });
    });

    test("parse errors are remapped", () => {
      const schema = z.object({
        key_one: z.string(),
      });
      const camelCaseSchema = zodToCamelCase(schema, { bidirectional: true });
      const results = camelCaseSchema.safeParse({
        // @ts-expect-error
        keyTwo: "one",
      });
      expect(results.success).toEqual(false);
      expect(results.error?.message).toEqual(
        JSON.stringify(
          [
            {
              expected: "string",
              code: "invalid_type",
              path: ["keyOne"],
              message: "Invalid input: expected string, received undefined",
            },
          ],
          null,
          2,
        ),
      );
    });

    test("non-object schema", () => {
      const schema = z.string();
      const camelCaseSchema = zodToCamelCase(schema, { bidirectional: true });
      const result = camelCaseSchema.safeParse("testing");
      expect(result.data).toEqual("testing");
    });

    test("array schema", () => {
      const schema = z.array(z.object({ foo_bar: z.string() }));
      const camelCaseSchema = zodToCamelCase(schema, { bidirectional: true });
      const result = camelCaseSchema.safeParse([{ fooBar: "testing" }]);
      expect(result.data).toEqual([{ fooBar: "testing" }]);
    });
  });

  describe(".parse()", () => {
    test("valid nested data", () => {
      const schema = z.object({
        key_one: z.string(),
        key_two: z.string(),
        additional_props: z.object({
          foo_bar: z.number(),
        }),
      });
      const camelCaseSchema = zodToCamelCase(schema, { bidirectional: true });
      const results = camelCaseSchema.parse({
        keyOne: "one",
        keyTwo: "two",
        additionalProps: {
          fooBar: 4,
        },
      });
      expect(results).toEqual({
        keyOne: "one",
        keyTwo: "two",
        additionalProps: {
          fooBar: 4,
        },
      });
    });

    test("parse errors are remapped", () => {
      const schema = z.object({
        key_one: z.string(),
      });
      const camelCaseSchema = zodToCamelCase(schema, { bidirectional: true });
      expect(() => {
        camelCaseSchema.parse({
          // @ts-expect-error
          keyTwo: "one",
        });
      }).toThrow(
        JSON.stringify(
          [
            {
              expected: "string",
              code: "invalid_type",
              path: ["keyOne"],
              message: "Invalid input: expected string, received undefined",
            },
          ],
          null,
          2,
        ),
      );
    });

    test("non parse error", () => {
      const schema = z.object({
        key_one: z.string().transform(() => {
          throw new Error("arrgh");
          return "";
        }),
      });
      const camelCaseSchema = zodToCamelCase(schema, { bidirectional: true });
      expect(() => {
        camelCaseSchema.parse({
          keyOne: "one",
        });
      }).toThrow(new Error("arrgh"));
    });

    test("non-object schema", () => {
      const schema = z.string();
      const camelCaseSchema = zodToCamelCase(schema, { bidirectional: true });
      const result = camelCaseSchema.parse("testing");
      expect(result).toEqual("testing");
    });

    test("array schema", () => {
      const schema = z.array(z.object({ foo_bar: z.string() }));
      const camelCaseSchema = zodToCamelCase(schema, { bidirectional: true });
      const result = camelCaseSchema.parse([{ fooBar: "testing" }]);
      expect(result).toEqual([{ fooBar: "testing" }]);
    });
  });
});
