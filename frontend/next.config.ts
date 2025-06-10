import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: "export",
  /* config options here */
  turbopack: {
    resolveAlias: {
      handlebars: "handlebars/dist/handlebars.js",
    },
  },
  webpack: (config) => {
    return {
      ...config,
      resolve: {
        ...config.resolve,
        alias: {
          ...config.resolve.alias,
          handlebars: "handlebars/dist/handlebars.js",
        },
      },
    };
  },
};

export default nextConfig;
