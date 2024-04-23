import { preloadSSR } from "./SSRPreload";
import { preloadSSRDev } from "./SSRPreloadDev";
import { babelPlugin } from "./babel";

export const babel = babelPlugin;

export interface PreloadStartAssetsOptions {
  ignorePatterns?:
    | string
    | string[]
    | RegExp
    | RegExp[]
    | ((moduleId: string) => boolean);
}
export const preloadStartAssets = (options: PreloadStartAssetsOptions = {}) => {
  import.meta.env.DEV ? preloadSSRDev(options) : preloadSSR(options);
};

export { registerRoute } from "./registerRoute";
