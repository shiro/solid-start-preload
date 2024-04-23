import { RequestEvent } from "solid-js/web";
import { preloadSSR } from "./SSRPreload";
import { preloadSSRDev } from "./SSRPreloadDev";

export { warmupRoutes } from "./warmupRoutes";

export interface PreloadStartAssetsOptions {
  request: RequestEvent | undefined;
  ignorePatterns?:
    | string
    | RegExp
    | (string | RegExp)[]
    | ((moduleId: string) => boolean);
}
export const preloadStartAssets = (options: PreloadStartAssetsOptions) => {
  return import.meta.env.DEV ? preloadSSRDev(options) : preloadSSR(options);
};
