import { defineConfig } from "vitest/config";

export default defineConfig({
  resolve: {
    alias: {
      "@xmtp/message-kit": "./src/index.ts",
    },
  },
  test: {
    coverage: {
      provider: "v8",
      reporter: ["text", "json", "html"],
    },
    environment: "node",
    deps: {
      optimizer: {
        ssr: {
          include: ["@xmtp/message-kit"],
        },
      },
    },
  },
});
