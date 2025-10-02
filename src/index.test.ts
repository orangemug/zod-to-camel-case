import z from "zod"
import { zodToCamelCaseOutput, zodToCamelCaseInputAndOutput } from "./"

describe("zodToCamelCaseOutput", () => {
    test("nested", () => {
        const schema = z.object({
            key_one: z.string(),
            key_two: z.string(),
            additional_props: z.object({
                foo_bar: z.number(),
            }),
        })
        const camelCaseSchema = zodToCamelCaseOutput(schema);
        const results = camelCaseSchema.parse({
            key_one: "one",
            key_two: "two",
            additional_props: {
                foo_bar: 4
            }
        })
        expect(results).toEqual({
            keyOne: "one",
            keyTwo: "two",
            additionalProps: {
                fooBar: 4
            }
        })
    })

    test("error remapped", () => {
        const schema = z.object({
            key_one: z.string(),
        })
        const camelCaseSchema = zodToCamelCaseOutput(schema);
        const results = camelCaseSchema.safeParse({
            // @ts-expect-error 
            key_two: "one",
        })
        expect(results.success).toEqual(false);
        expect(results.error?.message).toEqual(JSON.stringify([
            {
            "expected": "string",
            "code": "invalid_type",
            "path": [
                "key_one"
            ],
            "message": "Invalid input: expected string, received undefined"
            }
        ], null, 2));
    })
})

describe("zodToCamelCaseInputOutput", () => {
    test("nested", () => {
        const schema = z.object({
            key_one: z.string(),
            key_two: z.string(),
            additional_props: z.object({
                foo_bar: z.number(),
            }),
        })
        const camelCaseSchema = zodToCamelCaseInputAndOutput(schema);
        const results = camelCaseSchema.parse({
            keyOne: "one",
            keyTwo: "two",
            additionalProps: {
                fooBar: 4
            }
        })
        expect(results).toEqual({
            keyOne: "one",
            keyTwo: "two",
            additionalProps: {
                fooBar: 4
            }
        })
    })

    test("error remapped", () => {
        const schema = z.object({
            key_one: z.string(),
        })
        const camelCaseSchema = zodToCamelCaseInputAndOutput(schema);
        const results = camelCaseSchema.safeParse({
            // @ts-expect-error 
            keyTwo: "one",
        })
        expect(results.success).toEqual(false);
        expect(results.error?.message).toEqual(JSON.stringify([
            {
            "expected": "string",
            "code": "invalid_type",
            "path": [
                "keyOne"
            ],
            "message": "Invalid input: expected string, received undefined"
            }
        ], null, 2));
    })
})