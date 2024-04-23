import path from "path";
import { getManifest as getVinxiManifest } from "vinxi/manifest";
import { ModuleGraph } from "vite";
import { createMatcher } from "./routerMatchingUtil";
import { PreloadStartAssetsOptions } from "./server";
import { getSSRManifest, isModuleIgnored } from "./util";

const getModuleGraph = () => {
  return getVinxiManifest("client").dev.server.moduleGraph;
};

const fixUrl = (url: string) => (url.startsWith("/") ? url : "/" + url);

const withoutQuery = (url: string) => url.split("?")[0];

function renderAsset(url: string) {
  const urlWithoutSearch = withoutQuery(url);
  if (urlWithoutSearch.endsWith(".woff2"))
    return (
      <link
        rel="preload"
        as="font"
        type="font/woff2"
        crossorigin=""
        href={url}
      />
    );
  return <link rel="modulepreload" as="script" crossorigin="" href={url} />;

  // throw new Error(`unknown filetype in SSR  renderAsset: '${url}'`);
}

function renderInlineCSS(id: string, code: string) {
  return <style type="text/css" data-vite-dev-id={id} innerHTML={code} />;
}

const collectRec = (
  JSOutput: string[],
  CSSOutput: [id: string, code: string][],
  filepath: string,
  moduleGraph: ModuleGraph,
  visited: Set<String>,
  options: PreloadStartAssetsOptions
) => {
  const node = [
    ...(moduleGraph.fileToModulesMap.get(filepath)?.values() ?? []),
  ][0];
  if (!node.file || !node.id) return;
  if (visited.has(node.id)) return;
  visited.add(node.id);

  if (!isModuleIgnored(node.id!, options.ignorePatterns)) {
    const imports = [...node.clientImportedModules.values()];

    for (const dep of imports) {
      if (!dep.file) continue;

      collectRec(JSOutput, CSSOutput, dep.file, moduleGraph, visited, options);
    }
  }

  if ([".css", ".scss"].some((x) => withoutQuery(node.url).endsWith(x))) {
    if (!node.transformResult?.code) return;

    const start = 'const __vite__css = "';
    const end = '"\n__vite__updateStyle';
    let code = node.transformResult.code;
    code = code
      .substring(code.indexOf(start) + start.length, code.indexOf(end))
      .replaceAll("\\n", "\n")
      .replaceAll('\\"', '"')
      .replaceAll("\\\\", "\\");

    CSSOutput.push([node.id, code]);
  } else if ([".js"].some((x) => withoutQuery(node.url).endsWith(x))) {
    JSOutput.push(node.url);
  }
};

export const preloadSSRDev = (options: PreloadStartAssetsOptions) => {
  const matchers: [(path: string) => boolean, string[]][] = Object.entries(
    getSSRManifest()
  ).map(([pattern, value]) => [createMatcher(pattern), value as string[]]);

  if (!options.request) {
    console.warn("failed to preload: no request event");
    return;
  }

  const pathname = new URL(options.request.request.url).pathname;
  const moduleGraph = getModuleGraph();

  const filesToPreload: string[] = [];
  const inlineCSSToPreload: [string, string][] = [];

  for (const [matcher, matches] of matchers) {
    if (matcher(pathname) == null) continue;
    for (const filename of matches) {
      collectRec(
        filesToPreload,
        inlineCSSToPreload,
        path.resolve(filename),
        moduleGraph,
        new Set(),
        options
      );
    }
  }

  return [
    ...inlineCSSToPreload.map(([id, code]) => renderInlineCSS(id, code)),
    // ...filesToPreload.map(fixUrl).map(renderAsset),
  ];
};
