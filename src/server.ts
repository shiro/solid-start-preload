import { RequestEvent } from "solid-js/web";
import { preloadSSR } from "./SSRPreload";
import { preloadSSRDev } from "./SSRPreloadDev";
import { type getManifest } from "vinxi/manifest";

export { warmupRoutes } from "./warmupRoutes";

export interface PreloadStartAssetsOptions {
  request: RequestEvent | undefined;
  manifest: ReturnType<typeof getManifest>;
  ignorePatterns?:
    | string
    | RegExp
    | (string | RegExp)[]
    | ((moduleId: string) => boolean);
}
export const preloadStartAssets = (options: PreloadStartAssetsOptions) => {
  return process.env.NODE_ENV == "production"
    ? preloadSSR(options)
    : preloadSSRDev(options);
};
