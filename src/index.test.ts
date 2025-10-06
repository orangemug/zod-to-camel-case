import z from "zod";
import { zodToCamelCaseOutput, zodToCamelCaseInputAndOutput } from "./";
import { keysToCamel } from "./format";

const complex_schema = z
  .object({
    type: z.literal("complex"),
    format: z.enum(["png", "jpg", "jpeg", "webp", "gif", "svg"]),
    url: z.url(),
    size: z.number(),
    metadata: z.union([
      z
        .object({
          attribution: z.string(),
        })
        .partial(),
      z.array(z.never()).length(0), // cloudinary provides an empty array if there is no metadata ?!
    ]),
  })
  .partial();

const simple_schema = z.object({
  type: z.literal("simple"),
  url: z.url(),
  size: z.number(),
});

describe("zodToCamelCaseOutput", () => {
  test("nested", () => {
    const schema = z.object({
      key_one: z.string(),
      key_two: z.string(),
      additional_props: z.object({
        foo_bar: z.number(),
      }),
    });
    const camelCaseSchema = zodToCamelCaseOutput(schema);
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

  test("error remapped", () => {
    const schema = z.object({
      key_one: z.string(),
    });
    const camelCaseSchema = zodToCamelCaseOutput(schema);
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
        2
      )
    );
  });

  it("converts a snake_case schema to camelCase", () => {
    const snake_case_schema = z.object({
      test_param: z.string(),
      test_param2: z.number(),
    });

    const snake_data = {
      test_param: "test",
      test_param2: 123,
    };

    expect(snake_case_schema.parse(snake_data)).toEqual(snake_data);

    const camelCaseSchema = zodToCamelCaseOutput(snake_case_schema);
    const camelParsedData = camelCaseSchema.parse(snake_data);

    const camelData = keysToCamel(snake_data);

    expect(camelParsedData).toEqual(camelData);
  });

  it("converts a nested snake_case schema to camelCase", () => {
    const nested_schema = z.object({
      test_param: z.string(),
      nested_param: z.object({
        nested_param_test: z.number(),
      }),
    });

    const nested_data = {
      test_param: "test",
      nested_param: {
        nested_param_test: 123,
      },
    };

    expect(nested_schema.parse(nested_data)).toEqual(nested_data);

    const camelData = keysToCamel(nested_data);

    const camelCaseSchema = zodToCamelCaseInputAndOutput(nested_schema);

    expect(camelCaseSchema.parse(camelData)).toEqual(camelData);
  });

  it("can convert an optional schema to camelCase", () => {
    const optional_schema = z
      .object({
        test_param: z.string().optional(),
      })
      .optional();

    const optional_data = {
      test_param: "test",
    };

    expect(optional_schema.parse(optional_data)).toEqual(optional_data);

    const camelData = keysToCamel(optional_data);

    const camelCaseSchema = zodToCamelCaseInputAndOutput(optional_schema);

    expect(camelCaseSchema.parse(camelData)).toEqual(camelData);
  });

  it("can convert a complex schema", () => {
    const example: z.infer<typeof complex_schema> = {
      url: "https://example.com/",
      metadata: {
        attribution: "image attribution",
      },
    };

    expect(() => complex_schema.parse(example)).not.toThrow();
    expect(complex_schema.parse(example)).toEqual(example);
  });

  it("can convert a union schema of simple and complex objects", () => {
    const union_schema = z.object({
      test_param: z.union([complex_schema, simple_schema]),
    });

    const unionSchema = zodToCamelCaseInputAndOutput(union_schema);

    const simple_item = {
      type: "simple",
      url: "https://example.com/simple_image.png",
      size: 12345,
    };

    expect(() => union_schema.parse({ test_param: simple_item })).not.toThrow();

    const simpleItem = keysToCamel(simple_item);

    expect(() => unionSchema.parse({ testParam: simpleItem })).not.toThrow();
  });

  it("can convert an object with a url property originally defined as a url and then extended as string", () => {
    const asURL = z.object({
      url: z.url(),
    });
    const omitAndExtended = asURL
      .omit({ url: true })
      .extend({ url: z.string() });
    const objectWithUrl = {
      url: "not a valid url",
    };

    expect(() => asURL.parse(objectWithUrl)).toThrow();
    expect(() => omitAndExtended.parse(objectWithUrl)).not.toThrow();
    expect(omitAndExtended.parse(objectWithUrl)).toEqual(objectWithUrl);
  });

  it("can convert an object with a url property defined as a url string", () => {
    const schemaWithUrl = z.object({
      url: z.url(),
    });
    const objectWithUrl = {
      url: "not a valid url",
    };

    expect(() => schemaWithUrl.parse(objectWithUrl)).toThrow();
  });

  it("Discriminated union must have at least one option", () => {
    const schema = z.discriminatedUnion("type", [
      z.object({ type: z.literal("snake_type"), snake_type: z.string() }),
    ]);

    const data = { type: "snake_type", snake_type: "test" };

    expect(schema.parse(data)).toEqual(data);

    const camelSchema = zodToCamelCaseInputAndOutput(schema);

    const camelData = keysToCamel(data);

    expect(camelSchema.parse(camelData)).toEqual(camelData);
  });

  it("can convert a tuple schema", () => {
    const tupleSchema = z.tuple([z.string(), z.number()]);

    const data = ["test", 123];

    expect(tupleSchema.parse(data)).toEqual(data);

    const camelSchema = zodToCamelCaseInputAndOutput(tupleSchema);

    const camelData = keysToCamel(data);

    expect(camelSchema.parse(camelData)).toEqual(camelData);
  });
});

describe("zodToCamelCaseInputOutput", () => {
  test("nested", () => {
    const schema = z.object({
      key_one: z.string(),
      key_two: z.string(),
      additional_props: z.object({
        foo_bar: z.number(),
      }),
    });
    const camelCaseSchema = zodToCamelCaseInputAndOutput(schema);
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

  test("error remapped", () => {
    const schema = z.object({
      key_one: z.string(),
    });
    const camelCaseSchema = zodToCamelCaseInputAndOutput(schema);
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
        2
      )
    );
  });
});
