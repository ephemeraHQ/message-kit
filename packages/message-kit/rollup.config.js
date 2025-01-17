import typescript from "@rollup/plugin-typescript";
import { defineConfig } from "rollup";
import { dts } from "rollup-plugin-dts";

const external = [
  "@redis/client",
  "@coinbase/coinbase-sdk",
  "@coinbase/cbpay-js",
  "@circle-fin/developer-controlled-wallets",
  "cross-fetch",
  "path",
  "@xmtp/agent-starter",
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
