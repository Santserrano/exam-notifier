const baseConfig = await import("@exam-notifier/eslint-config").then(m => m.default);

/** @type {import('eslint').Linter.FlatConfig[]} */
export default [
    {
        ignores: ["dist/**", "node_modules/**"]
    },
    ...baseConfig,
    {
        files: ["**/*.ts"],
        rules: {
            "@typescript-eslint/no-unused-vars": ["error", { "argsIgnorePattern": "^_" }]
        }
    }
];
