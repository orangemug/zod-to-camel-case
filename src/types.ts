// Type-level mapping: snake_case → camelCase
export type ZodContribSnakeToCamel<S extends string> = S extends `${infer Head}_${infer Tail}`
  ? `${Head}${Capitalize<ZodContribSnakeToCamel<Tail>>}`
  : S;

export type ZodContribKeysToCamel<U> =
  U extends Array<infer V>
    ? Array<ZodContribKeysToCamel<V>>
    : U extends object
      ? {
          [K in keyof U as ZodContribSnakeToCamel<string & K>]: ZodContribKeysToCamel<U[K]>;
        }
      : U;