export default {
  test: {
    // ... Specify options here.
    exclude: [],
    include: ["./src/**/*.test.ts"],
  },
  typecheck: {
    enabled: true,
    include: ["./src/**/*.test.ts"],
  },
};
