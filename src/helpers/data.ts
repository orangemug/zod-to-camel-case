type TestType =
  | {
      input: string;
      expected: string;
      throwsError?: undefined;
    }
  | {
      input: string;
      throwsError: true;
    };

export const snakeToCamelTestData: TestType[] = [
  { input: "foo_bar", expected: "fooBar" },
  { input: "foo_bar_baz", expected: "fooBarBaz" },
  { input: "foo__", expected: "foo__" },
  { input: "foo_", expected: "foo_" },
  { input: "__foo_", expected: "__foo_" },
  { input: "_", throwsError: true },
  { input: "__", throwsError: true },
  { input: "foo_bar__baz", throwsError: true },
  { input: "foo__bar_baz", throwsError: true },
  { input: "__ID_", throwsError: true },
  { input: "foo__bar", throwsError: true },
  { input: "fooBarBaz", throwsError: true },
  { input: "ca_fé", throwsError: true },
  { input: "c_$fé", throwsError: true },
  { input: "some_c$fé", throwsError: true },
] as const;
