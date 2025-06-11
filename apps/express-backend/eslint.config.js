// @ts-check

/** @type {import('eslint').Linter.FlatConfig[]} */
module.exports = [
    {
        ignores: ["dist/**", "node_modules/**"]
    },
    {
        files: ["**/*.ts"],
        languageOptions: {
            parser: require('@typescript-eslint/parser'),
            parserOptions: {
                project: './tsconfig.json'
            }
        },
        plugins: {
            '@typescript-eslint': require('@typescript-eslint/eslint-plugin')
        },
        rules: {
            "@typescript-eslint/no-unused-vars": ["error", { "argsIgnorePattern": "^_" }]
        }
    }
];
