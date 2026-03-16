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
    expectTypeOf<ZodContribSnakeToCamel<"foo__">>().toEqualTypeOf<"foo">();
    expectTypeOf<ZodContribSnakeToCamel<"foo_">>().toEqualTypeOf<"foo">();
    expectTypeOf<ZodContribSnakeToCamel<"_state">>().toEqualTypeOf<"_state">();
    expectTypeOf<ZodContribSnakeToCamel<"__foo_">>().toEqualTypeOf<"__foo_">();
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
          __foo_bar_baz_?: {
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
          __foo_bar_baz_: {
            name: string;
            check: boolean;
          }[];
        } | null;
      }>();
    });
  });
});
