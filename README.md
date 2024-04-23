<div align="center">
    <h1>Solid Start Preload</h1>
    <h3>SSR preload CSS, scripts and other assets in solid start with config-based routing</h3>

[![GitHub](https://img.shields.io/badge/GitHub-code-blue?logo=github)](https://github.com/shiro/solid-start-preload)
[![MIT License](https://img.shields.io/github/license/shiro/solid-start-preload?color=43A047&logo=linux&logoColor=white)](https://github.com/shiro/solid-start-preload/blob/master/LICENSE)
[![Build](https://img.shields.io/github/actions/workflow/status/shiro/solid-start-preload/CI.yml?color=00897B&logo=github-actions&logoColor=white)](https://github.com/shiro/solid-start-preload/actions/workflows/CI.yml)
[![Build](https://img.shields.io/npm/v/solid-start-preload?color=00897B&logo=npm&logoColor=white)](https://www.npmjs.com/package/solid-start-preload)
[![Donate](https://img.shields.io/badge/Ko--Fi-donate-orange?logo=ko-fi&color=E53935)](https://ko-fi.com/C0C3RTCCI)

</div>

Solid Start currently doesn't support SSR preloading assets when using config-based routing, this library can help you
with that!

SSR preloading refers to including CSS files and other assets in the `<head>` tag in the initial server rendered
response, which makes them start loading as soon as the `<head>` tag is streamed in rather than waiting
for Javascript to get loaded.
By doing this, we can avoid CSS flashes due to CSS not being loaded yet, improve SEO and generally make
config-routed Solid Start apps usable.

- ⚙ **Well integrated** into Solid Start, makes config-routed apps usable
- 📦 **Small bundle size**, no external dependencies except Solid Start
- ❤️ **Open source**, made with love

---

<div align="center">
    <b>If you like open source, consider supporting</b>
    <br/>
    <br/>
    <a href='https://ko-fi.com/C0C3RTCCI' target='_blank'><img height='36' style='border:0px;height:36px;' src='https://storage.ko-fi.com/cdn/kofi3.png?v=3' border='0' alt='Buy Me a Coffee at ko-fi.com' /></a>
</div>

## Install

1. First add the dependency to your project using your package manager:

```bash
# yarn
yarn add -D solid-start-preload
# NPM
npm install --save-dev solid-start-preload
```

2. Update `app.config.ts`:

```diff
import { defineConfig } from "@solidjs/start/config";
+ import SSPreloadBabel from "solid-start-preload/babel";

export default defineConfig({
+ solid: { babel: { plugins: [ SSPreloadBabel ] } },
});
```

3. Update `src/entry-server.tsx`:

```diff
import { createHandler, StartServer } from "@solidjs/start/server";
+ // this is your route array that you also pass to the router
+ import { routes } from "~/routes";
+ import { getManifest } from "vinxi/manifest";
+ import { getRequestEvent } from "solid-js/web";
+ import { preloadStartAssets, warmupRoutes } from "solid-start-preload/server";

+ // silence "No route matched" warning from Start
+ const _warn = console.warn;
+ console.warn = function (message?: any, ...optionalParams: any[]) {
+   if (message == "No route matched for preloading js assets") return;
+   _warn(message, ...optionalParams);
+ };

export default createHandler(
  () => (
    <StartServer
      document={({ assets, children, scripts }) => (
        <html lang="en">
          <head>
            <meta charset="utf-8" />
            {assets}
+           {preloadStartAssets({
+             request: getRequestEvent(),
+             manifest: getManifest("client"),
+             ignorePatterns: [/tw\.style.*\.css/, /routes\.tsx/],
+           })}
          </head>
          <body>
            <div id="app">{children}</div>
            {scripts}
          </body>
        </html>
      )}
    />
  ),
+ () => warmupRoutes(routes)
);
```

The `ignorePatterns` are very important, since some files pull in the entire project as dependencies
(i.e. Tailwind), meaning everything will always get preloaded. The file containing route definitions
should always be ignored.

If you are using Tailwind, put the `@tailwind ...` calls inside a separate file and add it to the
`ignorePatterns` list.

## Usage

After setting up the necessary configuration, simply register each route and it will be treated
as if it was a file-based route. An example component could look like this:

```diff
+ import { registerRoute } from "solid-start-preload";

export default () => <div>Some lazy route component</div>;

+ registerRoute({ path: "/user/:username" });
```

Now the component code and all non-lazy loaded dependent CSS and assets will be preloaded
when visiting `/user/bob`. This works in both development and production builds.

Registering the same file to multiple routes and multiple files to the same route is also allowed,
i.e. given the previous example there could be a `LazyHeader.tsx` component:

```diff
+ import { registerRoute } from "solid-start-preload";

export default () => <div>Lazy header component</div>;

+ registerRoute({ path: ["/", "/users", "/user/:username" ] });
```

When visiting `/user/mike`, both components and dependent files will get preloaded.

## Run it locally

Clone the repository and run:

```bash
yarn install
yarn test
```

## Authors

- Matic Utsumi Gačar <matic@usagi.io>
