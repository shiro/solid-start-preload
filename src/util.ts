import { PreloadStartAssetsOptions } from ".";

export const base = (import.meta.env.BASE_URL ?? "").replace("/_build", "");

export const isModuleIgnored = (
  moduleId: string,
  ignorePatterns: PreloadStartAssetsOptions["ignorePatterns"]
) => {
  if (!ignorePatterns) return false;
  if (typeof ignorePatterns == "function") return ignorePatterns(moduleId);
  if (!Array.isArray(ignorePatterns)) ignorePatterns = [ignorePatterns as any];
  for (const pat of ignorePatterns) {
    if (typeof pat == "string") return moduleId == pat;
    return pat.test(moduleId);
  }

  return false;
};
