import withSolid from "rollup-preset-solid";

const config = withSolid([
  {
    input: "src/index.ts",
    targets: ["cjs", "esm"],
    mappingName: "browser",
    solidOptions: { generate: "ssr" },
  },
  {
    input: "src/server.ts",
    targets: ["cjs", "esm"],
    mappingName: "server",
    solidOptions: { generate: "ssr" },
  },
  {
    input: "src/babel.ts",
    targets: ["cjs", "esm"],
    mappingName: "babel",
    solidOptions: { generate: "ssr" },
  },
]);

export default config;
