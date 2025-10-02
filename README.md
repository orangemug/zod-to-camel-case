# zod-to-camel-case

Convert zod schemas to camel case keys

> [!WARNING]
> This is a work in progress, here be dragons 🐉

Here is an example

```ts
import { z } from "zod";
import zodToCamelCase from "zod-to-camel-case";

// Original schema
const schema = z.object({
  full_name: z.string(),
  user: z.object({
    email_addresses: z.array(z.email()),
  }),
});

// Convert the schema
// Note: Use `zodToCamelCaseOutput` for uni-directional
const camelCaseSchema = zodToCamelCaseInputAndOutput(schema);

// Infer the type using zod
type Foo = z.infer<typeof camelCaseSchema>; /**
 * {
 *   fullName: string;
 *   user: {
 *     emailAddresses: string[];
 *   }
 * }
 */

const results = camelCaseSchema.parse({
  fullName: "Turanga Leela",
  user: {
    emailAddresses: ["name@example.com"],
  },
});
```

## Test

[![codecov](https://codecov.io/github/orangemug/zod-to-camel-case/graph/badge.svg?token=00EOGLB2HF)](https://codecov.io/github/orangemug/zod-to-camel-case)

```bash
npm test
```

## License

MIT
