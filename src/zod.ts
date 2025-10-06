import z from "zod";
import { $ZodType } from "zod/v4/core";

// From <https://github.com/colinhacks/zod/discussions/2134#discussioncomment-5194111>
export function zodKeys <T extends $ZodType>(schema: T): string[][] {
    // make sure schema is not null or undefined
    if (schema === null || schema === undefined) return [];
    // check if schema is nullable or optional
    if (schema instanceof z.ZodNullable || schema instanceof z.ZodOptional) return zodKeys(schema.unwrap());
    // check if schema is an array
    if (schema instanceof z.ZodArray) return zodKeys(schema.element);
    // check if schema is an object
    if (schema instanceof z.ZodObject) {
        // get key/value pairs from schema
        const entries = Object.entries(schema.shape);
        // loop through key/value pairs

        const out: string[][] = [];
        for (const [key,value] of entries) {
        if (value instanceof z.ZodType) {
            const subKeyList = zodKeys(value);
            if (subKeyList.length > 0) {
            for (const subKeys of subKeyList) {
                out.push([key].concat(subKeys ?? []))
            }
            } else {
            out.push([key])
            }
        } else {
            out.push([key]);
        }
        }
        return out;
    }
    // return empty array
    return [];
};

export function zodSiblingKeys <T extends $ZodType>(schema: T, fn: (keys: string[], path: string[], type: "union" | "object") => void, path: string[]=[]): void {
    // make sure schema is not null or undefined
    if (schema === null || schema === undefined) [];

    if (schema instanceof z.ZodUnion) {
        for (const opt of schema.options) {
            zodSiblingKeys(opt, fn, path)
        }
    }
    // check if schema is nullable or optional
    if (schema instanceof z.ZodNullable || schema instanceof z.ZodOptional) zodSiblingKeys(schema.unwrap(), fn, path);
    // check if schema is an array
    if (schema instanceof z.ZodArray) zodSiblingKeys(schema.element, fn, path.concat("*"));
    // check if schema is an object
    if (schema instanceof z.ZodObject) {
        // get key/value pairs from schema
        const entries = Object.entries(schema.shape);
        // loop through key/value pairs

        fn(Object.keys(schema.shape), path, "object")

        const out: string[][] = [];
        for (const [key,value] of entries) {
            if (value instanceof z.ZodType) {
                zodSiblingKeys(value, fn, path.concat(key));
            }
        }
    }
};