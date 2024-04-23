import withSolid from "rollup-preset-solid";

export default withSolid([
  {
    input: "src/index.ts",
    targets: ["cjs", "esm"],
    solidOptions: { generate: "ssr" },
  },
  {
    input: "src/server.ts",
    targets: ["cjs", "esm"],
    solidOptions: { generate: "ssr" },
  },
  {
    input: "src/babel.ts",
    targets: ["cjs", "esm"],
    solidOptions: { generate: "ssr" },
  },
]);
