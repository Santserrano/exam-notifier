/* eslint-disable no-undef */
/* eslint-env node */
/** @type {import('@babel/core').TransformOptions} */
module.exports = {
    presets: [
        ['@babel/preset-env', { targets: { node: 'current' } }],
        '@babel/preset-typescript',
    ],
}; 