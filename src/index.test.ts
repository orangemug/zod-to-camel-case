import z, { file } from "zod";
import { describe, expect, expectTypeOf, test, it } from "vitest";

import zodToCamelCase from "./";
import { keysToCamelCase } from "./format";
import { zodError } from "./test-utils";

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

    const camelCaseSchema = zodToCamelCase(snake_case_schema);
    const camelParsedData = camelCaseSchema.parse(snake_data);

    const camelData = keysToCamelCase(snake_data);

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

    const camelData = keysToCamelCase(nested_data);

    const camelCaseSchema = zodToCamelCase(nested_schema);

    expect(camelCaseSchema.parse(nested_data)).toEqual(camelData);
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

    const camelData = keysToCamelCase(optional_data);

    const camelCaseSchema = zodToCamelCase(optional_schema);
    
    const out = camelCaseSchema.parse(optional_data)
    expect(out).toEqual(camelData);
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

  it("can convert a 'string' schema", () => {
    const schema = zodToCamelCase(z.string());
    expect(schema.parse("test")).toEqual("test");
  })

  it("can convert a 'number' schema", () => {
    const schema = zodToCamelCase(z.number());
    expect(schema.parse(123)).toEqual(123);
  })

  it("can convert a 'bigint' schema", () => {
    const schema = zodToCamelCase(z.bigint());
    expect(schema.parse(BigInt(123))).toEqual(BigInt(123));
  })

  it("can convert a 'boolean' schema", () => {
    const schema = zodToCamelCase(z.boolean());
    expect(schema.parse(true)).toEqual(true);
  })

  it("can convert a 'symbol' schema", () => {
    const schema = zodToCamelCase(z.symbol());
    const sym = Symbol("test");
    expect(schema.parse(sym)).toEqual(sym);
  })

  it("can convert a 'undefined' schema", () => {
    const schema = zodToCamelCase(z.undefined());
    expect(schema.parse(undefined)).toEqual(undefined);
  })
  
  it("can convert a 'object' schema", () => {
    const schema = zodToCamelCase(z.object({
      test_param: z.string(),
    }));
    const data = {
      test_param: "test",
    };
    expect(schema.parse(data)).toEqual({
      testParam: "test",
    });
  })
  
  it.skip("can convert a 'function' schema", () => {

  })
  
  it("can convert a 'int' schema", () => {
    const schema = zodToCamelCase(z.int());
    expect(schema.parse(1)).toEqual(1);
  })
  
  it("can convert a 'null' schema", () => {
    const schema = zodToCamelCase(z.null());
    expect(schema.parse(null)).toEqual(null);
  })
  
  it("can convert a 'void' schema", () => {
    const schema = zodToCamelCase(z.void());
    expect(schema.parse(void(0))).toEqual(void(0));
  })
  
  it("can convert a 'never' schema", () => {
    const schema = zodToCamelCase(z.never());
    expect(() => schema.parse("foo")).toThrow();
  })
  
  it("can convert a 'any' schema", () => {
    const schema = zodToCamelCase(z.any());
    expect(schema.parse({a: 1})).toEqual({a: 1});
  })
  
  it("can convert a 'unknown' schema", () => {
    const schema = zodToCamelCase(z.unknown());
    expect(schema.parse({a: 1})).toEqual({a: 1});
  })
  
  it("can convert a 'date' schema", () => {
    const schema = zodToCamelCase(z.iso.date());
    expect(schema.parse("2020-01-01")).toEqual("2020-01-01");
  })
  
  it("can convert a 'record' schema", () => {
    const schema = zodToCamelCase(z.record(z.string(), z.number()));
    expect(schema.parse({a: 23})).toEqual({a: 23});
  })
  
  it.skip("can convert a 'file' schema", () => {
    const schema = zodToCamelCase(z.file());
    const file = new File([], "test.txt")
    expect(schema.parse(file)).toEqual(file);
  })
  
  it("can convert a 'array' schema", () => {
    const schema = zodToCamelCase(z.array(z.string()));
    expect(schema.parse(["test"])).toEqual(["test"]);
  })
  
  it("can convert a 'tuple' schema", () => {
    const schema = zodToCamelCase(z.tuple([z.string(), z.number(), z.string()]));
    expect(schema.parse(["test", 2, "test"])).toEqual(["test", 2, "test"]);
  })
  
  it("can convert a 'union' schema", () => {
    const schema = zodToCamelCase(z.union([z.string(), z.number()]));
    expect(schema.parse("test")).toEqual("test");
    expect(schema.parse(123)).toEqual(123);
  })
  
  it.skip("can convert a 'intersection' schema", () => {

  })
  
  it("can convert a 'map' schema", () => {
    const schema = zodToCamelCase(z.map(z.string(), z.number()));
    const m = new Map();
    m.set("a", 1);
    m.set("b", 2);
    expect(schema.parse(m)).toEqual(m);
  })
  
  it("can convert a 'set' schema", () => {
    const schema = zodToCamelCase(z.set(z.string()));
    const s = new Set<string>();
    s.add("a");
    s.add("b");
    expect(schema.parse(s)).toEqual(s);
  })
  
  it("can convert a 'enum' schema", () => {
    const schema = zodToCamelCase(z.enum(["a", "b", "c"]));
    expect(schema.parse("a")).toEqual("a");
    expect(schema.parse("b")).toEqual("b");
    expect(schema.parse("c")).toEqual("c");
  })
  
  it("can convert a 'literal' schema", () => {
    const schema = zodToCamelCase(z.literal("testing"));
    expect(schema.parse("testing")).toEqual("testing");
  })
  
  it("can convert a 'nullable' schema", () => {
    const schema = zodToCamelCase(z.string().nullable());
    expect(schema.parse(null)).toEqual(null);
  })
  
  it("can convert a 'optional' schema", () => {
    const schema = zodToCamelCase(z.string().optional());
    expect(schema.parse(undefined)).toEqual(undefined);
  })
  
  it("can convert a 'nonoptional' schema", () => {
    const schema = zodToCamelCase(z.string().nonoptional());
    expect(schema.parse("test")).toEqual("test");
  })
  
  it.skip("can convert a 'success' schema", () => {

  })
  
  it("can convert a 'transform' schema", () => {
    const schema = zodToCamelCase(z.string().transform(val => val.length));
    expect(schema.parse("test")).toEqual(4);
  })
  
  it("can convert a 'default' schema", () => {
    const schema = zodToCamelCase(z.string().default("hello"));
    expect(schema.parse(undefined)).toEqual("hello");
  })
  
  it("can convert a 'prefault' schema", () => {
    const schema = zodToCamelCase(z.string().trim().toUpperCase().prefault("tiger"));
    expect(schema.parse(undefined)).toEqual("TIGER");
  })
  
  it("can convert a 'catch' schema", () => {
    const schema = zodToCamelCase(z.number().catch(42));
    expect(schema.parse("testing")).toEqual(42);
  })
  
  it("can convert a 'nan' schema", () => {
    const schema = zodToCamelCase(z.nan());
    expect(schema.parse(NaN)).toEqual(NaN);
  })
  
  it.skip("can convert a 'pipe' schema", () => {

  })
  
  it.skip("can convert a 'readonly' schema", () => {

  })
  
  it.skip("can convert a 'template_literal' schema", () => {

  })
  
  it.skip("can convert a 'promise' schema", async () => {
    // const schema = zodToCamelCase(z.promise(z.number()));
    // expect(await schema.parseAsync(Promise.resolve(2))).toEqual(2);
  })
  
  it.skip("can convert a 'lazy' schema", () => {

  })
  
  it.skip("can convert a 'custom' schema", () => {

  })

  it("can convert a union schema of simple and complex objects", () => {
    const union_schema = z.object({
      test_param: z.union([complex_schema, simple_schema]),
    });

    const unionSchema = zodToCamelCase(union_schema);

    const simple_item = {
      type: "simple" as const,
      url: "https://example.com/simple_image.png",
      size: 12345,
    };

    expect(() => union_schema.parse({ test_param: simple_item })).not.toThrow();

    const simpleItem = keysToCamelCase(simple_item);

    expect(() => unionSchema.parse({ test_param: simpleItem })).not.toThrow();
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

    const data = { type: "snake_type" as const, snake_type: "test" };
    expect(schema.parse(data)).toEqual(data);

    const camelSchema = zodToCamelCase(schema);
    const camelData = keysToCamelCase(data);

    expect(camelSchema.parse(data)).toEqual(camelData);
  });

  it("can convert a tuple schema", () => {
    const tupleSchema = z.tuple([z.string(), z.number()]);

    const data: [string, number] = ["test", 123];

    expect(tupleSchema.parse(data)).toEqual(data);

    const camelSchema = zodToCamelCase(tupleSchema);

    const camelData = keysToCamelCase(data);

    expect(camelSchema.parse(camelData)).toEqual(camelData);
  });

  it("can be used in an array after conversion", () => {
    // Note: Putting in an array AFTER converting to camel-case
    const elementSchema = zodToCamelCase(
      z.object({ element_name: z.string() })
    );
    const arraySchema = z.array(elementSchema);

    expect(arraySchema.parse(
      [
        { element_name: "a" },
        { element_name: "b" },
      ]
    )).toEqual(
      [
        { elementName: "a" },
        { elementName: "b" },
      ]
    );
  });

  it("has separate state when used multiple times", () => {
    const schema = z.object({
      key_one: z.string(),
      key_two: z.string(),
    });
    const camelCase = zodToCamelCase(schema);

    expect(camelCase.parse({
      key_one: "abc",
      key_two: "def",
    })).toEqual({
      keyOne: "abc",
      keyTwo: "def",
    });

    expect(() =>
      camelCase.parse({
        key_one: "abc",
        // @ts-expect-error
        key_two: 2,
      })
    ).toThrow(zodError(
      {
        expected: "string",
        code: "invalid_type",
        path: ["keyTwo"],
        message: "Invalid input: expected string, received number",
      },
    ));

    expect(camelCase.parse({
      key_one: "abc",
      key_two: "def",
    })).toEqual({
      keyOne: "abc",
      keyTwo: "def",
    });

    expect(() =>
      camelCase.parse({
        // @ts-expect-error
        key_one: 2,
        key_two: "def",
      })
    ).toThrow(zodError(
      {
        expected: "string",
        code: "invalid_type",
        path: ["keyOne"],
        message: "Invalid input: expected string, received number",
      },
    ));
  });

  it("has separate state to the original schema", () => {
    const schema = z.object({
      key_one: z.string(),
      key_two: z.string(),
    });
    const camelCase = zodToCamelCase(schema);

    expect(schema.parse({
      key_one: "abc",
      key_two: "def",
    })).toEqual({
      key_one: "abc",
      key_two: "def",
    });

    expect(camelCase.parse({
      key_one: "abc",
      key_two: "def",
    })).toEqual({
      keyOne: "abc",
      keyTwo: "def",
    });

    expect(() =>
      schema.parse({
        key_one: "abc",
        key_two: 2,
      })
    ).toThrow(zodError(
      {
        expected: "string",
        code: "invalid_type",
        path: ["key_two"],
        message: "Invalid input: expected string, received number",
      },
    ));

    expect(() =>
      camelCase.parse({
        // @ts-expect-error
        key_one: 2,
        key_two: "def",
      })
    ).toThrow(zodError(
      {
        expected: "string",
        code: "invalid_type",
        path: ["keyOne"],
        message: "Invalid input: expected string, received number",
      },
    ));
  });
});

describe("zodToCamelCase (bidirectional)", () => {
  it("Discriminated union must have at least one option", () => {
    const schema = z.discriminatedUnion("type", [
      z.object({ type: z.literal("snake_type"), snake_type: z.string() }),
    ]);

    const data = { type: "snake_type" as const, snake_type: "test" };

    expect(schema.parse(data)).toEqual(data);

    const camelSchema = zodToCamelCase(schema, { bidirectional: true });

    const camelData = keysToCamelCase(data);

    expect(camelSchema.parse(camelData)).toEqual(camelData);
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

    const camelData = keysToCamelCase(optional_data);

    const camelCaseSchema = zodToCamelCase(optional_schema, {
      bidirectional: true,
    });

    expect(camelCaseSchema.parse(camelData)).toEqual(camelData);
  });

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

  test("toJSONSchema", () => {
    const schema = z.array(z.object({ foo_bar: z.string() }));
    const camelCaseSchema = zodToCamelCase(schema, { bidirectional: true });
    const result = camelCaseSchema.toJSONSchema();
    expect(result).toEqual({
      "$schema": "https://json-schema.org/draft/2020-12/schema",
      "items": {
        "additionalProperties": false,
        "properties": {
          "fooBar": {
            "type": "string",
          },
        },
        "required": [
          "fooBar",
        ],
        "type": "object",
      },
      "type": "array",
    });
  });

  test("pipe", () => {
    const schema = z.object({ foo_bar: z.string() });
    const camelCaseSchema = zodToCamelCase(schema, { bidirectional: false });
    const result = camelCaseSchema.pipe(z.transform(o => Object.keys(o))).parse({ foo_bar: "testing" });
    expect(result).toEqual(["fooBar"]);
  });

});

