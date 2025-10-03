import z from "zod";
import { zodToCamelCase } from "./";

describe("zodToCamelCaseOutput", () => {
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
      type Foo = z.infer<typeof camelCaseSchema>
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
        new Error(
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
  });
});

describe("zodToCamelCaseInputOutput", () => {
  describe(".safeParse()", () => {
    test("valid nested data", () => {
      const schema = z.object({
        key_one: z.string(),
        key_two: z.string(),
        additional_props: z.object({
          foo_bar: z.number(),
        }),
      });
      const camelCaseSchema = zodToCamelCase(schema, {bidirectional: true});
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
      const camelCaseSchema = zodToCamelCase(schema, {bidirectional: true});
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
      const camelCaseSchema = zodToCamelCase(schema, {bidirectional: true});
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
      const camelCaseSchema = zodToCamelCase(schema, {bidirectional: true});
      expect(() => {
        camelCaseSchema.parse({
          // @ts-expect-error
          keyTwo: "one",
        });
      }).toThrow(
        new Error(
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
      const camelCaseSchema = zodToCamelCase(schema, {bidirectional: true});
      expect(() => {
        camelCaseSchema.parse({
          keyOne: "one",
        });
      }).toThrow(new Error("arrgh"));
    });
  });
});
