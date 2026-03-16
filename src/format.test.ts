import { describe, expect, test } from "vitest";

import {
  camelToSnakeCase,
  keysToCamelCase,
  keysToSnakeCase,
  snakeToCamelCase,
} from "./format";

describe("snakeToCamelCase", () => {
  const TEST_CASES = [
    { input: "foo_bar_baz", expected: "fooBarBaz" },
    { input: "foo_bar__baz", expected: "fooBarBaz" },
    { input: "foo__bar_baz", expected: "fooBarBaz" },
    { input: "foo__", expected: "foo__" },
    { input: "foo_", expected: "foo_" },
    { input: "_foo_bar", expected: "_fooBar" },
    { input: "_foo_bar_baz_", expected: "_fooBarBaz_" },
    { input: "__foo_bar_", expected: "__fooBar_" },
    { input: "__foo_", expected: "__foo_" },
  ];

  for (const { input, expected } of TEST_CASES) {
    test(`${JSON.stringify(input)} -> ${JSON.stringify(expected)}`, () => {
      expect(snakeToCamelCase(input)).toEqual(expected);
    });
  }
});

describe("camelToSnakeCase", () => {
  const TEST_CASES = [
    { input: "fooBarBaz", expected: "foo_bar_baz" },
    { input: "foo", expected: "foo" },
  ];

  for (const { input, expected } of TEST_CASES) {
    test(`${JSON.stringify(input)} -> ${JSON.stringify(expected)}`, () => {
      expect(camelToSnakeCase(input)).toEqual(expected);
    });
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
            foo: [{ __foo_bar: "foo", foo_bar_baz: "foo" }],
          },
        },
      },
      expected: {
        fooBar: "testing",
        additionalProps: {
          testBaz: {
            foo: [{ __fooBar: "foo", fooBarBaz: "foo" }],
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
