import { keysToCamelCase, keysToSnakeCase, keysToCamelCaseObjectRoot } from "./format";
import { ZodContribSnakeToCamel, ZodContribKeysToCamel } from "./types";
import { $ZodFile, $ZodCustom, $ZodLazy, $ZodPromise, $ZodTemplateLiteral, $ZodReadonly, $ZodPipe, $ZodNaN, $ZodCatch, $ZodPrefault, $ZodDefault, $ZodTransform, $ZodSuccess, $ZodNonOptional, $ZodOptional, $ZodNullable, $ZodLiteral, $ZodEnum, $ZodSet, $ZodDate, $ZodUnknown, $ZodAny, $ZodNever, $ZodVoid, $ZodNull, $ZodFunction, $ZodObject, $ZodUndefined, $ZodSymbol, $ZodBoolean, $ZodBigInt, $ZodNumber, $ZodString, $ZodRecord, $ZodRecordDef, $ZodType, $ZodArray, $ZodTuple, $ZodUnion, $ZodIntersection, $ZodMap } from "zod/v4/core";
import { preprocess, toJSONSchema } from "zod";
import type {ZodSafeParseResult, infer as zodInfer, ZodType} from "zod";

export { keysToCamelCase, keysToSnakeCase };
export type { ZodContribSnakeToCamel, ZodContribKeysToCamel };

export type zodToCamelCaseOptions = { bidirectional?: boolean };

const parsers = {
  "string": (schema: $ZodString) => {
    return schema
  },
  "number": (schema: $ZodNumber) => {
    return schema
  },
  "bigint": (schema: $ZodBigInt) => {
    return schema;
  },
  "boolean": (schema: $ZodBoolean) => {
    return schema;
  },
  "symbol": (schema: $ZodSymbol) => {
    return schema;
  },
  "undefined": (schema: $ZodUndefined) => {
    return schema;
  },
  "object": (schema: $ZodObject) => {
    const newShape = keysToCamelCaseObjectRoot(schema._zod.def.shape);

    return new $ZodObject({
      ...schema._zod.def,
        shape: Object.fromEntries(
        Object.entries(newShape).map(([k, v]) => [
          k,
          parse(v as unknown as $ZodType),
        ]),
      ),
      catchall: schema._zod.def.catchall ? parse(schema._zod.def.catchall) : undefined,
    });
  },
  "function": (schema: $ZodFunction) => {
    return new $ZodFunction({
      ...schema._zod.def,
      input: parse(schema._zod.def.input),
      output: parse(schema._zod.def.output),
    });
  },
  "int": (schema: $ZodNumber) => {
    return schema;
  },
  "null": (schema: $ZodNull) => {
    return schema;
  },
  "void": (schema: $ZodVoid) => {
    return schema;
  },
  "never": (schema: $ZodNever) => {
    return schema
  },
  "any": (schema: $ZodAny) => {
    return schema
  },
  "unknown": (schema: $ZodUnknown) => {
    return schema;
  },
  "date": (schema: $ZodDate) => {
    return schema
  },
  "record": (schema: $ZodRecord) => {
    return new $ZodRecord({
      ...schema._zod.def,
      keyType: parse(schema._zod.def.keyType) as $ZodType<string | number | symbol, unknown>,
      valueType: parse(schema._zod.def.valueType) as $ZodRecordDef["valueType"],
    })
  },
  "file": (schema: $ZodFile) => {
    return schema;
  },
  "array": (schema: $ZodArray) => {
    return new $ZodArray({
      ...schema._zod.def,
      element: parse(schema._zod.def.element),
    });
  },
  "tuple": (schema: $ZodTuple) => {
    return new $ZodTuple({
      ...schema._zod.def,
      items: (schema._zod.def.items ?? []).map((item) => parse(item))
    });
  },
  "union": (schema: $ZodUnion) => {
    return new $ZodUnion({
      ...schema._zod.def,
      options: schema._zod.def.options.map((option) => parse(option)),
    });
  },
  "intersection": (schema: $ZodIntersection) => {
    return new $ZodIntersection({
      ...schema._zod.def,
      left: parse(schema._zod.def.left),
      right: parse(schema._zod.def.right),
    });
  },
  "map": (schema: $ZodMap) => {
    return new $ZodMap({
      ...schema._zod.def,
      keyType: parse(schema._zod.def.keyType),
      valueType: parse(schema._zod.def.valueType),
    });
  },
  "set": (schema: $ZodSet) => {
    return new $ZodSet({
      ...schema._zod.def,
      valueType: parse(schema._zod.def.valueType),
    });
  },
  "enum": (schema: $ZodEnum) => {
    return schema;
  },
  "literal": (schema: $ZodLiteral) => {
    return schema;
  },
  "nullable": (schema: $ZodNullable) => {
    return new $ZodNullable({
      ...schema._zod.def,
      innerType: parse(schema._zod.def.innerType),
    });
  },
  "optional": (schema: $ZodOptional) => {
    return new $ZodOptional({
      ...schema._zod.def,
      innerType: parse(schema._zod.def.innerType),
    });
  },
  "nonoptional": (schema: $ZodNonOptional) => {
    return new $ZodNonOptional({
      ...schema._zod.def,
      innerType: parse(schema._zod.def.innerType),
    });
  },
  "success": (schema: $ZodSuccess) => {
    return new $ZodSuccess({
      ...schema._zod.def,
      innerType: parse(schema._zod.def.innerType),
    });
  },
  "transform": (schema: $ZodTransform) => {
    return schema
  },
  "default": (schema: $ZodDefault) => {
    return new $ZodDefault({
      ...schema._zod.def,
      innerType: parse(schema._zod.def.innerType),
    });
  },
  "prefault": (schema: $ZodPrefault) => {
    return new $ZodPrefault({
      ...schema._zod.def,
      innerType: parse(schema._zod.def.innerType),
    });
  },
  "catch": (schema: $ZodCatch) => {
    return new $ZodCatch({
      ...schema._zod.def,
      innerType: parse(schema._zod.def.innerType),
    });
  },
  "nan": (schema: $ZodNaN) => {
    return schema;
  },
  "pipe": (schema: $ZodPipe) => {
    return schema;
  },
  "readonly": (schema: $ZodReadonly) => {
    return new $ZodReadonly({
      ...schema._zod.def,
      innerType: parse(schema._zod.def.innerType),
    });
  },
  "template_literal": (schema: $ZodTemplateLiteral) => {
    return schema;
  },
  "string_format": (schema: $ZodCustom) => {
    return schema;
  },
  "promise": (schema: $ZodPromise ) => {
    return new $ZodPromise({
      ...schema._zod.def,
      innerType: parse(schema._zod.def.innerType)
    });
  },
  "lazy": (schema: $ZodLazy) => {
    return schema;
  },
  "custom": (schema: $ZodCustom) => {
    return schema;
  },
} as const

export function parse<T extends $ZodType>(schema: T): T {
  const type = schema._zod.def.type;
  const fn = parsers[type]
 const out = fn ? (fn as unknown as (schema: $ZodType) => $ZodType)(schema) : schema;
 return out as T;
}

type parse<Input, T> = (input: Input) => ZodContribKeysToCamel<zodInfer<T>>;

// safeParse(...) with optional `Input` type
type safeParse<Input, T> = (input: Input) => ZodSafeParseResult<ZodContribKeysToCamel<zodInfer<T>>>;

// zodToCamelCase (unidirectional)
export default function zodToCamelCase<T extends ZodType>(
  schema: T,
  // Overload for 'true' condition
  options: { bidirectional: true },
): Omit<ZodType<ZodContribKeysToCamel<zodInfer<T>>>, "parse" | "safeParse"> & {
  // Expecting snake-case-case input to parse
  parse: parse<ZodContribKeysToCamel<zodInfer<T>>, T>;
  // Expecting snake-case-case input to safeParse
  safeParse: safeParse<ZodContribKeysToCamel<zodInfer<T>>, T>;
};

// zodToCamelCase (bidirectional)
export default function zodToCamelCase<T extends ZodType>(
  schema: T,
  // Overload for 'false' and 'missing' condition
  options?: { bidirectional?: false },
): Omit<ZodType<ZodContribKeysToCamel<zodInfer<T>>>, "parse" | "safeParse"> & {
  // Expecting snake-case-case input to parse
  parse: parse<zodInfer<T>, T>;
  // Expecting snake-case-case input to safeParse
  safeParse: safeParse<zodInfer<T>, T>;
};

export default function zodToCamelCase<T extends ZodType>(
  schema: T,
  {bidirectional=false}: zodToCamelCaseOptions = {},
) {
  const schemaNew = parse(schema);

  const remapKeys = (data: unknown) => {
    return bidirectional ? data : keysToCamelCase(data);
  };

  const wrapped = preprocess(
    remapKeys,
    schemaNew,
  ) as ZodType<ZodContribKeysToCamel<zodInfer<T>>, unknown>;

  Object.defineProperty(wrapped, "toJSONSchema", {
    value: (params?: Parameters<typeof toJSONSchema>[1]) =>
      toJSONSchema(schemaNew, params),
    configurable: true,
  });

  return wrapped;
}
