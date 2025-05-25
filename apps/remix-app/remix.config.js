/** @type {import('@remix-run/dev').AppConfig} */
module.exports = {
    ignoredRouteFiles: [
        "**/.*",
        "**/*.test.{ts,tsx}",
        "**/__tests__/**",
        "**/*.spec.{ts,tsx}"
    ],
    serverModuleFormat: "cjs",
    serverDependenciesToBundle: [
        /.*/,
        /^@prisma\/client$/,
        /^\.prisma\/client$/,
        /^\.prisma\/client\/index\.js$/,
        /^\.prisma\/client\/index\.d\.ts$/,
        /^\.prisma\/client\/runtime\/index\.js$/,
        /^\.prisma\/client\/runtime\/index\.d\.ts$/,
        /^\.prisma\/client\/runtime\/library\.js$/,
        /^\.prisma\/client\/runtime\/library\.d\.ts$/,
        /^\.prisma\/client\/runtime\/query_engine-windows\.dll\.node$/,
        /^@exam-notifier\/ui/
    ],
    assetsBuildDirectory: "public/build",
    publicPath: "/build/",
    devServerPort: 3000,
    future: {
        v3_fetcherPersist: true,
        v3_lazyRouteDiscovery: true,
        v3_relativeSplatPath: true,
        v3_singleFetch: true,
        v3_throwAbortReason: true
    },
}; 