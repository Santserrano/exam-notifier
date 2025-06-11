export function isMainModule(): boolean {
    return require.main === module;
}
