// step 1: preserve leading underscores
type ZodContribSnakeToCamelSplitLeadingUnderscores<
  S extends string,
  Prefix extends string = "",
> = S extends `_${infer Tail}`
  ? ZodContribSnakeToCamelSplitLeadingUnderscores<Tail, `${Prefix}_`>
  : [Prefix, S];

// step 2: preserve trailing underscores
type ZodContribSnakeToCamelSplitTrailingUnderscores<
  S extends string,
  Suffix extends string = "",
> = S extends `${infer Head}_`
  ? ZodContribSnakeToCamelSplitTrailingUnderscores<Head, `_${Suffix}`>
  : [S, Suffix];

// step 3: snake_case -> camelCase
type ZodContribSnakeToCamelStep2<S extends string> =
  S extends `${infer Head}_${infer Tail}`
    ? `${Head}${Capitalize<ZodContribSnakeToCamelStep2<Tail>>}`
    : S;

// step 4: re-apply the leading/trailing underscore prefix
export type ZodContribSnakeToCamel<S extends string> =
  ZodContribSnakeToCamelSplitLeadingUnderscores<S> extends [
    infer Prefix extends string,
    infer Rest extends string,
  ]
    ? ZodContribSnakeToCamelSplitTrailingUnderscores<Rest> extends [
        infer Core extends string,
        infer Suffix extends string,
      ]
      ? `${Prefix}${ZodContribSnakeToCamelStep2<Core>}${Suffix}`
      : never
    : never;

export type ZodContribKeysToCamel<U> =
  // Empty tuple
  U extends []
    ? []
    // Non-empty tuple
    : U extends [infer Head, ...infer Tail]
      ? [ZodContribKeysToCamel<Head>, ...ZodContribKeysToCamel<Tail>]
      // Array
      : U extends Array<infer V>
        ? Array<ZodContribKeysToCamel<V>>
        // Object
        : U extends object
          ? {
              [K in keyof U as ZodContribSnakeToCamel<
                string & K
              >]: ZodContribKeysToCamel<U[K]>;
            }
          // Anything else
          : U;
