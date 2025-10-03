# zod-to-camel-case

Convert zod schemas to camel case keys

## Usage

The `zodToCamelCase` supports both unidirectional and bidirectional transformation of schemas

### `zodToCamelCase` (unidirectional)

By default `zodToCamelCase` supports unidirectional transformation of the schema.

So the input will be expected to in the original snake-case format. The output data/type will be camel-case.

```ts
import { z } from "zod";
import zodToCamelCase from "zod-to-camel-case";

const userSchemaSnake = z.object({
  full_name: z.string(),
  user: z.object({
    email_addresses: z.array(z.email()),
  }),
});
const userSchema = zodToCamelCase(userSchemaSnake);

// Infer the type using zod
type User = z.infer<typeof userSchema>; /**
 * {
 *   fullName: string;
 *   user: {
 *     emailAddresses: string[];
 *   }
 * }
 */

// This input is snake-case
const results = userSchema.parse({
  full_name: "Turanga Leela",
  user: {
    email_addresses: ["name@example.com"],
  },
});

// The output is camel-case
assert.deepEqual(results, {
  fullName: "Turanga Leela",
  user: {
    emailAddresses: ["name@example.com"],
  },
});
```

### `zodToCamelCase` (bidirectional)

By passing `{bidirectional: true}` as a second option to `zodToCamelCase` will change the expected input to be snake-case.

```ts
import { z } from "zod";
import zodToCamelCase from "zod-to-camel-case";

const userSchemaSnake = z.object({
  full_name: z.string(),
  user: z.object({
    email_addresses: z.array(z.email()),
  }),
});
const userSchema = zodToCamelCase(userSchemaSnake, { bidirectional: true });

// Infer the type using zod
type User = z.infer<typeof userSchema>; /**
 * {
 *   fullName: string;
 *   user: {
 *     emailAddresses: string[];
 *   }
 * }
 */

// This input is snake-case
const results = userSchema.parse({
  fullName: "Turanga Leela",
  user: {
    emailAddresses: ["name@example.com"],
  },
});

// The output is camel-case
assert.deepEqual(results, {
  fullName: "Turanga Leela",
  user: {
    emailAddresses: ["name@example.com"],
  },
});
```

## Test

To run the tests run, in non-watch mode the coverage reports are available at `./coverage/lcov-report/index.html`

```bash
npm test
```

Or for watch mode (no coverage reports)

```bash
npm run test:watch
```

[![codecov](https://codecov.io/github/orangemug/zod-to-camel-case/graph/badge.svg?token=00EOGLB2HF)](https://codecov.io/github/orangemug/zod-to-camel-case)

## License

MIT
