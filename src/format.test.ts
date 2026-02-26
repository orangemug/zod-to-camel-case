import { describe, expect, test } from "vitest";

import {
  camelToSnakeCase,
  keysToCamelCase,
  keysToSnakeCase,
  snakeToCamelCase,
} from "./format";
import { snakeToCamelTestData } from "./helpers/data";

describe("snakeToCamelCase", () => {
  for (const item of snakeToCamelTestData) {
    if (item.throwsError) {
      test(`${JSON.stringify(item.input)} -> (throws)`, () => {
        expect(() => snakeToCamelCase(item.input)).toThrowError();
      });
    } else {
      test(`${JSON.stringify(item.input)} -> ${JSON.stringify(item.expected)}`, () => {
        expect(snakeToCamelCase(item.input)).toEqual(item.expected);
      });
    }
  }
});

describe("camelToSnakeCase", () => {
  for (const item of snakeToCamelTestData) {
    if (!item.throwsError) {
      test(`${JSON.stringify(item.expected)} -> ${JSON.stringify(item.input)}`, () => {
        expect(camelToSnakeCase(item.expected)).toEqual(item.input);
      });
    }
  }
});

describe("keysToCamelCase", () => {
  const TEST_CASES = [
    {
      name: "nested data",
      input: {
        foo_bar: "testing",
        additional_props: {
          test_baz: {
            foo: [{ __foo_bar: "foo" }],
          },
        },
      },
      expected: {
        fooBar: "testing",
        additionalProps: {
          testBaz: {
            foo: [{ __fooBar: "foo" }],
          },
        },
      },
    },
  ];

  for (const { name, input, expected } of TEST_CASES) {
    test(
      name ?? `${JSON.stringify(input)} -> ${JSON.stringify(expected)}`,
      () => {
        expect(keysToCamelCase(input)).toEqual(expected);
      },
    );
  }
});

describe("keysToSnakeCase", () => {
  const TEST_CASES = [
    {
      name: "nested data",
      input: {
        fooBar: "testing",
        additionalProps: {
          testBaz: {
            foo: [{ fooBar: "foo" }],
          },
        },
      },
      expected: {
        foo_bar: "testing",
        additional_props: {
          test_baz: {
            foo: [{ foo_bar: "foo" }],
          },
        },
      },
    },
  ];

  for (const { name, input, expected } of TEST_CASES) {
    test(
      name ?? `${JSON.stringify(input)} -> ${JSON.stringify(expected)}`,
      () => {
        expect(keysToSnakeCase(input)).toEqual(expected);
      },
    );
  }
});
