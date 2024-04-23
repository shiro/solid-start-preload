import { RouteDefinition } from "@solidjs/router";

export const warmupRoutes = async (routes: RouteDefinition[]) => {
  const rec = (route: RouteDefinition): Promise<any>[] => {
    const ret = [];
    if (route.component) {
      ret.push((route.component as any).preload?.());
    }
    if (Array.isArray(route.children)) {
      for (const c of route.children) {
        ret.push(rec(c));
      }
    } else if (route.children) {
      ret.push(rec(route.children));
    }
    return ret;
  };

  await Promise.all(Object.values(routes).flatMap(rec));
  return {};
};
