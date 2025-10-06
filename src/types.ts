// step 1: remove leading underscores
export type ZodContribSnakeToCamelStep1<S extends string> =
  S extends `_${infer Tail}`
    ? ZodContribSnakeToCamelStep1<Tail>
    : ZodContribSnakeToCamelStep2<S>;

// step 1: snake_case -> camelCase
type ZodContribSnakeToCamelStep2<S extends string> =
  S extends `${infer Head}_${infer Tail}`
    ? `${Head}${Capitalize<ZodContribSnakeToCamelStep2<Tail>>}`
    : S;

export type ZodContribSnakeToCamel<S extends string> =
  ZodContribSnakeToCamelStep1<S>;

export type ZodContribKeysToCamel<U> =
  U extends Array<infer V>
    ? Array<ZodContribKeysToCamel<V>>
    : U extends object
      ? {
          [K in keyof U as ZodContribSnakeToCamel<
            string & K
          >]: ZodContribKeysToCamel<U[K]>;
        }
      : U;
