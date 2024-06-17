# @xmtp/message-kit

Minimal viable package for creating messaging apps.

## CLI Quickstart

For a streamlined setup process, you can use the `create-message-kit` CLI tool, which simplifies the creation and configuration of new XMTP apps.

```bash
# with NPM
npm init message-kit

# with yarn
yarn dlx create-message-kit
```

## Overview

Here's a basic example of the code with a apps that responds with a gm:

```tsx
import { run, HandlerContext } from "@xmtp/message-kit";

run(async (context: HandlerContext) => {
  // Get the message and the address from the sender
  const { content, senderAddress } = context.message;

  // To reply, just call `reply` on the HandlerContext.
  await context.reply(`gm`);
});
```

## Development

To develop on this repo clone the repository containing the app code:

```bash
git clone https://github.com/xmtp-labs/message-kit
cd message-kit
# copy env variables template
cp .env.example .env
```

**Set the variables**

```bash
KEY= # 0x... the private key of the app (with the 0x prefix)
XMTP_ENV=production # or `dev`
```

> ⚠️ This package is not compatible with `bun` yet. Use `npm` or `yarn`

```bash
# install dependencies
yarn install

# running the app
yarn build
yarn start

# to run with hot-reload
yarn build:watch
yarn start:watch

# run the gm example
yarn build:watch
yarn start:gm
```
