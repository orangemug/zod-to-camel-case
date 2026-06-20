import { keysToCamelCase, keysToSnakeCase, keysToCamelCaseObjectRoot } from "./format";
import { ZodContribSnakeToCamel, ZodContribKeysToCamel } from "./types";
import { $ZodPromise, $ZodReadonly, $ZodCatch, $ZodPrefault, $ZodDefault, $ZodSuccess, $ZodNonOptional, $ZodOptional, $ZodNullable, $ZodSet, $ZodFunction, $ZodObject, $ZodRecord, $ZodRecordDef, $ZodType, $ZodArray, $ZodTuple, $ZodUnion, $ZodIntersection, $ZodMap } from "zod/v4/core";
import { preprocess, toJSONSchema } from "zod";
import type {z, ZodSafeParseResult, ZodType} from "zod";

export { keysToCamelCase, keysToSnakeCase };
export type { ZodContribSnakeToCamel, ZodContribKeysToCamel };

export type zodToCamelCaseOptions = { bidirectional?: boolean };

const parsers = {
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
  "record": (schema: $ZodRecord) => {
    return new $ZodRecord({
      ...schema._zod.def,
      keyType: parse(schema._zod.def.keyType) as $ZodType<string | number | symbol, unknown>,
      valueType: parse(schema._zod.def.valueType) as $ZodRecordDef["valueType"],
    })
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
  "readonly": (schema: $ZodReadonly) => {
    return new $ZodReadonly({
      ...schema._zod.def,
      innerType: parse(schema._zod.def.innerType),
    });
  },
  "promise": (schema: $ZodPromise ) => {
    return new $ZodPromise({
      ...schema._zod.def,
      innerType: parse(schema._zod.def.innerType)
    });
  },
} as const

export function parse<T extends $ZodType>(schema: T): T {
  const type = schema._zod.def.type;
  const fn = type in parsers ? parsers[type as keyof typeof parsers] : undefined;
  const out = fn ? (fn as unknown as (schema: $ZodType) => $ZodType)(schema) : schema;
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
): Omit<ZodType<ZodContribKeysToCamel<z.infer<T>>, ZodContribKeysToCamel<z.input<T>>>, "parse" | "safeParse"> & {
  // Expecting snake-case-case input to parse
  parse: parse<ZodContribKeysToCamel<z.input<T>>, T>;
  // Expecting snake-case-case input to safeParse
  safeParse: safeParse<ZodContribKeysToCamel<z.input<T>>, T>;
};

// zodToCamelCase (bidirectional)
export default function zodToCamelCase<T extends ZodType>(
  schema: T,
  // Overload for 'false' and 'missing' condition
  options?: { bidirectional?: false },
): Omit<ZodType<ZodContribKeysToCamel<z.infer<T>>, z.input<T>>, "parse" | "safeParse"> & {
  // Expecting snake-case-case input to parse
  parse: parse<z.input<T>, T>;
  // Expecting snake-case-case input to safeParse
  safeParse: safeParse<z.input<T>, T>;
};

export default function zodToCamelCase<T extends ZodType>(
  schema: T,
  {bidirectional=false}: zodToCamelCaseOptions = {},
) {
  // Always convert the schema to camelCase for internal use
  const camelSchema = parse(schema);

  // Only convert the input/output if bidirectional is true
  const conditionalSchema = bidirectional ? camelSchema : schema;

  const zodClassicSchema = preprocess(
    (i) => i,
    conditionalSchema,
  ).transform(data => {
    // If not bidirectional (unidirectional) then we need to convert the output data to camelCase
    return bidirectional ? data : keysToCamelCase(data);
  });

  // We always need to use camelSchema for toJSONSchema because we don't provide input data so we can assume the schema is always camelCase
  Object.defineProperty(zodClassicSchema, "toJSONSchema", {
    value: (params?: Parameters<typeof toJSONSchema>[1]) =>
      toJSONSchema(camelSchema, params),
    configurable: true,
  });

  return zodClassicSchema;
}
