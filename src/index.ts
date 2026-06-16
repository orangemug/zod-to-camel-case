import { keysToCamelCase, keysToSnakeCase, keysToCamelCaseNoDepth } from "./format";
import { ZodContribSnakeToCamel, ZodContribKeysToCamel } from "./types";
import { $ZodFile, $ZodCustom, $ZodLazy, $ZodPromise, $ZodTemplateLiteral, $ZodReadonly, $ZodPipe, $ZodNaN, $ZodCatch, $ZodPrefault, $ZodDefault, $ZodTransform, $ZodSuccess, $ZodNonOptional, $ZodOptional, $ZodNullable, $ZodLiteral, $ZodEnum, $ZodSet, $ZodDate, $ZodUnknown, $ZodAny, $ZodNever, $ZodVoid, $ZodNull, $ZodFunction, $ZodObject, $ZodUndefined, $ZodSymbol, $ZodBoolean, $ZodBigInt, $ZodNumber, $ZodString, $ZodRecord, $ZodRecordDef, $ZodType, $ZodArray, $ZodTuple, $ZodUnion, $ZodIntersection, $ZodMap } from "zod/v4/core";
import z, { ZodSafeParseResult, ZodType } from "zod";

export { keysToCamelCase, keysToSnakeCase };
export type { ZodContribSnakeToCamel, ZodContribKeysToCamel };

export type zodToCamelCaseOptions = { bidirectional?: boolean };

const parsers = {
  "string": (schema: $ZodString, _remap: boolean) => {
    return schema
  },
  "number": (schema: $ZodNumber, _remap: boolean) => {
    return schema
  },
  "bigint": (schema: $ZodBigInt, _remap: boolean) => {
    return schema;
  },
  "boolean": (schema: $ZodBoolean, _remap: boolean) => {
    return schema;
  },
  "symbol": (schema: $ZodSymbol, _remap: boolean) => {
    return schema;
  },
  "undefined": (schema: $ZodUndefined, _remap: boolean) => {
    return schema;
  },
  "object": (schema: $ZodObject, remap: boolean) => {
    // Required...
    const newShape = remap ? keysToCamelCaseNoDepth(schema._zod.def.shape) : schema._zod.def.shape;

    return new $ZodObject({
      ...schema._zod.def,
        shape: Object.fromEntries(
        Object.entries(newShape).map(([k, v]) => [
          k,
          parse(v as unknown as $ZodType, remap),
        ]),
      ),
      catchall: schema._zod.def.catchall ? parse(schema._zod.def.catchall, remap) : undefined,
    });
  },
  "function": (schema: $ZodFunction, remap: boolean) => {
    return new $ZodFunction({
      ...schema._zod.def,
      input: parse(schema._zod.def.input, remap),
      output: parse(schema._zod.def.output, remap),
    });
  },
  "int": (schema: $ZodNumber, _remap: boolean) => {
    return schema;
  },
  "null": (schema: $ZodNull, _remap: boolean) => {
    return schema;
  },
  "void": (schema: $ZodVoid, _remap: boolean) => {
    return schema;
  },
  "never": (schema: $ZodNever, _remap: boolean) => {
    return schema
  },
  "any": (schema: $ZodAny, _remap: boolean) => {
    return schema
  },
  "unknown": (schema: $ZodUnknown, _remap: boolean) => {
    return schema;
  },
  "date": (schema: $ZodDate, _remap: boolean) => {
    return schema
  },
  "record": (schema: $ZodRecord, remap: boolean) => {
    // Required...
    return new $ZodRecord({
      ...schema._zod.def,
      keyType: parse(schema._zod.def.keyType, remap) as $ZodType<string | number | symbol, unknown>,
      valueType: parse(schema._zod.def.valueType, remap) as $ZodRecordDef["valueType"],
    })
  },
  "file": (schema: $ZodFile, _remap: boolean) => {
    return schema;
  },
  "array": (schema: $ZodArray, remap: boolean) => {
    // Required...
    return new $ZodArray({
      ...schema._zod.def,
      element: parse(schema._zod.def.element, remap),
    });
  },
  "tuple": (schema: $ZodTuple, remap: boolean) => {
    // return schema
    return new $ZodTuple({
      ...schema._zod.def,
      items: (schema._zod.def.items ?? []).map((item) => parse(item, remap))
    });
  },
  "union": (schema: $ZodUnion, remap: boolean) => {
    // Required...
    return new $ZodUnion({
      ...schema._zod.def,
      options: schema._zod.def.options.map((option) => parse(option, remap)),
    });
  },
  "intersection": (schema: $ZodIntersection, remap: boolean) => {
    // Required...
    return new $ZodIntersection({
      ...schema._zod.def,
      left: parse(schema._zod.def.left, remap),
      right: parse(schema._zod.def.right, remap),
    });
  },
  "map": (schema: $ZodMap, remap: boolean) => {
    // Required...
    return new $ZodMap({
      ...schema._zod.def,
      keyType: parse(schema._zod.def.keyType, remap),
      valueType: parse(schema._zod.def.valueType, remap),
    });
  },
  "set": (schema: $ZodSet, remap: boolean) => {
    // Required...
    return new $ZodSet({
      ...schema._zod.def,
      valueType: parse(schema._zod.def.valueType, remap),
    });
  },
  "enum": (schema: $ZodEnum, _remap: boolean) => {
    return schema;
  },
  "literal": (schema: $ZodLiteral, _remap: boolean) => {
    return schema;
  },
  "nullable": (schema: $ZodNullable, remap: boolean) => {
    return new $ZodNullable({
      ...schema._zod.def,
      innerType: parse(schema._zod.def.innerType, remap),
    });
  },
  "optional": (schema: $ZodOptional, remap: boolean) => {
    return new $ZodOptional({
      ...schema._zod.def,
      innerType: parse(schema._zod.def.innerType, remap),
    });
  },
  "nonoptional": (schema: $ZodNonOptional, remap: boolean) => {
    return new $ZodNonOptional({
      ...schema._zod.def,
      innerType: parse(schema._zod.def.innerType, remap),
    });
  },
  "success": (schema: $ZodSuccess, remap: boolean) => {
    return new $ZodSuccess({
      ...schema._zod.def,
      innerType: parse(schema._zod.def.innerType, remap),
    });
  },
  "transform": (schema: $ZodTransform, remap: boolean) => {
    return schema
  },
  "default": (schema: $ZodDefault, remap: boolean) => {
    return new $ZodDefault({
      ...schema._zod.def,
      innerType: parse(schema._zod.def.innerType, remap),
    });
  },
  "prefault": (schema: $ZodPrefault, remap: boolean) => {
    return new $ZodPrefault({
      ...schema._zod.def,
      innerType: parse(schema._zod.def.innerType, remap),
    });
  },
  "catch": (schema: $ZodCatch, remap: boolean) => {
    return new $ZodCatch({
      ...schema._zod.def,
      innerType: parse(schema._zod.def.innerType, remap),
    });
  },
  "nan": (schema: $ZodNaN, remap: boolean) => {
    return schema;
  },
  "pipe": (schema: $ZodPipe, remap: boolean) => {
    return schema;
  },
  "readonly": (schema: $ZodReadonly, remap: boolean) => {
    return new $ZodReadonly({
      ...schema._zod.def,
      innerType: parse(schema._zod.def.innerType, remap),
    });
  },
  "template_literal": (schema: $ZodTemplateLiteral) => {
    return schema;
  },
  "promise": (schema: $ZodPromise, remap: boolean ) => {
    return new $ZodPromise({
      ...schema._zod.def,
      innerType: parse(schema._zod.def.innerType, remap)
    });
  },
  "lazy": (schema: $ZodLazy, remap: boolean) => {
    // Required...
    return schema;
  },
  "custom": (schema: $ZodCustom, remap: boolean) => {
    // Required...
    return schema;
  },
} as const

export function parse<T extends $ZodType>(schema: T, remap: boolean): T {
  const type = schema._zod.def.type;
  const fn = parsers[type]
 const out = (fn as unknown as (schema: $ZodType, remap: boolean) => $ZodType)(schema, remap);
 return out as T;
}

type parse<Input, T> = (input: Input) => ZodContribKeysToCamel<z.infer<T>>;

// safeParse(...) with optional `Input` type
type safeParse<Input, T> = (input: Input) => ZodSafeParseResult<ZodContribKeysToCamel<z.infer<T>>>;

// zodToCamelCase (unidirectional)
export default function zodToCamelCase<T extends ZodType>(
  schema: T,
  // Overload for 'true' condition
  options: { bidirectional: true },
): Omit<ZodType<ZodContribKeysToCamel<z.infer<T>>>, "parse" | "safeParse"> & {
  // Expecting snake-case-case input to parse
  parse: parse<ZodContribKeysToCamel<z.infer<T>>, T>;
  // Expecting snake-case-case input to safeParse
  safeParse: safeParse<ZodContribKeysToCamel<z.infer<T>>, T>;
};

// zodToCamelCase (bidirectional)
export default function zodToCamelCase<T extends ZodType>(
  schema: T,
  // Overload for 'false' and 'missing' condition
  options?: { bidirectional?: false },
): Omit<ZodType<ZodContribKeysToCamel<z.infer<T>>>, "parse" | "safeParse"> & {
  // Expecting snake-case-case input to parse
  parse: parse<z.infer<T>, T>;
  // Expecting snake-case-case input to safeParse
  safeParse: safeParse<z.infer<T>, T>;
};

export default function zodToCamelCase<T extends ZodType>(
  schema: T,
  {bidirectional=false}: zodToCamelCaseOptions = {},
) {
  const schemaNew = parse(schema, true);

  const remap = (data: unknown) => {
    return bidirectional ? data : keysToCamelCase(data);
  }

  const wrapped = z.preprocess(
    remap,
    schemaNew,
  ) as z.ZodType<ZodContribKeysToCamel<z.infer<T>>, unknown>;

  Object.defineProperty(wrapped, "toJSONSchema", {
    value: (params?: Parameters<typeof z.toJSONSchema>[1]) =>
      z.toJSONSchema(schemaNew, params),
    configurable: true,
  });

  return wrapped;
}
