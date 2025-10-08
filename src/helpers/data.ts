export const snakeToCamelTestData = [
    { input: "foo_bar", expected: "fooBar" },
    { input: "foo_bar_baz", expected: "fooBarBaz" },
    // { input: "foo_bar__baz", expected: "fooBarBaz" },
    // { input: "foo__bar_baz", expected: "fooBarBaz" },
    // { input: "foo__", expected: "foo__" },
    { input: "foo_", expected: "foo_" },
    { input: "__foo_", expected: "__foo_" },
    // { input: "__ID_", expected: "__id_" },
    // { input: "foo__bar", expected: "fooBar" },
    // { input: "fooBarBaz", expected: "foobarbaz" },
    // { input: "c_$fé", expected: "c$fé" },
    { input: "some_c$fé", expected: "someC$fé" },
] as const
