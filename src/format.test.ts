import { describe, expect, test } from "vitest";

import {
  camelToSnakeCase,
  keysToCamelCase,
  keysToSnakeCase,
  prettyFormatArray,
  snakeToCamelCase,
} from "./format";

describe("snakeToCamelCase", () => {
  const TEST_CASES = [
    { input: "foo_bar_baz", expected: "fooBarBaz" },
    { input: "foo_bar__baz", expected: "fooBarBaz" },
    { input: "foo__bar_baz", expected: "fooBarBaz" },
    { input: "foo__", expected: "foo" },
    { input: "foo_", expected: "foo" },
    { input: "__foo_", expected: "foo" },
    { input: "__foo_", expected: "foo" },
    { input: "__ID_", expected: "id" },
    { input: "fooBarBaz", expected: "foobarbaz" },
    { input: "c_$fé", expected: "c$fé" },
    { input: "some_c$fé", expected: "someC$fé" },
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
            foo: [{ __foo_bar: "foo" }],
          },
        },
      },
      expected: {
        fooBar: "testing",
        additionalProps: {
          testBaz: {
            foo: [{ fooBar: "foo" }],
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

describe("prettyFormatArray", () => {
  const TEST_CASES = [
    {input: ["foo"], expected: `"foo"`},
    {input: ["foo", "bar"], expected: `"foo" & "bar"`},
    {input: ["foo", "bar", "baz"], expected: `"foo", "bar" & "baz"`},
    {input: ["foo", 1, "baz"], expected: `"foo", 1 & "baz"`},
    {input: ["foo", false, "baz"], expected: `"foo", false & "baz"`},
  ];

  for (const { input, expected } of TEST_CASES) {
    test(`${JSON.stringify(input)} -> ${JSON.stringify(expected)}`, () => {
      expect(prettyFormatArray(input)).toEqual(expected);
    });
  }
});