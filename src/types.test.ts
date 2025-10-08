import { describe, expectTypeOf, test } from "vitest";
import { ZodContribKeysToCamel, ZodContribSnakeToCamel } from "./types";
import { snakeToCamelTestData } from "./helpers/data";

describe("types", () => {
  test(`ZodContribSnakeToCamel`, () => {
    expectTypeOf<ZodContribSnakeToCamel<"foo_bar">>().toEqualTypeOf<"fooBar">();
    expectTypeOf<ZodContribSnakeToCamel<"foo_bar_baz">>().toEqualTypeOf<"fooBarBaz">();
    expectTypeOf<ZodContribSnakeToCamel<"foo_">>().toEqualTypeOf<"foo">();
    expectTypeOf<ZodContribSnakeToCamel<"_foo">>().toEqualTypeOf<"_foo">();
    expectTypeOf<ZodContribSnakeToCamel<"some_c$fé">>().toEqualTypeOf<"someC$fé">();
  })

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
