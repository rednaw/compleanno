import adapter from "@sveltejs/adapter-static";
const dev = process.env.NODE_ENV === "development";
const preview = !!process.env.VITE_PREVIEW;

/** @type {import('@sveltejs/kit').Config} */
const config = {
  kit: {
    adapter: adapter({
      pages: "build",
      assets: "build",
      fallback: null,
      precompress: true,
      strict: true
    }),
    paths: {
      base: dev || preview ? "" : "/compleanno",
    }
  }
};

export default config;
