import fs from "fs";
import { PreloadStartAssetsOptions } from "./server";
import { createMatcher } from "./routerMatchingUtil";
import { getSSRManifest, isModuleIgnored } from "./util";

type Manifest = Record<string, any>;

const VITE_MANIFEST_PATH = ".vinxi/build/ssr/.vite/manifest.json";
const manifest = fs.existsSync(VITE_MANIFEST_PATH)
  ? JSON.parse(fs.readFileSync(VITE_MANIFEST_PATH).toString())
  : {};

const formatUrl = (url: string) => `${import.meta.env.SERVER_BASE_URL}/${url}`;

function renderAsset(url: string) {
  if (url.endsWith(".css")) return <link href={url} rel="stylesheet" />;
  if (url.endsWith(".js"))
    return <link rel="modulepreload" as="script" crossorigin="" href={url} />;
  if (url.endsWith(".woff2")) {
    return (
      <link
        rel="preload"
        as="font"
        type="font/woff2"
        crossorigin=""
        href={url}
      />
    );
  }
}

const push = (set: string[], item: string) => {
  if (set.some((x) => x == item)) return;
  set.push(item);
};

const collectRec = (
  output: string[],
  filename: string,
  manifest: Manifest,
  options: PreloadStartAssetsOptions
) => {
  const node = manifest[filename];
  if (!node) return;

  // ignore SSR bundles, only grab assets like fonts
  if (node.name == "ssr" && !node.src) {
    for (const assetFilename of node.assets ?? []) {
      if (output.some((x) => x == assetFilename)) continue;
      push(output, assetFilename);
    }
    return;
  }

  if (!isModuleIgnored(node.id, options.ignorePatterns)) {
    for (const jsFilename of node.imports ?? []) {
      collectRec(output, jsFilename, manifest, options);
    }
  }

  for (const assetFilename of [...(node.css ?? []), ...(node.assets ?? [])]) {
    if (output.some((x) => x == assetFilename)) continue;
    push(output, assetFilename);
  }

  if (node.file) {
    let url = manifest[filename].file;
    url = url.startsWith("/") ? url.slice(1) : url;

    push(output, url);
  }
};

export const preloadSSR = (options: PreloadStartAssetsOptions) => {
  if (!options.request) {
    console.warn("failed to preload: no request event");
    return;
  }

  const pathname = new URL(options.request.request.url).pathname;
  const filesToPreload: string[] = [];

  const matchers: [(path: string) => boolean, string[]][] = Object.entries(
    getSSRManifest()
  ).map(([pattern, value]) => [
    createMatcher(`${import.meta.env.SERVER_BASE_URL}${pattern}`),
    value as string[],
  ]);

  for (const [matcher, matches] of matchers) {
    if (matcher(pathname) == null) continue;
    for (const filename of matches) {
      collectRec(filesToPreload, filename, manifest, options);
    }
  }

  return filesToPreload.map(formatUrl).map(renderAsset).filter(Boolean);
};
