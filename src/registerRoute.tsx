import { isServer } from "solid-js/web";
import { getSSRManifest } from "./util";

interface Options {
  path: string | string[];
}

// export const SSRManifest: Record<string, string[]> = {};

export const registerRoute = (options: Options) => {
  if (!isServer) return;
  if (!Array.isArray(options.path)) options.path = [options.path];

  const src: string = (options as any)["__INTERNAL_SSR_SRC__"];
  if (!src)
    throw new Error(
      "[solid-start-preload]: it looks like the babel plugin 'solid-start-preload/babel' is not registered"
    );

  console.log("<<<< REGISTER", src);

  for (const p of options.path) {
    const SSRManifest = getSSRManifest();
    if (!SSRManifest[p]) SSRManifest[p] = [];
    if (SSRManifest[p].includes(src)) continue;
    SSRManifest[p].push(src);
  }
};
