// Setup heavily inspired by https://github.com/juliusmarminge/acme-corp
import { readFile, writeFile } from "fs/promises";
import { defineConfig, type Options } from "tsup";

const client = [
  "./src/components/checkbox.tsx",
  // "./src/calendar.tsx",
  // "./src/command.tsx",
  // "./src/dialog.tsx",
  // "./src/dropdown-menu.tsx",
  // "./src/input.tsx",
  // "./src/label.tsx",
  // "./src/popover.tsx",
  // "./src/scroll-area.tsx",
  // "./src/select.tsx",
  // "./src/sheet.tsx",
  // "./src/tabs.tsx",
  // "./src/toaster.tsx",
  // "./src/use-toast.tsx",
];

const server = [
  "./src/components/button.tsx",
  // "./src/icons.tsx",
  "./src/components/card.tsx",
  // "./src/toast.tsx",
];

const tailwind = [
  "./src/tailwind/index.ts",
  "./src/tailwind/shadcn-preset.ts",
  "./src/tailwind/shadcn-plugin.ts",
];

const styles = [
  "./src/tailwind.css",
];

export default defineConfig((opts) => {
  const common = {
    clean: !opts.watch,
    dts: true,
    format: ["esm"],
    minify: true,
    outDir: "dist",
    esbuildOptions: (options) => {
      options.loader = {
        '.css': 'css'
      };
    }
  } satisfies Options;

  return [
    {
      ...common,
      entry: ["./src/index.ts", ...server],
    },
    {
      ...common,
      entry: client,
      esbuildOptions: (options) => {
        options.banner = {
          js: '"use client";',
        };
        options.loader = {
          '.css': 'css'
        };
      },
      async onSuccess() {
        const pkgJson = JSON.parse(
          await readFile("./package.json", {
            encoding: "utf-8",
          }),
        ) as PackageJson;
        pkgJson.exports = {
          "./package.json": "./package.json",
          ".": {
            import: "./dist/index.js",
            types: "./dist/index.d.ts",
            default: "./dist/index.js",
          },
          "./tailwind": {
            import: "./dist/tailwind/index.js",
            types: "./dist/tailwind/index.d.ts",
            default: "./dist/tailwind/index.js",
          },
          "./styles.css": "./dist/tailwind.css",
        };
        if (!pkgJson.typesVersions) {
          pkgJson.typesVersions = { "*": {} };
        }
        if (!pkgJson.typesVersions["*"]) {
          pkgJson.typesVersions["*"] = {};
        }
        [...client, ...server]
          .filter((e) => e.endsWith(".tsx"))
          .forEach((entry) => {
            const file = entry.replace("./src/", "").replace(".tsx", "");
            pkgJson.exports["./" + file] = {
              import: "./dist/" + file + ".js",
              types: "./dist/" + file + ".d.ts",
            };
            pkgJson.typesVersions["*"][file] = ["dist/" + file + ".d.ts"];
          });

        await writeFile("./package.json", JSON.stringify(pkgJson, null, 2));
      },
    },
    {
      ...common,
      entry: tailwind,
      outDir: "dist/tailwind",
    },
    {
      ...common,
      entry: styles,
      outDir: "dist",
      loader: {
        ".css": "copy",
      },
    },
  ];
});

type PackageJson = {
  name: string;
  exports: Record<
    string,
    { import: string; types: string; default?: string } | string
  >;
  typesVersions: Record<"*", Record<string, string[]>>;
  files: string[];
  dependencies: Record<string, string>;
  pnpm: {
    overrides: Record<string, string>;
  };
};
