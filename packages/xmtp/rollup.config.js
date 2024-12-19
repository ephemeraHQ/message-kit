import typescript from "@rollup/plugin-typescript";
import { defineConfig } from "rollup";
import { dts } from "rollup-plugin-dts";

const external = [
  "@xmtp/content-type-primitives",
  "@xmtp/content-type-text",
  "@xmtp/content-type-reaction",
  "@xmtp/content-type-reply",
  "@xmtp/content-type-remote-attachment",
  "@xmtp/node-sdk",
  "@xmtp/message-kit",
  "@xmtp/xmtp-js",
  "@redis/client",
  "@xmtp/proto",
  "@xmtp/node-bindings",
  "@xmtp/grpc-api-client",
  "@xmtp/content-type-read-receipt",
  "cross-fetch",
  "path",
  "crypto",
  "viem",
  "dotenv",
  "openai",
  "viem/accounts",
  "fs/promises",
  "fs",
  "viem/chains",
  "dotenv/config",
];

const plugins = [
  typescript({
    declaration: false,
    declarationMap: false,
  }),
];

export default defineConfig([
  {
    input: "src/index.ts",
    output: {
      file: "dist/index.js",
      format: "es",
      sourcemap: true,
    },
    plugins,
    external,
  },
  {
    input: "src/index.ts",
    output: {
      file: "dist/index.cjs",
      format: "cjs",
      sourcemap: true,
    },
    plugins,
    external,
  },
  {
    input: "src/index.ts",
    output: {
      file: "dist/index.d.ts",
      format: "es",
    },
    plugins: [dts()],
  },
]);
