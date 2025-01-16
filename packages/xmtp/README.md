# XMTP agent wrapper sdk for Node js

This package provides the XMTP agent wrapper around [SDK for Node](https://github.com/xmtp/xmtp-js/tree/main/sdks/node-sdk).

To keep up with the latest SDK developments, see the [Issues tab](https://github.com/xmtp/xmtp-js/issues) in this repo.

To learn more about XMTP and get answers to frequently asked questions, see the [XMTP documentation](https://xmtp.org/docs).

> [!CAUTION]
> This SDK is currently in alpha. The API is subject to change and it is not yet recommended for production use.

## Requirements

- Node.js 20+
- `glibc` 3.28+ (i.e. Ubuntu 24.04 or later)

## Install

**NPM**

```bash
npm install xmtp
```

**PNPM**

```bash
pnpm install xmtp
```

**Yarn**

```bash
yarn add xmtp
```

## Usage

This is how you can use the `xmtp` package to create a client and handle messages.

```tsx
import { XMTP } from "xmtp";

const xmtp = new XMTP(onMessage, {
  encryptionKey: process.env.ENCRYPTION_KERY,
});

await xmtp.init();

const onMessage = async (message, user) => {
  console.log(`Decoded message: ${message.content.text} by ${user.address}`);
  // Your AI model response
  await xmtp.send({
    message: response,
    originalMessage: message,
  });
};
```

## XMTP network environments

XMTP provides `production`, `dev`, and `local` network environments to support the development phases of your project. To learn more about these environments, see our [official documentation](https://xmtp.org/docs/build/authentication#environments).

## Developing

Run `yarn dev` to build the SDK and watch for changes, which will trigger a rebuild.

### Useful commands

- `yarn build`: Builds the SDK
- `yarn clean`: Removes `node_modules`, `dist`, and `.turbo` folders
- `yarn test`: Runs all tests
- `yarn typecheck`: Runs `tsc`
