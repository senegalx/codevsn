import react from "@astrojs/react";
import sitemap from "@astrojs/sitemap";
import tailwind from "@astrojs/tailwind";
import { defineConfig } from "astro/config";
import remarkCollapse from "remark-collapse";
import remarkToc from "remark-toc";
import config from "./src/config/config.json";

import partytown from "@astrojs/partytown";

// https://astro.build/config
export default defineConfig({
  site: config.site.base_url ? config.site.base_url : "https://codevsn.org",
  base: config.site.base_path ? config.site.base_path : "/",
  trailingSlash: config.site.trailing_slash ? "always" : "never",
  image: {
    service: {
      entrypoint: 'astro/assets/services/sharp'
    }
  },
  integrations: [react(), sitemap(), tailwind({
    config: {
      applyBaseStyles: false
    }
  }), partytown({ config: { forward: ["dataLayer.push"] }})],
  markdown: {
    remarkPlugins: [remarkToc, [remarkCollapse, {
      test: "Table of contents"
    }]],
    shikiConfig: {
      theme: "one-dark-pro",
      wrap: true
    },
    extendDefaultPlugins: true
  }
});