import { describe, expectTypeOf, test } from "vitest";
import { ZodContribKeysToCamel, ZodContribSnakeToCamel } from "./types";

describe("types", () => {
  test("ZodContribSnakeToCamel", () => {
    expectTypeOf<
      ZodContribSnakeToCamel<"foo_bar_baz">
    >().toEqualTypeOf<"fooBarBaz">();
    expectTypeOf<
      ZodContribSnakeToCamel<"foo_bar__baz">
    >().toEqualTypeOf<"fooBarBaz">();
    expectTypeOf<
      ZodContribSnakeToCamel<"foo__bar_baz">
    >().toEqualTypeOf<"fooBarBaz">();
    expectTypeOf<ZodContribSnakeToCamel<"foo__">>().toEqualTypeOf<"foo__">();
    expectTypeOf<ZodContribSnakeToCamel<"foo_">>().toEqualTypeOf<"foo_">();
    expectTypeOf<ZodContribSnakeToCamel<"_foo_bar">>().toEqualTypeOf<"_fooBar">();
    expectTypeOf<
      ZodContribSnakeToCamel<"_foo_bar_baz_">
    >().toEqualTypeOf<"_fooBarBaz_">();
    expectTypeOf<
      ZodContribSnakeToCamel<"__foo_bar__">
    >().toEqualTypeOf<"__fooBar__">();
  });

  describe("ZodContribKeysToCamel", () => {
    test("simple object", () => {
      expectTypeOf<
        ZodContribKeysToCamel<{
          foo_bar_baz: {
            __foo_bar_baz_?: {
              name: string;
            };
          };
        }>
      >().toEqualTypeOf<{
        fooBarBaz: {
          __fooBarBaz_?: {
            name: string;
          };
        };
      }>();
    });

    test("with arrays", () => {
      expectTypeOf<
        ZodContribKeysToCamel<{
          foo_bar_baz: {
            __foo_bar_baz_: {
              name: string;
              check: boolean;
            }[];
          } | null;
        }>
      >().toEqualTypeOf<{
        fooBarBaz: {
          __fooBarBaz_: {
            name: string;
            check: boolean;
          }[];
        } | null;
      }>();
    });
  });
});
