export type ZodContribSnakeToCamelStep2<S extends string> =
  S extends `${infer Head}_${infer Tail}`
    ? `${Head}${Capitalize<ZodContribSnakeToCamelStep1<Tail>>}`
    : S;

export type ZodContribSnakeToCamelStep1<S extends string> =
  S extends `${infer Head}_`
    ? `${ZodContribSnakeToCamel<Head>}_`
    : ZodContribSnakeToCamelStep2<S>;

export type ZodContribSnakeToCamel<S extends string> =
  S extends `_${infer Head}`
    ? `_${ZodContribSnakeToCamel<Head>}`
    : ZodContribSnakeToCamelStep2<Lowercase<S>>;

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
