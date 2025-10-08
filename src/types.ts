type AllowedLetters =
  | "a"
  | "b"
  | "c"
  | "d"
  | "e"
  | "f"
  | "g"
  | "h"
  | "i"
  | "j"
  | "k"
  | "l"
  | "m"
  | "n"
  | "o"
  | "p"
  | "q"
  | "r"
  | "s"
  | "t"
  | "u"
  | "v"
  | "w"
  | "x"
  | "y"
  | "z"
  | "_";

type OnlyChars<
  O extends string,
  Allowed extends string,
  S extends string,
> = S extends string
  ? string extends S
    ? S
    : S extends ""
      ? O
      : S extends `${infer F}${infer R}`
        ? F extends Allowed
          ? OnlyChars<O, Allowed, R>
          : never
        : never
  : never;

export type OnlyAllowedChars<S extends string> = OnlyChars<
  S,
  AllowedLetters,
  S
>;

// ==============
export type DisallowMultipleUnderScores<S extends string> =
  S extends `${infer _Head}__${infer _Tail}` ? never : S;

// ===============
export type AsCamelCase<S extends string> =
  S extends `${infer Head}_${infer Tail}`
    ? `${Head}${Capitalize<AsCamelCase<Tail>>}`
    : S;

// ===============
export type ZodContribSnakeToCamel<S extends string> =
  // Remove leading '_'
  S extends `_${infer Head}`
    ? `_${ZodContribSnakeToCamel<Head>}`
    : // Remove trailing '_'
      S extends `${infer Head}_`
      ? `${ZodContribSnakeToCamel<Head>}_`
      : // If we've removed the underscores and left with "" error (never)
        S extends ""
        ? never
        : AsCamelCase<OnlyAllowedChars<DisallowMultipleUnderScores<S>>>;

// ===============
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
