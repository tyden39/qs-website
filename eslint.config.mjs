import next from "eslint-config-next";

// Flat-config ESLint for Next 16 (which dropped the built-in `next lint`).
// `eslint-config-next` ships its own flat-config array covering core-web-vitals
// + the TypeScript rules, so we spread it and only add project ignores.
const config = [
  {
    ignores: [
      "out/**",
      ".next/**",
      "node_modules/**",
      "next-env.d.ts",
      "public/**",
    ],
  },
  ...next,
];

export default config;
