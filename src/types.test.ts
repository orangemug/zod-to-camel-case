import { describe, expectTypeOf, test } from "vitest";
import {
  DisallowMultipleUnderScores,
  OnlyAllowedChars,
  AsCamelCase,
  ZodContribKeysToCamel,
  ZodContribSnakeToCamel,
} from "./types";

describe("types", () => {
  test("OnlyAllowedChars", () => {
    expectTypeOf<
      OnlyAllowedChars<"abcdefghijklmnop">
    >().toEqualTypeOf<"abcdefghijklmnop">();
    expectTypeOf<
      OnlyAllowedChars<"qrstuvwxyz">
    >().toEqualTypeOf<"qrstuvwxyz">();
    expectTypeOf<OnlyAllowedChars<"café">>().toBeNever();
  });

  test("DisallowMultipleUnderScores", () => {
    expectTypeOf<
      DisallowMultipleUnderScores<"one_two_three">
    >().toEqualTypeOf<"one_two_three">();
    expectTypeOf<DisallowMultipleUnderScores<"one__two_three">>().toBeNever();
  });

  test("AsCamelCase", () => {
    expectTypeOf<AsCamelCase<"one_two_three">>().toEqualTypeOf<"oneTwoThree">();
    // NOTE: This is weak so things like this still pass through, we combine with other type to prevent this
    expectTypeOf<
      AsCamelCase<"one__two__three">
    >().toEqualTypeOf<"oneTwoThree">();
  });

  test(`ZodContribSnakeToCamel`, () => {
    expectTypeOf<ZodContribSnakeToCamel<"foo_bar">>().toEqualTypeOf<"fooBar">();
    expectTypeOf<
      ZodContribSnakeToCamel<"foo_bar_baz">
    >().toEqualTypeOf<"fooBarBaz">();
    expectTypeOf<ZodContribSnakeToCamel<"foo__">>().toEqualTypeOf<"foo__">();
    expectTypeOf<ZodContribSnakeToCamel<"foo_">>().toEqualTypeOf<"foo_">();
    expectTypeOf<ZodContribSnakeToCamel<"__foo_">>().toEqualTypeOf<"__foo_">();

    expectTypeOf<ZodContribSnakeToCamel<"_">>().toBeNever();
    expectTypeOf<ZodContribSnakeToCamel<"__">>().toBeNever();
    expectTypeOf<ZodContribSnakeToCamel<"foo_bar__baz">>().toBeNever();
    expectTypeOf<ZodContribSnakeToCamel<"foo__bar_baz">>().toBeNever();
    expectTypeOf<ZodContribSnakeToCamel<"__ID_">>().toBeNever();
    expectTypeOf<ZodContribSnakeToCamel<"foo__bar">>().toBeNever();
    expectTypeOf<ZodContribSnakeToCamel<"fooBarBaz">>().toBeNever();
    expectTypeOf<ZodContribSnakeToCamel<"ca_fé">>().toBeNever();
    expectTypeOf<ZodContribSnakeToCamel<"c_$fé">>().toBeNever();
    expectTypeOf<ZodContribSnakeToCamel<"some_c$fé">>().toBeNever();
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
