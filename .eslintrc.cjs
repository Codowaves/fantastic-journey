module.exports = {
  root: true,
  parser: "@typescript-eslint/parser",
  plugins: ["@typescript-eslint"],
  extends: [
    "eslint:recommended",
    "plugin:@typescript-eslint/recommended",
  ],
  parserOptions: {
    ecmaVersion: 2022,
    sourceType: "module",
  },
  env: { node: true, es2022: true },
  ignorePatterns: ["node_modules", "dist", "*.cjs"],
  rules: {
    // intentionally permissive — fixtures contain code we WANT scanners
    // to flag; we don't want eslint to short-circuit them.
    "@typescript-eslint/no-explicit-any": "off",
    "@typescript-eslint/no-unused-vars": ["warn", { argsIgnorePattern: "^_" }],
    "no-console": "off",
  },
};
