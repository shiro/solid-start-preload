import { PreloadStartAssetsOptions } from ".";

// export const base = (import.meta.env.BASE_URL ?? "").replace("/_build", "");
export const getSSRManifest = () => {
  const g: any = globalThis;
  const key = "__solid-start-preload__SSR_MANIFEST";
  if (!g[key]) g[key] = {};
  return g[key];
};

export const isModuleIgnored = (
  moduleId: string,
  ignorePatterns: PreloadStartAssetsOptions["ignorePatterns"]
) => {
  if (!ignorePatterns) return false;
  if (typeof ignorePatterns == "function") return ignorePatterns(moduleId);
  if (!Array.isArray(ignorePatterns)) ignorePatterns = [ignorePatterns as any];
  for (const pat of ignorePatterns) {
    if (typeof pat == "string" && moduleId == pat) return true;
    if (pat.test(moduleId)) return true;
  }

  return false;
};
