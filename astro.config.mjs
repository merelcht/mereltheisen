import { defineConfig } from "astro/config";
import tailwind from "@astrojs/tailwind";
import mdx from "@astrojs/mdx";
import sitemap from "@astrojs/sitemap";
import { readFileSync } from "fs";
import { resolve, dirname } from "path";

import { remarkReadingTime } from "./src/utils/all";

export default defineConfig({
  site: 'https://www.mereltheisen.com',
  markdown: {
    remarkPlugins: [remarkReadingTime],
    rehypePlugins: ["rehype-plugin-image-native-lazy-loading"],
    extendDefaultPlugins: true,
  },
  image: {
    service: {
      entrypoint: "astro/assets/services/sharp",
    },
  },
  integrations: [
    tailwind(),
    mdx(),
    sitemap(),
  ],
  vite: {
    plugins: [
      {
        name: "css-tree-patch",
        transform(code, id) {
          if (id.includes("css-tree") && id.endsWith("data-patch.js")) {
            const patchPath = resolve(dirname(id),  "../data/patch.json");
            try {
              const json = readFileSync(patchPath, "utf-8");
              return code.replace("require('../data/patch.json')", `(${json})`);
            } catch {
              return null;
            }
          } 
          if (
            (id.includes("css-tree") || id.includes("csso")) && id.endsWith("version.js")
          ) {
            const pkgPath = resolve(dirname(id), "../package.json");
            try {
              const { version } = JSON.parse(readFileSync(pkgPath, "utf-8"));
              return code.replace("require('../package.json')", `({ version: "${version}" })`);
            } catch {
              return null;
            }
          }
        },
      },
    ],
  },
});
