import { describe, expect, test } from "vitest";
import { zodKeys } from "./zod";
import z from "zod";

describe("zodKeys", () => {
    test("simple", () => {
        const keys = zodKeys(z.object({
            test: z.string(),
            foo_bar: z.array(
                z.object({
                    bar_baz: z.string(),
                    one_two: z.object({
                        three_four: z.string()
                    })
                })
            )
        }))
        expect(keys).toEqual([
            ["test"],
            ["foo_bar", "bar_baz"],
            ["foo_bar", "one_two", "three_four"],
        ])
    })
})