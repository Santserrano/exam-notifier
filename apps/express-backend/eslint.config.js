const baseConfig = await import("@exam-notifier/eslint-config").then(m => m.default);

/** @type {import('typescript-eslint').Config} */
export default [
    ...baseConfig,
    {
        files: ["**/*.ts"],
        ignores: ["dist/**", "node_modules/**"],
        rules: {
            "@typescript-eslint/no-unused-vars": ["error", { "argsIgnorePattern": "^_" }]
        }
    }
];
