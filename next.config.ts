import { NextConfig } from "next";

export default {
  env: {
    AXIOM_TOKEN: process.env.AXIOM_TOKEN,
    AXIOM_DATASET: process.env.AXIOM_DATASET,
  },
  rewrites: async () => [
    {
      source: "/ax/:path*",
      destination: "https://api.axiom.co/:path*",
    },
  ],
} satisfies NextConfig;
