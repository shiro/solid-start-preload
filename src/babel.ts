import type * as BabelCoreNamespace from "@babel/core";
import { PluginObj } from "@babel/core";
import path from "path";

type Babel = typeof BabelCoreNamespace;

// interface Options {
//   routesFile: string;
// }

export const babelPlugin = (babel: Babel): PluginObj => {
  const t = babel.types;

  let imported = false;
  let exclude = false;
  let isImported = false;
  let filename!: string;

  return {
    visitor: {
      Program(p, state) {
        imported = false;

        const f = state.file.opts.filename!;

        exclude = !f?.endsWith(".tsx");
        filename = path.relative(process.cwd(), f);
      },
      ImportDeclaration(p) {
        if (exclude) return;

        const importSrc = p.node.source.value;
        const isRegister = importSrc == "~/solid-start-preload";
        if (isRegister) isImported = true;
      },
      CallExpression(p) {
        if (
          !isImported ||
          p.node.callee.type != "Identifier" ||
          p.node.callee.name != "registerRoute" ||
          p.node.arguments[0]?.type != "ObjectExpression"
        )
          return;
        p.node.arguments[0].properties.push(
          t.objectProperty(
            t.identifier("__INTERNAL_SSR_SRC__"),
            t.stringLiteral(filename)
          )
        );
      },
    },
  };
};
